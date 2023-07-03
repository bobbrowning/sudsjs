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
        title: 'Contact Management',
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
    sales: {
        title: 'Sales',
        img: '/images/suds/edit.jpg',
        permission: ['clerical', 'sales', 'admin', 'demo'],
        description: 'Let\'s get more business',
        links: [
            {
                report: 'customerSearch',
                title: 'Customer search',
                input: {
                    fullName: {
                        type: 'text',
                        placeholder: 'Search customers',
                    },
                },
                open: 'contacts',
            },
            {
                table: 'user',
                title: 'New prospect',
                mode: 'new',
                prePopulate: [['userType', 'P']],
                open: 'contacts',
                openGroup: 'contacts',
            },
            { report: 'customers' },
            { report: 'prospects' },
            { table: 'salesorders', title: 'Sales Orders', },
            { table: 'products' },
        ],
    },
    shipping: {
        title: 'shipping',
        img: '/images/suds/edit.jpg',
        permission: ['clerical', 'warehouse', 'admin', 'demo'],
        description: 'Shipping',
        links: [
            { report: 'outstandingOrders', title: 'Outstanding orders' },
            { table: 'salesorders', title: 'All sales orders', },
            { report: 'productSales', title: 'Sales per product' },
            { table: 'products', },
            { report: 'customers', title: 'All customers' },
        ],
    },
    purchasing: {
        title: 'Purchasing',
        img: '/images/suds/edit.jpg',
        permission: ['clerical', 'purchasing', 'warehouse', 'admin', 'demo'],
        description: 'Keeping stock levels right',
        links: [
            { report: 'suppliers', title: 'Suppliers' },
            { table: 'products', },
            { table: 'purchaseorders', title: 'Purchase Orders' },
        ],
    },
    // Website Management
    website: {
        title: 'Website Management',
        img: '/images/suds/www.jpg',
        permission: ['admin', 'web', 'demo'],
        links: [
            { table: 'webpagesnosql', title: 'Web Pages' },
            { www: '/', title: 'Home page', target: '_blank' },
            { www: 'https://www.google.com/analytics', title: 'Google analytics', target: '_blank' }
        ],
    },
    // Training academy
    relate: {
        title: 'Demo 1',
        description: 'Relational database',
        img: '/images/suds/www.jpg',
        permission: ['admin', 'demor', 'demo', 'trainer'],
        links: [
            { table: 'subjects', title: 'Subjects' },
            { table: 'papers', title: 'Papers' },
            { table: 'studentnorm', title: 'Students' },
            { report: 'resultsnorm', title: 'Results' },
        ],
    },
    denorm: {
        title: 'Demo 2',
        description: 'Denormalised/structured',
        img: '/images/suds/www.jpg',
        permission: ['admin', 'demo', 'trainer', 'demod'],
        links: [
            { table: 'subjectsdenorm', title: 'Subjects and papers' },
            { table: 'studentdenorm', title: 'Students' },
        ],
    },
    variable: {
        title: 'Demo 3',
        description: 'Variable content',
        img: '/images/suds/www.jpg',
        permission: ['admin', 'demo', 'trainer', 'demov'],
        links: [
            { table: 'studentsubschema', title: 'Students' },
            { report: 'studentSubschema', title: 'Subschemas' },
        ],
    },
    views: {
        title: 'Couch DB views',
        description: 'Couch DB only',
        img: '/images/suds/www.jpg',
        permission: ['admin', 'demo'],
        links: [
            { report: 'allSubjects', title: 'Subjects list' },
            { report: 'allUsers', title: 'User list' },
            { report: 'allAudit', title: 'Audit list' },
            { report: 'resultsdenorm', title: 'Results' },
            { report: 'productSales', title: 'Product sales' },
            { report: 'salesByProduct', title: 'Monthly sales' },
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
            { table: 'audit', title: 'Audit trail', },
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
    // dump / restore
    dumprestore: {
        title: 'Dump / restore',
        img: '/images/suds/settings.jpg',
        permission: ['admin'],
        description: 'Use with care',
        links: [
            { www: '/dump', title: 'Dump as JSON file' },
            { www: '/restore', title: 'Import from JSON file' },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcvaG9tZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7Ozs7R0FJRzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2I7Ozs7Ozs7Ozs0REFTd0Q7SUFDeEQsY0FBYyxFQUFFO1FBQ1osS0FBSyxFQUFFLG9CQUFvQjtRQUMzQixHQUFHLEVBQUUsMEJBQTBCO1FBQy9CLFVBQVUsRUFBRSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUM7UUFDaEUsV0FBVyxFQUFFLGVBQWU7UUFDNUIsS0FBSyxFQUFFO1lBQ0g7Z0JBQ0ksTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsUUFBUTtnQkFDckMsS0FBSyxFQUFFO29CQUNILFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixHQUFHO2lCQUMvRDthQUNKO1lBQ0QsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtZQUN4RCxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRTtZQUNyQyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEdBQUc7WUFDeEQsRUFBRSxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixHQUFHO1lBQzFELEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRSx3QkFBd0IsR0FBRztTQUNuRTtLQUNKO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsS0FBSyxFQUFFLE9BQU87UUFDZCxHQUFHLEVBQUUsdUJBQXVCO1FBQzVCLFVBQVUsRUFBRSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQztRQUNsRCxXQUFXLEVB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