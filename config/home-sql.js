"use strict";
/**
 * Admin setup
 *
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZS1zcWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29uZmlnL2hvbWUtc3FsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7OztHQUlHOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYjs7Ozs7Ozs7OzREQVN3RDtJQUN4RCxjQUFjLEVBQUU7UUFDWixLQUFLLEVBQUUsb0JBQW9CO1FBQzNCLEdBQUcsRUFBRSwwQkFBMEI7UUFDL0IsVUFBVSxFQUFFLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQztRQUNoRSxXQUFXLEVBQUUsZUFBZTtRQUM1QixLQUFLLEVBQUU7WUFDSDtnQkFDSSxNQUFNLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxRQUFRO2dCQUNyQyxLQUFLLEVBQUU7b0JBQ0gsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEdBQUc7aUJBQy9EO2FBQ0o7WUFDRCxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQ3hELEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFO1lBQ3JDLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxrQkFBa0IsR0FBRztZQUN4RCxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEdBQUc7WUFDMUQsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLHdCQUF3QixHQUFHO1NBQ25FO0tBQ0o7SUFFRCxxQkFBcUI7SUFDckIsT0FBTyxFQUFFO1FBQ0wsS0FBSyxFQUFFLG9CQUFvQjtRQUMzQixHQUFHLEVBQUUsc0JBQXNCO1FBQzNCLFVBQVUsRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFD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