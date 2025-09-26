class QuickAnalytics {
    constructor() {
        this.apiUrl = URLS.API_SCRIPT; // Replace with latest deployment APP SCRIPT URL
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
        const form = document.getElementById('time-entry-form');
        const energySlider = document.getElementById('energy');
        const quickButtons = document.querySelectorAll('.quick-btn');
        const syncButton = document.getElementById('sync-now');
        const categorySelect = document.getElementById('category');
        const taskSelect = document.getElementById('task');
        const subSubCategorySelect = document.getElementById('subSubCategory');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        energySlider.addEventListener('input', (e) => this.updateEnergyValue(e));
        categorySelect.addEventListener('change', (e) => this.handleCategoryChange(e));
        taskSelect.addEventListener('change', (e) => this.handleTaskChange(e));
        subSubCategorySelect.addEventListener('change', (e) => this.handleSubSubCategoryChange(e));

        quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e));
        });

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

    updateEnergyValue(e) {
        const value = e.target.value;
        document.getElementById('energy-value').textContent = value;
    }

    handleCategoryChange(e) {
        const category = e.target.value;
        const taskSelect = document.getElementById('task');

        // Define tasks for each category
        const taskOptions = {
            'Ascension Pathway': [
                'Admin',
                'Circle',
                'Check-in',
                'Class',
                'Data Management',
                'Homework',
                'Prayer Partner',
                'Other'
            ],
            'Health': [
                'Body Care',
                'Dentist',
                'Emotional Care',
                'Hobbies',
                'Relax',
                'Yoga',
                'Other'
            ],
            'Home Management': [
                'Car',
                'Cleaning',
                'Cooking',
                'Decluttering',
                'Decorating Project',
                'Finances',
                'General Maintenance',
                'Misc',
                'Pet Care',
                'Shopping',
                'Strata',
                'Other'
            ],
            'Work': [
                'Computer Maintenance',
                'Domestic Angel',
                'Job Applications',
                'Overhead',
                'Professional Development',
                'Sole Trader Administration',
                'Trello Sprint',
                'Quick Analytics',
                'Other'
            ]
        };

        // Clear existing options
        taskSelect.innerHTML = '<option value="">Select Sub Category</option>';
        
        // Also clear sub-sub-category dropdown when category changes
        const subSubCategorySelect = document.getElementById('subSubCategory');
        subSubCategorySelect.innerHTML = '<option value="">Select Sub Category First</option>';
        
        // Hide custom task and sub-sub-category inputs when category changes
        const customTaskGroup = document.getElementById('custom-task-group');
        const customTaskInput = document.getElementById('custom-task');
        const customSubSubCategoryGroup = document.getElementById('custom-subSubCategory-group');
        const customSubSubCategoryInput = document.getElementById('custom-subSubCategory');
        
        customTaskGroup.style.display = 'none';
        customTaskInput.required = false;
        customTaskInput.value = '';
        customSubSubCategoryGroup.style.display = 'none';
        customSubSubCategoryInput.required = false;
        customSubSubCategoryInput.value = '';
        subSubCategorySelect.disabled = false;
        subSubCategorySelect.style.display = 'block';

        // Add tasks for selected category
        if (category && taskOptions[category]) {
            taskOptions[category].forEach(task => {
                const option = document.createElement('option');
                option.value = task;
                option.textContent = task;
                taskSelect.appendChild(option);
            });
        } else {
            taskSelect.innerHTML = '<option value="">Select Category First</option>';
        }
    }

    handleTaskChange(e) {
        const task = e.target.value;
        const subSubCategorySelect = document.getElementById('subSubCategory');
        const customTaskGroup = document.getElementById('custom-task-group');
        const customTaskInput = document.getElementById('custom-task');
        
        // Show/hide custom task input based on selection
        const customSubSubCategoryGroup = document.getElementById('custom-subSubCategory-group');
        const customSubSubCategoryInput = document.getElementById('custom-subSubCategory');
        
        if (task === 'Other') {
            customTaskGroup.style.display = 'block';
            customTaskInput.required = true;
            // Hide sub-sub-category dropdown and show custom sub-sub-category input for Other tasks
            subSubCategorySelect.style.display = 'none';
            customSubSubCategoryGroup.style.display = 'block';
            customSubSubCategoryInput.required = false; // Optional field
            return;
        } else {
            customTaskGroup.style.display = 'none';
            customTaskInput.required = false;
            customTaskInput.value = '';
            subSubCategorySelect.style.display = 'block';
            subSubCategorySelect.disabled = false;
            customSubSubCategoryGroup.style.display = 'none';
            customSubSubCategoryInput.required = false;
            customSubSubCategoryInput.value = '';
        }
        
        // Define sub-sub-category options for each task
        const subSubCategoryOptions = {
            // Ascension Pathway tasks
            'Admin': ['ML3 Class Index', 'Survey'],
            'Circle': ['Video On', 'Video Off'],
            'Check-in': ['1-1 check-in with Jennifer', '1-1 check-in with Mary-Lu'],
            'Class': ['Replay','Video Off', 'Video On'],
            'Data Management': ['Download Files', 'ML1 - Download - Rename - Organise', 'ML2 - Download - Rename - Organise', 'ML3 - Download - Rename - Organise', 'AP - Download - Rename - Organise'],
            'Homework': ['Reading','Ray 3','Inspiration Board','Meditation'],
            'Prayer Partner': ['Andree','Sara','Cora','Julie'],
            
            // Health tasks
            'Body Care': ['Personal Hygiene','Mindful Eating','Gym','Rest','Sauna','Sick'],
            'Dentist': ['Check Appointment','Attend Appointment'],
            'Emotional Care': ['Journaling','Contemplation'],
            'Hobbies': ['Knitting','Reading','Audiobook','Podcast'],
            'Relax': ['Bath','Break','Reading','Rest','Sunshine','TV / YouTube'],
            'Yoga': ['Study','Practice','Meditation','Tattoo'],
            
            // Home Management tasks
            'Car': ['Service', 'Registration'],
            'Cleaning': ['General','Kitchen','Bedroom','Bathroom','Lounge Room','Laundry','Home Office','Car','Rubbish','Deep Clean','Service Vacuum'],
            'Cooking': ['Food Prep','Breakfast','Brunch','Lunch','Dinner'],
            'Decluttering': ['Bedroom','Home Office',],
            'Decorating Project': ['Bedroom','Home Office','Kitchen',],
            'Finances': ['Manage Subscriptions','Home Accounts','Suspend Health Insurance','Bills'],
            'Misc': ['Move Car','Condition leather jacket','Connect Smart PowerPoints to Network'],
            'Pet Care': ['Dog Walk','Take Pets Out','Feed Pets','Commute','Brush Bease','Bonding','Cat demands','Food Prep','Vet','Doggy Drive'],
            'Shopping': ['Groceries','Clothes','Accessories','Misc','Post','Errands',],
            'Strata': ['Communication','Yard Work'],
            
            // Work tasks
            'Computer Maintenance': ['System Updates','Security','Dev Setup','Cloud Storage','Content Liberation','Google Photo Settings','Share Recordings to PC','Clean Android Internal Drive','Laptop Battery','Review Key Commands','Troubleshoot Network Congestion','Resolve DNS Issues',],
            'Domestic Angel': ['Product Development','Website V2'],
            'Job Applications': [],
            'Overhead': ['Commute','Daily Setup'],
            'Professional Development': ['Research Vibe Coding Tools','AI Research','Training: PySpark'],
            'Sole Trader Administration': ['Marketing','Death & Taxes','ABN - Sole Trader Registration','Domain/Email Registration'],
            'Trello Sprint': ['Weekly Review','Update Cards','Stand Up'],
            'Quick Analytics': ['Data Management','Development V2','End of Month Review','Time Entries',]
        };

        // Clear existing options and hide custom sub-sub-category input
        subSubCategorySelect.innerHTML = '<option value="">Select Sub-Sub Category</option>';
        customSubSubCategoryGroup.style.display = 'none';
        customSubSubCategoryInput.required = false;
        customSubSubCategoryInput.value = '';
        
        // Add sub-sub-category options for selected task
        if (task && subSubCategoryOptions[task]) {
            subSubCategoryOptions[task].forEach(subSubCategory => {
                const option = document.createElement('option');
                option.value = subSubCategory;
                option.textContent = subSubCategory;
                subSubCategorySelect.appendChild(option);
            });
            
            // Always add "Other" option at the end
            const otherOption = document.createElement('option');
            otherOption.value = 'Other';
            otherOption.textContent = 'Other';
            subSubCategorySelect.appendChild(otherOption);
        } else {
            subSubCategorySelect.innerHTML = '<option value="">Select Sub Category First</option>';
        }
    }

    handleSubSubCategoryChange(e) {
        const subSubCategory = e.target.value;
        const customSubSubCategoryGroup = document.getElementById('custom-subSubCategory-group');
        const customSubSubCategoryInput = document.getElementById('custom-subSubCategory');
        
        if (subSubCategory === 'Other') {
            customSubSubCategoryGroup.style.display = 'block';
            customSubSubCategoryInput.required = false; // Optional field
        } else {
            customSubSubCategoryGroup.style.display = 'none';
            customSubSubCategoryInput.required = false;
            customSubSubCategoryInput.value = '';
        }
    }

    handleQuickAction(e) {
        const button = e.target;
        const category = button.dataset.category;
        const task = button.dataset.task;

        document.getElementById('category').value = category;
        document.getElementById('task').value = task;

        // Set start time to now
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        document.getElementById('start-time').value = timeString;

        // Focus on end time for quick entry
        document.getElementById('end-time').focus();
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
                this.showMessage('Time entry logged successfully!', 'success');
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

    prepareData(formData) {
        const data = {};

        // Get form values
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Store original task value to check for 'Other'
        const originalTask = data.task;

        // Handle custom task input
        if (data.task === 'Other' && data.customTask) {
            data.task = data.customTask;
            delete data.customTask;
        }

        // Handle custom sub-sub-category input
        // This can happen either when subSubCategory is 'Other' OR when original task is 'Other' (which shows custom sub-sub-category input)
        if (data.customSubSubCategory && (data.subSubCategory === 'Other' || originalTask === 'Other')) {
            data.subSubCategory = data.customSubSubCategory;
            delete data.customSubSubCategory;
        }

        // Convert date and times to ISO format
        const date = data.date || new Date().toISOString().split('T')[0];

        // Create ISO timestamps from date + time
        data.startTime = `${date}T${data.startTime}:00Z`;
        data.endTime = `${date}T${data.endTime}:00Z`;

        // Convert energy to number
        data.energy = parseInt(data.energy);

        return data;
    }

    validateData(data) {
        if (!data.category || !data.task || !data.startTime || !data.endTime) {
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

    async submitToAPI(data) {
        // URI encode timestamp values for safe transmission
        const encodedData = {
            ...data,
            startTime: encodeURIComponent(data.startTime),
            endTime: encodeURIComponent(data.endTime),
            client: data.subSubCategory  // Backend expects 'client' field name
        };
        
        // Remove the frontend field name
        delete encodedData.subSubCategory;

        console.log('sending body: ', JSON.stringify(encodedData));

        const response = await fetch(this.apiUrl, {
            redirect: "follow",
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(encodedData),
        });

        if (!response.ok) {
            var message = `HTTP error: ${response.status}, ${response.statusText}`;
            console.error(message);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
            var message = `'Error: ${result.error}`;
            console.error(message);
            throw new Error(result.error);
        }


        // Show popup for successful HTTP 200 response
        var message = `Success: Time entry has been logged with result: ${result}`;
        console.log(message);

        return result;
    }

    saveToQueue(data) {
        const pending = this.getPendingEntries();
        pending.push({
            ...data,
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        });

        localStorage.setItem('pendingEntries', JSON.stringify(pending));
        this.updatePendingDisplay();
    }

    getPendingEntries() {
        const stored = localStorage.getItem('pendingEntries');
        return stored ? JSON.parse(stored) : [];
    }

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
                await this.submitToAPI(entry);
                synced.push(entry);
            } catch (error) {
                console.error('Sync failed for entry:', entry, error);
                failed.push(entry);
            }
        }

        // Keep only failed entries
        localStorage.setItem('pendingEntries', JSON.stringify(failed));
        this.updatePendingDisplay();

        if (synced.length > 0) {
            this.showMessage(`Synced ${synced.length} entries successfully!`, 'success');
        }

        if (failed.length > 0) {
            this.showMessage(`${failed.length} entries failed to sync`, 'error');
        }
    }

    loadPendingEntries() {
        this.updatePendingDisplay();

        // Auto-sync when online
        if (navigator.onLine) {
            setTimeout(() => this.syncPendingEntries(), 1000);
        }
    }

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
                <strong>${entry.category}</strong> - ${entry.task}
                <small>(${new Date(entry.timestamp).toLocaleString()})</small>
            </div>
        `).join('');
    }

    handleOnlineStatus(isOnline) {
        this.updateOnlineStatus();

        if (isOnline) {
            // Auto-sync when coming back online
            setTimeout(() => this.syncPendingEntries(), 1000);
        }
    }

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

    resetForm() {
        const form = document.getElementById('time-entry-form');
        form.reset();
        this.setDefaultDate();
        document.getElementById('energy-value').textContent = '0';
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickAnalytics;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new QuickAnalytics();
});