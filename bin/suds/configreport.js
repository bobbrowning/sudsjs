/* ****************************************
*
*  Documemnt the config file
*
**************************************** */
let trace = require('track-n-trace');
let suds = require('../../config/suds');
let sudshome = require('../../config/home');
let sudsReports = require('../../config/reports');
let lang = require('../../config/language')['EN'];
//let getRow = require('./get-row');
let db = require('./db');

let mergeAttributes = require('./merge-attributes');
let tableDataFunction = require('./table-data');
let sendView = require('./send-view');
let humaniseFieldName = require('./humanise-fieldname');



module.exports = async function (req, res) {
  console.log(__dirname);
  trace.init(req, './');


  trace.log({ starting: 'Config report', break: '#', });

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
  if (!suds.report.permission.includes(permission) && permission !== '#superuser#') {
    res.send('<h2>Sorry, you don\'t have permission to run this program</h2>');
    return;
  }

  const permissions = ['all', 'any', 'view', 'edit', 'delete'];
  let tableList = [];
  let tableDataStore = {};
  let attributesStore = {};
  let tables = suds.tables;
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
  let title = `Unnamed project`;
  let description = ``;
  if (suds.title) { title = suds.title }
  if (suds.description) { description = suds.description }
  let superwarning = '';
  output = `
      <div class="sudsReport">
      <div style="margin-bottom: 60px;">   <!--  header page -->
        <h1>SUDS Database Report</h1>
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
  if (suds.versionHistory) { hist = suds.versionHistory }
  for (let i = 0; i < hist.length; i++) {
    output += `
     <tr><td>${hist[i].version}</td><td>${hist[i].date}</td><td>${hist[i].author}</td><td>${hist[i].description}</td></tr>
      `;
  }
  output += `
    </tbody>
    </table>`;

  output += `
  <p>
    <a href="${suds.mainPage}">Admin page</a>
    </p>
    </div>            <!--  header page -->      
     <hr class="sudsreporthr">`;


  /* ****************************************
     *
     *  Other configuration data
     *
     **************************************** */
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
    <tr><td>Listening on port</td><td>${suds.port}</td></tr>
   <tr><td>Route to the main program</td><td>${suds.mainPage}</td></tr>
   <tr><td>Route to the configuration report program</td><td>${suds.report.page}</td></tr>
   <tr><td>Route to the configuration validate program</td><td>${suds.validate.page}</td></tr>
     <tr><td>Number of rows in paginated lists</td><td>${suds.pageLength}</td></tr>
     <tr><td>Currrency </td><td>${suds.currency.currency}<br />${suds.currency.locale}<br />${suds.currency.digits} digits</td></tr>
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
    if (i > 0) { output += ', ' }
    output += suds.search.allwaysEquals[i];
  }
  output += `
  ]</td></tr> 
   <tr><td>The search operation normally presents field options in the same format as the input field. 
    So for example if the input is radio buttons than the search is also radio buttons.
    However for the following input types the search field is a simple text input field:</td><td>[`;
  for (let i = 0; i < suds.search.allwaysText.length; i++) {
    if (i > 0) { output += ', ' }
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
   
   output+=`
   <tr><td>Audit trail</td><td> `
   if (suds.audit.include) {
    output += `Included`;
    if (suds.audit.trim) {
      output += `<br />Audit trail trimmed back to ${suds.audit.trim[0]}
       most recent entries, when the number of entries goes over ${suds.audit.trim[1]}`;
    }
  }
  else {
    output+=`Not included`;
  }
  output+=`</td></tr>`


  output += `
  <tr><td>Permission sets</td><td> `;
  for (let set of Object.keys(suds.permissionSets)) {
    output += `
        ${set} (<i>${suds.permissionSets[set]}</i>)<br /> `;
  }
  output+=`</td></tr>`;

  output += `
  <tr><td>The authorisation table (<i>${suds.authorisation['table']}</i>)
   has the following columns
  </td><td>`;
  for (let set of Object.keys(suds.authorisation)) {
    if (set == 'table') {continue}
    output += `
        ${humaniseFieldName(set)}  -> ${suds.authorisation[set]}<br /> `;
  }
  output+=`</td></tr>`;


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
 
  let inputFieldTypes = suds.inputFieldTypes;
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
  for (let fieldType of suds.inputTypeHandlers) {
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

  let parentChild = [];
  for (let i = 0; i < tables.length; i++) {
    table = tables[i];
    properties = attributesStore[table];
    for (let property of Object.keys(properties)) {
      if (properties[property].model) {
        let parent = properties[property].model;
        parentChild.push([parent, table, property, properties[property].friendlyName]);
      }
    }






  }

  /* ****************************************
  *
  *  Database structure
  *
  **************************************** */
  trace.log(parentChild);


  output += `<a name="ds"></a><h1>Database</h1>`;
  output += `<table class=".table-bordered" style="width: 900px; margin-bottom: 10px;">
    <thead>
    <tr>
      <th style="width: 500px">Item</th>
      <th >Value</th>
     </tr>
    </thead>
    <tbody>`;
  for (let key of Object.keys(suds.database)) {
    if (key == 'connection') {
      for (let con of Object.keys(suds.database[key])) {
        let value = suds.database[key][con];
        if (con == 'password') { value = '****************' }
        output += `   <tr><td>${con}</td><td>${value}</td></tr>`;
      }
    }
    else {
      output += `   <tr><td>${key}</td><td>${suds.database[key]}</td></tr>`;

    }
  }
  output += `
    </tbody>
    </table>`;
    if (suds.qualifyColName) {
      output+=`<p>SUDS will qualify column name with table when constructing queries (e.g. "where tablename.columnname=value")</p>`;
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
      let temp = parentChild[row];
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
  for (let row of parentChild) {
    if (row[0] == 'user' && row[2] == 'updatedBy') { continue } // ignore spurious foreign key
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
    let tabledata = tableDataStore[table];
    let sudsdata = {};
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
    if (tabledata.primaryKey) {
      output += `
           <p>The primary key is  ${tabledata.primaryKey}. </p> `;
    }
    trace.log(tabledata, { level: table });

    let defaultDescription = ` For details see the 
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
          </p>`

    /* ****************************************
    *
    *  Permission sets
    *
    **************************************** */

    if (sudsdata.permission) {
      let permissions = sudsdata.permission;
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
      for (let ptype of Object.keys(permissions)) {
        let sets = permissions[ptype];
        output += `
            <tr>
              <td>${ptype}</td>
              <td>`;
        for (let i = 0; i < sets.length; i++) {
          if (i > 0) { output += ', ' }
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
    trace.log({ table: table, data: tabledata, maxdepth: 2 });
    if (tabledata.groups && Object.keys(tabledata.groups).length > 1) {
      output += `
        <h3 style="margin-top: 30px">Data Item Groups</h3>
        <table class=".table-bordered">
          <thead>
            <tr>
              <th style="width: 20%">Group</th>
              <th style="width: 40%">Treatment</th>
              <th style="width: 40%">Columns</th>
            </tr>
          </thead>
          <tbody>`;
      for (let group of Object.keys(tabledata.groups)) {
        groupData = tabledata.groups[group];
        let name = group;
        if (groupData.friendlyName) { name = groupData.friendlyName }
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
          output += `This is a static group. `;
          first = false;
        }
        if (groupData.open && groupData.open != 'none') {
          if (!first) { output += '<br />' };
          output += `Listing of ${groupData.open} child records is automatically opened.`;
          first = false;
        }
        if (groupData.recordTypes) {
          if (!first) { output += '<br />' };
          let types = groupData.recordTypes;
          output += `Only shown for record types: <i> `;
          for (let i = 0; i < types.length; i++) {
            if (i > 0) { output += ', ' }
            output += types[i];
          }
          output += '</i>';
        }

        if (groupData.permission) {
          if (!first) { output += '<br />' };
          first = false;
          output += `Permission sets: <i>`;
          for (let ptype of Object.keys(groupData.permission)) {
            let sets = groupData.permission[ptype];
            output += `
              ${ptype}: `;
            for (let i = 0; i < sets.length; i++) {
              if (i > 0) { output += ', ' }
              output += sets[i];
            }
          }
          output += '</i>';
        }
        output += `
          </td>
          <td>`;
        if (groupData.columns) {
          let cols = groupData.columns;
          for (let i = 0; i < cols.length; i++) {
            if (i > 0) { output += ', ' }
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
      *  List attributes
      *
      **************************************** */
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

    trace.log({ table: table, attributes: properties, level: table })   // trick to only log for one table... 
    for (let col of Object.keys(properties)) {
      let fld = properties[col].friendlyName;
      output += `
              <tr>
                <td >${fld}<br />(<i>${col}</i>}</td>
                <td >`;
      for (let prop of Object.keys(properties[col])) {
        if (prop == 'collection') {
          output += `<b>Not a database column.</b> <br />It identifies a link from a child table<br />`;
        }
      }
      if (properties[col].description) {
        output += properties[col].description;
      }
      output += `</td>
                <td >`;
      let autocreate = false;
      let needBreak = false;
      for (let prop of Object.keys(properties[col])) {
        trace.log(col, prop, properties[col][prop]);
        if (prop == 'collection') { continue }
        if (properties[col].collection && prop == 'input') { continue }
        if (properties[col].collection && prop == 'required') { continue }
        if (properties[col].collection && prop == 'permission') { continue }
        if (prop == 'via') { continue }
        if (prop == 'friendlyName') { continue }
        if (prop == 'canEdit') { continue }
        if (prop == 'canView') { continue }
        if (prop == 'description') { continue }
        if (prop == 'autoMigrations') { continue }
        if (prop == 'database' && !Object.keys(properties[col][prop]).length) { continue; }
        if (prop == 'process' && !Object.keys(properties[col][prop]).length) { continue; }

        let value = properties[col][prop];
        if (!value) { continue }

        if (needBreak) {
          output += '<br />';
        }
        needBreak = true;;


        /** Big Switch - attribute characteristics */
        /** ************************************** */

        let line = ''
        switch (prop) {

          /** Permission */
          case 'permission':
            output += `Permissions`;
            for (let i = 0; i < permissions.length; i++) {  // try all the permissions
              if (value[permissions[i]]) {    // say permissions[i] == edit then this is ['none'] like this 
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
              output += "This is the primary key."
            }
            break;

          /** Autoincrement */
          case 'autoincrement':
            if (properties[col][prop]) {
              output += "This is an autoincrement field."
              autocreate = true;
            }
            break;

          /** Dataase field type */
          case 'database':
            output += `Database field (may be specific to ${suds.database.client}.)`;
            trace.log(properties[col][prop]);
            for (let subprop of Object.keys(properties[col][prop])) {
              output += `<br />&nbsp;&nbsp;${subprop}: ${properties[col][prop][subprop]}: `;
            }
            break;

          /** Process */
          case 'process':
            {
              let line = `Process`;
              for (let subprop of Object.keys(properties[col][prop])) {
                let content = `${subprop}: ${properties[col][prop][subprop]}: `;
                if (subprop == 'updatedBy') { content = `Automatically populated with user who updated.` }
                if (subprop == 'updatedAt') { content = `Automatically populated with date-time updated.` }
                if (subprop == 'createdAt') { content = `Automatically populated with date-time created.` }
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
              continue
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
              continue
            }
            {
              let line = `Input specification`;
              for (let key of Object.keys(value)) {
                if (key == 'class' && value[key] == suds.input.class) { continue }
                let thisline = `<br />&nbsp;&nbsp;${key}: ${value[key]}`;
                if (key == 'search' && typeof value[key] == 'object') {
                  let andor = 'and';
                  if (value[key].andor && value[key].andor == 'or') { andor = 'or' }
                  thisline = `<br />&nbsp;&nbsp;search:`;
                  for (let i = 0; i < value[key].searches.length; i++) {
                    if (i > 0) { line += `<br />&nbsp;&nbsp;&nbsp;&nbsp;${andor}` }
                    let search = value[key].searches[i];
                    thisline += `<br />&nbsp;&nbsp;&nbsp;&nbsp;${search[0]} ${search[1]} ${search[2]}`;
                  }
                }
                if (key == 'validations') {
                  if (Object.keys(value[key]).length == 0) {
                    thisline = '';
                    continue
                  }
                  thisline = `Validations: `;
                  for (let subkey of Object.keys(value[key])) {
                    let val = value[key][subkey];
                    if (typeof (val) == 'object') { val = `See <i>${table}</i> config file` }
                    thisline += `<br />&nbsp;&nbsp;${subkey}: ${val}`;
                  }

                  let val = value[key];
                  if (typeof (val) == 'object') { val = `See <i>${table}</i> config file` }
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
              for (let key of Object.keys(value)) {
                if (!value[key]) {
                  needBreak = false
                  continue;
                }
                count++
                let name = key;
                if (key == 'linkedTable') { name = 'Lookup in table' }
                line += `<br />&nbsp;&nbsp;${name}: ${value[key]}`;
                if (key == 'titleField') { line += `&nbsp;&nbsp;(<i>Shown this field in the linked table</i>)`; }
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
              let line = ''
              if (typeof (value) == 'string') { line = `Set in item <i>${value}</i> in config file suds.js.`; }
              if (typeof (value) == 'object') { line = `Set in table definition ${table}.js.`; }
              if (typeof (value) == 'function') { line = `Set in a function in table definition <i>${table}.js</i>.`; }
              output += line;
            }

            break;

          /** */
          case 'collectionList':
            line = `
              Child list parameters: `;
            for (let key of Object.keys(value)) {
              if (key == 'columns') {
                line += `<br />&nbsp;&nbsp;Columns listed:<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;[`;
                let cols = value[key];
                for (let i = 0; i < cols.length; i++) {
                  if (i > 0) { line += ', ' }
                  line += cols[i];
                }
                line += ']';
              }
              else {
                line += `<br />&nbsp;&nbsp;${key}: ${value[key]}`;
              }
            }
            output += line;
            break;

          /** Extended description */
          case 'extendedDescription':
            output += `Extended description: <br /><i>${value}</i>`;
            break;

          /** required */
          case 'required':
            output += `Required`;
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

  let result = sendView(res, 'report', output);
  return result;

}
