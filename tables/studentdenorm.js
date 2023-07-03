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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R1ZGVudGRlbm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YWJsZXMvc3R1ZGVudGRlbm9ybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQStERzs7QUFFSCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNyQyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNuQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsV0FBVyxFQUFFLDRCQUE0QjtJQUN6QyxJQUFJLEVBQUUsUUFBUTtJQUNkLFlBQVksRUFBRSx3QkFBd0I7SUFDdEMsU0FBUyxFQUFFLE1BQU07SUFDakIsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEVBQUU7SUFDMUQsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsR0FBRztJQUNsRCxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFDbEIsVUFBVSxFQUFFO1FBQ1I7c0dBQzhGO1FBQzlGLElBQUksRUFBRSxrQ0FBa0M7UUFDeEMsSUFBSSxFQUFFO1lBQ0YsSUFBSSxFQUFFLFFBQVE7U0FDakI7UUFDRCxPQUFPLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtZQUNkLFVBQVUsRUFBRTtnQkFDUixJQUFJLEVBQUUsaUJBQWlCO2FBQzFCO1NBQ0o7UUFDRCxPQUFPLEVBQUU7WUFDTCxJQUFJLEVBQUUsT0FBTztZQUNiLFlBQVksRUFBRSxxQkFBcUI7WUFDbkMsU0FBUyxFQUFFLEtBQUssV0FBVyxJQUFJO2dCQUMzQixJQUFJLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM5RCxPQUFPLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMvQixDQUFDO1lBQ0QsS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRSxRQUFRO2dCQUNkLFVBQVUsRUFBRTtvQkFDUixPQUFPLEVBQUU7d0JBQ0wsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsS0FBSyxFQUFFLGdCQUFnQjt3QkFDdkIsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsR0FBRztxQkFDN0I7b0JBQ0QsS0FBSyxFQUFFO3dCQUNIOzswQkFFRTt3QkFDRixJQUFJLEVBQUUsT0FBTzt3QkFDYixLQUFLLEVBQUU7NEJBQ0gsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsVUFBVSxFQUFFO2dDQUNSLEtBQUssRUFBRTtvQ0FDSCxJQUFJLEVBQUUsUUFBUTtvQ0FDZCxLQUFLLEVBQUU7d0NBQ0gsSUFBSSxFQUFFLFFBQVE7d0NBQ2QsUUFBUSxFQUFFOzRDQUNOLE1BQU0sRUFBRSx5RUFBeUU7NENBQ2pGLE9BQU8sRUFBRSx3REFBd0Q7eUNBQ3BFO3FDQUNKO2lDQUNKO2dDQUNELEtBQUssRUFBRTtvQ0FDSCxJQUFJLEVBQUUsU0FBUztvQ0FDZixPQUFPLEVBQUUsQ0FBQztvQ0FDVixPQUFPLEVBQUUsR0FBRztpQ0FDZjs2QkFDSjt5QkFDSjtxQkFDSjtpQkFDSjthQUNKO1NBQ0o7S0FDSjtJQUNELEtBQUssRUFBRTtRQUNILE9BQU8sRUFBRTtZQUNMLFFBQVEsRUFBRTtnQkFDTixJQUFJLEVBQUUsUUFBUTthQUNqQjtZQUNELFFBQVEsRUFBRTtnQkFDTixJQUFJLEVBQUUsUUFBUTthQUNqQjtZQUNELElBQUksRUFBRTtnQkFDRixJQUFJLEVBQUUsUUFBUTthQUNqQjtZQUNELEdBQUcsRUFBRTtnQkFDRCxJQUFJLEVBQUUsUUFBUTthQUNqQjtTQUNKO0tBQ0o7Q0FDSixDQUFDIn0=