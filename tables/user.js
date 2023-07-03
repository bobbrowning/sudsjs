"use strict";
/* ***************************postgattribu*******************************************
*
*    User table schema
*
* ********************************************************************* */
Object.defineProperty(exports, "__esModule", { value: true });
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
        columns: ['fullName', 'emailAddress', 'userType', 'permission',],
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
            activityLog: true,
            limit: 15,
            activities: ['contacts', 'salesorders', 'products', 'purchaseorders', 'purchaseorderlines'],
            permission: { view: ['sales', 'purchasing', 'admin', 'demo'] },
        },
        profile: {
            friendlyName: 'Profile',
            columns: ['picture', 'streetAddress', 'zip', 'province', 'country', 'mainPhone', 'mobilePhone', 'notes', 'business', 'organisation', 'people',],
        },
        contacts: {
            friendlyName: 'Contacts',
            open: 'contacts',
            permission: { all: ['sales', 'purchasing', 'admin', 'demo'] },
            columns: ['contacts', 'lastContact', 'nextActionDate', 'nextAction'],
        },
        sales: {
            friendlyName: 'Sales',
            description: `Lists the sales orders and products ordered by the customer.  New sales orders can be added.`,
            open: 'salesorders',
            columns: ['salesorders', 'lastSale'],
            permission: { all: ['admin', 'sales', 'demo'] },
            recordTypes: ['L', 'C', 'P'], // Only shown for Leads, prospects and customers
        },
        products: {
            friendlyName: 'Products supplied',
            open: 'products',
            columns: ['products', 'purchaseorders'],
            permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
            recordTypes: ['S'], // Only shown for suppliers
        },
        website: {
            friendlyName: 'Website',
            open: 'website',
            columns: ['webpages', 'webpagesnosql'],
            permission: { all: ['admin', 'web'] },
        },
        security: {
            friendlyName: 'Security',
            permission: { all: ['admin'] },
            columns: ['password', 'salt', 'forgottenPasswordToken', 'forgottenPasswordExpire', 'isSuperAdmin', 'lastSeenAt', 'permission',],
        },
        other: {
            friendlyName: 'Other', // This will scoop up the rest
        },
    },
    /**  Treatment of each column */
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
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
            values: 'countries', // values are in /config/countries.js
        },
        permission: {
            friendlyName: 'Permission set',
            permission: { view: ['all'], edit: ['admin'] },
            type: 'string',
            description: 'Permission set.',
            extendedDescription: `Every table, column group and column can have a set of permission values for 
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
            input: { type: 'tel' } // but this doesn't validate
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
            database: { type: 'varchar', length: 2000 },
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
                limit: 5,
                order: 'date',
                direction: 'DESC',
                heading: 'Recent contacts',
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
                columns: ['date', 'status', 'totalValue'],
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
                columns: ['name', 'description'],
            }
        },
        purchaseorders: {
            collection: 'purchaseorders',
            via: 'supplier',
            collectionList: {
                columns: ['date', 'status', 'notes'],
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YWJsZXMvdXNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7Ozs7MEVBSTBFOztBQUUxRSxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsWUFBWSxFQUFFLFlBQVk7SUFDMUIsV0FBVyxFQUFFOztpRkFFZ0U7SUFDN0Usb0RBQW9EO0lBQ3BELFVBQVUsRUFBRTtRQUNSLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztLQUMvRDtJQUNELDBDQUEwQztJQUMxQyxNQUFNLEVBQUUsZ0JBQWdCO0lBQ3hCOzJEQUN1RDtJQUN2RCxTQUFTLEVBQUUsVUFBVTtJQUNyQiw2RUFBNkU7SUFDN0UsZ0JBQWdCLEVBQUUsVUFBVTtJQUM1QjsrQ0FDMkM7SUFDM0MsSUFBSSxFQUFFO1FBQ0YsSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFO0tBQ25FO0lBQ0Q7Ozs2QkFHeUI7SUFDekIsTUFBTSxFQUFFO1FBQ0osTUFBTSxFQUFFO1lBQ0osTUFBTSxFQUFFLElBQUk7WUFDWixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQztTQUM3RDtRQUNELFdBQVcsRUFBRTtZQUNULFlBQVksRUFBRSxjQUFjO1lBQzVCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLEtBQUssRUFBRSxFQUFFO1lBQ1QsVUFBVSxFQUFFLENBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLENBQUM7WUFDM0YsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFP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