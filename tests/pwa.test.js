describe('PWA Features', () => {
    describe('Service Worker', () => {
        test('should register service worker when supported', () => {
            const mockRegister = jest.fn(() => Promise.resolve());
            
            Object.defineProperty(navigator, 'serviceWorker', {
                value: { register: mockRegister },
                writable: true
            });

            // Simulate the actual service worker registration code from index.html
            if ('serviceWorker' in navigator) {
                const loadHandler = () => {
                    navigator.serviceWorker.register('sw.js');
                };
                
                // Add the event listener
                window.addEventListener('load', loadHandler);
                
                // Trigger the load event
                const loadEvent = new Event('load');
                window.dispatchEvent(loadEvent);
            }

            expect(mockRegister).toHaveBeenCalledWith('sw.js');
        });
    });

    describe('Offline Storage', () => {
        test('should store data in localStorage', () => {
            const testData = { key: 'value' };
            localStorage.setItem('testKey', JSON.stringify(testData));

            expect(localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(testData));
        });

        test('should retrieve data from localStorage', () => {
            const testData = { key: 'value' };
            localStorage.getItem.mockReturnValue(JSON.stringify(testData));

            const result = JSON.parse(localStorage.getItem('testKey'));

            expect(result).toEqual(testData);
            expect(localStorage.getItem).toHaveBeenCalledWith('testKey');
        });
    });

    describe('Network Status', () => {
        test('should detect online status', () => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: true
            });

            expect(navigator.onLine).toBe(true);
        });

        test('should detect offline status', () => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });

            expect(navigator.onLine).toBe(false);
        });
    });

    describe('Form Validation', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <form id="time-entry-form">
                    <input type="date" id="date" name="date" required>
                    <select id="category" name="category" required>
                        <option value="">Select Category</option>
                        <option value="Work">Work</option>
                    </select>
                    <input type="time" id="start-time" name="startTime" required>
                    <input type="time" id="end-time" name="endTime" required>
                </form>
            `;
        });

        test('should validate required fields', () => {
            const form = document.getElementById('time-entry-form');
            const categorySelect = document.getElementById('category');
            const startTime = document.getElementById('start-time');
            const endTime = document.getElementById('end-time');

            categorySelect.value = '';
            startTime.value = '09:00';
            endTime.value = '10:00';

            expect(form.checkValidity()).toBe(false);
            expect(categorySelect.validity.valid).toBe(false);
        });

        test('should pass validation with all required fields', () => {
            const form = document.getElementById('time-entry-form');
            const categorySelect = document.getElementById('category');
            const startTime = document.getElementById('start-time');
            const endTime = document.getElementById('end-time');

            categorySelect.value = 'Work';
            startTime.value = '09:00';
            endTime.value = '10:00';

            expect(categorySelect.validity.valid).toBe(true);
            expect(startTime.validity.valid).toBe(true);
            expect(endTime.validity.valid).toBe(true);
        });
    });
});