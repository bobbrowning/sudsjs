"use strict";
/** ************************************************
 *
 *                Field types test schema
 *
 * *********************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    friendlyName: 'Field types test',
    description: `This database has one example of each input
     field type for testing.`,
    permission: { all: ['admin', 'demo'] },
    list: {
        columns: ['_id', 'text']
    },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        text: {
            friendlyName: 'Regular input field (hover here for tooltip).',
            type: 'string',
            input: { type: 'text', placeholder: 'Enter some text.' },
            description: 'This is a plain input field - nothing special. ',
        },
        datea: {
            friendlyName: 'ISO Date',
            type: 'string',
            input: { type: 'date', default: '#today' },
            description: 'This date is stored in ISO format (e.g. 2021-10-14). It is set to default to the current date.',
        },
        dateb: {
            friendlyName: 'Numeric Date',
            type: 'number',
            input: { type: 'date', default: '#today' },
            display: { type: 'date' },
            description: 'This date is stored in as the number of milliseconds since 1 Jauary 1970 UTC (e.g. 1635033600000). ',
        },
        password: {
            friendlyName: 'Password',
            type: 'string',
            input: { type: 'password', },
            display: { type: 'asterisks' },
        },
        color: {
            friendlyName: 'Color',
            type: 'string',
            input: { type: 'color', default: '#ffffff' },
            display: { type: 'color' },
        },
        datetimelocal: {
            friendlyName: 'Date time',
            type: 'string',
            input: { type: 'datetime-local' },
            description: 'This date and time is stored in ISO format. (e.g. 2021-10-15T14:51). ',
        },
        email: {
            friendlyName: 'Email',
            type: 'string',
            input: { type: 'email' },
        },
        month: {
            friendlyName: 'Month',
            type: 'string',
            input: { type: 'month' },
            description: 'Stored as month and year. (e.g. 2021-11). ',
        },
        time: {
            friendlyName: 'Time',
            type: 'string',
            input: { type: 'time' },
            description: 'Stored as a string. (e.g. 14:54). ',
        },
        week: {
            friendlyName: 'Week',
            type: 'string',
            input: { type: 'week' },
            description: 'Year and week number stored as a string. (e.g. 2021-W41). ',
        },
        number: {
            friendlyName: 'Number',
            type: 'number',
            input: { type: 'number' },
        },
        checkbox: {
            friendlyName: 'Checkbox',
            type: 'boolean',
            input: { type: 'checkbox' },
            description: 'Stored as a boolean value (true/false).',
        },
        yesnoradio: {
            friendlyName: 'Alternative to Checkbox',
            type: 'boolean',
            input: { type: 'yesnoRadio' },
            description: 'Stored as a boolean value (true/false).',
        },
        checkboxesdda: {
            friendlyName: 'Checkboxes: text values in table definition',
            description: `Where a field may have multiple values the data is converted to JSON and stored in a text field. (example:  ["a","b","d"])
 In this case the source values are stored as an object in the table definition file.`,
            type: 'string',
            input: { type: 'checkboxes' },
            process: { JSON: true },
            display: { JSON: true },
            values: { a: 'A', b: 'B', c: 'C', d: 'D' },
        },
        checkboxesddc: {
            friendlyName: 'Checkboxes: array in table definition',
            description: `Where a field may have multiple values the data is converted to JSON and stored in a text field. (example:  ["A","D"])
In this case the source values are stored as an array in the table definition file.`,
            type: 'string',
            input: { type: 'checkboxes' },
            process: { JSON: true },
            display: { JSON: true },
            values: ['A', 'B', 'C', 'D'],
        },
        checkboxesc: {
            friendlyName: 'Checkboxes: data in configuration file',
            description: `Where a field may have multiple values the data is converted to JSON and stored in a text field. (example:  ["a","d"])
In this case the source values are stored as an object in a file in the config directory.`,
            type: 'string',
            input: { type: 'checkboxes' },
            process: { JSON: true },
            display: { JSON: true },
            values: 'test',
        },
        radiodda: {
            friendlyName: 'radio: array in table definition',
            type: 'string',
            input: { type: 'radio' },
            values: ['A', 'B', 'C', 'D'],
            description: `The source values are an array in the configuration  file (example ['A', 'B', 'C', 'D'] )'`,
        },
        radioddb: {
            friendlyName: 'radio: numbers in table definition',
            type: 'number',
            input: { type: 'radio' },
            values: { 1: 'A', 2: 'B', 3: 'C', 4: 'D' },
            description: `The source values are an object in the configuration  file (example { 1: 'A', 2: 'B', 3: 'C', 4: 'D' } )`,
        },
        radioc: {
            friendlyName: 'Radio Buttons: data in configuration file',
            type: 'string',
            input: { type: 'radio' },
            values: 'test',
            description: 'The source values are an object in a module in the config directory. ',
        },
        selectddt: {
            friendlyName: 'Select: values in table definition',
            type: 'string',
            input: { type: 'select' },
            values: { a: 'A', b: 'B', c: 'C', d: 'D' },
            description: `The source values are an object in the configuration  file (example { a: 'A', b: 'B', c: 'C', d: 'D' } )`,
        },
        selectddn: {
            friendlyName: 'Select: Numeric value - text labels',
            type: 'number',
            input: { type: 'select' },
            values: { 1: 'A', 2: 'B', 3: 'C', 4: 'D' },
            description: `The source values are an object in the configuration  file (example { 1: 'A', 2: 'B', 3: 'C', 4: 'D' } )
The values are stored as a number.`,
        },
        selectc: {
            friendlyName: 'Select: data in configuration file',
            type: 'string',
            input: { type: 'select' },
            values: 'countries',
            description: `The source values are an object in a file in the config directory. 
In this case the table is a list of countries with ISO codes.`,
        },
        selectdb: {
            friendlyName: 'Select: data in database table',
            type: 'string',
            input: { type: 'select' },
            model: 'products',
            description: `The source values are from a table on the database. 
In this case the table the product table.`,
        },
        autocompletec: {
            friendlyName: "Autocomplete: data in configuration file (try 'U')",
            type: 'string',
            input: { type: 'autocomplete' },
            values: 'countries',
            description: `This is an autocomplete field. The source values are from a file in the config directory (the same countries table as above).  
Start typing and the progrem presents a limited number of matching records.  Select the one you want. This will be case sensitive.`,
        },
        autocompletedb: {
            friendlyName: "Autocomplete: data in database table (try 'A')",
            type: 'string',
            input: { type: 'autocomplete', search: 'name', },
            model: 'products',
            description: `This is an autocomplete field. The source values are from a table in the database (The product table).  
Start typing and the progrem presents a limited number of matching records.  Select the one you want. 
This may be case sensitive depending on the database management system you are using.`,
        },
        summernote: {
            friendlyName: 'Summernote',
            type: 'string',
            input: { type: 'summernote' },
            description: 'Summernote is a very simple rich text editor.',
        },
        ckeditor4: {
            friendlyName: 'CKEditor 4',
            type: 'string',
            input: { type: 'ckeditor4' },
            description: 'CKEditor 4 is a very long established rich text editor.  The styles and format options were customised to support this web site.',
        },
        ckeditor5: {
            friendlyName: 'CKEditor 5',
            type: 'string',
            input: { type: 'ckeditor5' },
            description: `CKEditor 5 is a more recent development of a long established rich text editor. The implementation here is very basic. The text box will grow as ypou type.
NOTE: You can't mix ckeditor4 and 5 on the same page so this area wil not work - it is for illustrative purposes only.`,
        },
        textarea: {
            friendlyName: 'Text Area',
            type: 'string',
            input: { type: 'textarea' },
        },
        uploadfile: {
            friendlyName: 'Upload file',
            type: 'string',
            input: { type: 'uploadFile' },
            display: { type: 'image', width: '100px' },
        },
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGR0eXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YWJsZXMvZmllbGR0eXBlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7Ozs7cURBSXFEOztBQUVyRCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsWUFBWSxFQUFFLGtCQUFrQjtJQUNoQyxXQUFXLEVBQUU7NkJBQ1k7SUFDekIsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO0lBQ3RDLElBQUksRUFBRTtRQUNGLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7S0FDM0I7SUFDRCxVQUFVLEVBQUU7UUFDUjt1R0FDK0Y7UUFDL0YsSUFBSSxFQUFFLGtDQUFrQztRQUN4QyxJQUFJLEVBQUU7WUFDRixZQUFZLEVBQUUsK0NBQStDO1lBQzdELElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEVBQUU7WUFDeEQsV0FBVyxFQUFFLGlEQUFpRDtTQUNqRTtRQUNELEtBQUssRUFBRTtZQUNILFlBQVksRUFBRSxVQUFVO1lBQ3hCLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFO1lBQzFDLFdBQVcsRUFBRSxnR0FBZ0c7U0FDaEg7UUFDRCxLQUFLLEVBQUU7WUFDSCxZQUFZLEVBQUUsY0FBYztZQUM1QixJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRTtZQUMxQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO1lBQ3pCLFdBQVcsRUFBRSxxR0FBcUc7U0FDckg7UUFDRCxRQUFRLEVBQUU7WUFDTixZQUFZLEVBQUUsVUFBVTtZQUN4QixJ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