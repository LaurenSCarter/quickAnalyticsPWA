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
        const drivingEmotionSelect = document.getElementById('driving-emotion');
        const resultingEmotionSelect = document.getElementById('resulting-emotion');
        const drivingIntensitySlider = document.getElementById('driving-emotion-intensity');
        const resultingIntensitySlider = document.getElementById('resulting-emotion-intensity');
        const appSelect = document.getElementById('app');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        drivingEmotionSelect.addEventListener('change', (e) => this.handleDrivingEmotionChange(e));
        resultingEmotionSelect.addEventListener('change', (e) => this.handleResultingEmotionChange(e));
        drivingIntensitySlider.addEventListener('input', (e) => this.updateDrivingIntensityValue(e));
        resultingIntensitySlider.addEventListener('input', (e) => this.updateResultingIntensityValue(e));
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
     * Show/hide custom driving emotion input when "Other" is selected
     */
    handleDrivingEmotionChange(e) {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        const customDrivingEmotionGroup = document.getElementById('custom-driving-emotion-group');
        const customDrivingEmotionInput = document.getElementById('custom-driving-emotion');

        if (selectedOptions.includes('Other')) {
            customDrivingEmotionGroup.style.display = 'block';
            customDrivingEmotionInput.required = true;
        } else {
            customDrivingEmotionGroup.style.display = 'none';
            customDrivingEmotionInput.required = false;
            customDrivingEmotionInput.value = '';
        }
    }

    /**
     * Show/hide custom resulting emotion input when "Other" is selected
     */
    handleResultingEmotionChange(e) {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        const customResultingEmotionGroup = document.getElementById('custom-resulting-emotion-group');
        const customResultingEmotionInput = document.getElementById('custom-resulting-emotion');

        if (selectedOptions.includes('Other')) {
            customResultingEmotionGroup.style.display = 'block';
            customResultingEmotionInput.required = true;
        } else {
            customResultingEmotionGroup.style.display = 'none';
            customResultingEmotionInput.required = false;
            customResultingEmotionInput.value = '';
        }
    }

    /**
     * Update driving emotion intensity value display
     */
    updateDrivingIntensityValue(e) {
        const value = e.target.value;
        document.getElementById('driving-intensity-value').textContent = value;
    }

    /**
     * Update resulting emotion intensity value display
     */
    updateResultingIntensityValue(e) {
        const value = e.target.value;
        document.getElementById('resulting-intensity-value').textContent = value;
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

        // Get driving emotions (multiple selection)
        const drivingEmotionSelect = document.getElementById('driving-emotion');
        const selectedDrivingEmotions = Array.from(drivingEmotionSelect.selectedOptions)
            .map(option => option.value)
            .filter(value => value !== 'Other');

        // Get resulting emotions (multiple selection)
        const resultingEmotionSelect = document.getElementById('resulting-emotion');
        const selectedResultingEmotions = Array.from(resultingEmotionSelect.selectedOptions)
            .map(option => option.value)
            .filter(value => value !== 'Other');

        // Get other form values
        for (let [key, value] of formData.entries()) {
            if (key !== 'drivingEmotion' && key !== 'resultingEmotion') {
                data[key] = value;
            }
        }

        // Handle custom driving emotion input
        const customDrivingEmotion = formData.get('customDrivingEmotion');
        if (customDrivingEmotion && selectedDrivingEmotions.length === 0) {
            // If "Other" was the only selection
            data.drivingEmotion = customDrivingEmotion;
        } else if (customDrivingEmotion) {
            // Append custom emotion to selected emotions
            selectedDrivingEmotions.push(customDrivingEmotion);
            data.drivingEmotion = selectedDrivingEmotions.join(', ');
        } else {
            data.drivingEmotion = selectedDrivingEmotions.join(', ');
        }
        delete data.customDrivingEmotion;

        // Handle custom resulting emotion input
        const customResultingEmotion = formData.get('customResultingEmotion');
        if (customResultingEmotion && selectedResultingEmotions.length === 0) {
            // If "Other" was the only selection
            data.resultingEmotion = customResultingEmotion;
        } else if (customResultingEmotion) {
            // Append custom emotion to selected emotions
            selectedResultingEmotions.push(customResultingEmotion);
            data.resultingEmotion = selectedResultingEmotions.join(', ');
        } else {
            data.resultingEmotion = selectedResultingEmotions.join(', ');
        }
        delete data.customResultingEmotion;

        // Handle custom app input
        if (data.app === 'Other' && data.customApp) {
            data.app = data.customApp;
        }
        delete data.customApp;

        // Convert date and time to ISO format
        const date = data.date || new Date().toISOString().split('T')[0];
        data.startTime = `${date}T${data.startTime}:00Z`;
        data.endTime = `${date}T${data.endTime}:00Z`;

        // Convert intensity values to numbers
        data.drivingEmotionIntensity = parseInt(data.drivingEmotionIntensity);
        data.resultingEmotionIntensity = parseInt(data.resultingEmotionIntensity);

        // Keep the date field for API payload
        data.date = date;

        return data;
    }

    /**
     * Validate required fields
     */
    validateData(data) {
        if (!data.date || !data.startTime || !data.endTime || !data.drivingEmotion || !data.resultingEmotion || !data.app) {
            this.showMessage('Please fill in all required fields', 'error');
            return false;
        }

        // Parse ISO formatted timestamps
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);

        // Check if dates are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            this.showMessage('Invalid date/time format', 'error');
            return false;
        }

        if (start >= end) {
            this.showMessage('End time must be after start time', 'error');
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
            endTime: encodeURIComponent(data.endTime),
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
                <strong>${entry.drivingEmotion || entry.emotion}</strong> - ${entry.app}
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

        // Reset intensity value displays
        document.getElementById('driving-intensity-value').textContent = '5';
        document.getElementById('resulting-intensity-value').textContent = '5';

        // Hide custom input fields
        document.getElementById('custom-driving-emotion-group').style.display = 'none';
        document.getElementById('custom-resulting-emotion-group').style.display = 'none';
        document.getElementById('custom-app-group').style.display = 'none';
        document.getElementById('custom-driving-emotion').required = false;
        document.getElementById('custom-resulting-emotion').required = false;
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
