/**
 *  
 * Student table - normalised moned
 * 
 */

 let suds = require('../config/suds');
 let db = require('../bin/suds/'+suds.dbDriver);
 let lookup = require('../bin/suds/lookup-value');


module.exports = {
    description: 'Student - normalised model',

    friendlyName: 'Student',
    stringify: 'name',
    permission: { all: ['admin', 'demo','trainer','demov'] },
    list: {
        columns: ['name','address','subjects'], 
        subschemaName: 'exams',
    },
    standardHeader: true,
    subschema: {
        key: 'subjects',
    },
    attributes: {
        name: {
            type: 'string'
        },
        address: {
            type: 'object',
            object: {
                address1: {
                    type: 'string'
                },
                address2: {
                    type: 'string'
                },
                city: {
                    type: 'string'
                },
                zip: {
                    type: 'string'
                },
            },
        },
        subjects: {
            type: 'string',
            array: { type: 'single' },
            friendlyName: 'Subjects taken',
            description: 'Check those that apply',
            model: 'subschema',
            input: {
              type: 'checkboxes',
              search: {
                searches: [
                  ['group', 'eq', 'exams'],
                ]
              }
            },
            display: { type: 'list' },                  
        }
    }
}