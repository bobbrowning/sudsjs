"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* ****************************************
*
*  Validate the config file
*
**************************************** */
const trace = require('track-n-trace');
const suds = require('../../config/suds');
const sudshome = require('../../config/home');
const sudsReports = require('../../config/reports');
const lang = require('../../config/language').EN;
// let getRow = require('./get-row');
const db = require('./db');
const fs = require('fs');
const jsonFragments = require('../../tables/fragments');
const standardHeader = require('../../config/standard-header')[suds[suds.dbDriver].standardHeader];
module.exports = async function (req, res) {
    console.log(__dirname);
    trace.init(req, './');
    trace.log({ starting: 'Validate Config', break: '#' });
    let user = {};
    let permission = '#guest#';
    if (req.cookies.user) {
        req.session.userId = req.cookies.user;
    }
    if (req.session.userId) {
        user = await db.getRow('user', req.session.userId);
        if (user.isSuperAdmin) {
            permission = '#superuser#';
        }
        else {
            permission = user.permission;
        }
        if (suds.superuser == user.emailAddress) {
            permission = '#superuser#';
        }
        trace.log({ 'User record': user, level: 'verbose' });
    }
    globalThis.errors = '';
    globalThis.warnings = '';
    globalThis.errorCount = -0;
    globalThis.warningCount = 0;
    /* ****************************************
      *
      *  Validate  suds.config
      *
      **************************************** */
    let seterror = function (msg) {
        console.log(msg);
        msg = msg.replace(/\n/g, '<br />&nbsp;&nbsp;');
        errors += `\n<p>Error:<br />${msg}</p>`;
        errorCount++;
    };
    let warning = function (msg) {
        console.log(msg);
        msg = msg.replace(/\n/g, '<br />&nbsp;&nbsp;');
        this.warnings += `\n<p>Warning:<br />${msg}</p>`;
        warningCount++;
    };
    const validSections = [
        'title',
        'description',
        'versionHistory',
        'database',
        'dbDriver',
        'tables',
        'port',
        'get',
        'post',
        'csrf',
        'useHTML5Validation',
        'subschemaGroups',
        'validate',
        'baseURL',
        'mainPage',
        'validatePage',
        'forgottenPasswordOptions',
        'session',
        'morgan',
        'authorisation',
        'login',
        'logout',
        'changepw',
        'register',
        'report',
        'forgotten',
        'pageLength',
        'superuser',
        'defaultInputFieldWidth',
        'forgottenPasswordExpire',
        'rememberPasswordExpire',
        'audit',
        'currency',
        'qualifyColName',
        'quoteColName',
        'input',
        'search',
        'permissionSets',
        'inputFieldTypes',
        'inputTypes',
        'inputTypeHandlers',
        'viewEngine',
        'views',
        'emailTransport',
        'documentation',
        'headerTags',
        'dbkey',
        'dbType',
        'dbDriverKey',
        'dbDriverName',
        'caseInsensitive',
        'databases',
        'start',
        'jsonSchema'
    ];
    console.log('Checking suds.js: ');
    for (const key of Object.keys(suds)) {
        console.log('- checking : ', key);
        let item = suds[key];
        if (!(validSections.includes(key) || suds.databases.includes(key))) {
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
    const hometypes = [
        'table',
        'report',
        'www',
        'user'
    ];
    for (const section of Object.keys(sudshome)) {
        if (sudshome[section].links) {
            for (let i = 0; i < sudshome[section].links.length; i++) {
                const link = sudshome[section].links[i];
                let type = '';
                for (const key of Object.keys(link)) {
                    if (hometypes.includes(key)) {
                        type = key;
                    }
                }
                if (!type) {
                    seterror(`In home.js: 
                Section ${section} 
                link  ${i + 1} does not have a type.`);
                }
            }
        }
    }
    /* ****************************************
      *
      *  Validate tables.config
      *
      **************************************** */
    const validProperties = [
        'ref',
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
        'values',
        'helpText',
        'recordTypeColumn',
        'addRow',
        'recordType',
        'array',
        'object',
        'stringify',
        'key',
        'qualifiedName',
        'qualifiedFriendlyName',
        'children',
    ];
    const validTableData = [
        'rowTitle',
        'stringify',
        'standardHeader',
        'friendlyName',
        'description',
        'extendedDescription',
        'permission',
        'addRow',
        'stringify',
        'list',
        'groups',
        'properties',
        'attributes',
        'parentData',
        'edit',
        'open',
        'recordTypeColumn',
        'recordTypeInput',
        'demoRow',
        'subschema'
    ];
    const validChildData = [
        'tab',
        'link',
        'limit',
        'order',
        'direction',
        'heading',
        'addRow',
        'open',
        'list',
        'columns',
        'hideEdit',
        'hideDetails',
        'addChildTip',
        'derive',
        'sort'
    ];
    const validTypes = [
        'string',
        'number',
        'boolean',
        'object'
    ];
    const validPermissions = Object.keys(suds.permissionSets);
    validPermissions.push('all');
    validPermissions.push('#guest#');
    validPermissions.push('#superuser#');
    // Start with the list of field types in suds.js then add the helpers that produce fields.
    /* clone the input field types to start */
    const validInputFieldTypes = [];
    for (let i = 0; i < suds.inputFieldTypes.length; i++) {
        validInputFieldTypes.push(suds.inputFieldTypes[i]);
    }
    for (let i = 0; i < suds.inputTypeHandlers.length; i++) {
        validInputFieldTypes.push(suds.inputTypeHandlers[i]);
    }
    console.log('Checking tables');
    /* ****************************************
        *
        *  Loop through tables
        *
        **************************************** */
    for (const table of suds.tables) {
        let summernotes = 0;
        trace.log({ table, break: '#' });
        console.log('- checking ', table);
        const tableObject = require(`../../tables/${table}`);
        /* ****************************************
            *
            *  consolidate properties of this table
            *
            **************************************** */
        /* ****************************************
            *
            *  Check table items
            *
            **************************************** */
        for (const key of Object.keys(tableObject)) {
            if (!validTableData.includes(key)) {
                seterror(`table: ${table}
            ${key} is not  valid item`);
                console.log(tableObject[key]);
            }
        }
        /* ****************************************
             *
             *  Check permissions
             *
             **************************************** */
        if (tableObject.permission) {
            for (const criterion of Object.keys(tableObject.permission)) {
                let sets = tableObject.permission[criterion];
                trace.log({ criterion, sets });
                for (let i = 0; i < sets.length; i++) {
                    if (!validPermissions.includes(sets[i])) {
                        seterror(`
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
        let properties = tableObject.properties;
        trace.log('search');
        if (tableObject.search) {
            const search = tableObject.search;
            for (const srch of Object.keys(search)) {
                if (!properties[srch]) {
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
            let children = {};
            if (tableObject.children)
                children = tableObject.children;
            for (const group of Object.keys(tableObject.groups)) {
                const columns = tableObject.groups[group].columns;
                if (columns) {
                    if (!Array.isArray(columns)) {
                        seterror(`In table: ${table}  
              Group: ${group} 
              Sorry columns ${columns} is not an array
              `);
                    }
                    else {
                        for (const column of columns) {
                            if (!properties[column] && !children[column]) {
                                seterror(`In table: ${table}  
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
            const columns = tableObject.list.columns;
            trace.log(table, columns);
            for (let i = 0; i < columns.length; i++) {
                if (!properties[columns[i]]) {
                    seterror(`
      Table: ${table} 
      In columns for listing: ${columns[i]} is not a valid attribute
      `);
                }
            }
        }
        if (tableObject.recordTypeColumn) {
            const recordTypeColumn = tableObject.recordTypeColumn;
            if (!tableObject.properties[recordTypeColumn]) {
                seterror(`
                Table: ${table} 
                Record type column ${recordTypeColumn} is not a valid attribute
                `);
            }
        }
        /* ****************************************
              *
              *  All the properties /  properties valid?
              *
              **************************************** */
        dereference(properties, tableObject);
        validateproperties(table, properties);
        /**
         *
         *   Dereference schema
         *
         * @param {object} properties
         * @param {object} tableData
         * @param {object} parent
         */
        function dereference(properties, tableData) {
            trace.log(tableData.friendlyName);
            /*   couldn't get this to work  *********
           const deref = require('json-schema-deref-sync');
           const schema=JSON.stringify(properties)
           try {
           deref(schema,{baseFolder:'/home/bob/suds/tables'})
           console.log(JSON.parse(schema))
           process.exit()
           }
           catch (err) {
             throw new Error (`problem with schema for ${tableData.friendlyName}
             ${err}`)
           }
           */
            trace.log(properties);
            for (const key of Object.keys(properties)) {
                trace.log({ key: key, properties: properties[key] });
                if (key === '$ref') {
                    /**
                     *  Only $ref supported are:
                     * #/$defs/aaa   retrieved bbb from object $defs in the current document
                     * filename.js#/aaa   object aaa in filename.js  which is in the tables directory
                     */
                    let jsonFragments;
                    if (properties[key].includes('{{dbDriver}}')) {
                        properties[key] = properties[key].replace('{{dbDriver}}', suds.dbDriver);
                    }
                    let [address, ref] = properties[key].split('#/');
                    trace.log(address, ref);
                    if (address) {
                        jsonFragments = require(`../../tables/${address}`);
                        trace.log(`Replacing $ref with object in ${address} - ${ref}`);
                        for (const jr of Object.keys(jsonFragments[ref])) {
                            properties[jr] = jsonFragments[ref][jr];
                        }
                    }
                    else {
                        if (ref.includes('$defs/')) {
                            ref = ref.replace('$defs/', '');
                            if (!(tableData['$defs'])) {
                                throw new Error(`merge-attributes.js::No $defs object for ${ref}`);
                            }
                            if (!(tableData['$defs'][ref])) {
                                throw new Error(`merge-attributes.js::No $defs/${ref} object`);
                            }
                            for (const jr of Object.keys(tableData['$defs'][ref])) {
                                trace.log(jr, tableData['$defs'][ref][jr]);
                                properties[jr] = tableData['$defs'][ref][jr];
                            }
                        }
                    }
                    delete properties[key];
                }
                else {
                    if (properties[key].type == 'object') {
                        trace.log(properties[key].properties);
                        //        if (properties[key].object) dereference(properties[key].object, tableData)
                        if (properties[key].properties)
                            dereference(properties[key].properties, tableData);
                    }
                }
            }
            trace.log(properties);
        }
        function validateproperties(table, properties) {
            for (const attribute of Object.keys(properties)) {
                console.log('-- checking properties ', attribute);
                if (attribute === '$ref') {
                    continue;
                }
                if (typeof properties[attribute] !== 'object') {
                    seterror(`
            Table: ${table}  
            ${attribute} is not a valid attribute
            `);
                }
                if (properties[attribute].type == 'object') {
                    if (!properties[attribute].object) {
                        seterror(`
                        Table: ${table}  
                        Column: ${attribute} 
                        Needs an object property with sub-fields defined
                        `);
                    }
                    else {
                        console.log('descending one level');
                        validateproperties(table, properties[attribute].object);
                    }
                }
                trace.log('table', attribute, properties[attribute].type);
                if (properties[attribute].type && !validTypes.includes(properties[attribute].type)) {
                    seterror(`
                Table: ${table}  
                Column: ${attribute} 
                ${properties[attribute].type} is not  valid type
                `);
                }
                for (const property of Object.keys(properties[attribute])) {
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
                if (properties[attribute].input && properties[attribute].input.type) {
                    if (!validInputFieldTypes.includes(properties[attribute].input.type)) {
                        seterror(`
                        Table: ${table}  
                        Column: ${attribute} 
                        ${properties[attribute].input.type} is not  valid input type
                        `);
                    }
                    /* ****************************************
                               *
                               *  Only one summernote field
                               *
                               **************************************** */
                    if (properties[attribute].input.type == 'summernote') {
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
                    if (properties[attribute].input.type == 'file') {
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
                if (properties[attribute].collectionList) {
                    if (!tableObject.properties[attribute].collection) {
                        trace.log(attribute, properties[attribute]);
                        seterror(`In project ${project}: 
              Table: ${table}
              Column: ${attribute}  
              This column has a collectionList  section, but does not 
              have a collection set in the model.
              `);
                        return;
                    }
                    for (const key of Object.keys(properties[attribute].collectionList)) {
                        if (!validChildData.includes(key)) {
                            seterror(`
              Table: ${table}  
              Column: ${attribute} 
              ${key} is not  valid
              `);
                        }
                    }
                    const columns = properties[attribute].collectionList.columns;
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
    const validCompare = ['contains', 'startswith', 'startWith', 'eq', 'lt', 'gt', 'le', 'ge', 'ne'];
    for (const report of Object.keys(sudsReports)) {
        const reportData = sudsReports[report];
        trace.log(reportData);
        if (!reportData.table) {
            seterror(`In report ${report}:            
          The table name is required.
          `);
        }
        const table = reportData.table;
        trace.log({ report, table });
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
                let searchItem = reportData.search.searches[i];
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
    let output = '<h2>Checking the SUDSjs config files for obvious errors</h2>';
    if (errorCount) {
        output += errors;
    }
    else {
        output += '<p>No Errors</p>';
    }
    if (warningCount) {
        output += warnings;
    }
    else {
        output += '<p>No warnings</p>';
    }
    output += `\n<p><a href="${suds.mainPage}">Admin page</a></p>`;
    const summary = `${Date().slice(0, 21)}
    ${errorCount} Errors
    ${warningCount} Warnings
    `;
    fs.writeFile('lastvalidate.txt', summary, err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(summary);
    });
    res.send(output);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGVjb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvdmFsaWRhdGVjb25maWcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OzsyQ0FJMkM7QUFDM0MsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQzdDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ25ELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUNoRCxxQ0FBcUM7QUFDckMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzFCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN4QixNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtBQUV2RCxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBRWxHLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHO0lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFFckIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUV0RCxJQUFJLElBQUksR0FBRyxFQUFFLENB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