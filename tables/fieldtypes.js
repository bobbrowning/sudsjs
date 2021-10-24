
/** ************************************************
 * 
 *                Field types test
 * 
 * *********************************************** */

module.exports = {
    friendlyName: 'Field types test',
    description: `This database has one example of each input
     field type for testing.`,
    permission: { all: ['admin'] },
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
        },
        dateb: {
            friendlyName: 'Numeric Date',
            type: 'number',
            input: { type: 'date', default: '#today' },
            display: { type: 'date' }
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
            friendlyName: 'Date time local',
            type: 'string',
            input: { type: 'datetime-local' },
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
        },
        time: {
            friendlyName: 'Time',
            type: 'string',
            input: { type: 'time' },
        },
         week: {
            friendlyName: 'Week',
            type: 'string',
            input: { type: 'week' },
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
        },
       yesnoradio: {
            friendlyName: 'Alternative to Checkbox',
            type: 'boolean',
            input: { type: 'yesnoRadio' },
        },
        checkboxesdda: {
            friendlyName: 'Checkboxes: text values in table definition',
            description: `Where a field may have multiple values the data is converted to JSON and stored in a text field. 
                           In this case the source values are stored as an object in the table definition file.`,
            type: 'string',
            input: { type: 'checkboxes' },
            process: { JSON: true },
            display: { JSON: true },
            values: { a: 'A', b: 'B', c: 'C', d: 'D' },
        },
        checkboxesddc: {
            friendlyName: 'Checkboxes: array in table definition',
            description: `Where a field may have multiple values the data is converted to JSON and stored in a text field. 
            in this case the source values are stored as an array in the table definition file.`,
            type: 'string',
            input: { type: 'checkboxes' },
            process: { JSON: true },
            display: { JSON: true },
            values: ['A', 'B', 'C', 'D'],
        },
        checkboxesc: {
           friendlyName: 'Checkboxes: data in configuration file',
            description: `Where a field may have multiple values the data is converted to JSON and stored in a text field. 
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
        },
        radioddb: {
            friendlyName: 'radio: numbers in table definition',
            type: 'number',
            input: { type: 'radio' },
            values: { 1: 'A', 2: 'B', 3: 'C', 4: 'D' },
        },
        radioc: {
            friendlyName: 'Radio Buttons: data in configuration file',
            type: 'string',
            input: { type: 'radio' },
            values: 'test',
        },
       selectddt: {
            friendlyName: 'Select: values in table definition',
            type: 'string',
            input: { type: 'select' },
            values: { a: 'A', b: 'B', c: 'C', d: 'D' },
        },
        selectddn: {
            friendlyName: 'Select: Numeric value - text labels',
            type: 'number',
            input: { type: 'select' },
            values: { 1: 'A', 2: 'B', 3: 'C', 4: 'D' },
        },
         selectc: {
            friendlyName: 'Select: data in configuration file',
            type: 'string',
            input: { type: 'select' },
            values: 'countries',
        },
       selectdb: {
            friendlyName: 'Select: data in database table',
            type: 'string',
            input: { type: 'select' },
            model: 'products',
        },
        autocompletec: {
            friendlyName: "Autocomplete: data in configuration file (try 'U')",
            type: 'string',
            input: { type: 'autocomplete' },
            values: 'countries',
        },
         autocompletedb: {
            friendlyName: "Autocomplete: data in database table (try 'A')",
            type: 'string',
            input: { type: 'autocomplete', search: 'name', },
            model: 'products',
        },
         summernote: {
            friendlyName: 'Summernote',
            type: 'string',
            input: { type: 'summernote' },
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
        },

    }




}