"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViamVjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3N1YmplY3RzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0E7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNiLFdBQVcsRUFBRSxzSEFBc0g7SUFDbkksWUFBWSxFQUFFLCtCQUErQjtJQUM3QyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFBRTtJQUM1RCxnR0FBZ0c7SUFDaEcsU0FBUyxFQUFFLE1BQU07SUFDakI7Ozs7TUFJRTtJQUNGLElBQUksRUFBRTtRQUNGLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUM7S0FDNUM7SUFDRDs7Ozs7Ozs7Ozs7Ozs7O09BZUc7SUFDSCxVQUFVLEVBQUU7UUFDUixJQUFJLEVBQUUsa0NBQWtDO1FBQ3hDLElBQUksRUFBRTtZQUNGLFlBQVksRUFBRSxjQUFjO1lBQzVCLElBQUksRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsV0FBVyxFQUFFO1lBQ1QsSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUUsc0JBQXNCO1lBQy9CLFdBQVcsRUFBRTs7Z0RBRXVCO1lBQ3BDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEdBQUcsRUFBRTtTQUN4QztRQUNELEtBQUssRUFBRTtZQUNILElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFOzBEQUNpQztZQUM5QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQzNCLE9BQU8sRUFBRSxFQUFFLG9CQUFvQixFQUFFLEVBQUUsRUFBRTtZQUNyQyxTQUFTLEVBQUUsRUFBRTtTQUNoQjtRQUNELElBQUksRUFBRTtZQUNGLElBQUksRUFBRSxTQUFTO1lBQ2YsWUFBWSxFQUFFLFlBQVk7WUFDMUIsV0FBVyxFQUFFLHNDQUFzQztZQUNuRCxPQUFPLEVBQUUsR0FBRztZQUNaLE9BQU8sRUFBRSxFQUFFO1lBQ1gsVUFBVSxFQUFFLENBQUM7U0FDaEI7S0FDSjtJQUNELFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUM7SUFDakM7OztNQUdFO0lBQ0YsUUFBUSxFQUFFO1FBQ04sTUFBTSxFQUFFO1lBQ0osVUFBVSxFQUFFLFFBQVE7WUFDcEIsR0FBRyxFQUFFLFNBQVM7WUFDZCxZQUFZLEVBQUUsYUFBYTtZQUMzQixjQUFjLEVBQUU7Z0JBQ1osT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDO2FBQ3BCO1NBQ0o7S0FDSjtDQUNKLENBQUMifQ==