/* **********************************************************************
*
*  These are tables that you must have in any SUDS system.
*
* ***********************************************************************/

const { stringify } = require('postcss');

module.exports = {

  /* ********************************************************************
  *
  *    Attributes common to all tables
  *
  * ******************************************************************** */
  /* **********************************************************************
  *
  *    Users - customers, suppliers and admin atrea users 
  *
  * ********************************************************************* */
  friendlyName: 'Users',                                  // Name of the table

  description: `This table includes a row for each person or organisation that 
  the system needs to process. This may be a customer, supplier, or in-house staff. 
  Rows can be linked so it can indicate which organisation a customer works for.`,
  permission: {                                           // Permission sets who can see this file 
    all: ['sales', 'purchasing', 'admin']
  },
  addRow: 'Add a new user',                               // Words that appear in the add button

  /* This function provides a text string that in some way identifies the   */
  /*  row to people. In this case it is the full name with the row number   */
  /* brackets                                                               */
  rowTitle: function (record) {
    return `${record.fullName} (User no:${record.id})`
  },

  /* Columns on the table listing. All columns are in the detail page       */
  /* This can be over-ridden in a report.                                   */
  list: {
    columns: ['id', 'fullName', 'emailAddress', 'userType', 'organisation'],
  },

  /* The columns can be split into groups for editing and display purposes   */
  /* Once the edit page is loaded then user can switch between groups with   */
  /* a menu. Any columns not listed here are automatically included in a     */
  /* group called 'other'                                                    */
  /* Note that in the test database we added a number of fields to the table */
  /* But the only field that it is essential to add is 'permission'.         */
  groups: {
    basics: {
      static: true,
      open: 'none',
      columns: ['fullName', 'emailAddress', 'userType', 'isOrg'],
    },
    profile: {
      friendlyName: 'profile',
      open: 'none',
      columns: ['organisation', 'business', 'notes'],
    },
    location: {
      friendlyName: 'How to contact',
      open: 'none',
      columns: ['streetAddress', 'zip', 'country', 'region', 'mainPhone', 'mobilePhone'],
    },
    contacts: {
      friendlyName: 'Contacts',
      open: 'contacts',
      columns: ['people','contacts','lastContact', 'nextAction', 'nextActionDate',],
    },
    sales: {
      friendlyName: 'Sales',
      open: 'salesorders',
      columns: ['salesorders','lastSale'],
      permission: { all: ['admin', 'sales'] },
    },
    products: {
      friendlyName: 'Products supplied',
      open: 'products',
      columns: ['products', 'purchaseorders'],
      permission: { all: ['admin', 'purchasing'], view: ['sales'] },
    },
    website: {
      friendlyName: 'Website',
      open: 'website',
      columns: ['webpages'],
      permission: { all: ['admin', 'web'] },
    },
    other: {                                        // This is a *special* name. 
      friendlyName: 'Other',                         // This will scoop up the rest
    },
  },

  /* These sections extend the information in the model files with processing     */
  /* rules.  Should be read alongside the model.                                  */


  /*  If a column is not included here. The defaults are:                          */
  /*    input: type= text for string columns, number for numbers                   */
  /*                  and checkbox for boolean,                                    */
  /*    friendlyName: Like this 'streetAddress' would become 'Street address'      */

  attributes: {
    id: {
      friendlyName: 'User No',                            // Visible name 
      type: 'number',
      primaryKey: true,
      autoincrement: true,
    },
    createdAt: {
      friendlyName: 'Date created',
      type: 'number',
      display: { type: 'datetime',truncateForTableList: 16 },
      database: { type: 'biginteger' },
      process: { createdAt: true }
    },                                      // You don't actually enter these
    updatedAt: {                            // but if you did they would be dates. 
      friendlyName: 'Date last updated',    // so this also governs how they are diaplayed
      type: 'number',
      display: { type: 'datetime',truncateForTableList: 16 },
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
        placeholder: 'Please enter the persons full name' // Placeholder text in the input field
      },
    },
    emailAddress: {
      type: 'string',
    },
    password: {
      type: 'string',
      //      required: true,
      description: 'Securely hashed representation of the user\'s login password.',
      permission: '#superuser#',
      example: '2$28a8eabna301089103-13948134nad'
    },
    salt: {
      type: 'string',
      permission: '#superuser#',
    },
    forgottenPasswordToken: {
      permission: '#superuser#',
      type: 'string',
    },
    forgottenPasswordExpire: {
      permission: '#superuser#',
      type: 'number',
      display: { type: 'datetime',truncateForTableList: 16 },
      database: { type: 'biginteger' },
     
    },
  isSuperAdmin: {
      type: 'boolean',
      description: 'Whether this user is a "super admin" with extra permissions, etc.',
    },
    lastSeenAt: {
      type: 'number',
      description: 'A JS timestamp (epoch ms) representing the moment at which this user most recently interacted with the backend while logged in (or 0 if they have not interacted with the backend at all yet).',
      example: 1502844074211,
      input: {type: 'date', },
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
    country: {
      type: 'string',
    },
    region: {
      description: 'This is an example of a select using the data in the isIn attribute.',
      type: 'string',
      input: {
        type: 'select',
        values: ['Europe', 'Middle East', 'Africa', 'South Asia', 'East', 'N America', 'S America'],
      }
    },

    permission: {
      friendlyName: 'Permission set',
      type: 'string',
      description: 'Permission set.',
      extendedDescription:
        `Every table, column group and column can have a set of permission values for 
        viewing. Tables addionally have permissions for editing and deleting rows.  
        The user can only carry out this finmction if their permission in this
        field is in the permission array. The permissions are set in config.subdstables`,
      allowNull: true,
      input: {
        type: 'select',
        values: function (req) {
          return require('../config/suds').permissionSets;
        }
      }
    },
    /*  This will be a set of radion buttons with the values and labels as shown      */
    isOrg: {
      friendlyName: 'Person or Business?',
      type: 'string',
      description: 'This record describes a business rather than a person',
      input: {
        type: 'radio',
        values: {
          P: 'Person',
          B: 'Business/Organisation',
        },
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
      description: 'The organsation this user belongs to (or holding group if this is an organisation)',
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
        values: {
          L: 'Sales lead',
          P: 'Prospect',
          C: 'Customer',
          S: 'Supplier',
          I: 'In-house staff',
          N: 'No longer considered a prospect',
          O: 'Other',
        },
        required: true,     
      },
    },




    /* These columns represent data which is set up autorically by various actions     */
    /* They are marked as hidden because it is not shown on the form (it will          */
    /* be a hidden field).                                                             */
    /*                                                                                 */
    /* Normally a link to anothet table is shown as a parent, however this can be      */
    /* suppressed wih the 'child: false' entry. The effect is cosmetic only.           */
    lastContact: {
      model: 'contacts',
      child: false,
      friendlyName: 'Last contact',
      input: { hidden: true },
    },

    /*  Also set by when a contact is logged                                          */
    nextActionDate: {
      friendlyName: 'Next action date',
      type: 'string',
      description: 'When a contact is entered, this is updated.',
      extendedDescription: `Created automatically with the date the user should be contacted next.  
        This is set up when a contact is registered that has a next action.`,
      input: {
        type: 'date',
        hidden: true,
      }
    },

    nextAction: {
      friendlyName: 'Next action',
      type: 'string',
      description: 'When a contact is entered, this is updated.',
      extendedDescription: `Created automatically with the description of the next action required.
        This is set up when a contact is registered that has a next action.`,
      input: { hidden: true, }
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
        columns: ['id','date', 'notes', 'closed'],
        addChildTip: 'Add a new contact for this user.',
      },
    },
     

    
      salesorders: {
        collection: 'salesorders',
        via: 'customer',
        collectionList: {
          columns: ['date', 'id', 'status', 'total'],
        }
      },
     
    /* These are products supplied if the user is a supplier.                      */

    
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
      friendlyName: 'Associated people',
      collection: 'user',
      via: 'organisation',
      collectionList: {
        columns: ['fullName','mobilePhone','lastContact'],
      }
    },
    



  }
}
