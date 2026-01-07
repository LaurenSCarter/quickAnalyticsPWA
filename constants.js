// URL constants for Quick Analytics PWA
const URLS = {
    // APPS Script Endpoint
    LOG_ENTRY_ENDPOINT: 'https://script.google.com/macros/s/AKfycbxhWGVWlfdnr_zL-LNYCU58p2Hx4lfYKMKpQqyco7efs-KAV5taJCb9gE1TuT-AiJaaFg/exec',
    
    //Looker Studio Endpoints

    /**
     * NOTE TO DEVELOPER
     * When generating the looker studio report links, you need to be in the editor mode.
     * Enable Sharing (unlisted - so anyone with the link can view but its unlisted)
     * Update the permissions to prevent users from copying/using the report attributes (see advanced sharing settings)
     * Finally - get the 'embeded' page link for each page of the report.
     * THIS is the version of the link that needs to be used here.
     * YOU WILL GET CONSOLE ERRORS and RENDERING ERRORS if you do not do this.
     */
    
    // TIME REPORTS
    TODAYS_TIME_ENTRIES: 'https://lookerstudio.google.com/embed/reporting/6b9695d3-cc1f-4539-9b0f-b6918d6a360a/page/p_qxlby2dywd',
    WEEKLY_DASHBOARD: 'https://lookerstudio.google.com/embed/reporting/6b9695d3-cc1f-4539-9b0f-b6918d6a360a/page/mKhMF',
    WEEKLY_INSPIRATION: 'https://lookerstudio.google.com/embed/reporting/6b9695d3-cc1f-4539-9b0f-b6918d6a360a/page/p_mw7cs3plwd',

    // DOOM SCROLL REPORTS
    DOOM_WEEKLY_OVERVIEW: 'https://lookerstudio.google.com/embed/reporting/d23efbd3-aa61-4b47-87ac-6d5dc4b066af/page/3JUkF',
    DOOM_DRIVING_EMOTION_INSIGHTS: 'https://lookerstudio.google.com/embed/reporting/d23efbd3-aa61-4b47-87ac-6d5dc4b066af/page/p_gy0b3darzd',
    DOOM_RESULTING_EMOTION_INSIGHTS: 'https://lookerstudio.google.com/embed/reporting/d23efbd3-aa61-4b47-87ac-6d5dc4b066af/page/p_x6pl5yarzd',

    // PET ANALYTIC REPORTS
    // TBA

};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = URLS;
}