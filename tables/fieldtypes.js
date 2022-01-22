
/** ************************************************
 * 
 *                Field types test
 * 
 * *********************************************** */

module.exports = {
    friendlyName: 'Field types test',
    description: `This database has one example of each input
     field type for testing.`,
    permission: { all: ['admin', 'demo'] },
    list: {
        columns: ['id', 'text']
    },

    attributes: {
        /*  Standard columns in all tables */
        id: {
            friendlyName: 'Record key',
            type: 'number',
            primaryKey: true,
            autoincrement: true,
        },
        createdAt: {
            friendlyName: 'Date created',
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            database: { type: 'biginteger' },
            process: { createdAt: true }
        },                                      // You don't actually enter these
        updatedAt: {
            friendlyName: 'Date last updated',
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

        /* Application columns */
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




}