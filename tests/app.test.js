const { screen } = require('@testing-library/dom');

const mockUrls = {
    LOG_ENTRY_ENDPOINT: 'https://test-api.example.com'
};

beforeAll(() => {
    global.URLS = mockUrls;
    
    document.body.innerHTML = `
        <div id="online-status">●</div>
        <span id="status-text">Online</span>
        <form id="time-entry-form">
            <input type="date" id="date" name="date">
            <select id="category" name="category" required>
                <option value="">Select Category</option>
                <option value="Work">Work</option>
                <option value="Home Management">Home Management</option>
                <option value="Health">Health</option>
            </select>
            <select id="task" name="task" required>
                <option value="">Select Category First</option>
            </select>
            <select id="subSubCategory" name="subSubCategory">
                <option value="">Select Sub Category First</option>
            </select>
            <div id="custom-task-group" style="display: none;">
                <input type="text" id="custom-task" name="customTask">
            </div>
            <div id="custom-subSubCategory-group" style="display: none;">
                <input type="text" id="custom-subSubCategory" name="customSubSubCategory">
            </div>
            <input type="time" id="start-time" name="startTime" required>
            <input type="time" id="end-time" name="endTime" required>
            <input type="range" id="energy" name="energy" min="-5" max="5" value="0">
            <span id="energy-value">0</span>
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
    
    const QuickAnalytics = require('../app.js');
    global.QuickAnalytics = QuickAnalytics;
});

describe('QuickAnalytics', () => {
    let app;

    beforeEach(() => {
        app = new QuickAnalytics();
        jest.clearAllMocks();
    });

    describe('populateCategories', () => {
        test('should populate category dropdown from CategoryData', () => {
            const categorySelect = document.getElementById('category');

            // Clear and repopulate
            app.populateCategories();

            // Should have default option + 4 categories
            expect(categorySelect.options.length).toBe(5);
            expect(categorySelect.options[0].value).toBe('');
            expect(categorySelect.options[0].textContent).toBe('Select Category');
            expect(categorySelect.options[1].value).toBe('Ascension Pathway');
            expect(categorySelect.options[2].value).toBe('Health');
            expect(categorySelect.options[3].value).toBe('Home Management');
            expect(categorySelect.options[4].value).toBe('Work');
        });
    });

    describe('setDefaultDate', () => {
        test('should set date input to local date', () => {
            const dateInput = document.getElementById('date');
            
            app.setDefaultDate();
            
            const today = new Date();
            const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
            const expectedDate = localDate.toISOString().split('T')[0];
            
            expect(dateInput.value).toBe(expectedDate);
        });
    });

    describe('prepareData', () => {
        test('should preserve date field in processed data', () => {
            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('category', 'Work');
            formData.set('task', 'Meeting');
            formData.set('startTime', '09:00');
            formData.set('endTime', '10:00');
            formData.set('energy', '3');
            formData.set('notes', 'Test note');

            const result = app.prepareData(formData);

            expect(result.date).toBe('2023-12-01');
            expect(result.startTime).toBe('2023-12-01T09:00:00Z');
            expect(result.endTime).toBe('2023-12-01T10:00:00Z');
            expect(result.energy).toBe(3);
        });

        test('should handle custom task', () => {
            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('category', 'Work');
            formData.set('task', 'Other');
            formData.set('customTask', 'Custom Task Name');
            formData.set('startTime', '09:00');
            formData.set('endTime', '10:00');
            formData.set('energy', '0');

            const result = app.prepareData(formData);

            expect(result.task).toBe('Custom Task Name');
            expect(result.customTask).toBeUndefined();
        });

        test('should handle custom task with custom sub-sub-category', () => {
            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('category', 'Work');
            formData.set('task', 'Other');
            formData.set('customTask', 'Custom Task Name');
            formData.set('customSubSubCategory', 'Custom Sub-Sub Category');
            formData.set('startTime', '09:00');
            formData.set('endTime', '10:00');
            formData.set('energy', '0');

            const result = app.prepareData(formData);

            expect(result.task).toBe('Custom Task Name');
            expect(result.customTask).toBeUndefined();
            expect(result.subSubCategory).toBe('Custom Sub-Sub Category');
            expect(result.customSubSubCategory).toBeUndefined();
        });
    });

    describe('validateData', () => {
        test('should return true for valid data', () => {
            const validData = {
                category: 'Work',
                task: 'Meeting',
                startTime: '2023-12-01T09:00:00Z',
                endTime: '2023-12-01T10:00:00Z'
            };

            const result = app.validateData(validData);
            expect(result).toBe(true);
        });

        test('should return false for missing required fields', () => {
            const invalidData = {
                category: 'Work',
                startTime: '09:00',
                endTime: '10:00'
            };

            const result = app.validateData(invalidData);
            expect(result).toBe(false);
        });

        test('should validate time order', () => {
            const invalidTimeData = {
                category: 'Work',
                task: 'Meeting',
                startTime: '2023-12-01T10:00:00Z',
                endTime: '2023-12-01T09:00:00Z'
            };

            const result = app.validateData(invalidTimeData);
            expect(result).toBe(false);
        });
    });

    describe('submitToAPI', () => {
        test('should make fetch request with correct parameters', async () => {
            const testData = {
                entryType: "logTime", 
                date: '2023-12-01',
                category: 'Work',
                task: 'Meeting',
                startTime: '2023-12-01T09:00:00Z',
                endTime: '2023-12-01T10:00:00Z',
                energy: 3
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });

            await app.submitToAPI(testData);

            expect(fetch).toHaveBeenCalledWith(mockUrls.LOG_ENTRY_ENDPOINT, {
                redirect: "follow",
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify({
                    ...testData,
                    startTime: encodeURIComponent(testData.startTime),
                    endTime: encodeURIComponent(testData.endTime)
                })
            });
        });

        test('should throw error on failed request', async () => {
            const testData = { category: 'Work', task: 'Meeting' };

            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            await expect(app.submitToAPI(testData)).rejects.toThrow('HTTP error! status: 500');
        });
    });

    describe('offline functionality', () => {
        test('should save to queue when offline', () => {
            const testData = { category: 'Work', task: 'Meeting' };
            
            app.saveToQueue(testData);

            expect(localStorage.setItem).toHaveBeenCalledWith('pendingEntries', expect.any(String));
        });

        test('should load pending entries from localStorage', () => {
            const mockEntries = [{ category: 'Work', task: 'Meeting' }];
            localStorage.getItem.mockReturnValue(JSON.stringify(mockEntries));

            const entries = app.getPendingEntries();

            expect(entries).toEqual(mockEntries);
            expect(localStorage.getItem).toHaveBeenCalledWith('pendingEntries');
        });
    });

    describe('Quick Actions', () => {
        test('should handle pet care quick action with duration', () => {
            // Create a mock button element
            const mockButton = {
                dataset: {
                    category: 'Home Management',
                    task: 'Pet Care',
                    subcategory: 'Dog Walk',
                    duration: '60'
                }
            };

            const mockEvent = { target: mockButton };

            // Mock the current time to get consistent results
            const mockNow = new Date('2023-12-01T14:30:00');
            const originalDate = global.Date;
            global.Date = class extends originalDate {
                constructor(...args) {
                    if (args.length === 0) {
                        return mockNow;
                    }
                    return new originalDate(...args);
                }
                static now() {
                    return mockNow.getTime();
                }
            };

            app.handleQuickAction(mockEvent);

            // Verify the form fields are populated correctly
            expect(document.getElementById('category').value).toBe('Home Management');
            expect(document.getElementById('task').value).toBe('Pet Care');
            expect(document.getElementById('subSubCategory').value).toBe('Dog Walk');
            expect(document.getElementById('start-time').value).toBe('14:30');
            expect(document.getElementById('end-time').value).toBe('15:30'); // 60 minutes later

            global.Date = originalDate;
        });
    });

    describe('updateEnergyValue', () => {
        test('should update energy value display', () => {
            const energySlider = document.getElementById('energy');
            const energyValue = document.getElementById('energy-value');

            energySlider.value = '3';
            const event = { target: energySlider };

            app.updateEnergyValue(event);

            expect(energyValue.textContent).toBe('3');
        });

        test('should handle negative energy values', () => {
            const energySlider = document.getElementById('energy');
            const energyValue = document.getElementById('energy-value');

            energySlider.value = '-4';
            const event = { target: energySlider };

            app.updateEnergyValue(event);

            expect(energyValue.textContent).toBe('-4');
        });
    });

    describe('showMessage', () => {
        test('should display success message', () => {
            const messageEl = document.getElementById('message');

            app.showMessage('Time logged successfully!', 'success');

            expect(messageEl.textContent).toBe('Time logged successfully!');
            expect(messageEl.className).toBe('message success');
            expect(messageEl.style.display).toBe('block');
        });

        test('should display error message', () => {
            const messageEl = document.getElementById('message');

            app.showMessage('Failed to log time', 'error');

            expect(messageEl.textContent).toBe('Failed to log time');
            expect(messageEl.className).toBe('message error');
            expect(messageEl.style.display).toBe('block');
        });
    });

    describe('setLoading', () => {
        test('should disable button and show spinner when loading', () => {
            const button = document.querySelector('.submit-btn');
            const text = button.querySelector('.btn-text');
            const spinner = button.querySelector('.btn-spinner');

            app.setLoading(true);

            expect(button.disabled).toBe(true);
            expect(text.style.display).toBe('none');
            expect(spinner.style.display).toBe('inline');
        });

        test('should enable button and hide spinner when not loading', () => {
            const button = document.querySelector('.submit-btn');
            const text = button.querySelector('.btn-text');
            const spinner = button.querySelector('.btn-spinner');

            app.setLoading(false);

            expect(button.disabled).toBe(false);
            expect(text.style.display).toBe('inline');
            expect(spinner.style.display).toBe('none');
        });
    });

    describe('updateOnlineStatus', () => {
        test('should show online status when navigator.onLine is true', () => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: true
            });

            app.updateOnlineStatus();

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

            app.updateOnlineStatus();

            const statusIndicator = document.getElementById('online-status');
            const statusText = document.getElementById('status-text');

            expect(statusIndicator.className).toBe('status offline');
            expect(statusText.textContent).toBe('Offline');
        });
    });

    describe('prepareData - energy conversion', () => {
        test('should convert energy string to number', () => {
            const formData = new FormData();
            formData.set('date', '2023-12-01');
            formData.set('category', 'Work');
            formData.set('task', 'Meeting');
            formData.set('startTime', '09:00');
            formData.set('endTime', '10:00');
            formData.set('energy', '-3');
            formData.set('notes', 'Low energy meeting');

            const result = app.prepareData(formData);

            expect(result.energy).toBe(-3);
            expect(typeof result.energy).toBe('number');
        });
    });

    describe('submitToAPI - error handling', () => {
        test('should handle API error response', async () => {
            const testData = {
                entryType: "logTime",
                date: '2023-12-01',
                category: 'Work',
                task: 'Meeting',
                startTime: '2023-12-01T09:00:00Z',
                endTime: '2023-12-01T10:00:00Z',
                energy: 3
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ error: 'Invalid time range' })
            });

            await expect(app.submitToAPI(testData)).rejects.toThrow('Invalid time range');
        });

        test('should properly encode URI components in request', async () => {
            const testData = {
                entryType: "logTime",
                date: '2023-12-01',
                category: 'Work',
                task: 'Meeting',
                startTime: '2023-12-01T09:00:00Z',
                endTime: '2023-12-01T10:00:00Z',
                energy: 0
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });

            await app.submitToAPI(testData);

            const callArgs = fetch.mock.calls[0];
            const bodyData = JSON.parse(callArgs[1].body);

            expect(bodyData.startTime).toBe(encodeURIComponent('2023-12-01T09:00:00Z'));
            expect(bodyData.endTime).toBe(encodeURIComponent('2023-12-01T10:00:00Z'));
        });
    });

    describe('offline functionality - queue management', () => {
        test('should append to existing queue', () => {
            const existingEntries = [
                { category: 'Work', task: 'Meeting', timestamp: '2023-12-01T10:00:00Z', id: '111' }
            ];
            localStorage.getItem.mockReturnValue(JSON.stringify(existingEntries));

            const newData = { category: 'Health', task: 'Exercise' };
            app.saveToQueue(newData);

            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(2);
            expect(savedData[0].category).toBe('Work');
            expect(savedData[1].category).toBe('Health');
        });

        test('should handle empty pending entries', () => {
            localStorage.getItem.mockReturnValue(null);

            const entries = app.getPendingEntries();

            expect(entries).toEqual([]);
        });
    });
});