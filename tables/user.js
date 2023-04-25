
/* ***************************postgattribu*******************************************
*
*    User table schema 
*
* ********************************************************************* */

module.exports = {

  friendlyName: 'User table',

  description: `This table includes a row for each person or organisation that 
  the system needs to process. This may be a customer, supplier, or in-house staff. 
  Rows can be linked so it can indicate which organisation a customer works for.`,

  /** Permission sets who can edit / see this file  */
  permission: {
    all: ['sales', 'purchasing', 'admin', 'demo'], view: ['all']
  },

  /** Words that appear in the add button */
  addRow: 'Add a new user',

  /** This column provides a text string that in some way identifies the  
   *  row to people. In this case it is the full name  */
  stringify: 'fullName',


  /**  This allows you to vary the input form depending on the record type.  */
  recordTypeColumn: 'userType',

  /** Columns on the table listing. All columns are in the detail page
   *  This can be over-ridden in a report. */
  list: {
    view: 'allUsers',
    columns: [ 'fullName', 'emailAddress', 'userType', 'permission', ],
  },

  /** The columns can be split into groups for editing and display purposes   
  * Once the edit/view page is loaded then user can switch between groups with   
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
      activities: ['contacts', 'salesorders', 'products', 'purchaseorders', 'purchaseorderlines'],              // These shild records are included
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
      columns: ['contacts', 'lastContact', 'nextActionDate', 'nextAction'],
    },
    sales: {
      friendlyName: 'Sales',
      description: `Lists the sales orders and products ordered by the customer.  New sales orders can be added.`,
      open: 'salesorders',
      columns: ['salesorders', 'lastSale'],
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
      columns: ['webpages','webpagesnosql'],
      permission: { all: ['admin', 'web'] },
    },
    security: {
      friendlyName: 'Security',
      permission: { all: ['admin'] },
      columns: ['password', 'salt', 'forgottenPasswordToken', 'forgottenPasswordExpire', 'isSuperAdmin', 'lastSeenAt', 'permission',],
    },
    other: {                                        // This is a *special* name. 
      friendlyName: 'Other',                         // This will scoop up the rest
    },
  },

  /**  Treatment of each column */
  properties: {
       /* This inserts a standard header from fragments.js
          The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
          $ref: '{{dbDriver}}Header',
    fullName: {
      type: 'string',
      description: 'Full representation of the user\'s name.',
      example: 'Mary Sue van der McHenst',
      input: {
        required: true,
        placeholder: 'Please enter the persons full name',
      },
    },
    emailAddress: {
      type: 'string',
      input: { type: 'email', }
    },

    picture: {
      type: 'string',
      input: { type: 'uploadFile' },
      process: { uploadFile: true },
      display: { type: 'image', width: '100px' },
    },


    password: {
      type: 'string',
      description: 'Securely hashed representation of the user\'s login password.',
      extendedDescription: `This field is created by the login program, where the hashing 
      takes place. Only the superuser can see this field.`,
      permission: { all: ['#superuser#'] },
      example: '2$28a8eabna301089103-13948134nad'
    },
    salt: {
      description: 'Used to generate password hash.',
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
      database: { type: 'bigint' },

    },
    isSuperAdmin: {
      type: 'boolean',
      permission: { view: ['all'], edit: ['#superuser#'] },
      description: 'Whether this user is a "super admin" with extra permissions, etc.',
    },
    lastSeenAt: {
      type: 'number',
      permission: { view: ['all'] },
      extendedDescription: `A JS timestamp (epoch ms) representing the moment at which 
      this user most recently interacted with the backend while logged in 
      (or the creation date if they have not interacted with the backend at all yet).`,
      example: 1502844074211,
      input: { type: 'date', },
      display: { type: 'date' },
      database: { type: 'bigint' }
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
    /* for each entry comes from the stringify function above.                         */
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
      input: { type: 'tel' }   // but this doesn't validate
    },
    mainPhone: {
      type: 'string',
      input: { type: 'tel' }
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
      database: {type: 'varchar', length: 2000},
      input: {
        type: 'ckeditor4',
        placeholder: `Please enter any notes about this user.`,
      }
    },

    lastContact: {
      model: 'contacts',
    },
    nextActionDate: {
      type: 'string',
      display: { type: 'date' },
    },
    nextAction: {
      type: 'string',
    },


  },
  children: {
    webpages: {
      description: `Web pages authored by this user. Web pages will be listed for SQL systems. For technical reasons the NOSQL and SQL databases are configured differently for the web pages file.`,
      friendlyName: 'Web pages authored on SQL system',
      collection: 'webpages',
      via: 'author',
    },
    webpagesnosql: {
      description: `Web pages authored by this user. Web pages will be listed for CpouchDB or MongoDB.`,
      friendlyName: 'Web pages authored on NOSQL system',
      collection: 'webpagesnosql',
      via: 'author',
    },

    /* The contacts made with this user is one of the collections in the model.        */
    /* Contact notes are listed below the person's record.                            */


    contacts: {
      description: `Contacts with this user by phone, email, etc`,
      collection: 'contacts',
      via: 'user',
      collectionList: {
        limit: 5,                                           // Number of child records listed in the detail page (default 10)
        order: 'date',                                 // The order in which the are listed (default updatedAt)
        direction: 'DESC',                                  // ASC or DESC  default DESC
        heading: 'Recent contacts',                         // Heading to the listing Default to table name
        columns: ['date', 'note', 'nextActionDate', 'closed'],
        addChildTip: 'Add a new contact for this user.',
        derive: {
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
        columns: ['date',  'status', 'totalValue'],
        derive: {
          nosales: { type: 'count', friendlyName: 'Number of sales ' },
          totsales: { type: 'total', column: 'totalValue', friendlyName: 'Total sales', display: { currency: true } },
          ave: { type: 'average', column: 'totalValue', friendlyName: 'Average value per order', display: { currency: true } },
        }
      }
    },


    products: {
      collection: 'products',
      via: 'supplier',
      collectionList: {
        columns: ['name','description'],
      }
    },

    purchaseorders: {
      collection: 'purchaseorders',
      via: 'supplier',
      collectionList: {
        columns: [ 'date', 'status', 'notes'],
      }

    },

    people: {
      friendlyName: 'Staff / Subsidiary',
      description: `These are people who are emplyed by the organisation or subsidiary companies in a group.`,
      collection: 'user',
      addRow: false,
      via: 'organisation',
      collectionList: {
        columns: ['fullName', 'mobilePhone', 'lastContact'],
      }
    },

  }
}
