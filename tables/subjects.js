"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Subjects collection
 *
 * The schema format is inspired by the JSON Schema standard. There are additional keys to add
 * processing requirements.
 *
 */
module.exports = {
    description: 'This file includes records for each subject. This is the normalized version in which results are in a separate file.',
    friendlyName: 'Subjects (normalised version)',
    permission: { "all": ["admin", "demo", "trainer", "demor"] },
    /* Stringify provides a field or a function which creates a string that identifies the record.*/
    stringify: "name",
    /** List identifies the fields to be included in a standard list of the file
     *  open specifies that when a subject is shown in detail there is a list of papers
     *  automatically opened on that page.  These are child records and the children
     *  object specifies how they are listed.
    */
    list: {
        open: "papers",
        columns: ["name", "subjectCode", "notes"]
    },
    /**
     *       PROPERTIES
     *
     * One entry per column in the table / field in the document.
     *   type is the type of field (string, number, boolean)
     *     integer is allowed but is treated as 'number' except validated to be an integer.
     *   friendlyName is the name displayed for that column. If omitted the field name
     *     is 'humanised' (fooBar would become 'Foo Bar')
     *   description is used in the tooltip for that field in the update form as well as
     *     being documentation.  If omitted the friendlyName is used.
     *   $ref: {{dbDriver}}Header is replaced by the appropriate Header object in the fragments.js file.
    *      The {{dbHeader}} is a kludge to allow me to use the same schema for different databases.
     *     So for CouchDB the fragment substituted is 'couchHeader'.
     *     The header object contains the standard header fields (id, datestamp, etc)
      *
     */
    properties: {
        $ref: "fragments.js#/{{dbDriver}}Header",
        name: {
            friendlyName: "Subject name",
            type: "string",
        },
        subjectCode: {
            type: 'string',
            pattern: "[A-Z]{2,2}[0-9]{3,3}",
            description: `Must be for the form AA999 and must be unique. 
Uniqueness is checked when you leafe the field.  
The format is chequed when you submit the form.`,
            input: { api: { route: '/unique', } },
        },
        notes: {
            type: "string",
            description: `Notes about the subject that may be useful. 
Optional, but if included must be at least 50 characters.`,
            input: { type: "textarea" },
            display: { truncateForTableList: 50 },
            minLength: 20,
        },
        pass: {
            type: 'integer',
            friendlyName: 'Pass score',
            description: 'Must be an integer between 20 an 100',
            maximum: 100,
            minimum: 20,
            multipleOf: 5,
        }
    },
    required: ['name', 'subjectCode'],
    /** The children section indicates that the papers records are child records
     *  and the foreign key in the papers records is called 'subject'.`  It also specifies
     *  which fields are listed in the subject detail listing.
    */
    children: {
        papers: {
            collection: "papers",
            via: "subject",
            friendlyName: "Exam papers",
            collectionList: {
                columns: ["name"]
            }
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViamVjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3N1YmplY3RzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYixNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RDs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsV0FBVyxFQUFFLHNIQUFzSDtJQUNuSSxZQUFZLEVBQUUsK0JBQStCO0lBQzdDLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0lBQzVELGdHQUFnRztJQUNoRyxTQUFTLEVBQUUsTUFBTTtJQUNqQjs7OztNQUlFO0lBQ0YsSUFBSSxFQUFFO1FBQ0YsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQztLQUM1QztJQUNEOzs7Ozs7Ozs7Ozs7Ozs7T0FlRztJQUNILFVBQVUsRUFBRTtRQUNSLElBQUksRUFBRSxrQ0FBa0M7UUFDeEMsSUFBSSxFQUFFO1lBQ0YsWUFBWSxFQUFFLGNBQWM7WUFDNUIsSUFBSSxFQUFFLFFBQVE7U0FDakI7UUFDRCxXQUFXLEVBQUU7WUFDVCxJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxzQkFBc0I7WUFDL0IsV0FBVyxFQUFFOztnREFFdUI7WUFDcEMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsR0FBRyxFQUFFO1NBQ3hDO1FBQ0QsS0FBSyxFQUFFO1lBQ0gsSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUU7MERBQ2lDO1lBQzlDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDM0IsT0FBTyxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSxFQUFFO1lBQ3JDLFNBQVMsRUFBRSxFQUFFO1NBQ2hCO1FBQ0QsSUFBSSxFQUFFO1lBQ0YsSUFBSSxFQUFFLFNBQVM7WUFDZixZQUFZLEVBQUUsWUFBWTtZQUMxQixXQUFXLEVBQUUsc0NBQXNDO1lBQ25ELE9BQU8sRUFBRSxHQUFHO1lBQ1osT0FBTyxFQUFFLEVBQUU7WUFDWCxVQUFVLEVBQUUsQ0FBQztTQUNoQjtLQUNKO0lBQ0QsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQztJQUNqQzs7O01BR0U7SUFDRixRQUFRLEVBQUU7UUFDTixNQUFNLEVBQUU7WUFDSixVQUFVLEVBQUUsUUFBUTtZQUNwQixHQUFHLEVBQUUsU0FBUztZQUNkLFlBQVksRUFBRSxhQUFhO1lBQzNCLGNBQWMsRUFBRTtnQkFDWixPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7YUFDcEI7U0FDSjtLQUNKO0NBQ0osQ0FBQyJ9