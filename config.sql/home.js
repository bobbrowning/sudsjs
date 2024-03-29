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
    title: 'Contact management',                         // Title of the section
    img: '/images/suds/contact.jpg',                     // Optional image 
    permission: ['clerical', 'sales', 'purchasing', 'admin','demo'],       // permission sets that will see this
    description: 'Keep in touch',                        // explanitory text under the heading.
    links: [
      {
        report: 'userSearch', title: 'Search',     // Pre-defined report which uses the fullName 
        input: {                                                // input field in the search.
          fullName: { type: 'text', placeholder: 'Search all users', },
        },
      },
      { table: 'contacts', title: 'Log contact', mode: 'new' },
      { table: 'user', title: 'All users' },
      { report: 'allFollowUps', title: 'All overdue Follow ups', },
      { report: 'allUpcomingFollowUps', title: 'All upcoming Follow ups', },
    ],
  },


  sales: {
    title: 'Sales',                                   // Title of the section
    img: '/images/suds/edit.jpg',                     // Optional image 
    permission: ['clerical', 'sales', 'admin','demo'],       // permission sets that will see this
    description: 'Let\'s get more business',          // explanitory text under the heading.
    links: [
      {
        report: 'customerSearch',
        title: 'Customer search',     // Pre-defined report which uses the fullName 
        input: {                                                // input field in the search.
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
        mode: 'new',                       // add new record
        prePopulate: [['userType', 'P']],  // pre-set the user type to 'P' (prospect)
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
    permission: ['clerical', 'warehouse', 'admin','demo'],
    description: 'Shipping',
    links: [
      {report: 'outstandingOrders', title: 'Outstanding orders'},
      { table: 'salesorders', title: 'All sales orders', },
      { table: 'products', },
      { report: 'customers', title: 'All customers' },
    ],
  },


  purchasing: {
    title: 'Purchasing',
    img: '/images/suds/edit.jpg',
    permission: ['clerical', 'purchasing', 'warehouse', 'admin','demo'],
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
    permission: ['admin', 'web','demo'],
    links: [
      { table: 'webpages', title: 'Web Pages' },
      { www: '/', title: 'Home page', target: '_blank' },
      { www: 'https://www.google.com/analytics', title: 'Google analytics', target: '_blank' }
    ],
  },


  //  Setup / admin section
  setup: {
    title: 'Setup',
    img: '/images/suds/settings.jpg',
    permission: ['admin','demo'],
    description: 'Used by system admin',
    links: [
      { table: 'user', title: 'All users' },
    { report: 'auditTrail', title: 'Audit trail', },
      { www: '/createtables', title: 'Create new database tables' },
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
    permission: ['admin','demo'],
    description: 'Used by system admin',
    links: [
      {
        report: 'auditTrail', title: 'Audit trail',
        input: {                                                // input field in the search.
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


}


