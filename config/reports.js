"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    /* *****************************************************
    *
    *    Report definitions
    *
    * **************************************************** */
    userSearch: {
        table: 'user',
        friendlyName: 'User list',
        title: 'All people/organisations',
        sort: ['fullName', 'ASC'],
        open: 'contacts',
        openGroup: 'contacts',
        search: {
            andor: 'and',
            searches: [
                ['fullName', 'contains', '#fullName'] // Name assigned in suds-home.js 
            ]
        },
        /* Columns on the table listing. All columns are in the detail page */
        columns: ['fullName', 'emailAddress', 'mainPhone', 'mobilePhone', 'userType', 'organisation',],
    },
    productSales: {
        table: 'salesorders',
        friendlyName: 'Products sales',
        //  searchFields: ['product'],   // Not available for multiple keys
        columns: ['product', 'date', 'id', 'customer', 'units', 'price', 'total'],
        view: {
            design: 'reports',
            view: 'productSales',
            key: ['product', 'date'],
            params: {},
            /** Additional fields not in salesorder schema */
            fields: {
                product: {
                    type: 'string',
                    friendlyName: 'Product',
                    model: 'products',
                    input: { type: 'select' }
                },
                id: {
                    friendlyName: 'Sales order',
                    type: 'string',
                    model: 'salesorders',
                },
                units: { type: 'string', friendlyName: 'Units' },
                price: { type: 'number', friendlyName: 'Price' },
                total: { type: 'number', friendlyName: 'Total' },
            }
        }
    },
    salesByProduct: {
        table: 'products',
        friendlyName: 'Products sales by month',
        searchFields: ['product'],
        sort: ['product', 'ASC'],
        view: {
            design: 'reports',
            view: 'salesbyproduct',
        },
        columns: ['product', 'total'],
        view: {
            design: 'reports',
            view: 'salesbyproduct',
            reduced: true,
            params: {},
            fields: {
                product: {
                    type: 'string',
                    friendlyName: 'Product',
                    model: 'products',
                    input: { type: 'select' }
                },
                order: {
                    friendlyName: 'Sales order',
                    type: 'string',
                    model: 'salesorders',
                },
                units: { type: 'string', friendlyName: 'Units' },
                price: { type: 'number', friendlyName: 'Price' },
                total: { type: 'number', friendlyName: 'Total' },
            }
        }
    },
    allSubjects: {
        table: 'subjects',
        friendlyName: 'Subjects list',
        view: {
            design: 'reports',
            view: 'allSubjects',
        },
        columns: ['name', 'notes'],
    },
    resultsnorm: {
        table: 'results',
        friendlyName: 'Results by subject (Normalized data)',
        sort: ['subject', 'ASC'],
        columns: ['subject', 'studentId', 'paper', 'score'],
    },
    resultsdenorm: {
        table: 'studentdenorm',
        friendlyName: 'Results by subject (Denormalized data)',
        searchFields: ['subject'],
        view: {
            design: 'reports',
            view: 'results',
            key: 'subject',
            params: {},
            fields: {
                subject: {
                    friendlyName: 'Subject',
                    model: 'subjectsdenorm',
                    input: { type: 'select' },
                },
                student: {
                    friendlyName: 'Student',
                    model: 'studentdenorm',
                },
                paper: {
                    friendlyName: 'Paper',
                },
                score: {
                    friendlyName: 'Score',
                },
            },
        },
        columns: ['subject', 'student', 'paper', 'score'],
    },
    allUsers: {
        table: 'user',
        friendlyName: 'User list',
        view: {
            design: 'reports',
            view: 'allUsers',
        },
        //   sort: ['emailAddress', 'ASC'],                            // sort field
        columns: ['fullName', 'emailAddress', 'userType', 'permission',],
    },
    allAudit: {
        table: 'audit',
        friendlyName: 'Audit list',
        view: {
            design: 'reports',
            view: 'allAudit',
        },
        columns: ['createdAt', 'tableName', 'mode', 'row'],
    },
    /* *****************************************************
    *
    *    Customer search, assumes that an input field (fullName) is present.
    *
    * **************************************************** */
    customerSearch: {
        table: 'user',
        friendlyName: 'Customer list',
        title: 'Customers',
        sort: ['fullName', 'ASC'],
        open: 'contacts',
        openGroup: 'contacts',
        search: {
            andor: 'and',
            searches: [
                ['userType', 'eq', 'C'],
                ['fullName', 'contains', '#fullName'] // Name assigned in suds-home.js 
            ]
        },
        /* Columns on the table listing. All columns are in the detail page */
        columns: ['fullName', 'emailAddress', 'mainPhone', 'mobilePhone', 'userType', 'organisation',],
    },
    /* *****************************************************
    *
    *    Overdue follow-ups to contacts
    *
    * **************************************************** */
    myOpenContacts: {
        table: 'contacts',
        friendlyName: 'My open contacts',
        description: 'My open contacts',
        title: 'My open contacts',
        sort: ['nextActionDate', 'DESC'],
        open: 'contacts',
        openGroup: 'contacts',
        search: {
            andor: 'and',
            searches: [
                ['contactBy', 'eq', '#loggedInUser'],
                ['closed', 'ne', true],
            ]
        },
        columns: ['user', 'date', 'nextActionDate', 'note'], // Columns on the table listing. All columns are in the detail page
    },
    allOpenContacts: {
        table: 'contacts',
        friendlyName: 'All open contacts',
        description: 'All open contacts',
        title: 'All open contacts',
        sort: ['nextActionDate', 'DESC'],
        open: 'contacts',
        openGroup: 'contacts',
        search: {
            andor: 'and',
            searches: [
                ['closed', 'ne', true],
            ]
        },
        columns: ['user', 'date', 'nextActionDate', 'note', 'contactBy'], // Columns on the table listing. All columns are in the detail page
    },
    overdueFollowUps: {
        table: 'contacts',
        friendlyName: 'All overdue follow-ups',
        description: 'All overdue follow-ups',
        title: 'Overdue follow-ups',
        sort: ['nextActionDate', 'DESC'],
        open: 'contacts',
        openGroup: 'contacts',
        search: {
            andor: 'and',
            searches: [
                ['nextActionDate', 'lt', '#today'],
                ['closed', 'ne', true],
            ]
        },
        columns: ['user', 'date', 'nextActionDate', 'note', 'contactBy'], // Columns on the table listing. All columns are in the detail page
    },
    upcomingFollowUps: {
        table: 'contacts',
        friendlyName: 'Upcoming follow-ups',
        title: 'My Upcoming follow-ups',
        sort: ['nextActionDate', 'ASC'],
        open: 'contacts',
        openGroup: 'contacts',
        search: {
            andor: 'and',
            searches: [
                ['nextActionDate', 'ge', '#today'],
                ['nextActionDate', 'le', '#today+7'],
                ['contactBy', 'eq', '#loggedInUser'],
                ['closed', 'ne', true],
            ]
        },
        columns: ['user', 'date', 'nextActionDate', 'note'], // Columns on the table listing. All columns are in the detail page
    },
    allUpcomingFollowUps: {
        table: 'contacts',
        friendlyName: 'Upcoming follow-ups',
        title: 'All Upcoming follow-ups',
        sort: ['nextActionDate', 'ASC'],
        open: 'contacts',
        openGroup: 'contacts',
        search: {
            andor: 'and',
            searches: [
                ['nextActionDate', 'ge', '#today'],
                ['nextActionDate', 'le', '#today+7'],
                ['closed', 'ne', true],
            ]
        },
        columns: ['user', 'date', 'nextActionDate', 'note', 'contactBy'], // Columns on the table listing. All columns are in the detail page
    },
    customers: {
        table: 'user',
        title: 'Customer list',
        sort: ['fullName', 'ASC'],
        open: 'contacts',
        openGroup: 'contacts',
        search: {
            andor: 'and',
            searches: [
                ['userType', 'eq', 'C'],
            ] // Filter field and value
        },
        columns: ['fullName', 'emailAddress', 'mainPhone', 'mobilePhone', 'organisation',], // Columns on the table listing. All columns are in the detail page
    },
    studentSubschema: {
        table: 'subschema',
        title: 'Subschemas for student demo',
        sort: ['updatedAt', 'DESC'],
        search: {
            andor: 'and',
            searches: [
                ['group', 'eq', 'exams'],
            ] // Filter field and value
        },
    },
    outstandingOrders: {
        table: 'salesorders',
        title: 'Outstanding orders',
        sort: ['updatedAt', 'DESC'],
        openGroup: 'salesorderlines',
        search: {
            andor: 'and',
            searches: [
                ['status', 'ne', 'D'],
            ] // Filter field and value
        },
    },
    prospects: {
        table: 'user',
        friendlyName: 'Customer list',
        title: 'Prospects',
        sort: ['fullName', 'ASC'],
        open: 'contacts',
        openGroup: 'contacts',
        search: {
            andor: 'or',
            searches: [
                ['userType', 'eq', 'L'],
                ['userType', 'eq', 'P'],
            ] // Filter field and value
        },
        columns: ['fullName', 'organisation', 'lastContact', 'nextActionDate', 'userType'], // Columns on the table listing. All columns are in the detail page
    },
    suppliers: {
        table: 'user',
        friendlyName: 'Suppliers list',
        title: 'Suppliers',
        sort: ['fullName', 'ASC'],
        open: 'products',
        openGroup: 'products',
        search: {
            andor: 'and',
            searches: [
                ['userType', 'eq', 'S'],
            ] // Filter field and value
        },
        columns: ['fullName', 'emailAddress', 'mainPhone', 'mobilePhone',], // Columns on the table listing. All columns are in the detail page
    },
    inhouseUsers: {
        table: 'user',
        friendlyName: 'In house users list',
        title: 'In House users',
        sort: ['permission', 'ASC'],
        open: 'contacts',
        openGroup: 'contacts',
        search: {
            andor: 'and',
            searches: [
                ['userType', 'eq', 'I'],
            ] // Filter field and value
        },
        columns: ['fullName', 'emailAddress', 'mainPhone', 'mobilePhone', 'permission', 'isSuperAdmin'], // Columns on the table listing. All columns are in the detail page
    },
    auditTrail: {
        table: 'audit',
        title: 'List audit trail',
        sort: ['createdAt', 'DESC'],
        search: {
            andor: 'and',
            searches: [
                ['tableName', 'eq', '#table'],
                ['udatedBy', 'eq', '#users'],
            ]
        },
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcvcmVwb3J0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYjs7Ozs2REFJeUQ7SUFDekQsVUFBVSxFQUFFO1FBQ1IsS0FBSyxFQUFFLE1BQU07UUFDYixZQUFZLEVBQUUsV0FBVztRQUN6QixLQUFLLEVBQUUsMEJBQTBCO1FBQ2pDLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUM7UUFDekIsSUFBSSxFQUFFLFVBQVU7UUFDaEIsU0FBUyxFQUFFLFVBQVU7UUFDckIsTUFBTSxFQUFFO1lBQ0osS0FBSyxFQUFFLEtBQUs7WUFDWixRQUFRLEVBQUU7Z0JBQ04sQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDLGlDQUFpQzthQUMxRTtTQUNKO1FBQ0Qsc0VBQXNFO1FBQ3RFLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFO0tBQ2pHO0lBQ0QsWUFBWSxFQUFFO1FBQ1YsS0FBSyxFQUFFLGFBQWE7UUFDcEIsWUFBWSxFQUFFLGdCQUFnQjtRQUM5QixtRUFBbUU7UUFDbkUsT0FBTyxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO1FBQ3pFLElBQUksRUFBRTtZQUNGLE1BQU0sRUFBRSxTQUFTO1lBQ2pCLElBQUksRUFBRSxjQUFjO1lBQ3BCLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7WUFDeEIsTUFBTSxFQUFFLEVBQUU7WUFDVixpREFBaUQ7WUFDakQsTUFBTSxFQUFFO2dCQUNKLE9BQU8sRUFBRTtvQkFDTCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxZQUFZLEVBQUUsU0FBUztvQkFD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