/**
 * Pet Analytics Tracker
 * Tracks pet behavior with date, time, pet name, behavior type, and notes
 * Includes offline support and automatic sync functionality
 */
class PetAnalyticsTracker {
    constructor() {
        this.apiUrl = URLS.LOG_ENTRY_ENDPOINT;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateOnlineStatus();
        this.loadPendingEntries();
        this.setDefaultDate();

        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
    }

    bindEvents() {
        const form = document.getElementById('pet-analytics-form');
        const syncButton = document.getElementById('sync-now');

        form.addEventListener('submit', (e) => this.handleSubmit(e));

        if (syncButton) {
            syncButton.addEventListener('click', () => this.syncPendingEntries());
        }
    }

    setDefaultDate() {
        const dateInput = document.getElementById('date');
        const today = new Date();
        const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
        dateInput.value = localDate.toISOString().split('T')[0];
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = this.prepareData(formData);

        if (!this.validateData(data)) {
            return;
        }

        this.setLoading(true);

        try {
            if (navigator.onLine) {
                await this.submitToAPI(data);
                this.showMessage('Pet behavior logged successfully!', 'success');
                this.resetForm();
            } else {
                this.saveToQueue(data);
                this.showMessage('Saved locally - will sync when online', 'info');
                this.resetForm();
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.saveToQueue(data);
            this.showMessage('Saved locally due to connection issue', 'info');
            this.resetForm();
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Prepare form data for submission
     * Converts date and time to ISO format timestamp
     */
    prepareData(formData) {
        const data = {};

        // Get form values
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Convert date and time to ISO format timestamp
        const date = data.date || new Date().toISOString().split('T')[0];
        data.timestamp = `${date}T${data.time}:00Z`;

        // Remove separate date and time fields as we now have timestamp
        delete data.date;
        delete data.time;

        return data;
    }

    /**
     * Validate required fields
     */
    validateData(data) {
        if (!data.timestamp || !data.petName || !data.behaviour) {
            this.showMessage('Please fill in all required fields', 'error');
            return false;
        }

        // Check if timestamp is valid ISO format
        const timestamp = new Date(data.timestamp);
        if (isNaN(timestamp.getTime())) {
            this.showMessage('Invalid date/time format', 'error');
            return false;
        }

        return true;
    }

    /**
     * Submit data to Google Apps Script endpoint
     */
    async submitToAPI(data) {

        // URI encode timestamp value for safe transmission
        const encodedData = {
            entryType: "petAnalytics",
            ...data,
            startTime: encodeURIComponent(data.timestamp),
        };

        console.log('Submitting pet analytics data:', JSON.stringify(encodedData));

        const response = await fetch(this.apiUrl, {
            redirect: "follow",
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(encodedData),
        });

        if (!response.ok) {
            const message = `HTTP error: ${response.status}, ${response.statusText}`;
            console.error(message);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
            const message = `Error: ${result.error}`;
            console.error(message);
            throw new Error(result.error);
        }

        // Show popup for successful HTTP 200 response
        const message = `Success: Pet behavior logged with result: ${result.message}`;
        console.log(message);

        return result;
    }

    /**
     * Save entry to localStorage queue for offline support
     */
    saveToQueue(data) {
        const pending = this.getPendingEntries();
        pending.push({
            ...data,
            queuedAt: new Date().toISOString(),
            id: Date.now().toString()
        });

        localStorage.setItem('pendingPetAnalyticsEntries', JSON.stringify(pending));
        this.updatePendingDisplay();
    }

    /**
     * Get pending entries from localStorage
     */
    getPendingEntries() {
        const stored = localStorage.getItem('pendingPetAnalyticsEntries');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Sync pending entries when online
     */
    async syncPendingEntries() {
        const pending = this.getPendingEntries();

        if (pending.length === 0) {
            return;
        }

        this.showMessage('Syncing pending entries...', 'info');

        const synced = [];
        const failed = [];

        for (const entry of pending) {
            try {
                // Remove queuedAt and id fields before submitting
                const { queuedAt, id, ...cleanEntry } = entry;
                await this.submitToAPI(cleanEntry);
                synced.push(entry);
            } catch (error) {
                console.error('Sync failed for entry:', entry, error);
                failed.push(entry);
            }
        }

        // Keep only failed entries
        localStorage.setItem('pendingPetAnalyticsEntries', JSON.stringify(failed));
        this.updatePendingDisplay();

        if (synced.length > 0) {
            this.showMessage(`Synced ${synced.length} entries successfully!`, 'success');
        }

        if (failed.length > 0) {
            this.showMessage(`${failed.length} entries failed to sync`, 'error');
        }
    }

    /**
     * Load and display pending entries on page load
     */
    loadPendingEntries() {
        this.updatePendingDisplay();

        // Auto-sync when online
        if (navigator.onLine) {
            setTimeout(() => this.syncPendingEntries(), 1000);
        }
    }

    /**
     * Update the pending entries display
     */
    updatePendingDisplay() {
        const pending = this.getPendingEntries();
        const container = document.getElementById('pending-entries');
        const list = document.getElementById('pending-list');

        if (pending.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        list.innerHTML = pending.map(entry => `
            <div class="pending-item">
                <strong>${entry.petName}</strong> - ${entry.behaviour}
                <small>(${new Date(entry.queuedAt).toLocaleString()})</small>
            </div>
        `).join('');
    }

    /**
     * Handle online/offline status changes
     */
    handleOnlineStatus(isOnline) {
        this.updateOnlineStatus();

        if (isOnline) {
            // Auto-sync when coming back online
            setTimeout(() => this.syncPendingEntries(), 1000);
        }
    }

    /**
     * Update online status indicator
     */
    updateOnlineStatus() {
        const statusIndicator = document.getElementById('online-status');
        const statusText = document.getElementById('status-text');

        if (navigator.onLine) {
            statusIndicator.className = 'status online';
            statusText.textContent = 'Online';
        } else {
            statusIndicator.className = 'status offline';
            statusText.textContent = 'Offline';
        }
    }

    /**
     * Show/hide loading state on submit button
     */
    setLoading(loading) {
        const button = document.querySelector('.submit-btn');
        const text = button.querySelector('.btn-text');
        const spinner = button.querySelector('.btn-spinner');

        button.disabled = loading;

        if (loading) {
            text.style.display = 'none';
            spinner.style.display = 'inline';
        } else {
            text.style.display = 'inline';
            spinner.style.display = 'none';
        }
    }

    /**
     * Display message to user
     */
    showMessage(text, type) {
        const message = document.getElementById('message');
        message.textContent = text;
        message.className = `message ${type}`;
        message.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            message.style.display = 'none';
        }, 5000);
    }

    /**
     * Reset form to default state
     */
    resetForm() {
        const form = document.getElementById('pet-analytics-form');
        form.reset();
        this.setDefaultDate();
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PetAnalyticsTracker;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PetAnalyticsTracker();
});
