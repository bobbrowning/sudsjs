"use strict";
/**
 * Contacts table schema
 *
 *
 * You need to make a couple f changes to use this table with SQL.
 * Chang
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL2NvbnRhY3RzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7Ozs7OztHQU9HOztBQUVILE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDN0MsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDckMsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDbkMsTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNiLElBQUksRUFBRSxRQUFRO0lBQ2QsV0FBVyxFQUFFOzs7O2tFQUlpRDtJQUM5RCxZQUFZLEVBQUUscUJBQXFCO0lBQ25DLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO0lBQzdELE1BQU0sRUFBRSxtQkFBbUI7SUFDM0IsbUVBQW1FO0lBQ25FLElBQUksRUFBRTtRQUNGLDJEQUEyRDtRQUMzRCxPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDO0tBQzNEO0lBQ0QsdUVBQXVFO0lBQ3ZFLHlFQUF5RTtJQUN6RSxTQUFTLEVBQUUsS0FBSyxXQUFXLE1BQU07UUFDaEMsd0JBQXdCO1FBQ3JCLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELElBQUksSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hELElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMs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