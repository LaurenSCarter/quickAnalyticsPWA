// URL constants for Quick Analytics PWA
const URLS = {
    // APPS Script Endpoint
    API_SCRIPT: 'https://script.google.com/macros/s/AKfycbwXGJWZW7Hx_nAKAWx9_PNm_uIve1K4YKUWkHUkRY6wzANr1_84ZscC1KuoCVBv5Ckp3g/exec',

    //Looker Studio Endpoint
    WEEKLY_DASHBOARD: 'https://lookerstudio.google.com/embed/reporting/6b9695d3-cc1f-4539-9b0f-b6918d6a360a/page/mKhMF'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = URLS;
}