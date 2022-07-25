/**
 * 
 * Student table - normalised moned
 * 
 */

let db = require('../bin/suds/db-mongo');
let lookup = require('../bin/suds/lookup-value');


module.exports = {
    description: 'Student - normalised model',

    friendlyName: 'Student',
    stringify: 'name',
    permission: { all: ['admin', 'demo', 'trainer'] },
    list: { columns: ['name', 'address', 'results'], },
    standardHeader: true,
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
        results: {
            array: { type: 'multiple' },
            type: 'object',
            stringify: async function (data) {
                let subject = await db.getRow('subjectsdenorm', data.subject);
                return (`${subject.name}`)
            },
            object: {
                subject: {
                    type: 'string',
                    model: 'subjectsdenorm',
                    input: { type: 'select', },
                },
                paper: {
                    type: 'object',
                    array: { type: 'multiple' },
                    object: {
                        paper: {
                            type: 'string',
                            input: {
                                type: 'select',
                                onevents: {
                                    onload: `fillPaperSelect('{{fieldName}}','{{fieldValue}}')`,
                                    onfocusin: `fillPaperSelect('{{fieldName}}')`,
                                },
                            },
                        },
                        score: {
                            type: 'number',
                            input: { type: 'number', max: 100 },
                        }
                    }
                }
            }
        }

    }
}
