const { screen } = require('@testing-library/dom');

const mockUrls = {
    API_SCRIPT: 'https://test-api.example.com'
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

            expect(fetch).toHaveBeenCalledWith(mockUrls.API_SCRIPT, {
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
});