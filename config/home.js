/**
 * Admin setup
 *
 *
 */

module.exports = {
  /* ****************************************************
 *  Specify the admnistration home page.
 *  ****************************************************
 * * 
 *  This is divided into into sections.
 *  Sections can contain links to file listing programs or 
 *  links to arbitrary web pages   
 * 
 ***************************************************** */

  contactManager: {
    title: 'Contact management',                         // Title of the section
    img: '/images/suds/contact.jpg',                     // Optional image 
    permission: ['all'],                                 // permission sets that will see this
    description: 'Keep in touch',                        // explanitory text under the heading.
    links: [
      {
        report: 'userSearch', title: 'Search',     // Pre-defined report which uses the fullName 
        input: {                                                // input field in the search.
          fullName: {
            type: 'text',
            placeholder: 'Search all',
          },
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
    permission: ['clerical', 'sales', 'admin'],       // permission sets that will see this
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
    permission: ['clerical', 'warehouse', 'admin'],
    description: 'Shipping',
    links: [
      {
        report: 'customerSearch', title: 'Customer search',
        input: {
          fullName: {
            type: 'text',
            placeholder: 'Search customers',               // optional placeholder for the input field]
          },
        },
      },
      { table: 'products', },
      { report: 'customers', title: 'All customers' },
      { table: 'salesorders', title: 'Sales Orders', },
    ],
  },


  purchasing: {
    title: 'Purchasing',
    img: '/images/suds/edit.jpg',
    permission: ['clerical', 'purchasing', 'warehouse', 'admin'],
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
    permission: ['admin', 'web'],
    links: [
      { table: 'webpages', title: 'Web Pages' },
      { www: 'https://www.google.com/analytics', title: 'Google analytics', target: '_blank' }
    ],
  },



  //  Setup / admin section
  setup: {
    title: 'Setup',
    img: '/images/suds/settings.jpg',
    permission: ['admin'],
    description: 'Used by system admin',
    links: [
      { table: 'user', title: 'All users' },
      { table: 'audit', title: 'Audit trail' },
      { www: '/create-table',title: 'Create database tables'},
      { www: '/validate-config',title: 'Validate configuration'},
      { www: '/config-report',title: 'Configuration report'},
    ],
  },
  
  trouble: {
    title: 'Trouble Shooting',
    img: '/images/suds/settings.jpg',
    permission: ['admin'],
    description: 'Used by system admin',
    links: [
      { table: 'audit', title: 'Audit trail', sort: ['createdAt', 'DESC'] },
      { table: 'contacts', title: 'All external contacts' },
      { table: 'productjoin', title: 'Product Join Table' },
      { table: 'salesorderlines', title: 'Sales order lines' },
      { table: 'purchaseorderlines', title: 'Purchase order lines' },
     ],
  },

  //  Setup / admin section
  profile: {
    title: 'Profile',
    img: '/images/suds/profile.jpg',
    permission: ['#guest#','all'],
    description: 'About you',
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


