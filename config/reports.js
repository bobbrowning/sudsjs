
module.exports = {

  /* *****************************************************
  *
  *    Report definitions 
  *
  * **************************************************** */
  userSearch: {
    table: 'user',
    friendlyName: 'User list',
    title: 'All people/organisations',                                   // Title
    sort: ['fullName', 'ASC'],                            // sort field
    open: 'contacts',                                     // Link to row detail page will open this child list
    openGroup: 'contacts',                                // Link to row detail page will open this group
    search: {                                             // search specification
      andor: 'and',
      searches: [
        ['fullName', 'contains', '#fullName']             // Name assigned in suds-home.js 
      ]
    },
    /* Columns on the table listing. All columns are in the detail page */
    columns: ['id', 'fullName', 'emailAddress', 'mainPhone', 'mobilePhone', 'userType', 'organisation',],
  },


  /* *****************************************************
  *
  *    Customer search, assumes that an input field (fullName) is present. 
  *
  * **************************************************** */


  customerSearch: {
    table: 'user',
    friendlyName: 'Customer list',
    title: 'Customers',                                   // Title
    sort: ['fullName', 'ASC'],                            // sort field
    open: 'contacts',                                     // Link to row detail page will open this child list
    openGroup: 'contacts',                                // Link to row detail page will open this group
    search: {                                             // search specification
      andor: 'and',
      searches: [
        ['userType', 'eq', 'C'],
        ['fullName', 'contains', '#fullName']             // Name assigned in suds-home.js 
      ]
    },
    /* Columns on the table listing. All columns are in the detail page */
    columns: ['id', 'fullName', 'emailAddress', 'mainPhone', 'mobilePhone', 'userType', 'organisation',],
  },

  /* *****************************************************
  *
  *    Overdue follow-ups to contacts 
  *
  * **************************************************** */

  followUps: {
    table: 'contacts',
    friendlyName: 'My overdue follow-ups',
    description: 'My overdue follow-ups',
    title: 'Overdue follow-ups',                                   // Title
    sort: ['nextActionDate', 'DESC'],
    open: 'contacts',
    openGroup: 'contacts',                                // Link to row detail page will open this child list
    search: {
      andor: 'and',
      searches:
        [
          ['nextActionDate', 'lt', '#today'],            //  #today and #loggedInUser are special names 
          ['contactBy', 'eq', '#loggedInUser'],          //  #today+n and #today-n are also allowed where n is a number of days.
          ['closed', 'ne', true],
        ]
    },
    columns: ['user', 'date', 'nextActionDate', 'notes'],        // Columns on the table listing. All columns are in the detail page
  },

  allFollowUps: {
    table: 'contacts',
    friendlyName: 'All overdue follow-ups',
    description: 'All overdue follow-ups',
    title: 'Overdue follow-ups',                                   // Title
    sort: ['nextActionDate', 'DESC'],
    open: 'contacts',
    openGroup: 'contacts',                                // Link to row detail page will open this child list
    search: {
      andor: 'and',
      searches:
        [
          ['nextActionDate', 'lt', '#today'],
          ['closed', 'ne', true],
        ]
    },
    columns: ['user', 'date', 'nextActionDate', 'notes', 'contactBy'],        // Columns on the table listing. All columns are in the detail page
  },

  upcomingFollowUps: {
    table: 'contacts',
    friendlyName: 'Upcoming follow-ups',
    title: 'My Upcoming follow-ups',                                   // Title
    sort: ['nextActionDate', 'ASC'],
    open: 'contacts',
    openGroup: 'contacts',                                // Link to row detail page will open this child list
    search: {
      andor: 'and',
      searches:
        [
          ['nextActionDate', 'ge', '#today'],
          ['nextActionDate', 'le', '#today+7'],
          ['contactBy', 'eq', '#loggedInUser'],
          ['closed', 'ne', true],
        ]
    },
    columns: ['user', 'date', 'nextActionDate', 'notes'],        // Columns on the table listing. All columns are in the detail page
  },

  allUpcomingFollowUps: {
    table: 'contacts',
    friendlyName: 'Upcoming follow-ups',
    title: 'All Upcoming follow-ups',                                   // Title
    sort: ['nextActionDate', 'ASC'],
    open: 'contacts',
    openGroup: 'contacts',                                // Link to row detail page will open this child list
    search: {
      andor: 'and',
      searches:
        [
          ['nextActionDate', 'ge', '#today'],
          ['nextActionDate', 'le', '#today+7'],
          ['closed', 'ne', true],
        ]
    },
    columns: ['user', 'date', 'nextActionDate', 'notes', 'contactBy'],        // Columns on the table listing. All columns are in the detail page
  },


  customers: {
    table: 'user',
    title: 'Customer list',
    sort: ['fullName', 'ASC'],                          // Option sort field and direction. 
    open: 'contacts',
    openGroup: 'contacts',                                // Link to row detail page will open this child list
    search: {
      andor: 'and',
      searches: [
        ['userType', 'eq', 'C'],
      ]                                           // Filter field and value
    },
    columns: ['id', 'fullName', 'emailAddress', 'mainPhone', 'mobilePhone', 'organisation',],        // Columns on the table listing. All columns are in the detail page
  },

  
  outstandingOrders: {
    table: 'salesorders',
    title: 'Outstanding orders',
    sort: ['updatedAt', 'DESC'],                          // Option sort field and direction. 
    openGroup: 'salesorderlines',
     search: {
      andor: 'and',
      searches: [
        ['status', 'ne', 'D'],
      ]                                           // Filter field and value
    },
  },

  prospects: {
    table: 'user',
    friendlyName: 'Customer list',
    title: 'Prospects',                  // Title
    sort: ['fullName', 'ASC'],                          // Option sort field and direction. 
    open: 'contacts',
    openGroup: 'contacts',                                // Link to row detail page will open this child list
    search: {
      andor: 'or',
      searches: [
        ['userType', 'eq', 'L'],
        ['userType', 'eq', 'P'],
      ]                                           // Filter field and value
    },
    columns: ['id', 'fullName', 'organisation', 'lastContact', 'nextActionDate', 'userType'],        // Columns on the table listing. All columns are in the detail page
  },

  suppliers: {
    table: 'user',
    friendlyName: 'Suppliers list',
    title: 'Suppliers',                  // Title
    sort: ['fullName', 'ASC'],                          // Option sort field and direction. 
    open: 'products',
    openGroup: 'products',                                // Link to row detail page will open this child list
    search: {
      andor: 'and',
      searches: [
        ['userType', 'eq', 'S'],
      ]                                           // Filter field and value
    },
    columns: ['id', 'fullName', 'emailAddress', 'mainPhone', 'mobilePhone',],        // Columns on the table listing. All columns are in the detail page
  },


  inhouseUsers: {
    table: 'user',
    friendlyName: 'In house users list',
    title: 'In House users',                  // Title
    sort: ['permission', 'ASC'],                          // Option sort field and direction. 
    open: 'contacts',
    openGroup: 'contacts',                                // Link to row detail page will open this child list
    search: {
      andor: 'and',
      searches: [
        ['userType', 'eq', 'I'],
      ]                                           // Filter field and value
    },
    columns: ['id', 'fullName', 'emailAddress', 'mainPhone', 'mobilePhone', 'permission', 'isSuperAdmin'],        // Columns on the table listing. All columns are in the detail page
  },

   auditTrail: {
     table: 'audit',
     title: 'List audit trail',
     sort: ['createdAt','DESC'],
     search: {
      andor: 'and',
      searches: [
        ['tableName', 'eq', '#table'],
        ['udatedBy', 'eq', '#users'],
      ]                                           
    },

   }

}





