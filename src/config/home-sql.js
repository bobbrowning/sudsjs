
/**
 * Admin setup
 *
 *
 */

module.exports = {
    /** ****************************************************
     *
     *         Specify the admnistration home page.
     *         -----------------------------------
     
    *  This is divided into into sections.
    *  Sections can contain links to file listing programs or
    *  links to arbitrary web pages
    *
    ***************************************************** */
    contactManager: {
        title: 'Contact management',
        img: '/images/suds/contact.jpg',
        permission: ['clerical', 'sales', 'purchasing', 'admin', 'demo'],
        description: 'Keep in touch',
        links: [
            {
                report: 'userSearch', title: 'Search',
                input: {
                    fullName: { type: 'text', placeholder: 'Search all users', },
                },
            },
            { table: 'contacts', title: 'Log contact', mode: 'new' },
            { table: 'user', title: 'All users' },
            { report: 'myOpenContacts', title: 'My open contacts', },
            { report: 'allOpenContacts', title: 'All open contacts', },
            { report: 'overdueFollowUps', title: 'All overdue follow ups', },
        ],
    },
 
    // Website Management
    website: {
        title: 'Website Management',
        img: '/images/suds/www.jpg',
        permission: ['admin', 'web', 'demo'],
        links: [
            { www: '/', title: 'Home page', target: '_blank' },
            { table: 'webpages', title: 'Web Pages (sql)' },
            { www: 'https://www.google.com/analytics', title: 'Google analytics', target: '_blank' }
        ],
    },
    // Training academy
    relate: {
        title: 'Demo 1',
        description: 'Relational database',
        permission: ['admin', 'demor', 'demo', 'trainer'],
        links: [
            { table: 'subjects', title: 'Subjects' },
            { table: 'papers', title: 'Papers' },
            { table: 'studentnorm', title: 'Students' },
            { report: 'resultsnorm', title: 'Results' },
        ],
    },
    //  Setup / admin section
    setup: {
        title: 'Setup',
        img: '/images/suds/settings.jpg',
        permission: ['admin', 'demo'],
        description: 'Used by system admin',
        links: [
            { table: 'user', title: 'All users' },
            { table: 'subschema', title: 'Subschema' },
            { report: 'auditTrail', title: 'Audit trail', },
            { www: '/configreport', title: 'Configuration report' },
            { www: '/admin?table=fieldtypes&mode=new', title: 'Field type test' },
        ],
    },
    //  Setup / admin section
    validation: {
        title: 'Validation',
        img: '/images/suds/settings.jpg',
        permission: ['admin', 'demo'],
        description: 'Run on config changes',
        links: [
            { www: '/validateconfig', title: 'Validate configuration' },
            { user: 'lastValidate', title: 'Results' },
        ],
    },
    trouble: {
        title: 'Trouble Shooting',
        img: '/images/suds/settings.jpg',
        permission: ['admin', 'demo'],
        description: 'Used by system admin',
        links: [
            {
                report: 'auditTrail', title: 'Audit trail',
                input: {
                    table: { type: 'text', placeholder: 'Table', },
                    button: 'search audit trail',
                },
            },
            { table: 'contacts', title: 'All external contacts' },
            { table: 'productjoin', title: 'Product Join Table' },
            { table: 'purchaseorderlines', title: 'Purchase order lines' },
        ],
    },
    /*
     Docs: {
       title: 'Documentation',
       img: '/images/suds/settings.jpg',
       permission: ['demo'],
       description: 'Documentation - under development',
       links: [
          { user: 'docs', title: 'Module path/name' },
        ],
     },
   
   */
    switchdb: {
        title: 'Switch Database',
        permission: ['admin', 'demo'],
        description: 'Switch database',
        links: [
            { user: 'switchdb', title: 'Select' },
        ],
    },
    //  Setup / admin section
    you: {
        title: 'You',
        img: '/images/suds/profile.jpg',
        permission: ['#guest#', 'all'],
        description: '#username#',
        links: [
            { user: 'login', title: 'Log in' },
            { user: 'register', title: 'Register' },
            { user: 'forgotten', title: 'Forgotten password' },
            { user: 'logout', title: 'Log out' },
            { user: 'changepw', title: 'Change password' },
            { user: 'profile', title: 'Update your profile' },
        ],
    },
};
