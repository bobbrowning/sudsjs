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
