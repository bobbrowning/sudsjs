
/* **********************************************************************
*
*    Users - customers, suppliers and admin atrea users 
*
* ********************************************************************* */

module.exports = {

  friendlyName: 'User table',                                  // Name of the table

  description: `This table includes a row for each person or organisation that 
  the system needs to process. This may be a customer, supplier, or in-house staff. 
  Rows can be linked so it can indicate which organisation a customer works for.`,

  permission: {                                           // Permission sets who can see this file 
    all: ['sales', 'purchasing', 'admin', 'demo'], view: ['all']
  },

  /** Words that appear in the add button */
  addRow: 'Add a new user',

  /** This provides a text string that in some way identifies the  
   *  row to people. In this case it is the full name  */
  rowTitle: 'fullName',


  /**  This allows you to vary the input form depending on the record type.  */
  recordTypeColumn: 'userType',

  /** Columns on the table listing. All columns are in the detail page
   *  This can be over-ridden in a report. */
  list: {
    columns: ['id', 'fullName', 'emailAddress', 'userType', 'permission', 'organisation'],
  },

  /** The columns can be split into groups for editing and display purposes   
  * Once the edit page is loaded then user can switch between groups with   
  * a menu. Any columns not listed here are automatically included in a    
  * group called 'other' */
  groups: {
    basics: {
      static: true,
      open: 'none',
      columns: ['fullName', 'emailAddress', 'userType', 'isOrg'],
    },
    activityLog: {
      friendlyName: 'Activity Log',
      activityLog: true,                                                       // This is the activity log
      limit: 15,                                                               // Maximum entries shown (defaults to 10)
      activities: ['contacts', 'salesorders', 'salesorderlines'],              // These shild records are included
      permission: { view: ['sales', 'purchasing', 'admin', 'demo'] },
    },
    profile: {
      friendlyName: 'Profile',
      columns: ['picture', 'streetAddress', 'zip', 'province', 'country', 'mainPhone', 'mobilePhone', 'notes', 'business', 'organisation', 'people',],
    },
    contacts: {
      friendlyName: 'Contacts',
      open: 'contacts',                                                      // When this group is shown, these child records are shown
      permission: { all: ['sales', 'purchasing', 'admin', 'demo'] },
      columns: ['contacts',],
    },
    sales: {
      friendlyName: 'Sales',
      open: 'salesorders',
      columns: ['salesorders', 'lastSale', 'salesorderlines'],
      permission: { all: ['admin', 'sales', 'demo'] },
      recordTypes: ['L', 'C', 'P'],                                          // Only shown for Leads, prospects and customers
    },
    products: {
      friendlyName: 'Products supplied',
      open: 'products',
      columns: ['products', 'purchaseorders'],
      permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
      recordTypes: ['S'],                                                    // Only shown for suppliers
    },
    website: {
      friendlyName: 'Website',
      open: 'website',                                                       // List web pages authored by this user
      columns: ['webpages'],
      permission: { all: ['admin', 'web', 'demo'] },
      recordTypes: ['W'],                                                    // Only shown for web developers
    },
    security: {
      friendlyName: 'Security',
      permission: { all: ['admin'] },
      columns: ['password', 'salt', 'forgottenPasswordToken', 'forgottenPasswordExpire', 'isSuperAdmin', 'lastSeenAt', 'permission', 'audit'],
    },
    other: {                                        // This is a *special* name. 
      friendlyName: 'Other',                         // This will scoop up the rest
    },
  },


  /*  If a column is not included here. The defaults are:                          */
  /*    input: type= text for string columns, number for numbers                   */
  /*                  and checkbox for boolean,                                    */
  /*    friendlyName: Like this 'streetAddress' would become 'Street address'      */

  attributes: {
    id: {
      friendlyName: 'User No',
      type: 'number',
      primaryKey: true,
      autoincrement: true,
    },
    createdAt: {
      friendlyName: 'Date created',
      type: 'number',
      display: { type: 'datetime', truncateForTableList: 16 },   // For the table list only show date not time.
      database: { type: 'biginteger' },
      process: { createdAt: true }
    },                                                         // You don't actually enter these
    updatedAt: {                                               // but if you did they would be dates. 
      friendlyName: 'Date last updated',                       // so this also governs how they are diaplayed
      type: 'number',
      display: { type: 'datetime', truncateForTableList: 16 },
      database: { type: 'biginteger' },
      process: { updatedAt: true }
    },
    updatedBy: {
      friendlyName: 'Last updated by',
      description: `The person who last updated the row.`,
      type: 'number',
      model: 'user',
      process: { updatedBy: true }
    },
    fullName: {

      type: 'string',
      description: 'Full representation of the user\'s name.',
      example: 'Mary Sue van der McHenst',
      input: {
        required: true,
        placeholder: 'Please enter the persons full name'      // Placeholder text in the input field
      },
    },
    emailAddress: {
      type: 'string',
    },

    picture: {
      type: 'string',
      input: { type: 'uploadFile' },
      process: { uploadFile: true },
      display: { type: 'image', width: '100px' },
    },


    password: {
      type: 'string',
      //      required: true,
      description: 'Securely hashed representation of the user\'s login password.',
      permission: { all: ['#superuser#'] },
      example: '2$28a8eabna301089103-13948134nad'
    },
    salt: {
      type: 'string',
      permission: { all: ['#superuser#'] },
    },
    forgottenPasswordToken: {
      permission: { all: ['#superuser#'] },
      type: 'string',
    },
    forgottenPasswordExpire: {
      permission: { all: ['#superuser#'] },
      type: 'number',
      display: { type: 'datetime', truncateForTableList: 16 },
      database: { type: 'biginteger' },

    },
    isSuperAdmin: {
      type: 'boolean',
      permission: { view: ['all'], edit: ['#superuser#'] },
      description: 'Whether this user is a "super admin" with extra permissions, etc.',
    },
    lastSeenAt: {
      type: 'number',
      permission: { view: ['all'] },
      description: 'A JS timestamp (epoch ms) representing the moment at which this user most recently interacted with the backend while logged in (or 0 if they have not interacted with the backend at all yet).',
      example: 1502844074211,
      input: { type: 'date', },
      display: { type: 'date' },
      database: { type: 'biginteger' }
    },
    streetAddress: {
      type: 'string',
      input: {
        type: 'textarea',
        rows: 5,
        cols: 60,
        placeholder: 'Please enter the street address of the user'
      }
    },
    zip: {
      type: 'string',
    },
    province: {
      friendlyName: 'State/Province/County',
      type: 'string',
    },
    country: {
      type: 'string',
      input: {
        type: 'autocomplete',
        route: 'lookup',
      },
      values: 'countries',       // values are in /config/countries.js

    },


    permission: {
      friendlyName: 'Permission set',
      permission: { view: ['all'], edit: ['admin'] },
      type: 'string',
      description: 'Permission set.',
      extendedDescription:
        `Every table, column group and column can have a set of permission values for 
        viewing. Tables addionally have permissions for editing and deleting rows.  
        The user can only carry out this finmction if their permission in this
        field is in the permission array. The permissions are set in config.subdstables`,
      allowNull: true,
      values: function (req) {
        return require('../config/suds').permissionSets;
      },
      input: {
        type: 'select',
      }
    },
    /*  This will be a set of radion buttons with the values and labels as shown      */
    isOrg: {
      friendlyName: 'Person or Business?',
      type: 'string',
      description: 'This record describes a business rather than a person',
      values: {
        P: 'Person',
        B: 'Business/Organisation',
      },
      input: {
        type: 'radio',
        required: true,
      },
    },

    business: {
      type: 'string',
      description: `Description of the customer's business`,
      friendlyName: 'The type of business.',
      type: 'string',
      input: {
        type: 'textarea',
        rows: 3,
        cols: 60,
        placeholder: `Please enter a description of the user's business and place in the organisation`,
      }
    },

    /* in this case the model specifies that the organisation is the key of another   */
    /* 'user' row.  This will create a select with values from the user table.        */
    /* but only usersd with isOrg set to 'B'  (business)  will be listed. The label   */
    /* for each entry comes from the rowTitle function above.                         */
    /* See below for the 'isOrg' column treatment                                     */
    organisation: {
      friendlyName: 'Organisation',
      model: 'user',
      description: 'The organisation this user belongs to (or holding group if this is an organisation)',
      input: {
        type: 'select',
        search: {
          searches: [
            ['isOrg', 'equals', 'B']
          ]
        }
      },
    },

    /*  This will be a select with the values and labels as shown      */
    userType: {
      description: 'The type of user.  Customer/Supplier or in-house.',
      type: 'string',
      input: {
        type: 'select',
        required: true,
        recordTypeFix: true,
      },
      values: {
        L: 'Sales lead',
        P: 'Prospect',
        C: 'Customer',
        S: 'Supplier',
        W: 'Website support',
        I: 'In-house staff',
        N: 'No longer considered a prospect',
        O: 'Other',

      },
    },




    mobilePhone: {
      type: 'string',
    },
    mainPhone: {
      type: 'string',
    },

    lastSale: {
      type: 'number',
      model: 'salesorders',
      friendlyName: 'Last sale',
      description: `Created automatically. This is a link to the last sales order.`,
      input: { hidden: true, }
    },
    notes: {
      type: 'string',
      friendlyName: 'Notes',
      input: {
        type: 'textarea',
        rows: 6,
        cols: 60,
        placeholder: `Please enter any notes about this user.`,
      }
    },

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    webpages: {
      collection: 'webpages',
      via: 'author',
    },


    /* The contacts made with this user is one of the collections in the model.        */
    /* Contact notes are listed below the person's record.                            */


    contacts: {
      collection: 'contacts',
      via: 'user',
      collectionList: {
        limit: 5,                                           // Number of child records listed in the detail page (default 10)
        order: 'date',                                 // The order in which the are listed (default updatedAt)
        direction: 'DESC',                                  // ASC or DESC  default DESC
        heading: 'Recent contacts',                         // Heading to the listing Default to table name
        columns: ['id', 'date', 'notes', 'closed'],
        addChildTip: 'Add a new contact for this user.',
        derive: {
          lines: { type: 'count', friendlyName: 'Number of contacts' },
          last: {
            type: 'function',
            friendlyName: 'Last contact',
            fn: require('../bin/custom/last-contact.js'),

          },
        },
      },
    },



    salesorders: {
      collection: 'salesorders',
      friendlyName: 'Sales orders',
      via: 'customer',
      collectionList: {
        columns: ['date', 'id', 'status', 'totalValue'],
        derive: {
          nosales: { type: 'count', friendlyName: 'Number of sales ' },
          totsales: { type: 'total', column: 'totalValue', friendlyName: 'Total sales', display: { currency: true } },
          ave: { type: 'average', column: 'totalValue', friendlyName: 'Average value per order', display: { currency: true } },
        }
      }
    },

    /* These are products supplied if the user is a supplier.                      */

    salesorderlines: {
      collection: 'salesorderlines',
      friendlyName: 'Products ordered',
      via: 'customer',
      addRow: false,
      collectionList: {
        columns: ['orderNo', 'product', 'units', 'price', 'total'],
        derive: {
          lines: { type: 'count', friendlyName: 'Number of order lines ' },
          sales: { type: 'total', column: 'total', friendlyName: 'Total sales', display: { currency: true } },
          ave: { type: 'average', column: 'total', friendlyName: 'Average value per product line', display: { currency: true } },
          units: { type: 'total', column: 'units', friendlyName: 'No of units', },
          aveunits: { type: 'composite', divide: ['sales', 'units'], display: { currency: true }, friendlyName: 'Average unit price', },
        },
      }
    },


    products: {
      collection: 'products',
      via: 'supplier',
      collectionList: {
        columns: ['name', 'price', 'class', 'description'],
      }
    },

    purchaseorders: {
      collection: 'purchaseorders',
      via: 'supplier',
      collectionList: {
        columns: ['name', 'date', 'status', 'notes'],
      }

    },

    people: {
      friendlyName: 'Staff / Subsidiary',
      collection: 'user',
      addRow: false,
      via: 'organisation',
      collectionList: {
        columns: ['fullName', 'mobilePhone', 'lastContact'],
      }
    },

    audit: {
      collection: 'audit',
      via: 'row',
      collectionList: {
        columns: ['id', 'createdAt', 'tableName', 'mode'],
      },
      permission: { all: ['admin'] },
    },


  }
}
