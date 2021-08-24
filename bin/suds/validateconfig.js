/* ****************************************
*
*  Validate the config file
*
**************************************** */
let trace = require('track-n-trace');
let suds = require('../../config/suds');
let sudshome = require('../../config/home');
let sudsReports = require('../../config/reports');
let lang = require('../../config/language')['EN'];
//let getRow = require('./get-row');
let db=require('./db');



module.exports = async function (req, res) {
    console.log(__dirname);
    trace.init(req, './');


    trace.log({ starting: 'Validate Config', break: '#', });

    let user = {};
    permission = '#guest#';

    if (req.cookies.user) {
        req.session.userId = req.cookies.user;
    }

    if (req.session.userId) {
        user = await db.getRow('user', req.session.userId);
        if (user.isSuperAdmin) { permission = '#superuser#' } else { permission = user.permission; }
        if (suds.superuser == user.emailAddress) { permission = '#superuser#' }
        trace.log({ 'User record': user, level: 'verbose' });
    }

    errors = '';
    warnings = '';
    /* ****************************************
    *
    *  Validate  suds.config
    *
    **************************************** */

    seterror = function (msg) {

        console.log(msg);
        msg = msg.replace(/\n/g, '<br />&nbsp;&nbsp;');
        this.errors += `\n<p>Error:<br />${msg}</p>`;

    }
    warning = function (msg) {

        console.log(msg);
        msg = msg.replace(/\n/g, '<br />&nbsp;&nbsp;');
        this.warnings += `\n<p>Warning:<br />${msg}</p>`;

    }

    let validSections = [
        'title',
        'description',
        'versionHistory',
        'database',
        'tables',
        'mainPage',
        'validatePage',
        'reportPage',
        'pageLength',
        'superuser',
        'defaultInputFieldWidth',
        'audit',
        'currency',
        'fixWhere',
        'input',
        'search',
        'permissionSets',
        'inputFieldTypes',
        'inputTypes',
    ];
    for (let key of Object.keys(suds)) {
        console.log('checking suds: ', key);
        item = suds[key];
        if (!validSections.includes(key)) {
            seterror(`In suds.js: 
        ${key} is not  valid item`);
        }
        if (key == 'pageLength' && !Number.isInteger(item)) {
            seterror(`In suds.js: 
        pageLength ${item} must be an integer`);
        }
        if (key == 'startSuperusers' && !Number.isInteger(item)) {
            seterror(`In suds.js: 
        startSuperusers ${item} must be an integer`);
        }
        if (key == 'defaultInputSize' && !Number.isInteger(item)) {
            seterror(`In suds.js: 
        defaultInputSize ${item} must be an integer`);
        }

    }

/**
 * 
 * Check home page setup
 * 
 */


    let hometypes = [
        'table',
        'report',
        'www',
        'user',
    ]

    for (let section of Object.keys(sudshome)) {
        if (sudshome[section].links) {
            for (let i = 0; i < sudshome[section].links.length; i++) {
                let link = sudshome[section].links[i];
                let type = '';
                for (let key of Object.keys(link)) {
                    if (hometypes.includes(key)) {
                        type = key;
                    }
                }
                 if (!type) {
                    seterror(`In home.js: 
                Section ${section} 
                link  ${i + 1} does not have a type.`)
                }
            }
        }
    }






    /* ****************************************
    *
    *  Validate tables.config
    *
    **************************************** */
    let validProperties = [
        'type',
        'primaryKey',
        'autoincrement',
        'database',
        'process',
        'input',
        'titleField',
        'display',
        'associations',
        'search',
        'friendlyName',
        'description',
        'extendedDescription',
        'permission',
        'validations',
        'child',
        'collectionList',
        'canEdit',
        'canView',
        'model',
        'allowNull',
        'collection',
        'via',
        'example',
        'annotate',
   
    ];
    let validTableData = [
        'friendlyName',
        'description',
        'extendedDescription',
        'permission',
        'addRow',
        'rowTitle',
        'list',
        'groups',
        'attributes',
        'parentData',
        'edit',
        'open',
    ];
    let validChildData = [
        'tab',
        'link',                     // column in child table that links to this  (yes - we could probablt work that out)
        'limit',                           // number of child records listed in the detail page
        'order',                 // The order in which the are listed 
        'direction',                  // ASC or DESC
        'heading',          //Heading to the listing 
        'addRow',
        'open',              // whether this listing is automatically open
        'list',
        'columns',
        'hideEdit',
        'hideDetails',
        'addChildTip',
    ];
    let validPermissions = Object.keys(suds.permissionSets);

    // Start with the list of field types in suds.js then add the helpers that produce fields.
    /* clone the input field types to start */

    let validInputFieldTypes = [];
    for (let i = 0; i < suds.inputFieldTypes.length; i++) {
        validInputFieldTypes[i] = suds.inputFieldTypes[i];
    }

    console.log('checking tables.js');

    /* ****************************************
      *
      *  Loop through tables
      *
      **************************************** */

    for (let table of suds.tables) {
        let summernotes = 0;
        trace.log({ table: table, break: '#' });

        let tableObject = require(`../../tables/${table}`);
        console.log('checking attribute: ', table, tableObject);
        /* ****************************************
        *
        *  Check table items 
        *
        **************************************** */
        for (let key of Object.keys(tableObject)) {
            if (!validTableData.includes(key)) {
                seterror(`table: ${table}
            ${key} is not  valid item`);
            }
        }


        /* ****************************************
         *
         *  Check permissions
         *
         **************************************** */

        if (tableObject.permission) {
            for (let criterion of Object.keys(tableObject.permission)) {
                sets = tableObject.permission[criterion];
                trace.log({ criterion: criterion, sets: sets });
                for (let i = 0; i < sets.length; i++) {
                    if (!validPermissions.includes(sets[i])) {
                        seterror(`
          In project ${project}:
          Table: ${table}  
          Permission: ${sets[i]} is not  valid permission set
          `);
                    }
                }
            }

        }

        /* ****************************************
          *
          *  Check search field exists
          *
          **************************************** */
        trace.log('search');
        if (tableObject.search) {
            let search = tableObject.search;
            for (let srch of Object.keys(search)) {
                if (!tableObject.attributes[srch]) {
                    seterror(`In project ${project}: 
              Table: ${table}  
              Search: ${srch} 
              Sorry ${srch} is not a valid field
              `);

                }
            }
        }

        /* ****************************************
           *
           *  Check groups
           *
           **************************************** */
        trace.log('groups');

        if (tableObject.groups) {
            for (let group of Object.keys(tableObject.groups)) {
                let columns = tableObject.groups[group].columns;
                if (columns) {
                    if (!Array.isArray(columns)) {
                        seterror(`In project ${project}: 
              Table: ${table}  
              Group: ${group} 
              Sorry columns ${columns} is not an array
              `);
                    }
                    else {
                        for (let column of columns) {
                            if (!tableObject.attributes[column]) {
                                seterror(`In project ${project}: 
            Table: ${table}  
            Group: ${group} 
            Sorry ${column} is not a valid field
            `);

                            }
                        }
                    }
                }
            }
        }



        trace.log('columns');

        /* ****************************************
         *
         *  Check columns on listings
         *
         **************************************** */
        if (tableObject.list && tableObject.list.columns) {
            let columns = tableObject.list.columns;
            trace.log(table, columns);
            for (let i = 0; i < columns.length; i++) {
                if (!tableObject.attributes[columns[i]]) {
                    seterror(`
      Table: ${table} 
      In columns for listing: ${columns[i]} is not a valid attribute
      `);

                }
            }

        }


        /* ****************************************
          *
          *  loop through attributes of this table
          *
          **************************************** */
        if (tableObject.attributes) {
            let attributes = tableObject.attributes;


            /* ****************************************
              *
              *  All the attributes /  properties valid?
              *
              **************************************** */
            trace.log(attributes);
            for (let attribute of Object.keys(attributes)) {

                if (!tableObject.attributes[attribute]) {
                    seterror(`
            Table: ${table}  
            ${attribute} is not a valid attribute
            `);

                }


                for (let property of Object.keys(attributes[attribute])) {
                    if (!validProperties.includes(property)) {
                        seterror(`
            Table: ${table}  
            Column: ${attribute} 
            ${property} is not  valid property
            `);
                    }
                }

                /* ****************************************
                  *
                  *  Input field types valid?
                  *
                  **************************************** */
                if (attributes[attribute].input && attributes[attribute].input.type) {
         
                    /* ****************************************
                     *
                     *  Only one summernote field
                     *
                     **************************************** */

                    if (attributes[attribute].input.type == 'summernote') {
                        summernotes++;
                        if (summernotes > 1) {
                            seterror(`In project ${project}: 
              Table: ${key}  
              Column: ${attribute} 
              Sorry you can only have one summernotes field in a form. (${summernotes})
              `);

                        }
                    }
                    /* ****************************************
                    *
                    *  file type doesn't work yet
                    *
                    **************************************** */

                    if (attributes[attribute].input.type == 'file') {
                        seterror(`In project ${project}: 
              Table: ${table}  
              Column: ${attribute} 
              Sorry the file upload feature is not yet working.
              `);
                    }
                }
                /* ****************************************
                  *
                  *  Check associations
                  *
                  **************************************** */
                if (attributes[attribute].collectionList) {
                    if (!tableObject.attributes[attribute].collection) {
                        trace.log(attribute, attributes[attribute])
                        seterror(`In project ${project}: 
              Table: ${table}
              Column: ${attribute}  
              This column has a collectionList  section, but does not 
              have a collection set in the model.
              `);
                        continue;
                    }
                    for (key of Object.keys(attributes[attribute].collectionList)) {
                        if (!validChildData.includes(key)) {
                            seterror(`
              In project ${project}:
              Table: ${table}  
              Column: ${attribute} 
              ${key} is not  valid
              `);
                        }
                    }
                    let columns = attributes[attribute].collectionList.columns
                    if (columns) {
                        if (!Array.isArray(columns)) {
                            seterror(`In project ${project}: 
                  Table: ${table}  
                  Column: ${attribute} 
                  Property: collectionlist                   
                  Sorry columns ${columns} is not an array 
                  `);
                        }

                    }
                }
            }
        }
    }


    /* ****************************************
    *
    *  Validare reports.config
    *
    **************************************** */

    let validCompare = ['contains', 'startswith', 'startWith', 'eq', 'lt', 'gt', 'le', 'ge', 'ne'];

    for (report of Object.keys(sudsReports)) {
        let reportData = sudsReports[report];
        trace.log(reportData);
        if (!reportData.table) {
            seterror(`In report ${report}:            
          The table name is required.
          `);

        }
        let table = reportData.table;
        trace.log({ report: report, table: table });

        if (reportData.sort) {
            if (reportData.sort[1] != 'ASC' && reportData.sort[1] != 'DESC') {
                seterror(`In report ${report}:            
            The sort direction ${reportData.sort[1]} must be 'ASC' or 'DESC'
            `);
            }
        }
        if (reportData.search) {
            if (reportData.search.andor && reportData.search.andor != 'and' && reportData.search.andor != 'or') {
                seterror(`In report ${report}:            
            The search and/or (${reportData.search.andor} must be 'and' or 'or' (lower case)
            `);
            }
            for (let i = 0; i < reportData.search.searches.length; i++) {
                searchItem = reportData.search.searches[i];
                trace.log(searchItem[1]);
                if (!validCompare.includes(searchItem[1])) {
                    seterror(`In report ${report}:            
              The search comparison "${searchItem[1]}" is not a valid comparison
              `);
                }
            }

        }

    }








    /* ****************************************
       *
       *  Exit
       *
       **************************************** */
    let output = "<h2>Checking the SUDS config files for obvious errors</h2>"
    if (errors) {
        output += errors;
    }
    else {
        output += '<p>No Errors</p>';

    }
    if (warnings) {
        output += warnings;
    }
    else {
        output += '<p>No warnings</p>';

    }
    output += `\n<p><a href="${suds.mainPage}">Admin page</a></p>`;

    res.send(output);
    return;

}