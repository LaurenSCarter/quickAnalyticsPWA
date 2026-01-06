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
            <select id="driving-emotion" name="drivingEmotion" multiple required size="7">
                <option value="bored">Bored</option>
                <option value="sad">Sad</option>
                <option value="excited">Excited</option>
                <option value="disturbed">Disturbed</option>
                <option value="angry">Angry</option>
                <option value="frustrated">Frustrated</option>
                <option value="Other">Other</option>
            </select>
            <div id="custom-driving-emotion-group" style="display: none;">
                <input type="text" id="custom-driving-emotion" name="customDrivingEmotion">
            </div>
            <input type="range" id="driving-emotion-intensity" name="drivingEmotionIntensity" min="0" max="10" value="5">
            <span id="driving-intensity-value">5</span>
            <select id="resulting-emotion" name="resultingEmotion" multiple required size="6">
                <option value="empty">Empty</option>
                <option value="depressed">Depressed</option>
                <option value="angry">Angry</option>
                <option value="self righteous">Self Righteous</option>
                <option value="sad">Sad</option>
                <option value="Other">Other</option>
            </select>
            <div id="custom-resulting-emotion-group" style="display: none;">
                <input type="text" id="custom-resulting-emotion" name="customResultingEmotion">
            </div>
            <input type="range" id="resulting-emotion-intensity" name="resultingEmotionIntensity" min="0" max="10" value="5">
            <span id="resulting-intensity-value">5</span>
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

    describe('handleDrivingEmotionChange', () => {
        test('should show custom driving emotion input when Other is selected', () => {
            const drivingEmotionSelect = document.getElementById('driving-emotion');
            const customDrivingEmotionGroup = document.getElementById('custom-driving-emotion-group');
            const customDrivingEmotionInput = document.getElementById('custom-driving-emotion');

            const otherOption = Array.from(drivingEmotionSelect.options).find(opt => opt.value === 'Other');
            otherOption.selected = true;

            const event = {
                target: {
                    selectedOptions: [otherOption]
                }
            };

            tracker.handleDrivingEmotionChange(event);

            expect(customDrivingEmotionGroup.style.display).toBe('block');
            expect(customDrivingEmotionInput.required).toBe(true);
        });

        test('should hide custom driving emotion input when Other is not selected', () => {
            const drivingEmotionSelect = document.getElementById('driving-emotion');
            const customDrivingEmotionGroup = document.getElementById('custom-driving-emotion-group');
            const customDrivingEmotionInput = document.getElementById('custom-driving-emotion');

            const boredOption = Array.from(drivingEmotionSelect.options).find(opt => opt.value === 'bored');
            boredOption.selected = true;

            const event = {
                target: {
                    selectedOptions: [boredOption]
                }
            };

            tracker.handleDrivingEmotionChange(event);

            expect(customDrivingEmotionGroup.style.display).toBe('none');
            expect(customDrivingEmotionInput.required).toBe(false);
            expect(customDrivingEmotionInput.value).toBe('');
        });
    });

    describe('updateDrivingIntensityValue', () => {
        test('should update driving intensity value display', () => {
            const slider = document.getElementById('driving-emotion-intensity');
            const valueDisplay = document.getElementById('driving-intensity-value');

            slider.value = '7';
            const event = { target: slider };

            tracker.updateDrivingIntensityValue(event);

            expect(valueDisplay.textContent).toBe('7');
        });
    });

    describe('updateResultingIntensityValue', () => {
        test('should update resulting intensity value display', () => {
            const slider = document.getElementById('resulting-emotion-intensity');
            const valueDisplay = document.getElementById('resulting-intensity-value');

            slider.value = '10';
            const event = { target: slider };

            tracker.updateResultingIntensityValue(event);

            expect(valueDisplay.textContent).toBe('10');
        });
    });

    describe('handleResultingEmotionChange', () => {
        test('should show custom resulting emotion input when Other is selected', () => {
            const resultingEmotionSelect = document.getElementById('resulting-emotion');
            const customResultingEmotionGroup = document.getElementById('custom-resulting-emotion-group');
            const customResultingEmotionInput = document.getElementById('custom-resulting-emotion');

            const otherOption = Array.from(resultingEmotionSelect.options).find(opt => opt.value === 'Other');
            otherOption.selected = true;

            const event = {
                target: {
                    selectedOptions: [otherOption]
                }
            };

            tracker.handleResultingEmotionChange(event);

            expect(customResultingEmotionGroup.style.display).toBe('block');
            expect(customResultingEmotionInput.required).toBe(true);
        });

        test('should hide custom resulting emotion input when Other is not selected', () => {
            const resultingEmotionSelect = document.getElementById('resulting-emotion');
            const customResultingEmotionGroup = document.getElementById('custom-resulting-emotion-group');
            const customResultingEmotionInput = document.getElementById('custom-resulting-emotion');

            const emptyOption = Array.from(resultingEmotionSelect.options).find(opt => opt.value === 'empty');
            emptyOption.selected = true;

            const event = {
                target: {
                    selectedOptions: [emptyOption]
                }
            };

            tracker.handleResultingEmotionChange(event);

            expect(customResultingEmotionGroup.style.display).toBe('none');
            expect(customResultingEmotionInput.required).toBe(false);
            expect(customResultingEmotionInput.value).toBe('');
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
            // Set up multiple selections
            const drivingEmotionSelect = document.getElementById('driving-emotion');
            const boredOption = Array.from(drivingEmotionSelect.options).find(opt => opt.value === 'bored');
            const sadOption = Array.from(drivingEmotionSelect.options).find(opt => opt.value === 'sad');
            boredOption.selected = true;
            sadOption.selected = true;

            const resultingEmotionSelect = document.getElementById('resulting-emotion');
            const emptyOption = Array.from(resultingEmotionSelect.options).find(opt => opt.value === 'empty');
            const depressedOption = Array.from(resultingEmotionSelect.options).find(opt => opt.value === 'depressed');
            emptyOption.selected = true;
            depressedOption.selected = true;

            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('drivingEmotionIntensity', '7');
            formData.set('resultingEmotionIntensity', '10');
            formData.set('app', 'reddit');
            formData.set('startTime', '14:30');
            formData.set('endTime', '15:45');
            formData.set('notes', 'Test doom scroll session');

            const result = tracker.prepareData(formData);

            expect(result.date).toBe('2023-12-01');
            expect(result.drivingEmotion).toBe('bored, sad');
            expect(result.drivingEmotionIntensity).toBe(7);
            expect(result.resultingEmotion).toBe('empty, depressed');
            expect(result.resultingEmotionIntensity).toBe(10);
            expect(result.app).toBe('reddit');
            expect(result.startTime).toBe('2023-12-01T14:30:00Z');
            expect(result.endTime).toBe('2023-12-01T15:45:00Z');
            expect(result.notes).toBe('Test doom scroll session');
        });

        test('should handle custom driving emotion', () => {
            // Clear all selections first and select only "Other" option
            const drivingEmotionSelect = document.getElementById('driving-emotion');
            Array.from(drivingEmotionSelect.options).forEach(opt => opt.selected = false);
            const otherOption = Array.from(drivingEmotionSelect.options).find(opt => opt.value === 'Other');
            otherOption.selected = true;

            const resultingEmotionSelect = document.getElementById('resulting-emotion');
            Array.from(resultingEmotionSelect.options).forEach(opt => opt.selected = false);
            const emptyOption = Array.from(resultingEmotionSelect.options).find(opt => opt.value === 'empty');
            emptyOption.selected = true;

            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('customDrivingEmotion', 'Overwhelmed');
            formData.set('drivingEmotionIntensity', '5');
            formData.set('resultingEmotionIntensity', '5');
            formData.set('app', 'Instagram');
            formData.set('startTime', '14:30');
            formData.set('endTime', '15:00');

            const result = tracker.prepareData(formData);

            expect(result.drivingEmotion).toBe('Overwhelmed');
            expect(result.customDrivingEmotion).toBeUndefined();
        });

        test('should handle custom app', () => {
            const drivingEmotionSelect = document.getElementById('driving-emotion');
            const boredOption = Array.from(drivingEmotionSelect.options).find(opt => opt.value === 'bored');
            boredOption.selected = true;

            const resultingEmotionSelect = document.getElementById('resulting-emotion');
            const emptyOption = Array.from(resultingEmotionSelect.options).find(opt => opt.value === 'empty');
            emptyOption.selected = true;

            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('drivingEmotionIntensity', '5');
            formData.set('resultingEmotionIntensity', '5');
            formData.set('app', 'Other');
            formData.set('customApp', 'Reddit');
            formData.set('startTime', '14:30');
            formData.set('endTime', '15:00');

            const result = tracker.prepareData(formData);

            expect(result.app).toBe('Reddit');
            expect(result.customApp).toBeUndefined();
        });

        test('should handle multiple emotions with custom driving emotion', () => {
            const drivingEmotionSelect = document.getElementById('driving-emotion');
            Array.from(drivingEmotionSelect.options).forEach(opt => opt.selected = false);
            const boredOption = Array.from(drivingEmotionSelect.options).find(opt => opt.value === 'bored');
            const otherOption = Array.from(drivingEmotionSelect.options).find(opt => opt.value === 'Other');
            boredOption.selected = true;
            otherOption.selected = true;

            const resultingEmotionSelect = document.getElementById('resulting-emotion');
            Array.from(resultingEmotionSelect.options).forEach(opt => opt.selected = false);
            const emptyOption = Array.from(resultingEmotionSelect.options).find(opt => opt.value === 'empty');
            const sadOption = Array.from(resultingEmotionSelect.options).find(opt => opt.value === 'sad');
            emptyOption.selected = true;
            sadOption.selected = true;

            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('customDrivingEmotion', 'Lonely');
            formData.set('drivingEmotionIntensity', '5');
            formData.set('resultingEmotionIntensity', '5');
            formData.set('app', 'Facebook');
            formData.set('startTime', '14:30');
            formData.set('endTime', '15:00');

            const result = tracker.prepareData(formData);

            expect(result.drivingEmotion).toBe('bored, Lonely');
            expect(result.resultingEmotion).toBe('empty, sad');
            expect(result.app).toBe('Facebook');
            expect(result.customDrivingEmotion).toBeUndefined();
        });

        test('should use current date if not provided', () => {
            const drivingEmotionSelect = document.getElementById('driving-emotion');
            const boredOption = Array.from(drivingEmotionSelect.options).find(opt => opt.value === 'bored');
            boredOption.selected = true;

            const resultingEmotionSelect = document.getElementById('resulting-emotion');
            const emptyOption = Array.from(resultingEmotionSelect.options).find(opt => opt.value === 'empty');
            emptyOption.selected = true;

            const formData = new FormData();
            formData.set('drivingEmotionIntensity', '5');
            formData.set('resultingEmotionIntensity', '5');
            formData.set('app', 'Instagram');
            formData.set('startTime', '14:30');
            formData.set('endTime', '15:00');

            const result = tracker.prepareData(formData);

            const expectedDate = new Date().toISOString().split('T')[0];
            expect(result.date).toBe(expectedDate);
        });

        test('should handle custom resulting emotion', () => {
            // Clear all selections first and select only "Other" option
            const drivingEmotionSelect = document.getElementById('driving-emotion');
            Array.from(drivingEmotionSelect.options).forEach(opt => opt.selected = false);
            const boredOption = Array.from(drivingEmotionSelect.options).find(opt => opt.value === 'bored');
            boredOption.selected = true;

            const resultingEmotionSelect = document.getElementById('resulting-emotion');
            Array.from(resultingEmotionSelect.options).forEach(opt => opt.selected = false);
            const otherOption = Array.from(resultingEmotionSelect.options).find(opt => opt.value === 'Other');
            otherOption.selected = true;

            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('customResultingEmotion', 'Guilty');
            formData.set('drivingEmotionIntensity', '5');
            formData.set('resultingEmotionIntensity', '8');
            formData.set('app', 'Instagram');
            formData.set('startTime', '14:30');
            formData.set('endTime', '15:00');

            const result = tracker.prepareData(formData);

            expect(result.resultingEmotion).toBe('Guilty');
            expect(result.customResultingEmotion).toBeUndefined();
        });

        test('should handle multiple resulting emotions with custom emotion', () => {
            const drivingEmotionSelect = document.getElementById('driving-emotion');
            Array.from(drivingEmotionSelect.options).forEach(opt => opt.selected = false);
            const boredOption = Array.from(drivingEmotionSelect.options).find(opt => opt.value === 'bored');
            boredOption.selected = true;

            const resultingEmotionSelect = document.getElementById('resulting-emotion');
            Array.from(resultingEmotionSelect.options).forEach(opt => opt.selected = false);
            const emptyOption = Array.from(resultingEmotionSelect.options).find(opt => opt.value === 'empty');
            const otherOption = Array.from(resultingEmotionSelect.options).find(opt => opt.value === 'Other');
            emptyOption.selected = true;
            otherOption.selected = true;

            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('customResultingEmotion', 'Ashamed');
            formData.set('drivingEmotionIntensity', '5');
            formData.set('resultingEmotionIntensity', '9');
            formData.set('app', 'TikTok');
            formData.set('startTime', '14:30');
            formData.set('endTime', '15:00');

            const result = tracker.prepareData(formData);

            expect(result.resultingEmotion).toBe('empty, Ashamed');
            expect(result.customResultingEmotion).toBeUndefined();
        });
    });

    describe('validateData', () => {
        test('should return true for valid data', () => {
            const validData = {
                date: '2023-12-01',
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z',
                drivingEmotion: 'bored, sad',
                drivingEmotionIntensity: 7,
                resultingEmotion: 'empty, depressed',
                resultingEmotionIntensity: 10,
                app: 'reddit'
            };

            const result = tracker.validateData(validData);
            expect(result).toBe(true);
        });

        test('should return false when date is missing', () => {
            const invalidData = {
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z',
                drivingEmotion: 'bored',
                resultingEmotion: 'empty',
                app: 'Instagram'
            };

            const result = tracker.validateData(invalidData);
            expect(result).toBe(false);
        });

        test('should return false when startTime is missing', () => {
            const invalidData = {
                date: '2023-12-01',
                endTime: '2023-12-01T15:45:00Z',
                drivingEmotion: 'bored',
                resultingEmotion: 'empty',
                app: 'Instagram'
            };

            const result = tracker.validateData(invalidData);
            expect(result).toBe(false);
        });

        test('should return false when endTime is missing', () => {
            const invalidData = {
                date: '2023-12-01',
                startTime: '2023-12-01T14:30:00Z',
                drivingEmotion: 'bored',
                resultingEmotion: 'empty',
                app: 'Instagram'
            };

            const result = tracker.validateData(invalidData);
            expect(result).toBe(false);
        });

        test('should return false when drivingEmotion is missing', () => {
            const invalidData = {
                date: '2023-12-01',
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z',
                resultingEmotion: 'empty',
                app: 'Instagram'
            };

            const result = tracker.validateData(invalidData);
            expect(result).toBe(false);
        });

        test('should return false when resultingEmotion is missing', () => {
            const invalidData = {
                date: '2023-12-01',
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z',
                drivingEmotion: 'bored',
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
                drivingEmotion: 'bored',
                resultingEmotion: 'empty'
            };

            const result = tracker.validateData(invalidData);
            expect(result).toBe(false);
        });

        test('should return false for invalid date format', () => {
            const invalidData = {
                date: '2023-12-01',
                startTime: 'invalid-date',
                endTime: '2023-12-01T15:45:00Z',
                drivingEmotion: 'bored',
                resultingEmotion: 'empty',
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
                drivingEmotion: 'bored',
                resultingEmotion: 'empty',
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
                drivingEmotion: 'bored',
                resultingEmotion: 'empty',
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
                drivingEmotion: 'bored, sad',
                drivingEmotionIntensity: 7,
                resultingEmotion: 'empty, depressed',
                resultingEmotionIntensity: 10,
                app: 'reddit',
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
                    drivingEmotion: 'bored, sad',
                    drivingEmotionIntensity: 7,
                    resultingEmotion: 'empty, depressed',
                    resultingEmotionIntensity: 10,
                    app: 'reddit',
                    startTime: encodeURIComponent(testData.startTime),
                    endTime: encodeURIComponent(testData.endTime),
                    notes: 'Test session'
                })
            });
        });

        test('should throw error on failed request', async () => {
            const testData = {
                date: '2023-12-01',
                drivingEmotion: 'bored',
                resultingEmotion: 'empty',
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
                drivingEmotion: 'bored',
                resultingEmotion: 'empty',
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
                drivingEmotion: 'bored, sad',
                drivingEmotionIntensity: 7,
                resultingEmotion: 'empty, depressed',
                resultingEmotionIntensity: 10,
                app: 'reddit',
                startTime: '2023-12-01T14:30:00Z',
                endTime: '2023-12-01T15:45:00Z'
            };

            tracker.saveToQueue(testData);

            expect(localStorage.setItem).toHaveBeenCalledWith('pendingDoomScrollEntries', expect.any(String));

            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].drivingEmotion).toBe('bored, sad');
            expect(savedData[0].app).toBe('reddit');
            expect(savedData[0]).toHaveProperty('timestamp');
            expect(savedData[0]).toHaveProperty('id');
        });

        test('should load pending entries from localStorage', () => {
            const mockEntries = [
                {
                    drivingEmotion: 'bored',
                    resultingEmotion: 'empty',
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
            const customDrivingEmotionGroup = document.getElementById('custom-driving-emotion-group');
            const customResultingEmotionGroup = document.getElementById('custom-resulting-emotion-group');
            const customAppGroup = document.getElementById('custom-app-group');
            const customDrivingEmotionInput = document.getElementById('custom-driving-emotion');
            const customResultingEmotionInput = document.getElementById('custom-resulting-emotion');
            const customAppInput = document.getElementById('custom-app');
            const drivingIntensityValue = document.getElementById('driving-intensity-value');
            const resultingIntensityValue = document.getElementById('resulting-intensity-value');

            // Set some values first
            customDrivingEmotionGroup.style.display = 'block';
            customResultingEmotionGroup.style.display = 'block';
            customAppGroup.style.display = 'block';
            customDrivingEmotionInput.required = true;
            customResultingEmotionInput.required = true;
            customAppInput.required = true;
            drivingIntensityValue.textContent = '8';
            resultingIntensityValue.textContent = '9';

            tracker.resetForm();

            expect(customDrivingEmotionGroup.style.display).toBe('none');
            expect(customResultingEmotionGroup.style.display).toBe('none');
            expect(customAppGroup.style.display).toBe('none');
            expect(customDrivingEmotionInput.required).toBe(false);
            expect(customResultingEmotionInput.required).toBe(false);
            expect(customAppInput.required).toBe(false);
            expect(drivingIntensityValue.textContent).toBe('5');
            expect(resultingIntensityValue.textContent).toBe('5');
        });
    });
});
