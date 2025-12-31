// URL constants for Quick Analytics PWA
const URLS = {
    // APPS Script Endpoint
    LOG_ENTRY_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwBw3cYQZqUBZZF7mLPH1s09EDN2a4FNTtZbfp_fZy0LBuThb0oi9pc5iM4BbkzqvFBxw/exec',
    
    //Looker Studio Endpoints
    TODAYS_TIME_ENTRIES: 'https://lookerstudio.google.com/embed/reporting/6b9695d3-cc1f-4539-9b0f-b6918d6a360a/page/p_qxlby2dywd',
    WEEKLY_DASHBOARD: 'https://lookerstudio.google.com/embed/reporting/6b9695d3-cc1f-4539-9b0f-b6918d6a360a/page/mKhMF',
    WEEKLY_INSPIRATION: 'https://lookerstudio.google.com/embed/reporting/6b9695d3-cc1f-4539-9b0f-b6918d6a360a/page/p_mw7cs3plwd',
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = URLS;
}