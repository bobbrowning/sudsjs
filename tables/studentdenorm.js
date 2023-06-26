"use strict";
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
 * The API code is found in bin -> custom -> APIname.js
 * The parentName can be an array or sungle values. Single values
 * are standardised to an array (in this case). These are passed to the API code as
 * parentValue0, 1,2, etc.
 *
 * The API does not need a routing entry because there is a routing function
 * that forwards the data to the requested custom routine (apicustomrouter).
 *
 *
 * Example document  (couchdb)
 *
 * {
_id: 'dbb87f2f748e4ac19f13ad887806ac62',
_rev: '4-fffaff6f4c74d19c3d0653d856b9dd92',
collection: 'studentdenorm',
createdAt: 1659523428186,
updatedAt: 1667904766660,
updatedBy: 'dbb87f2f748e4ac19f13ad8878005588',
name: 'Foghorn Leghorn',
address: {
  address1: 'Warner Farm',
  address2: '',
  city: 'Burbank',
  zip: '47894',
  },
results: [
  {
    subject: 'dbb87f2f748e4ac19f13ad8878066813',
    paper: [
      { paper: 'Geometry',  score: 55,  },
      { paper: 'Numerical analysis',  score: 88,  },
      ],
    },
  {
    subject: 'dbb87f2f748e4ac19f13ad8878065418',
    paper: [ { paper: 'TV Advertising',  score: 77,  },  ],
    },
  ],
}

 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
let suds = require('../config/suds');
let db = require('../bin/suds/db');
let lookup = require('../bin/suds/lookup-value');
module.exports = {
    description: 'Student - structured model',
    type: 'object',
    friendlyName: 'Student (Denormalized)',
    stringify: 'name',
    permission: { all: ['admin', 'demo', 'trainer', 'demod'] },
    list: { columns: ['name', 'address', 'results'], },
    required: ['name'],
    properties: {
        /* This inserts a standard header from fragments.js
          The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        name: {
            type: 'string'
        },
        address: {
            type: 'object',
            properties: {
                $ref: '#/$defs/address',
            },
        },
        results: {
            type: 'array',
            friendlyName: 'Subject and results',
            stringify: async function (data) {
                let subject = await db.getRow('subjectsdenorm', data.subject);
                return (`${subject.name}`);
            },
            items: {
                type: 'object',
                properties: {
                    subject: {
                        type: 'string',
                        model: 'subjectsdenorm',
                        input: { type: 'select', },
                    },
                    paper: {
                        /*                        type: 'object',
                                                array: { type: 'multiple' },
                        */
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
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
                                    type: 'integer',
                                    minimum: 0,
                                    maximum: 100,
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    $defs: {
        address: {
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
        }
    }
};
