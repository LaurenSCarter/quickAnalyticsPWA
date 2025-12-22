// URL constants for Quick Analytics PWA
const URLS = {
    // APPS Script Endpoint
    TIME_ENTRY_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwXGJWZW7Hx_nAKAWx9_PNm_uIve1K4YKUWkHUkRY6wzANr1_84ZscC1KuoCVBv5Ckp3g/exec',
    DOOM_SCROLL_ENDPOINT: 'https://script.google.com/macros/s/AKfycbx-8W4f2HNTXDn6H9rxWyn4R55P2P8Ozp_xl3FtLWalBt6JyRsy7HHGPgxmeNy0Iusptw/exec',

    //Looker Studio Endpoints
    TODAYS_TIME_ENTRIES: 'https://lookerstudio.google.com/embed/reporting/6b9695d3-cc1f-4539-9b0f-b6918d6a360a/page/p_qxlby2dywd',
    WEEKLY_DASHBOARD: 'https://lookerstudio.google.com/embed/reporting/6b9695d3-cc1f-4539-9b0f-b6918d6a360a/page/mKhMF',
    WEEKLY_INSPIRATION: 'https://lookerstudio.google.com/embed/reporting/6b9695d3-cc1f-4539-9b0f-b6918d6a360a/page/p_mw7cs3plwd',
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = URLS;
}