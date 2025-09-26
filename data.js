// Category and task data for Quick Analytics PWA
const CategoryData = {
    // Define tasks for each category
    taskOptions: {
        'Ascension Pathway': [
            'Admin',
            'Circle',
            'Check-in',
            'Class',
            'Data Management',
            'Homework',
            'Prayer Partner',
            'Other'
        ],
        'Health': [
            'Body Care',
            'Dentist',
            'Emotional Care',
            'Hobbies',
            'Relax',
            'Yoga',
            'Other'
        ],
        'Home Management': [
            'Car',
            'Cleaning',
            'Cooking',
            'Decluttering',
            'Decorating Project',
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
        // Ascension Pathway tasks
        'Admin': ['ML3 Class Index', 'Survey'],
        'Circle': ['Video On', 'Video Off'],
        'Check-in': ['1-1 check-in with Jennifer', '1-1 check-in with Mary-Lu'],
        'Class': ['Replay','Video Off', 'Video On'],
        'Data Management': ['Download Files', 'ML1 - Download - Rename - Organise', 'ML2 - Download - Rename - Organise', 'ML3 - Download - Rename - Organise', 'AP - Download - Rename - Organise'],
        'Homework': ['Reading','Ray 3','Inspiration Board','Meditation'],
        'Prayer Partner': ['Andree','Sara','Cora','Julie'],
        
        // Health tasks
        'Body Care': ['Personal Hygiene','Mindful Eating','Gym','Rest','Sauna','Sick'],
        'Dentist': ['Check Appointment','Attend Appointment'],
        'Emotional Care': ['Journaling','Contemplation'],
        'Hobbies': ['Knitting','Reading','Audiobook','Podcast'],
        'Relax': ['Bath','Break','Reading','Rest','Sunshine','TV / YouTube'],
        'Yoga': ['Study','Practice','Meditation','Tattoo'],
        
        // Home Management tasks
        'Car': ['Service', 'Registration'],
        'Cleaning': ['General','Kitchen','Bedroom','Bathroom','Lounge Room','Laundry','Home Office','Car','Rubbish','Deep Clean','Service Vacuum'],
        'Cooking': ['Food Prep','Breakfast','Brunch','Lunch','Dinner'],
        'Decluttering': ['Bedroom','Home Office'],
        'Decorating Project': ['Bedroom','Home Office','Kitchen'],
        'Finances': ['Manage Subscriptions','Home Accounts','Suspend Health Insurance','Bills'],
        'Misc': ['Move Car','Condition leather jacket','Connect Smart PowerPoints to Network'],
        'Pet Care': ['Dog Walk','Take Pets Out','Feed Pets','Commute','Brush Bease','Bonding','Cat demands','Food Prep','Vet','Doggy Drive'],
        'Shopping': ['Groceries','Clothes','Accessories','Misc','Post','Errands'],
        'Strata': ['Communication','Yard Work'],
        
        // Work tasks
        'Computer Maintenance': ['System Updates','Security','Dev Setup','Cloud Storage','Content Liberation','Google Photo Settings','Share Recordings to PC','Clean Android Internal Drive','Laptop Battery','Review Key Commands','Troubleshoot Network Congestion','Resolve DNS Issues'],
        'Domestic Angel': ['Product Development','Website V2'],
        'Job Applications': [],
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