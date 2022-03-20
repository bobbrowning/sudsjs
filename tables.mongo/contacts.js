/**
 * Contacts table schema
 *
 */

let db = require('../bin/suds/db-mongo');



module.exports = {
  description: `A record should be created for all contacts with prospects, customers 
  or suppliers. It may be phone, email, text etc. When a contact is made, it may result in further 
  actions being needed. The expected date and the person responsible for the action is recorded. 
  When the subsequent action takes place the earlier action is closed.  When the contacts are listed, 
  they are characterised by the first 40 characters of the notes.`,
  friendlyName: 'Notes from contacts',
  permission: { all: ['sales', 'purchasing', 'admin', 'demo'] },
  addRow: 'Add a new contact',            // text in the link to add a new row  

  /* The list property has the specification for the table listing */
  list: {
    /* When the table is listed, these are the columns shown */
    columns: ['updatedAt', '_id', 'user', 'date', 'notes', 'closed', 'contactBy'],
  },

  /* The row title function returns the first 40 characters of notes  */
  /*   plus the current date.                                            */
  rowTitle: function (record) {
    let date = new Date(record.date).toString().substring(0, 16);
    let text = record.notes.substring(0, 40);
    if (record.notes.length > 40) { text += ' ...' }
    return `${text} - ${date}`;
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


    preFormDescription: `This function is run immediately before updating/adding to  the     
     a new contact.   The 'isFollowUp' value is pre-populated for new    
     rows when called from a parent record. This is because it is the  
     field that links the new record to the parent.                     
     This routine looks for 'isFollowUp' populated and there is no       
     user - i.e. a new row called from a parent.  The routine fills in   
     the user from the parent record. It also closes the previous contact `,
    preForm: async function (record, mode) {
      if (record.isFollowUp && !record.user) {
        let following = await db.getRow('contacts', record.isFollowUp);
        record.user = following.user;
        await db.updateRow('contacts', { _id: record.isFollowUp, closed: true })
      }
      return;
    },


    postProcessDescription: `This function is run immediately after the record is updated.   
    It sets the last contact and next action in the user's record.`,
    postProcess: async function (record, operation) {
      console.log('postprocess - updating user', record.user,record.id,record.nextActionDate,record.nextAction,)
      await db.updateRow('user', {
        _id: record.user,
        lastContact: record._id,
        nextActionDate: record.nextActionDate,
        nextAction: record.nextAction,
      });

      return;
    },
  },
  attributes: {
    _id: {
      friendlyName: 'Contact Id',                            // Visible name 
      primaryKey: true,
    },
    createdAt: {
      friendlyName: 'Date created',
      type: 'number',
      display: { type: 'datetime', truncateForTableList: 16 },
      database: { type: 'biginteger' },
      process: { createdAt: true }
    },                                      // You don't actually enter these
    updatedAt: {                            // but if you did they would be dates. 
      friendlyName: 'Date last updated',    // so this also governs how they are diaplayed
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

    user: {
      description: 'The person or organisation contacted',
      model: 'user',
      friendlyName: 'Customer or supplier',
      input: {
        type: 'autocomplete',
        placeholder: 'Number or type name (case sensitive)',
        idPrefix: 'User number: ',
        search: 'fullName',          // Looks for record whete the name contains whatever is entered
        required: true,
      },
      display: {
        linkedTable: 'user',      // if omitted will be picked up from the model
        makeLink: true,             // hypertext link to the linked table
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
        limit: 5,                   // number of options returned
        search: {                  // This can simply be a field to search 
          andor: 'and',             // Or can be a full search specification  
          searches: [
            ['fullName', 'contains', '#input'],
            ['userType', 'equals', 'I']
          ],
        },
        minLength: 3,               // min characters entered before search (defaults to 2)
        placeholder: 'Number or type name (case sensitive)',
        idPrefix: 'User number: ',   // The program adds the id in brackets after the title. in this case 'User number n'
        default: '#loggedInUser',    // 
      }
    },
    contacttype: {
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
      friendlyName: 'Contact number that this is a following up to',
      input: {type: 'readonly'},
    },


    notes:
    {
      description: 'Notes from contact',
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
    result: {
      description: 'How did it go',
      type: 'string',
      values: {
        E: 'Excellent - objectives reached',
        G: 'Good - progress towards objective met',
        N: 'Neutral',
        B: 'Not as well as exected',
        F: 'Failure',
      },
      input: {
        type: 'select',
      }
    },
    nextActionDate: {
      type: 'string',
      description: 'Next action Date (ISO Format)',
      example: '2020-10-29 13:59:58.000',
      input: { type: 'date', width: '220px', default: '#today+5' },
      display: { type: 'date' },
    },
    nextAction:
    {
      description: 'Next Action',
      type: 'string',
      input: {
        type: 'textarea',
        rows: 3,
        cols: 60,
        placeholder: 'Please enter follow up required',
      },
    },
    closed: {
      type: 'boolean',
    },
    followUp: {
      collection: 'contacts',
      via: 'isFollowUp',
      collectionList: {
        addChildTip: 'Record the follow-up to this contact',
        columns: ['date', 'notes', 'closed'],
      }
    },

  },

}
