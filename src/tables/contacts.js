
/**
 * Contacts table schema
 * 
 * 
 * You need to make a couple f changes to use this table with SQL.
 * Chang
 *
 */

const { stringify } = require('querystring');
let suds = require('../config/suds');
let db = require('../bin/suds/db');
module.exports = {
    type: 'object',
    description: `A record should be created for all contacts with prospects, customers 
  or suppliers. It may be phone, email, text etc. When a contact is made, it may result in further 
  actions being needed. The expected date and the person responsible for the action is recorded. 
  When the subsequent action takes place the earlier action is closed.  When the contacts are listed, 
  they are characterised by the first 40 characters of the notes.`,
    friendlyName: 'Notes from contacts',
    permission: { all: ['sales', 'purchasing', 'admin', 'demo'] },
    addRow: 'Add a new contact',
    /* The list property has the specification for the table listing */
    list: {
        /* When the table is listed, these are the columns shown */
        columns: ['updatedAt', 'user', 'date', 'note', 'closed'],
    },
    /* The stringify  function returns the first 40 characters of notes  */
    /*   plus the contact date.                                            */
    stringify: async function (record) {
     //   console.log(record)
        let date = new Date(record.date).toString().substring(0, 16);
        let user = await db.getRow('user', record.user);
        let text = record.note.substring(0, 30);
        if (record.note.length > 30) {
            text += ' ...'; 
        }
        return `${user.fullName}: ${text} - ${date}`;
    },
    /* The edit property has the specification of the add/update functions */
    edit: {
        /*  The add/update function shows a box at the top of the form the form */
        /*  with information from the parent record.  Only applies if the form  */
        /*  comes  via the parent record                                        */
        parentData: {
            link: 'user',
            columns: ['fullName', 'lastContact', 'emailAddress', 'mainPhone'],
        },
        /**
         * This function is run immediately before updating/adding to  the
         * a new contact.   The 'isFollowUp' value is pre-populated for new
         * rows when called from a parent record. If it is a followup then the
         * previous contact in the chain is marked as closed.
         */
        preForm: async function (record, mode) {
            if (record.isFollowUp) {
                await db.updateRow('contacts', { _id: record.isFollowUp, closed: true });
            }
            return;
        },
        /**
         * This function is run immediately after the record is updated.
         * It sets the last contact and next action in the user's record.
         * ***** this does not work with the SQL test data becaue the key is id. It will crash! ***
         * */
        postProcess: async function (record, operation) {
            console.log('postprocess - updating user', record.user, record.id, record.nextActionDate, record.nextAction);
            await db.updateRow('user', {
                _id: record.user,
                lastContact: record._id,
                nextActionDate: record.nextActionDate,
                nextAction: record.nextAction,
            });
            return;
        },
    },
    properties: {
        /* This inserts a standard header from fragments.js
            The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        user: {
            description: 'The person or organisation contacted',
            model: 'user',
            friendlyName: 'Customer or supplier',
            input: {
                type: 'autocomplete',
                placeholder: 'Number or type name (case sensitive)',
                idPrefix: 'User number: ',
                search: 'fullName',
                required: true,
            },
            display: {
                linkedTable: 'user',
                makeLink: true, // hypertext link to the linked table
            },
        },
        date: {
            type: 'string',
            description: 'Date (ISO Format)',
            example: '2020-10-29 13:59:58.000',
            input: {
                type: 'date',
                width: '200px',
                required: true,
                default: '#today',
            },
            display: { type: 'date' }
        },
        contactBy: {
            description: 'Contact person',
            model: 'user',
            friendlyName: 'Person who made the contact',
            input: {
                type: 'autocomplete',
                required: true,
                limit: 5,
                search: {
                    andor: 'and',
                    searches: [
                        ['fullName', 'contains', '#input'],
                        ['userType', 'equals', 'I']
                    ],
                },
                placeholder: 'Number or type name (case sensitive)',
                idPrefix: 'User number: ',
                default: '#loggedInUser', // 
            }
        },
        contactType: {
            description: 'Type of contact',
            type: 'string',
            friendlyName: 'Type of contact',
            input: { type: 'radio' },
            values: {
                C: 'Cold call',
                O: 'Phone out',
                T: 'Phone in',
                X: 'Text',
                E: 'Email',
                P: 'Face to face',
                M: 'Post',
            },
        },
        isFollowUp: {
            model: 'contacts',
            description: 'If this is a follow-up to another contact. This refers.',
            friendlyName: 'Contact that this is a following up to',
            input: {
                type: 'autocomplete',
                search: {
                    andor: 'and',
                    searches: [
                        ['note', 'contains', '#input'],
                        ['user', 'equals', '$user'],
                        ['_id', 'ne', '$_id']
                    ],
                    sort: ['date', 'DESC'],
                },
                limit: 5,
                placeholder: 'Type part of the note',
                idPrefix: 'User number: ', // The program adds the id in brackets after the title. in this case 'User number n'
            },
        },
        result: {
            description: 'How did it go',
            type: 'array',
            values: {
                E: 'Excellent - sale made',
                C: 'Call back scheduled',
                P: 'Purchasing plans dicussed',
                M: 'Meeting scheduled',
                Y: `Another person identified`,
                U: 'Future sales unlikely',
            },
            input: {
                type: 'checkboxes',
                single: true, // presented on input as a single field - normal for checkboxes..
            },
            items: {
                type: 'string',
            },
            display: { type: 'list' },
        },
        nextActionDate: {
            type: 'string',
            description: 'Next action Date (ISO Format)',
            example: '2020-10-29 13:59:58.000',
            input: { type: 'date', width: '220px', default: '#today+5' },
            display: { type: 'date' },
        },
        closed: {
            type: 'boolean',
        },
        note: {
            description: 'Notes from contact. ',
            type: 'string',
            input: {
                type: 'textarea',
                rows: 5,
                cols: 60,
                placeholder: 'Please enter notes on the contact'
            },
            display: {
                truncateForTableList: 30,
                maxWidth: '500px',
            },
        },
        nextAction: {
            description: 'Next Action',
            type: 'string',
            input: {
                type: 'textarea',
                rows: 3,
                cols: 60,
                placeholder: 'Please enter follow up required',
            },
        },
    },
    children: {
        followUp: {
            collection: 'contacts',
            via: 'isFollowUp',
            collectionList: {
                addChildTip: 'Record the follow-up to this contact',
                columns: ['date', 'note', 'closed'],
            }
        }
    },
};