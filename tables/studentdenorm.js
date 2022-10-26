/**
 * 
 * Student table - denormalized model
 * 
 * This version of the student table contains all of the exam results as an array of objects. 
 * Like this
 * result 1 - subject 1
 *            -  paper 1
 *            -  paper 2
 *          - subject 2
 *              etc
 * result 2 - subject 1
 *            - paper 1
 *            - paper 2
 * etc
 * 
 * So the user on entry or update has to select the subject before being presented 
 * with the papers. This is done by an API called by fillChildSelect which sites in 
 * public -> javascript -> suds.js. 
 * 
 * The paramerters are field name, API name, parent name, value
 * 
 * The API code is found in 
 * bin -> custom -> APIname.js the parentName can be an array and sungkle values 
 * care standardised to an array (in this case). These are passed to the API code as 
 * parentValue0, 1,2, etc.
 * 
 * The API does not need a routing entry because there is a routing function 
 * that forwards the data to the requested custom routine (apicustomrouter). 
 * 
 */

let db = require('../bin/suds/db-mongo');
let lookup = require('../bin/suds/lookup-value');


module.exports = {
    description: 'Student - structured model',

    friendlyName: 'Student',
    stringify: 'name',
    permission: { all: ['admin', 'demo', 'trainer','demod'] },
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
            friendlyName: 'Subject and results',
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
                                    onload: `fillChildSelect('{{fieldName}}','exampaper','subject','{{fieldValue}}')`,
                                    onfocus: `fillChildSelect('{{fieldName}}','exampaper','subject')`,
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
