"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YWJsZXMvdXNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBQ2I7Ozs7MEVBSTBFO0FBQzFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzlELE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixZQUFZLEVBQUUsWUFBWTtJQUMxQixXQUFXLEVBQUU7O2lGQUVnRTtJQUM3RSxvREFBb0Q7SUFDcEQsVUFBVSxFQUFFO1FBQ1IsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO0tBQy9EO0lBQ0QsMENBQTBDO0lBQzFDLE1BQU0sRUFBRSxnQkFBZ0I7SUFDeEI7MkRBQ3VEO0lBQ3ZELFNBQVMsRUFBRSxVQUFVO0lBQ3JCLDZFQUE2RTtJQUM3RSxnQkFBZ0IsRUFBRSxVQUFVO0lBQzVCOytDQUMyQztJQUMzQyxJQUFJLEVBQUU7UUFDRixJQUFJLEVBQUUsVUFBVTtRQUNoQixPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUU7S0FDbkU7SUFDRDs7OzZCQUd5QjtJQUN6QixNQUFNLEVBQUU7UUFDSixNQUFNLEVBQUU7WUFDSixNQUFNLEVBQUUsSUFBSTtZQUNaLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDO1NBQzdEO1FBQ0QsV0FBVyxFQUFFO1lBQ1QsWUFBWSxFQUFFLGNBQWM7WUFDNUIsV0FBVyxFQUFFLElBQUk7WUFDakIsS0FBSyxFQUFFLEVBQUU7WUFDVCxVQUFVLEVBQUUsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsQ0FBQztZQUMzRixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTtTQUNqRTtRQUNELE9BQU8sRUFBRTtZQUNMLFlBQVksRUFBRSxTQUFTO1lBQ3ZCLE9BQU8sRUFBRSxDQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUU7U0FDbEo7UUFDRCxRQUFRLEVBQUU7WUFDTixZQUFZLEVBQUUsVUFBVTtZQUN4QixJQUFJLEVBQUUsVUFBVTtZQUNoQixVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTtZQUM3RCxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixFQUFFLFlBQVksQ0FBQztTQUN2RTtRQUNELEtBQUssRUFBRTtZQUNILFlBQVksRUFBRSxPQUFPO1lBQ3JCLFdBQVcsRUFBRSw4RkFBOEY7WUFDM0csSUFBSSxFQUFFLGFBQWE7WUFDbkIsT0FBTyxFQUFFLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQztZQUNwQyxVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQy9DLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsZ0RBQWdEO1NBQ2pGO1FBQ0QsUUFBUSxFQUFFO1lBQ04sWUFBWSxFQUFFLG1CQUFtQjtZQUNqQyxJQUFJLEVBQUUsVUFBVTtZQUNoQixPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUM7WUFDdkMsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNyRSxXQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSwyQkFBMkI7U0FDbEQ7UUFDRCxPQUFPLEVBQUU7WUFDTCxZQUFZLEVBQUUsU0FBUztZQUN2QixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUM7WUFDdEMsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFO1NBQ3hDO1FBQ0QsUUFBUSxFQUFFO1lBQ04sWUFBWSxFQUFFLFVBQVU7WUFDeEIsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDOUIsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSx3QkFBd0IsRUFBRSx5QkFBeUIsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRTtTQUNsSTtRQUNELEtBQUssRUFBRTtZQUNILFlBQVksRUFBRSxPQUFPLEVBQUUsOEJBQThCO1NBQ3hEO0tBQ0o7SUFDRCxnQ0FBZ0M7SUFDaEMsVUFBVSxFQUFFO1FBQ1I7dUdBQytGO1FBQy9GLElBQUksRUFBRSxrQ0FBa0M7UUFDeEMsUUFBUSxFQUFFO1lBQ04sSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUUsMENBQTBDO1lBQ3ZELE9BQU8sRUFBRSwwQkFBMEI7WUFDbkMsS0FBSyxFQUFFO2dCQUNILFFBQVEsRUFBRSxJQUFJO2dCQUNkLFdBQVcsRUFBRSxvQ0FBb0M7YUFDcEQ7U0FDSjtRQUNELFlBQVksRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sR0FBRztTQUM1QjtRQUNELE9BQU8sRUFBRTtZQUNMLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUM3QixPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO1lBQzdCLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTtTQUM3QztRQUNELFFBQVEsRUFBRTtZQUNOLElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLCtEQUErRDtZQUM1RSxtQkFBbUIsRUFBRTswREFDeUI7WUFDOUMsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDcEMsT0FBTyxFQUFFLGtDQUFrQztTQUM5QztRQUNELElBQUksRUFBRTtZQUNGLFdBQVcsRUFBRSxpQ0FBaUM7WUFDOUMsSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRTtTQUN2QztRQUNELHNCQUFzQixFQUFFO1lBQ3BCLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3BDLElBQUksRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsdUJBQXVCLEVBQUU7WUFDckIsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDcEMsSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFFLEVBQUUsRUFBRTtZQUN2RCxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO1NBQy9CO1FBQ0QsWUFBWSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFNBQVM7WUFDZixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUNwRCxXQUFXLEVBQUUsbUVBQW1FO1NBQ25GO1FBQ0QsVUFBVSxFQUFFO1lBQ1IsSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM3QixtQkFBbUIsRUFBRTs7c0ZBRXFEO1lBQzFFLE9BQU8sRUFBRSxhQUFhO1lBQ3RCLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEdBQUc7WUFDeEIsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUN6QixRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO1NBQy9CO1FBQ0QsYUFBYSxFQUFFO1lBQ1gsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLElBQUksRUFBRSxDQUFDO2dCQUNQLElBQUksRUFBRSxFQUFFO2dCQUNSLFdBQVcsRUFBRSw2Q0FBNkM7YUFDN0Q7U0FDSjtRQUNELEdBQUcsRUFBRTtZQUNELElBQUksRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsUUFBUSxFQUFFO1lBQ04sWUFBWSxFQUFFLHVCQUF1QjtZQUNyQyxJQUFJLEVBQUUsUUFBUTtTQUNqQjtRQUNELE9BQU8sRUFBRTtZQUNMLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRSxjQUFjO2dCQUNwQixLQUFLLEVBQUUsUUFBUTthQUNsQjtZQUNELE1BQU0sRUFBRSxXQUFXLEVBQUUscUNBQXFDO1NBQzdEO1FBQ0QsVUFBVSxFQUFFO1lBQ1IsWUFBWSxFQUFFLGdCQUFnQjtZQUM5QixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM5QyxJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSxpQkFBaUI7WUFDOUIsbUJBQW1CLEVBQUU7Ozt3RkFHdUQ7WUFDNUUsU0FBUyxFQUFFLElBQUk7WUFDZixNQUFNLEVBQUUsVUFBVSxHQUFHO2dCQUNqQixPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUNwRCxDQUFDO1lBQ0QsS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRSxRQUFRO2FBQ2pCO1NBQ0o7UUFDRCxvRkFBb0Y7UUFDcEYsS0FBSyxFQUFFO1lBQ0gsWUFBWSxFQUFFLHFCQUFxQjtZQUNuQyxJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSx1REFBdUQ7WUFDcEUsTUFBTSxFQUFFO2dCQUNKLENBQUMsRUFBRSxRQUFRO2dCQUNYLENBQUMsRUFBRSx1QkFBdUI7YUFDN0I7WUFDRCxLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsUUFBUSxFQUFFLElBQUk7YUFDakI7U0FDSjtRQUNELFFBQVEsRUFBRTtZQUNOLElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLHdDQUF3QztZQUNyRCxZQUFZLEVBQUUsdUJBQXVCO1lBQ3JDLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRSxVQUFVO2dCQUNoQixJQUFJLEVBQUUsQ0FBQztnQkFDUCxJQUFJLEVBQUUsRUFBRTtnQkFDUixXQUFXLEVBQUUsaUZBQWlGO2FBQ2pHO1NBQ0o7UUFDRCxvRkFBb0Y7UUFDcEYsb0ZBQW9GO1FBQ3BGLG9GQUFvRjtRQUNwRixxRkFBcUY7UUFDckYsb0ZBQW9GO1FBQ3BGLFlBQVksRUFBRTtZQUNWLFlBQVksRUFBRSxjQUFjO1lBQzVCLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLHFGQUFxRjtZQUNsRyxLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsTUFBTSxFQUFFO29CQUNKLFFBQVEsRUFBRTt3QkFDTixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDO3FCQUMzQjtpQkFDSjthQUNKO1NBQ0o7UUFDRCxxRUFBcUU7UUFDckUsUUFBUSxFQUFFO1lBQ04sV0FBVyxFQUFFLG1EQUFtRDtZQUNoRSxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRTtnQkFDSCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxhQUFhLEVBQUUsSUFBSTthQUN0QjtZQUNELE1BQU0sRUFBRTtnQkFDSixDQUFDLEVBQUUsWUFBWTtnQkFDZixDQUFDLEVBQUUsVUFBVTtnQkFDYixDQUFDLEVBQUUsVUFBVTtnQkFDYixDQUFDLEVBQUUsVUFBVTtnQkFDYixDQUFDLEVBQUUsaUJBQWlCO2dCQUNwQixDQUFDLEVBQUUsZ0JBQWdCO2dCQUNuQixDQUFDLEVBQUUsaUNBQWlDO2dCQUNwQyxDQUFDLEVBQUUsT0FBTzthQUNiO1NBQ0o7UUFDRCxXQUFXLEVBQUU7WUFDVCxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyw0QkFBNEI7U0FDdEQ7UUFDRCxTQUFTLEVBQUU7WUFDUCxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7U0FDekI7UUFDRCxRQUFRLEVBQUU7WUFDTixJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxhQUFhO1lBQ3BCLFlBQVksRUFBRSxXQUFXO1lBQ3pCLFdBQVcsRUFBRSxnRUFBZ0U7WUFDN0UsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksR0FBRztTQUMzQjtRQUNELEtBQUssRUFBRTtZQUNILElBQUksRUFBRSxRQUFRO1lBQ2QsWUFBWSxFQUFFLE9BQU87WUFDckIsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO1lBQzNDLEtBQUssRUFBRTtnQkFDSCxJQUFJLEVBQUUsV0FBVztnQkFDakIsV0FBVyxFQUFFLHlDQUF5QzthQUN6RDtTQUNKO1FBQ0QsV0FBVyxFQUFFO1lBQ1QsS0FBSyxFQUFFLFVBQVU7U0FDcEI7UUFDRCxjQUFjLEVBQUU7WUFDWixJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7U0FDNUI7UUFDRCxVQUFVLEVBQUU7WUFDUixJQUFJLEVBQUUsUUFBUTtTQUNqQjtLQUNKO0lBQ0QsUUFBUSxFQUFFO1FBQ04sUUFBUSxFQUFFO1lBQ04sV0FBVyxFQUFFLGlMQUFpTDtZQUM5TCxZQUFZLEVBQUUsa0NBQWtDO1lBQ2hELFVBQVUsRUFBRSxVQUFVO1lBQ3RCLEdBQUcsRUFBRSxRQUFRO1NBQ2hCO1FBQ0QsYUFBYSxFQUFFO1lBQ1gsV0FBVyxFQUFFLG9GQUFvRjtZQUNqRyxZQUFZLEVBQUUsb0NBQW9DO1lBQ2xELFVBQVUsRUFBRSxlQUFlO1lBQzNCLEdBQUcsRUFBRSxRQUFRO1NBQ2hCO1FBQ0QscUZBQXFGO1FBQ3JGLG9GQUFvRjtRQUNwRixRQUFRLEVBQUU7WUFDTixXQUFXLEVBQUUsOENBQThDO1lBQzNELFVBQVUsRUFBRSxVQUFVO1lBQ3RCLEdBQUcsRUFBRSxNQUFNO1lBQ1gsY0FBYyxFQUFFO2dCQUNaLEtBQUssRUFBRSxDQUFDO2dCQUNSLEtBQUssRUFBRSxNQUFNO2dCQUNiLFNBQVMsRUFBRSxNQUFNO2dCQUNqQixPQUFPLEVBQUUsaUJBQWlCO2dCQUMxQixPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsQ0FBQztnQkFDckQsV0FBVyxFQUFFLGtDQUFrQztnQkFDL0MsTUFBTSxFQUFFO29CQUNKLElBQUksRUFBRTt3QkFDRixJQUFJLEVBQUUsVUFBVTt3QkFDaEIsWUFBWSxFQUFFLGNBQWM7d0JBQzVCLEVBQUUsRUFBRSxPQUFPLENBQUMsK0JBQStCLENBQUM7cUJBQy9DO2lCQUNKO2FBQ0o7U0FDSjtRQUNELFdBQVcsRUFBRTtZQUNULFVBQVUsRUFBRSxhQUFhO1lBQ3pCLFlBQVksRUFBRSxjQUFjO1lBQzVCLEdBQUcsRUFBRSxVQUFVO1lBQ2YsY0FBYyxFQUFFO2dCQUNaLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDO2dCQUN6QyxNQUFNLEVBQUU7b0JBQ0osT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsa0JBQWtCLEVBQUU7b0JBQzVELFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRTtvQkFDM0csR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSx5QkFBeUIsRUFBRSxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUU7aUJBQ3ZIO2FBQ0o7U0FDSjtRQUNELFFBQVEsRUFBRTtZQUNOLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLEdBQUcsRUFBRSxVQUFVO1lBQ2YsY0FBYyxFQUFFO2dCQUNaLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUM7YUFDbkM7U0FDSjtRQUNELGNBQWMsRUFBRTtZQUNaLFVBQVUsRUFBRSxnQkFBZ0I7WUFDNUIsR0FBRyxFQUFFLFVBQVU7WUFDZixjQUFjLEVBQUU7Z0JBQ1osT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUM7YUFDdkM7U0FDSjtRQUNELE1BQU0sRUFBRTtZQUNKLFlBQVksRUFBRSxvQkFBb0I7WUFDbEMsV0FBVyxFQUFFLDBGQUEwRjtZQUN2RyxVQUFVLEVBQUUsTUFBTTtZQUNsQixNQUFNLEVBQUUsS0FBSztZQUNiLEdBQUcsRUFBRSxjQUFjO1lBQ25CLGNBQWMsRUFBRTtnQkFDWixPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLGFBQWEsQ0FBQzthQUN0RDtTQUNKO0tBQ0o7Q0FDSixDQUFDIn0=