const { screen } = require('@testing-library/dom');

const mockUrls = {
    LOG_ENTRY_ENDPOINT: 'https://test-api.example.com'
};

beforeAll(() => {
    global.URLS = mockUrls;

    document.body.innerHTML = `
        <div id="online-status">●</div>
        <span id="status-text">Online</span>
        <form id="doom-scroll-form">
            <input type="date" id="date" name="date">
            <select id="emotion" name="emotion" required>
                <option value="">Select Emotion</option>
                <option value="Anxious">Anxious</option>
                <option value="Bored">Bored</option>
                <option value="Stressed">Stressed</option>
                <option value="Other">Other</option>
            </select>
            <div id="custom-emotion-group" style="display: none;">
                <input type="text" id="custom-emotion" name="customEmotion">
            </div>
            <select id="app" name="app" required>
                <option value="">Select App</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Twitter/X">Twitter/X</option>
                <option value="Other">Other</option>
            </select>
            <div id="custom-app-group" style="display: none;">
                <input type="text" id="custom-app" name="customApp">
            </div>
            <input type="time" id="start-time" name="startTime" required>
            <input type="time" id="end-time" name="endTime" required>
            <textarea id="notes" name="notes"></textarea>
            <button type="submit" class="submit-btn">
                <span class="btn-text">Submit</span>
                <span class="btn-spinner" style="display: none;">⏳</span>
            </button>
        </form>
        <div id="message" class="message" style="display: none;"></div>
        <div id="pending-entries" style="display: none;">
            <div id="pending-list"></div>
            <button id="sync-now">Sync Now</button>
        </div>
    `;

    const DoomScrollTracker = require('../doomScroll.js');
    global.DoomScrollTracker = DoomScrollTracker;
});

describe('DoomScrollTracker', () => {
    let tracker;

    beforeEach(() => {
        tracker = new DoomScrollTracker();
        jest.clearAllMocks();
    });

    describe('setDefaultDate', () => {
        test('should set date input to local date', () => {
            const dateInput = document.getElementById('date');

            tracker.setDefaultDate();

            const today = new Date();
            const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
            const expectedDate = localDate.toISOString().split('T')[0];

            expect(dateInput.value).toBe(expectedDate);
        });
    });

    describe('handleEmotionChange', () => {
        test('should show custom emotion input when Other is selected', () => {
            const emotionSelect = document.getElementById('emotion');
            const customEmotionGroup = document.getElementById('custom-emotion-group');
            const customEmotionInput = document.getElementById('custom-emotion');

            emotionSelect.value = 'Other';
            const event = { target: emotionSelect };

            tracker.handleEmotionChange(event);

            expect(customEmotionGroup.style.display).toBe('block');
            expect(customEmotionInput.required).toBe(true);
        });

        test('should hide custom emotion input when predefined option is selected', () => {
            const emotionSelect = document.getElementById('emotion');
            const customEmotionGroup = document.getElementById('custom-emotion-group');
            const customEmotionInput = document.getElementById('custom-emotion');

            // First show it
            emotionSelect.value = 'Other';
            tracker.handleEmotionChange({ target: emotionSelect });

            // Then select a predefined option
            emotionSelect.value = 'Anxious';
            tracker.handleEmotionChange({ target: emotionSelect });

            expect(customEmotionGroup.style.display).toBe('none');
            expect(customEmotionInput.required).toBe(false);
            expect(customEmotionInput.value).toBe('');
        });
    });

    describe('handleAppChange', () => {
        test('should show custom app input when Other is selected', () => {
            const appSelect = document.getElementById('app');
            const customAppGroup = document.getElementById('custom-app-group');
            const customAppInput = document.getElementById('custom-app');

            appSelect.value = 'Other';
            const event = { target: appSelect };

            tracker.handleAppChange(event);

            expect(customAppGroup.style.display).toBe('block');
            expect(customAppInput.required).toBe(true);
        });

        test('should hide custom app input when predefined option is selected', () => {
            const appSelect = document.getElementById('app');
            const customAppGroup = document.getElementById('custom-app-group');
            const customAppInput = document.getElementById('custom-app');

            // First show it
            appSelect.value = 'Other';
            tracker.handleAppChange({ target: appSelect });

            // Then select a predefined option
            appSelect.value = 'Instagram';
            tracker.handleAppChange({ target: appSelect });

            expect(customAppGroup.style.display).toBe('none');
            expect(customAppInput.required).toBe(false);
            expect(customAppInput.value).toBe('');
        });
    });

    describe('prepareData', () => {
        test('should prepare basic doom scroll data correctly', () => {
            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('emotion', 'Anxious');
            formData.set('app', 'Instagram');
            formData.set('startTime', '14:30');
            formData.set('endTime', '15:45');
            formData.set('notes', 'Test doom scroll session');

            const result = tracker.prepareData(formData);

            expect(result.date).toBe('2023-12-01');
            expect(result.emotion).toBe('Anxious');
            expect(result.app).toBe('Instagram');
            expect(result.startTime).toBe('2023-12-01T14:30:00Z');
            expect(result.endTime).toBe('2023-12-01T15:45:00Z');
            expect(result.notes).toBe('Test doom scroll session');
        });

        test('should handle custom emotion', () => {
            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('emotion', 'Other');
            formData.set('customEmotion', 'Overwhelmed');
            formData.set('app', 'Instagram');
            formData.set('startTime', '14:30');
            formData.set('endTime', '15:00');

            const result = tracker.prepareData(formData);

            expect(result.emotion).toBe('Overwhelmed');
            expect(result.customEmotion).toBeUndefined();
        });

        test('should handle custom app', () => {
            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('emotion', 'Bored');
            formData.set('app', 'Other');
            formData.set('customApp', 'Reddit');
            formData.set('startTime', '14:30');
            formData.set('endTime', '15:00');

            const result = tracker.prepareData(formData);

            expect(result.app).toBe('Reddit');
            expect(result.customApp).toBeUndefined();
        });

        test('should handle both custom emotion and app', () => {
            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('emotion', 'Other');
            formData.set('customEmotion', 'Lonely');
            formData.set('app', 'Other');
            formData.set('customApp', 'Facebook');
            formData.set('startTime', '14:30');
            formData.set('endTime', '15:00');

            const result = tracker.prepareData(formData);

            expect(result.emotion).toBe('Lonely');
            expect(result.app).toBe('Facebook');
            expect(result.customEmotion).toBeUndefined();
            expect(result.customApp).toBeUndefined();
        });

        test('should use current date if not provided', () => {
            const formData = new FormData();
            formData.set('emotion', 'Anxious');
            formData.set('app', 'Instagram');
            formData.set('startTime', '14:30');
            formData.set('endTime', '15:00');

            const result = tracker.prepareData(formData);

            const expectedDate = new Date().toISOString().split('T')[0];
            expect(result.date).toBe(expectedDate);
        });
    });

    describe('validateData', () => {
        test('should return true for valid data', () => {
            const validData = {
                date: '2023-12-01',
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z',
                emotion: 'Anxious',
                app: 'Instagram'
            };

            const result = tracker.validateData(validData);
            expect(result).toBe(true);
        });

        test('should return false when date is missing', () => {
            const invalidData = {
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z',
                emotion: 'Anxious',
                app: 'Instagram'
            };

            const result = tracker.validateData(invalidData);
            expect(result).toBe(false);
        });

        test('should return false when startTime is missing', () => {
            const invalidData = {
                date: '2023-12-01',
                endTime: '2023-12-01T15:45:00Z',
                emotion: 'Anxious',
                app: 'Instagram'
            };

            const result = tracker.validateData(invalidData);
            expect(result).toBe(false);
        });

        test('should return false when endTime is missing', () => {
            const invalidData = {
                date: '2023-12-01',
                startTime: '2023-12-01T14:30:00Z',
                emotion: 'Anxious',
                app: 'Instagram'
            };

            const result = tracker.validateData(invalidData);
            expect(result).toBe(false);
        });

        test('should return false when emotion is missing', () => {
            const invalidData = {
                date: '2023-12-01',
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z',
                app: 'Instagram'
            };

            const result = tracker.validateData(invalidData);
            expect(result).toBe(false);
        });

        test('should return false when app is missing', () => {
            const invalidData = {
                date: '2023-12-01',
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z',
                emotion: 'Anxious'
            };

            const result = tracker.validateData(invalidData);
            expect(result).toBe(false);
        });

        test('should return false for invalid date format', () => {
            const invalidData = {
                date: '2023-12-01',
                startTime: 'invalid-date',
                endTime: '2023-12-01T15:45:00Z',
                emotion: 'Anxious',
                app: 'Instagram'
            };

            const result = tracker.validateData(invalidData);
            expect(result).toBe(false);
        });

        test('should validate time order - reject when end time is before start time', () => {
            const invalidTimeData = {
                date: '2023-12-01',
                startTime: '2023-12-01T15:45:00Z',
                endTime: '2023-12-01T14:30:00Z',
                emotion: 'Anxious',
                app: 'Instagram'
            };

            const result = tracker.validateData(invalidTimeData);
            expect(result).toBe(false);
        });

        test('should validate time order - reject when end time equals start time', () => {
            const invalidTimeData = {
                date: '2023-12-01',
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T14:30:00Z',
                emotion: 'Anxious',
                app: 'Instagram'
            };

            const result = tracker.validateData(invalidTimeData);
            expect(result).toBe(false);
        });
    });

    describe('submitToAPI', () => {
        test('should make fetch request with correct parameters', async () => {
            const testData = {
                entryType: 'doomScroll',
                date: '2023-12-01',
                emotion: 'Anxious',
                app: 'Instagram',
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z',
                notes: 'Test session'
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true, message: 'Logged successfully' })
            });

            await tracker.submitToAPI(testData);

            expect(fetch).toHaveBeenCalledWith(mockUrls.LOG_ENTRY_ENDPOINT, {
                redirect: "follow",
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify({
                    entryType: 'doomScroll',
                    date: '2023-12-01',
                    emotion: 'Anxious',
                    app: 'Instagram',
                    startTime: encodeURIComponent(testData.startTime),
                    endTime: encodeURIComponent(testData.endTime),
                    notes: 'Test session'
                })
            });
        });

        test('should throw error on failed request', async () => {
            const testData = {
                date: '2023-12-01',
                emotion: 'Anxious',
                app: 'Instagram',
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z'
            };

            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            await expect(tracker.submitToAPI(testData)).rejects.toThrow('HTTP error! status: 500');
        });

        test('should throw error when API returns error in response', async () => {
            const testData = {
                date: '2023-12-01',
                emotion: 'Anxious',
                app: 'Instagram',
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z'
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ error: 'Invalid data format' })
            });

            await expect(tracker.submitToAPI(testData)).rejects.toThrow('Invalid data format');
        });
    });

    describe('offline functionality', () => {
        test('should save doom scroll entry to queue when offline', () => {
            const testData = {
                date: '2023-12-01',
                emotion: 'Anxious',
                app: 'Instagram',
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z'
            };

            tracker.saveToQueue(testData);

            expect(localStorage.setItem).toHaveBeenCalledWith('pendingDoomScrollEntries', expect.any(String));

            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].emotion).toBe('Anxious');
            expect(savedData[0].app).toBe('Instagram');
            expect(savedData[0]).toHaveProperty('timestamp');
            expect(savedData[0]).toHaveProperty('id');
        });

        test('should load pending entries from localStorage', () => {
            const mockEntries = [
                {
                    emotion: 'Bored',
                    app: 'TikTok',
                    timestamp: '2023-12-01T14:30:00Z',
                    id: '1234567890'
                }
            ];
            localStorage.getItem.mockReturnValue(JSON.stringify(mockEntries));

            const entries = tracker.getPendingEntries();

            expect(entries).toEqual(mockEntries);
            expect(localStorage.getItem).toHaveBeenCalledWith('pendingDoomScrollEntries');
        });

        test('should return empty array when no pending entries exist', () => {
            localStorage.getItem.mockReturnValue(null);

            const entries = tracker.getPendingEntries();

            expect(entries).toEqual([]);
        });
    });

    describe('updateOnlineStatus', () => {
        test('should show online status when navigator.onLine is true', () => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: true
            });

            tracker.updateOnlineStatus();

            const statusIndicator = document.getElementById('online-status');
            const statusText = document.getElementById('status-text');

            expect(statusIndicator.className).toBe('status online');
            expect(statusText.textContent).toBe('Online');
        });

        test('should show offline status when navigator.onLine is false', () => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });

            tracker.updateOnlineStatus();

            const statusIndicator = document.getElementById('online-status');
            const statusText = document.getElementById('status-text');

            expect(statusIndicator.className).toBe('status offline');
            expect(statusText.textContent).toBe('Offline');
        });
    });

    describe('setLoading', () => {
        test('should disable button and show spinner when loading', () => {
            const button = document.querySelector('.submit-btn');
            const text = button.querySelector('.btn-text');
            const spinner = button.querySelector('.btn-spinner');

            tracker.setLoading(true);

            expect(button.disabled).toBe(true);
            expect(text.style.display).toBe('none');
            expect(spinner.style.display).toBe('inline');
        });

        test('should enable button and hide spinner when not loading', () => {
            const button = document.querySelector('.submit-btn');
            const text = button.querySelector('.btn-text');
            const spinner = button.querySelector('.btn-spinner');

            tracker.setLoading(false);

            expect(button.disabled).toBe(false);
            expect(text.style.display).toBe('inline');
            expect(spinner.style.display).toBe('none');
        });
    });

    describe('showMessage', () => {
        test('should display success message', () => {
            const messageEl = document.getElementById('message');

            tracker.showMessage('Success!', 'success');

            expect(messageEl.textContent).toBe('Success!');
            expect(messageEl.className).toBe('message success');
            expect(messageEl.style.display).toBe('block');
        });

        test('should display error message', () => {
            const messageEl = document.getElementById('message');

            tracker.showMessage('Error occurred', 'error');

            expect(messageEl.textContent).toBe('Error occurred');
            expect(messageEl.className).toBe('message error');
            expect(messageEl.style.display).toBe('block');
        });

        test('should display info message', () => {
            const messageEl = document.getElementById('message');

            tracker.showMessage('Info message', 'info');

            expect(messageEl.textContent).toBe('Info message');
            expect(messageEl.className).toBe('message info');
            expect(messageEl.style.display).toBe('block');
        });
    });

    describe('resetForm', () => {
        test('should reset form and hide custom fields', () => {
            const form = document.getElementById('doom-scroll-form');
            const customEmotionGroup = document.getElementById('custom-emotion-group');
            const customAppGroup = document.getElementById('custom-app-group');
            const customEmotionInput = document.getElementById('custom-emotion');
            const customAppInput = document.getElementById('custom-app');

            // Set some values first
            customEmotionGroup.style.display = 'block';
            customAppGroup.style.display = 'block';
            customEmotionInput.required = true;
            customAppInput.required = true;

            tracker.resetForm();

            expect(customEmotionGroup.style.display).toBe('none');
            expect(customAppGroup.style.display).toBe('none');
            expect(customEmotionInput.required).toBe(false);
            expect(customAppInput.required).toBe(false);
        });
    });
});
