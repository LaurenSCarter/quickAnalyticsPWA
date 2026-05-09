// Category and task data for Quick Analytics PWA
const CategoryData = {
    // Define available categories
    categories: [
        'Home Management',
        'Knitting',
        'YouTube'
    ],

    // Define tasks for each category
    taskOptions: {
        'Home Management': [
            'Finances',
        ],
        'Knitting': [
            'Learning',
            'Jumper',
            'Socks',
        ],
        'YouTube': [
            'Lauren Machine Knits',
            'Lauren Lifts'
        ]
    },

    // Define sub-sub-category options for each task
    subSubCategoryOptions: {        
        'Finances': ['Manage Subscriptions','Home Accounts','Suspend Health Insurance','Bills'],
        
        'Learning': ['Online Tutorial', 'Training Manual', 'Practice'],
        'Jumper': ['version 1', 'version 2'],
        'Socks': ['version 1'],

        'Lauren Machine Knits': ['Planning', 'Recording', 'Editing'],
        'Lauren Lifts': ['Planning', 'Recording', 'Editing'],
    }
};

// Export for module systems or make available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoryData;
} else {
    window.CategoryData = CategoryData;
}