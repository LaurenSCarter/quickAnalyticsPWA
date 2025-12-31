/**
 * Doom Scroll Tracker
 * Tracks doom scrolling sessions with emotion, app, and timing information
 * Includes offline support and automatic sync functionality
 */
class DoomScrollTracker {
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
        const form = document.getElementById('doom-scroll-form');
        const syncButton = document.getElementById('sync-now');
        const emotionSelect = document.getElementById('emotion');
        const appSelect = document.getElementById('app');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        emotionSelect.addEventListener('change', (e) => this.handleEmotionChange(e));
        appSelect.addEventListener('change', (e) => this.handleAppChange(e));

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

    /**
     * Show/hide custom emotion input when "Other" is selected
     */
    handleEmotionChange(e) {
        const emotion = e.target.value;
        const customEmotionGroup = document.getElementById('custom-emotion-group');
        const customEmotionInput = document.getElementById('custom-emotion');

        if (emotion === 'Other') {
            customEmotionGroup.style.display = 'block';
            customEmotionInput.required = true;
        } else {
            customEmotionGroup.style.display = 'none';
            customEmotionInput.required = false;
            customEmotionInput.value = '';
        }
    }

    /**
     * Show/hide custom app input when "Other" is selected
     */
    handleAppChange(e) {
        const app = e.target.value;
        const customAppGroup = document.getElementById('custom-app-group');
        const customAppInput = document.getElementById('custom-app');

        if (app === 'Other') {
            customAppGroup.style.display = 'block';
            customAppInput.required = true;
        } else {
            customAppGroup.style.display = 'none';
            customAppInput.required = false;
            customAppInput.value = '';
        }
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
                this.showMessage('Doom scroll session logged successfully!', 'success');
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
     * Converts custom inputs and formats timestamps
     */
    prepareData(formData) {
        const data = {};

        // Get form values
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Handle custom emotion input
        if (data.emotion === 'Other' && data.customEmotion) {
            data.emotion = data.customEmotion;
        }
        delete data.customEmotion;

        // Handle custom app input
        if (data.app === 'Other' && data.customApp) {
            data.app = data.customApp;
        }
        delete data.customApp;

        // Convert date and time to ISO format
        const date = data.date || new Date().toISOString().split('T')[0];
        data.startTime = `${date}T${data.startTime}:00Z`;

        // Keep the date field for API payload
        data.date = date;

        return data;
    }

    /**
     * Validate required fields
     */
    validateData(data) {
        if (!data.date || !data.startTime || !data.emotion || !data.app) {
            this.showMessage('Please fill in all required fields', 'error');
            return false;
        }

        // Check if startTime is valid ISO format
        const start = new Date(data.startTime);
        if (isNaN(start.getTime())) {
            this.showMessage('Invalid date/time format', 'error');
            return false;
        }

        return true;
    }

    /**
     * Submit data to Google Apps Script endpoint
     */
    async submitToAPI(data) {

        // URI encode timestamp values for safe transmission
        const encodedData = {
            entryType: "doomScroll",
            ...data,
            startTime: encodeURIComponent(data.startTime),
        };
        
        console.log('Submitting doom scroll data:', JSON.stringify(encodedData));

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
        const message = `Success: Doom scroll session logged with result: ${result.message}`;
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
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        });

        localStorage.setItem('pendingDoomScrollEntries', JSON.stringify(pending));
        this.updatePendingDisplay();
    }

    /**
     * Get pending entries from localStorage
     */
    getPendingEntries() {
        const stored = localStorage.getItem('pendingDoomScrollEntries');
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
                // Remove timestamp and id fields before submitting
                const { timestamp, id, ...cleanEntry } = entry;
                await this.submitToAPI(cleanEntry);
                synced.push(entry);
            } catch (error) {
                console.error('Sync failed for entry:', entry, error);
                failed.push(entry);
            }
        }

        // Keep only failed entries
        localStorage.setItem('pendingDoomScrollEntries', JSON.stringify(failed));
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
                <strong>${entry.emotion}</strong> - ${entry.app}
                <small>(${new Date(entry.timestamp).toLocaleString()})</small>
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
        const form = document.getElementById('doom-scroll-form');
        form.reset();
        this.setDefaultDate();

        // Hide custom input fields
        document.getElementById('custom-emotion-group').style.display = 'none';
        document.getElementById('custom-app-group').style.display = 'none';
        document.getElementById('custom-emotion').required = false;
        document.getElementById('custom-app').required = false;
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DoomScrollTracker;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new DoomScrollTracker();
});
