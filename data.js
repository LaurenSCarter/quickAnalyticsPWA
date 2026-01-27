// Category and task data for Quick Analytics PWA
const CategoryData = {
    // Define available categories
    categories: [
        'Health',
        'Home Management',
        'Work'
    ],

    // Define tasks for each category
    taskOptions: {
        'Health': [
            'Life Overhead',
            'Emotional Care',
            'Ascension Pathway',
            'Yoga',
            'Hobbies',
            'Body Care',
            'Dentist',
            'Relax',
            'Other'
        ],
        'Home Management': [
            'Car',
            'Cleaning',
            'Cooking',
            'Decluttering',
            'House Sale',
            'Finances',
            'General Maintenance',
            'Misc',
            'Pet Care',
            'Shopping',
            'Strata',
            'Other'
        ],
        'Work': [
            'Computer Maintenance',
            'Domestic Angel',
            'Job Applications',
            'NDIS',
            'Overhead',
            'Professional Development',
            'Sole Trader Administration',
            'Trello Sprint',
            'Quick Analytics',
            'Other'
        ]
    },

    // Define sub-sub-category options for each task
    subSubCategoryOptions: {        
        // Health tasks
        'Life Overhead': ['Wake up', 'Lunch', 'Break', 'Breakfast'],
        'Body Care': ['Personal Hygiene','Mindful Eating','Gym','Rest','Sauna','Sick'],
        'Emotional Care': ['Journaling','Contemplation'],
        'Hobbies': ['Knitting','Reading','Audiobook','Podcast','Content Liberation'],
        'Ascension Pathway': ['Circle','Breakout Call','Meditation','Spiritual Text'],
        'Relax': ['Bath','Break','Reading','Rest','Sunshine','TV / YouTube'],
        'Yoga': ['Study','Practice','Yin'],
        
        // Home Management tasks
        'Car': ['Service', 'Registration'],
        'Cleaning': ['General','Kitchen','Bedroom','Bathroom','Lounge Room','Laundry','Home Office','Car','Rubbish','Deep Clean','Service Vacuum'],
        'Cooking': ['Food Prep','Breakfast','Brunch','Lunch','Dinner'],
        'Decluttering': ['Bedroom','Home Office'],
        'House Sale': ['Repairs/Decorating'],
        'Finances': ['Manage Subscriptions','Home Accounts','Suspend Health Insurance','Bills'],
        'Misc': ['Move Car','Condition leather jacket','Connect Smart PowerPoints to Network'],
        'Pet Care': ['Dog Walk','Take Pets Out','Feed Pets','Commute','Brush Bease','Bonding','Cat demands','Food Prep','Vet','Doggy Drive'],
        'Shopping': ['Groceries','Clothes','Accessories','Misc','Post','Errands'],
        'Strata': ['Communication','Yard Work'],
        
        // Work tasks
        'Computer Maintenance': ['System Updates','Security','Dev Setup','Cloud Storage','Google Photo Settings','Share Recordings to PC','Clean Android Internal Drive','Laptop Battery','Review Key Commands','Troubleshoot Network Congestion','Resolve DNS Issues'],
        'Domestic Angel': ['Product Development','Website V2'],
        'Job Applications': [],
        'NDIS': ['Like Family', 'InsideOutAssist'],
        'Overhead': ['Commute','Daily Setup'],
        'Professional Development': ['Research Vibe Coding Tools','AI Research','Training: PySpark'],
        'Sole Trader Administration': ['Marketing','Death & Taxes','ABN - Sole Trader Registration','Domain/Email Registration'],
        'Trello Sprint': ['Weekly Review','Update Cards','Stand Up'],
        'Quick Analytics': ['Data Management','Development V2','End of Month Review','Time Entries']
    }
};

// Export for module systems or make available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoryData;
} else {
    window.CategoryData = CategoryData;
}