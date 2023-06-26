"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* ****************************************
*
*  Documemnt the config file
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
const mergeAttributes = require('./merge-attributes');
const tableDataFunction = require('./table-data');
const sendView = require('./send-view');
const humaniseFieldName = require('./humanise-fieldname');
module.exports = async function (req, res) {
    console.log(__dirname);
    trace.init(req, './');
    trace.log({ starting: 'Config report', break: '#' });
    let user = {};
    permission = '#guest#';
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
    if (!suds.report.permission.includes(permission) && permission !== '#superuser#') {
        res.send('<h2>Sorry, you don\'t have permission to run this program</h2>');
        return;
    }
    const permissions = ['all', 'any', 'view', 'edit', 'delete'];
    const tableList = [];
    const tableDataStore = {};
    const attributesStore = {};
    const tables = suds.tables;
    for (let i = 0; i < tables.length; i++) {
        table = tables[i];
        tableDataStore[table] = tableDataFunction(table, permission);
        attributesStore[table] = mergeAttributes(table, permission);
        let friendlyName = table;
        if (tableDataStore[table].friendlyName) {
            friendlyName = `${tableDataStore[table].friendlyName}`;
        }
        tableList.push([table, friendlyName]);
    }
    trace.log(tableList);
    /* ****************************************
     *
     *  Introduction
     *
     **************************************** */
    let title = 'Unnamed project';
    let description = '';
    if (suds.title) {
        title = suds.title;
    }
    if (suds.description) {
        description = suds.description;
    }
    const superwarning = '';
    output = `
      <div class="sudsReport">
      <div style="margin-bottom: 60px;">   <!--  header page -->
        <h1>SUDS Database Report </h1>
         <h2>${title}</h1>
        <p>${description}</p>${superwarning}</p>
        <h2>Contents</h2>
        <p>
          <b>Settings</b><br />
          <a href="#vh">Basic settings</a><br />
          <a href="#sp">Searches</a><br />
          <a href="#ps">Permission sets</a><br />
          <a href="#it">Input Types</a><br />
          <a href="#ds">Database</a><br />
        </p>
        <p>
          <b>Tables</b><br />`;
    for (let i = 0; i < tableList.length; i++) {
        output += `
          <a href="#${tableList[i][0]}">${tableList[i][1]}</a><br />
          `;
    }
    output += `
       </p>`;
    output += `
           <a name="vh"></a><h3 style="margin-top: 50px;">Version history</h3>
          <table class=".table-bordered" style="margin-bottom: 30px">
          <thead>
          <tr>
            <th >Version</th>
            <th >Date</th>
            <th >Author</th>
            <th >Notes</th>
           </tr>
          </thead>
          <tbody>`;
    hist = [];
    if (suds.versionHistory) {
        hist = suds.versionHistory;
    }
    for (let i = 0; i < hist.length; i++) {
        output += `
     <tr><td>${hist[i].version}</td><td>${hist[i].date}</td><td>${hist[i].author}</td><td>${hist[i].description}</td></tr>
      `;
    }
    output += `
    </tbody>
    </table>`;
    output += `
  <p>Report date: ${Date().substring(0, 16)}</p>
     </div>            <!--  header page -->      
     <hr class="sudsreporthr">`;
    /* ****************************************
       *
       *  Other configuration data
       *
       **************************************** */
    let val = '';
    try {
        const data = fs.readFileSync('lastvalidate.txt', 'utf8');
        const lines = data.split('\n');
        val = `
    ${lines[0]}<br />
    ${lines[1]}<br />
    ${lines[2]}<br />
    `;
    }
    catch (err) {
        console.error(err);
        val = 'Needs validation';
    }
    output += `
     <a name="ot"></a><h1>Basic settings</h1>
    <table class=".table-bordered" style=" margin-bottom: 10px;">
    <thead>
    <tr>
      <th >Item</th>
      <th >Value</th>
     </tr>
    </thead>
    <tbody>
    <tr><td>Listening on this port by default <br />(can be changed by setting the PORT environment variable)</td><td>${suds.port}</td></tr>
   <tr><td>Route to the main program</td><td>${suds.mainPage}</td></tr>
   <tr><td>Route to the configuration report program</td><td>${suds.report.page}</td></tr>
   <tr><td>Route to the configuration validate program</td><td>${suds.validate.page}</td></tr>
     <tr><td>Number of rows in paginated lists</td><td>${suds.pageLength}</td></tr>
     <tr><td>Currrency </td><td>${suds.currency.currency}<br />${suds.currency.locale}<br />${suds.currency.digits} digits</td></tr>
     <tr><td>Last validation run<br />(Needed when configuration changes) </td><td>${val}</td></tr>
     </tbody>
    </table>`;
    /* ****************************************
      *
      *  Search parameters
      *
      **************************************** */
    output += `
    <a name="sp"></a><h1>Searches</h1>
    <table class=".table-bordered" style="width: 900px;">
    <thead>
    <tr>
      <th style="width: 500px">Item</th>
      <th >Value</th>
     </tr>
    </thead>
    <tbody>
    <tr><td>Width of input fields for searches</td><td>${suds.search.fieldWidth}</td></tr>
    <tr><td>Maximum number of conditions</td><td>${suds.search.maxConditions}</td></tr>
    <tr><td>Users normally have an option to search equals, less than, greater than etc. 
    However the following fields are always treated as 'equals' tests.</td><td>[`;
    for (let i = 0; i < suds.search.allwaysEquals.length; i++) {
        if (i > 0) {
            output += ', ';
        }
        output += suds.search.allwaysEquals[i];
    }
    output += `
  ]</td></tr> 
   <tr><td>The search operation normally presents field options in the same format as the input field. 
    So for example if the input is radio buttons than the search is also radio buttons.
    However for the following input types the search field is a simple text input field:</td><td>[`;
    for (let i = 0; i < suds.search.allwaysText.length; i++) {
        if (i > 0) {
            output += ', ';
        }
        output += suds.search.allwaysText[i];
    }
    output += `]</td></tr>
    </tbody>
    </table>`;
    output += `
    </p>
    <hr class="sudsreporthr">`;
    /* ****************************************
      *
      *  Security
      *
      **************************************** */
    output += `
   <a name="ps"></a><h1>Security</h1>
   <table class=".table-bordered" style=" margin-bottom: 10px;">
   <thead>
   <tr>
     <th style="width: 350px" >Item</th>
     <th >Value</th>
    </tr>
   </thead>
   <tbody>
  <tr><td>Route to the login</td><td>${suds.login.page}</td></tr>
   <tr><td>Route to logout</td><td>${suds.logout.page}</td></tr>
   <tr><td>Route to the change password program</td><td>${suds.changepw.page}</td></tr>
   <tr><td>Route to the register program</td><td>${suds.register.page}</td></tr>
   <tr><td>Superuser by default</td><td>${suds.superuser}</td></tr>
   <tr><td>Forgotten password token expires after (days)</td><td>${suds.forgottenPasswordExpire}</td></tr>
   <tr><td>Forgotten password email</td><td>
        from:  ${suds.forgottenPasswordOptions.from}<br />
          subject:  ${suds.forgottenPasswordOptions.subject}<br />
          text:  ${suds.forgottenPasswordOptions.text}<br />
          </td></tr>
   <tr><td>Remember login expires after (days)</td><td>${suds.rememberPasswordExpire}</td></tr>
   `;
    output += `
   <tr><td>Audit trail</td><td> `;
    if (suds.audit.include) {
        output += 'Included';
        if (suds.audit.trim) {
            output += `<br />Audit trail trimmed back to ${suds.audit.trim[0]}
       most recent entries, when the number of entries goes over ${suds.audit.trim[1]}`;
        }
    }
    else {
        output += 'Not included';
    }
    output += '</td></tr>';
    output += `
  <tr><td>Permission sets</td><td> `;
    for (const set of Object.keys(suds.permissionSets)) {
        output += `
        ${set} (<i>${suds.permissionSets[set]}</i>)<br /> `;
    }
    output += '</td></tr>';
    output += `
  <tr><td>The authorisation table (<i>${suds.authorisation.table}</i>)
   has the following columns
  </td><td>`;
    for (const set of Object.keys(suds.authorisation)) {
        if (set == 'table') {
            continue;
        }
        output += `
        ${humaniseFieldName(set)}  -> ${suds.authorisation[set]}<br /> `;
    }
    output += '</td></tr>';
    output += ` 
   </tbody>
   </table>

    <hr class="sudsreporthr">`;
    /* ****************************************
      *
      *  INPUT
      *
      **************************************** */
    output += `
  <br />  
  <a name="it"></a><h1>Input</h1>`;
    output += `
 <table class=".table-bordered" style=" margin-bottom: 10px;">
 <thead>
 <tr>
   <th >Item</th>
   <th >Value</th>
  </tr>
 </thead>
 <tbody>
  <tr><td>Default input field width (autocomplete only)</td><td>${suds.defaultInputFieldWidth}</td></tr>
 <tr><td>Input Forms default format</td><td>${suds.input.default}<br />class: ${suds.input.class}</td></tr>
 <tr><td> Input types handled as a standard input tag with no special handling</td><td>`;
    const inputFieldTypes = suds.inputFieldTypes;
    for (let i = 0; i < inputFieldTypes.length; i++) {
        output += `
        ${inputFieldTypes[i]},&nbsp;`;
    }
    output += `
    </td></tr>  </tbody>
    </table>
    <p>
      The following input types are handled by special helper programs
    </p>
    <table class=".table-bordered" style="margin-bottom: 30px; width: 900px;"  >
    <thead>
    <tr>
      <th >Type</th>
      <th >Friendly Name</th>
      <th>Description</th>
     </tr>
    </thead>
    <tbody>
 `;
    trace.log(suds.inputTypeHandlers);
    for (const fieldType of suds.inputTypeHandlers) {
        helperName = '';
        for (let i = 0; i < fieldType.length; i++) {
            if (fieldType.charAt(i) == fieldType.charAt(i).toUpperCase()) {
                helperName += '-';
            }
            helperName += fieldType.charAt(i).toLowerCase();
        }
        docs = await require(`./input/${helperName}`).documentation;
        output += `
         <tr><td>${fieldType}</td><td>${docs.friendlyName}</td><td>${docs.description}</td></tr> `;
    }
    output += `
    <tbody>
    </table>
     <hr class="sudsreporthr">`;
    /* ****************************************
    *
    *  scan tables
    *
    **************************************** */
    const parentChild = [];
    for (let i = 0; i < tables.length; i++) {
        table = tables[i];
        properties = attributesStore[table];
        addToList(properties);
        function addToList(properties) {
            for (const property of Object.keys(properties)) {
                if (properties[property].object) {
                    addToList(properties[property].object);
                }
                else {
                    if (properties[property].model) {
                        const parent = properties[property].model;
                        parentChild.push([parent, table, property, properties[property].friendlyName]);
                    }
                }
            }
        }
    }
    /* ****************************************
    *
    *  Database structure
    *
    **************************************** */
    trace.log(parentChild);
    output += '<a name="ds"></a><h1>Database</h1>';
    if (suds.dbDriverName) {
        output += `This database is runnung under <b>${suds.dbDriverName}</b>`;
    }
    output += `<table class=".table-bordered" style="width: 900px; margin-bottom: 10px;">
    <thead>
    <tr>
      <th style="width: 500px">Item</th>
      <th >Value</th>
     </tr>
    </thead>
    <tbody>`;
    trace.log(suds[suds.dbdriver, suds.dbDriver]);
    for (const key of Object.keys(suds[suds.dbDriver])) {
        if (key == 'connection') {
            for (const con of Object.keys(suds[suds.dbDriver][key])) {
                let value = suds[suds.dbDriver][key][con];
                if (con == 'password') {
                    value = '****************';
                }
                output += `   <tr><td>${con}</td><td>${value}</td></tr>`;
            }
        }
        else {
            if (key == 'driver' && suds.dbDriver == 'db.js') {
                output += '   <tr><td>driver</td><td>Generic driver (db.js)</td></tr>';
            }
            else {
                output += `   <tr><td>${key}</td><td>${suds[suds.dbDriver][key]}</td></tr>`;
            }
        }
    }
    output += `
    </tbody>
    </table>`;
    if (suds.qualifyColName) {
        output += '<p>SUDS will qualify column name with table when constructing queries (e.g. "where tablename.columnname=value")</p>';
    }
    let switching, shouldSwitch;
    switching = true;
    let row;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        /* Loop through all table rows */
        for (row = 0; row < parentChild.length - 1; row++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
            one from current row and one from the next: */
            // Check if the two rows should switch place:
            if (parentChild[row][0] > parentChild[row + 1][0]) {
                // If so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
            and mark that a switch has been done: */
            const temp = parentChild[row];
            parentChild[row] = parentChild[row + 1];
            parentChild[row + 1] = temp;
            switching = true;
        }
    }
    trace.log(parentChild);
    output += `
               <p>The following table lists the relationship between tables. Note that SUDS only
            provides functions for these relationships if the parent table includes 'collection'
            attributes.
    </p>
            <table class=".table-bordered" style="margin-bottom: 30px; width: 900px;"  >
              <thead>
                <tr>
                  <th >Parent</th>
                  <th >Child</th>
                  <th>Via</th>
                </tr>
              </thead>
              <tbody>
                `;
    let last = '';
    for (const row of parentChild) {
        if (row[0] == 'user' && row[2] == 'updatedBy') {
            continue;
        } // ignore spurious foreign key
        if (row[0] != last) {
            output += `
      <tr>
        <td>${row[0]}</td>`;
            last = row[0];
        }
        else {
            output += `
      <tr>
        <td></td>`;
        }
        output += `
        <td>${row[1]}</td>
                <td>${row[2]} (${row[3]})</td>
     </tr>`;
    }
    output += `
    <tbody>
    </table>
    `;
    /* ****************************************
    *
    *  List tables     *
    **************************************** */
    trace.log(tables);
    for (let t = 0; t < tables.length; t++) {
        table = tables[t];
        trace.log(table);
        const tabledata = tableDataStore[table];
        const sudsdata = {};
        /* ****************************************
        *
        *  Table overview
        *
        **************************************** */
        let friendlyName = table;
        if (sudsdata.friendlyName) {
            friendlyName = `${sudsdata.friendlyName} (${table})`;
        }
        output += `
        <hr class="sudsreporthr">
        <div class="sudsReportTable">     <!-- ------------------------- ${table} -------------------- -->   
          <a name="${table}"><h1>Table: ${friendlyName}</h1>`;
        if (tabledata.description && tabledata.description != table) {
            output += `
          <p>${tabledata.description}</p>`;
        }
        output += '\n          <p>';
        if (tabledata.extendedDescription) {
            output += `
          <p>${tabledata.extendedDescription}</p>
          `;
        }
        properties = attributesStore[table];
        trace.log(properties);
        if (tabledata.tableName && tabledata.tableName != table) {
            output += `The database table is ${tabledata.tableName}. <br /> `;
        }
        output += '<p>';
        if (tabledata.primaryKey) {
            output += `
           The primary key is  <i>${tabledata.primaryKey}</i>. <br /> `;
        }
        if (tabledata.addRow) {
            output += `
           The add row button is titled  "${tabledata.addRow}". <br /> `;
        }
        if (tabledata.recordTypeColumn) {
            output += `
           This table has record types identified by field  <i>${tabledata.recordTypeColumn}</i>.  See below. <br /> `;
        }
        trace.log(table);
        output += '</p>';
        if (tabledata.list && tabledata.list.columns) {
            output += '<p>A standard listing in tabular form has the following columns listed<br />';
            for (let i = 0; i < tabledata.list.columns.length; i++) {
                if (i > 0) {
                    output += ', ';
                }
                trace.log(i, tabledata.list.columns[i]);
                output += properties[tabledata.list.columns[i]].friendlyName;
            }
            output += '</p>';
        }
        const defaultDescription = ` For details see the 
    table definition file in the tables directory`;
        if (tabledata.edit.postProcess) {
            let description = defaultDescription;
            if (tabledata.edit.postProcessDescription) {
                description = tabledata.edit.postProcessDescription;
            }
            output += `
            <p>The configuration includes a function which is invoked 
            after the database has been updated. ${description}</p>`;
        }
        if (tabledata.edit.preProcess) {
            let description = defaultDescription;
            if (tabledata.edit.preProcessDescription) {
                description = tabledata.edit.preProcessDescription;
            }
            output += `
            <p>The configuration includes a function which is invoked 
            before the database has been updated. ${description}  </p>`;
        }
        if (tabledata.edit.preForm) {
            let description = defaultDescription;
            if (tabledata.edit.preFormDescription) {
                description = tabledata.edit.preFormDescription;
            }
            output += `
            <p>The configuration includes a function which is invoked 
            before input form has been generated. ${description} </p>`;
        }
        output += `
          </p>`;
        /* ****************************************
        *
        *  Permission sets
        *
        **************************************** */
        if (tabledata.permission) {
            const permissions = tabledata.permission;
            output += `
        <h3>Permission sets</h3>
        <table class=".table-bordered" style="margin-bottom: 30px" >
          <thead>
            <tr>
              <th width="20">Permission</th>
              <th width="400">Permission sets</th>
            </tr>
          </thead>
          <tbody>`;
            for (const ptype of Object.keys(permissions)) {
                const sets = permissions[ptype];
                output += `
            <tr>
              <td>${ptype}</td>
              <td>`;
                for (let i = 0; i < sets.length; i++) {
                    if (i > 0) {
                        output += ', ';
                    }
                    output += sets[i];
                }
                output += `</td>
            </tr>`;
            }
            output += `
          </tbody>
        </table>`;
        }
        /* ****************************************
          *
          *  List groups - if there are any
          *
          **************************************** */
        trace.log({ table, data: tabledata, maxdepth: 2 });
        if (tabledata.groups && Object.keys(tabledata.groups).length > 1) {
            output += `
        <h3 style="margin-top: 30px">Groups of columns</h3>
        <p>Columns are in these groups for editing and presentation</p>
        <table class=".table-bordered">
          <thead>
            <tr>
              <th style="width: 20%">Group</th>
              <th style="width: 40%">Treatment</th>
              <th style="width: 40%">Columns</th>
            </tr>
          </thead>
          <tbody>`;
            for (const group of Object.keys(tabledata.groups)) {
                groupData = tabledata.groups[group];
                let name = group;
                if (groupData.friendlyName) {
                    name = groupData.friendlyName;
                }
                output += `
            <tr>
              <td>
              ${name}
              </td>
              <td>`;
                let first = true;
                if (groupData.description) {
                    output += `<i>${groupData.description}</i> `;
                    first = false;
                }
                if (groupData.static) {
                    output += 'This is a static group. ';
                    first = false;
                }
                if (groupData.open && groupData.open != 'none') {
                    if (!first) {
                        output += '<br />';
                    }
                    ;
                    output += `Listing of ${groupData.open} child records is automatically opened.`;
                    first = false;
                }
                if (groupData.recordTypes) {
                    if (!first) {
                        output += '<br />';
                    }
                    ;
                    const types = groupData.recordTypes;
                    output += 'Only shown for record types: <i> ';
                    for (let i = 0; i < types.length; i++) {
                        if (i > 0) {
                            output += ', ';
                        }
                        output += types[i];
                    }
                    output += '</i>';
                }
                if (groupData.permission) {
                    if (!first) {
                        output += '<br />';
                    }
                    ;
                    first = false;
                    output += 'Permission sets: <i>';
                    for (const ptype of Object.keys(groupData.permission)) {
                        const sets = groupData.permission[ptype];
                        output += `
              ${ptype}: `;
                        for (let i = 0; i < sets.length; i++) {
                            if (i > 0) {
                                output += ', ';
                            }
                            output += sets[i];
                        }
                    }
                    output += '</i>';
                }
                output += `
          </td>
          <td>`;
                if (groupData.columns) {
                    const cols = groupData.columns;
                    for (let i = 0; i < cols.length; i++) {
                        if (i > 0) {
                            output += ', ';
                        }
                        output += cols[i];
                    }
                }
                output += `
          </td>
          </tr>`;
            }
            output += `
          </tbody>
        </table>`;
        }
        /* ****************************************
          *
          * Collections
          *
          **************************************** */
        let anycollections = false;
        let collections = `
        <h3 style="margin-top: 30px">Links to this table.</h3>
        <p>Where this table is parent in a parent/child relationship.</p>
        <table class=".table-bordered" >
          <thead>
            <tr>
              <th style="width: 20%">Name</th>
              <th style="width: 30%">Description</th>
              <th style="width: 50%">Characteristics</th>
            </tr>
          </thead>
          <tbody>`;
        trace.log({ table, attributes: properties, level: table }); // trick to only log for one table...
        for (const col of Object.keys(properties)) {
            if (!properties[col].collection) {
                continue;
            }
            anycollections = true;
            const fld = properties[col].friendlyName;
            collections += `
              <tr>
                <td >${fld}<br />(<i>${col}</i>}</td>
                <td >`;
            if (properties[col].description) {
                collections += properties[col].description;
            }
            collections += `</td>
                <td >`;
            const autocreate = false;
            let needBreak = false;
            for (const prop of Object.keys(properties[col])) {
                trace.log(col, prop, properties[col][prop]);
                if (properties[col].collection && prop == 'permission') {
                    continue;
                }
                if (prop == 'friendlyName') {
                    continue;
                }
                if (prop == 'canEdit') {
                    continue;
                }
                if (prop == 'canView') {
                    continue;
                }
                if (prop == 'description') {
                    continue;
                }
                const value = properties[col][prop];
                if (!value) {
                    continue;
                }
                if (needBreak) {
                    collections += '<br />';
                }
                needBreak = true;
                /** Big Switch - attribute characteristics */
                /** ************************************** */
                let line = '';
                switch (prop) {
                    /** */
                    case 'collectionList':
                        line = `
              Child list parameters: `;
                        for (const key of Object.keys(value)) {
                            if (key == 'columns') {
                                line += `<br />&nbsp;&nbsp;Columns listed:<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;[`;
                                const cols = value[key];
                                for (let i = 0; i < cols.length; i++) {
                                    if (i > 0) {
                                        line += ', ';
                                    }
                                    line += cols[i];
                                }
                                line += ']';
                            }
                            else {
                                if (key == 'derive') {
                                    line += '<br />&nbsp;&nbsp;Derived information: <i>';
                                    for (const der of Object.keys(value.derive)) {
                                        line += `<br />&nbsp;&nbsp;&nbsp;&nbsp;${value.derive[der].friendlyName}`;
                                    }
                                    line += '</i>';
                                }
                                else {
                                    line += `<br />&nbsp;&nbsp;${key}: ${value[key]}`;
                                }
                            }
                        }
                        collections += line;
                        break;
                    /** Extended description */
                    case 'via':
                        collections += `Foreign key in child table: <i>${value}</i>`;
                        break;
                    case 'collection':
                        collections += `Child table: <i>${value}</i>`;
                        break;
                    /** Extended description */
                    case 'extendedDescription':
                        collections += `Extended description: <br /><i>${value}</i>`;
                        break;
                }
            }
        }
        collections += `
              </td>`;
        collections += `
            </tbody>    
          </table>`;
        if (anycollections) {
            output += collections;
        }
        output += `
  <h3 style="margin-top: 30px">Columns</h3>
  <table class=".table-bordered" >
    <thead>
      <tr>
        <th style="width: 20%">Name</th>
        <th style="width: 30%">Description</th>
        <th style="width: 50%">Characteristics</th>
      </tr>
    </thead>
    <tbody>`;
        trace.log({ table, attributes: properties, level: table }); // trick to only log for one table...
        for (const col of Object.keys(properties)) {
            if (properties[col].collection) {
                continue;
            }
            const fld = properties[col].friendlyName;
            output += `
        <tr>
          <td >${fld}<br />(<i>${col}</i>}</td>
          <td >`;
            for (const prop of Object.keys(properties[col])) {
                if (prop == 'collection') {
                    continue;
                    output += '<b>Not a database column.</b> <br />It identifies a link from a child table<br />';
                }
            }
            if (properties[col].description) {
                output += properties[col].description;
            }
            output += `</td>
          <td >`;
            let autocreate = false;
            let needBreak = false;
            for (const prop of Object.keys(properties[col])) {
                trace.log(col, prop, properties[col][prop]);
                if (prop == 'collection') {
                    continue;
                }
                if (properties[col].collection && prop == 'input') {
                    continue;
                }
                if (properties[col].collection && prop == 'required') {
                    continue;
                }
                if (properties[col].collection && prop == 'permission') {
                    continue;
                }
                if (prop == 'via') {
                    continue;
                }
                if (prop == 'friendlyName') {
                    continue;
                }
                if (prop == 'canEdit') {
                    continue;
                }
                if (prop == 'canView') {
                    continue;
                }
                if (prop == 'description') {
                    continue;
                }
                if (prop == 'autoMigrations') {
                    continue;
                }
                if (prop == 'database' && !Object.keys(properties[col][prop]).length) {
                    continue;
                }
                if (prop == 'process' && !Object.keys(properties[col][prop]).length) {
                    continue;
                }
                const value = properties[col][prop];
                if (!value) {
                    continue;
                }
                if (needBreak) {
                    output += '<br />';
                }
                needBreak = true;
                /** Big Switch - attribute characteristics */
                /** ************************************** */
                const line = '';
                switch (prop) {
                    /** Permission */
                    case 'permission':
                        output += 'Permissions';
                        for (let i = 0; i < permissions.length; i++) { // try all the permissions
                            if (value[permissions[i]]) { // say permissions[i] == edit then this is ['none'] like this
                                output += `<br />&nbsp;&nbsp;${permissions[i]}: `;
                                for (let j = 0; j < value[permissions[i]].length; j++) {
                                    output += `${value[permissions[i]][j]}, `;
                                }
                            }
                        }
                        break;
                    /** Primary key */
                    case 'primaryKey':
                        if (properties[col][prop]) {
                            output += 'This is the primary key.';
                        }
                        break;
                    case 'array':
                        if (properties[col][prop]) {
                            output += 'This is an array .';
                        }
                        break;
                    case 'object':
                        output += `Object contains:
                <ul>`;
                        for (const subprop of Object.keys(properties[col][prop])) {
                            output += `<li>${subprop}</li>`;
                        }
                        output += '</ul>';
                        break;
                    /** Autoincrement */
                    case 'autoincrement':
                        if (properties[col][prop]) {
                            output += 'This is an autoincrement field.';
                            autocreate = true;
                        }
                        break;
                    /** Dataase field type */
                    case 'database':
                        output += `Database field (may be specific to ${suds.dbDriver}.)`;
                        trace.log(properties[col][prop]);
                        for (const subprop of Object.keys(properties[col][prop])) {
                            output += `<br />&nbsp;&nbsp;${subprop}: ${properties[col][prop][subprop]}: `;
                        }
                        break;
                    /** Process */
                    case 'process':
                        {
                            let line = 'Process';
                            for (const subprop of Object.keys(properties[col][prop])) {
                                let content = `${subprop}: ${properties[col][prop][subprop]}: `;
                                if (subprop == 'updatedBy') {
                                    content = 'Automatically populated with user who updated.';
                                }
                                if (subprop == 'updatedAt') {
                                    content = 'Automatically populated with date-time updated.';
                                }
                                if (subprop == 'createdAt') {
                                    content = 'Automatically populated with date-time created.';
                                }
                                line += `<br />&nbsp;&nbsp;${content} `;
                                autocreate = true;
                            }
                            output += line;
                        }
                        break;
                    /** helptext */
                    case 'helpText':
                        if (autocreate) {
                            needBreak = false;
                            continue;
                        }
                        break;
                    /** Type */
                    case 'type':
                        output += `Data type: ${value}`;
                        break;
                    /** Input  */
                    case 'input':
                        if (autocreate) {
                            needBreak = false;
                            continue;
                        }
                        {
                            let line = 'Input specification';
                            for (const key of Object.keys(value)) {
                                if (key == 'class' && value[key] == suds.input.class) {
                                    continue;
                                }
                                let thisline = `<br />&nbsp;&nbsp;${key}: ${value[key]}`;
                                if (key == 'search' && typeof value[key] === 'object') {
                                    let andor = 'and';
                                    if (value[key].andor && value[key].andor == 'or') {
                                        andor = 'or';
                                    }
                                    thisline = '<br />&nbsp;&nbsp;search:';
                                    for (let i = 0; i < value[key].searches.length; i++) {
                                        if (i > 0) {
                                            line += `<br />&nbsp;&nbsp;&nbsp;&nbsp;${andor}`;
                                        }
                                        const search = value[key].searches[i];
                                        thisline += `<br />&nbsp;&nbsp;&nbsp;&nbsp;${search[0]} ${search[1]} ${search[2]}`;
                                    }
                                }
                                if (key == 'validations') {
                                    if (Object.keys(value[key]).length == 0) {
                                        thisline = '';
                                        continue;
                                    }
                                    thisline = 'Validations: ';
                                    for (const subkey of Object.keys(value[key])) {
                                        let val = value[key][subkey];
                                        if (typeof (val) === 'object') {
                                            val = `See <i>${table}</i> config file`;
                                        }
                                        thisline += `<br />&nbsp;&nbsp;${subkey}: ${val}`;
                                    }
                                    let val = value[key];
                                    if (typeof (val) === 'object') {
                                        val = `See <i>${table}</i> config file`;
                                    }
                                    thisline = `<br />&nbsp;&nbsp;${key}: ${val}`;
                                }
                                line += thisline;
                            }
                            output += line;
                        }
                        break;
                    /** Output format */
                    case 'display':
                        {
                            let line = '';
                            let count = 0;
                            for (const key of Object.keys(value)) {
                                if (!value[key]) {
                                    needBreak = false;
                                    continue;
                                }
                                count++;
                                let name = key;
                                if (key == 'linkedTable') {
                                    name = 'Lookup in table';
                                }
                                line += `<br />&nbsp;&nbsp;${name}: ${value[key]}`;
                                if (key == 'titleField') {
                                    line += '&nbsp;&nbsp;(<i>Shown this field in the linked table</i>)';
                                }
                            }
                            if (count) {
                                line = `Output format: ${line}`;
                            }
                            output += line;
                        }
                        break;
                    /** Values */
                    case 'values':
                        output += `
        Values: `;
                        {
                            let line = '';
                            if (typeof (value) === 'string') {
                                line = `Set in item <i>${value}</i> in config file suds.js.`;
                            }
                            if (typeof (value) === 'object') {
                                line = `Set in table definition ${table}.js.`;
                            }
                            if (typeof (value) === 'function') {
                                line = `Set in a function in table definition <i>${table}.js</i>.`;
                            }
                            output += line;
                        }
                        break;
                    /** Extended description */
                    case 'extendedDescription':
                        output += `Extended description: <br /><i>${value}</i>`;
                        break;
                    /** required */
                    case 'required':
                        output += 'Required';
                        break;
                    /** Foreign key */
                    case 'model':
                        output += `Foreign key - links to table ${properties[col].model}`;
                        break;
                    /** Example */
                    case 'example':
                        output += `Example:  ${properties[col].example}`;
                        break;
                    /** Default */
                    default:
                        output += `${prop}: ${value}`;
                        break;
                }
            }
        }
        output += `
        </td>`;
        output += `
      </tbody>    
    </table>`;
        output += `
</div> <!-- End ${table} -->`;
    }
    output += `
    </div> <!-- sudsReport -->`;
    const result = sendView(res, 'report', output);
    return result;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlncmVwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9zdWRzL2NvbmZpZ3JlcG9ydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7OzJDQUkyQztBQUMzQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDekMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDN0MsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFDbkQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxDQUFBO0FBQ2hELHFDQUFxQztBQUNyQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDMUIsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBRXhCLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3JELE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2pELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUN2QyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBRXpELE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHO0lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFFckIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFB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