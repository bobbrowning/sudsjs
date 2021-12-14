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
          <a href="#ds">Database structure</a><br />
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
   <tr><td>Route to the login</td><td>${suds.login.page}</td></tr>
    <tr><td>Route to logout</td><td>${suds.logout.page}</td></tr>
    <tr><td>Route to the change password program</td><td>${suds.changepw.page}</td></tr>
    <tr><td>Route to the register program</td><td>${suds.register.page}</td></tr>
    <tr><td>Number of rows in paginated lists</td><td>${suds.pageLength}</td></tr>
    <tr><td>Superuser by default</td><td>${suds.superuser}</td></tr>
    <tr><td>Default input field width (autocomplete only)</td><td>${suds.defaultInputFieldWidth}</td></tr>
    <tr><td>Input Forms default format</td><td>${suds.input.default}<br />class: ${suds.input.class}</td></tr>
    <tr><td>Currrency </td><td>${suds.currency.currency}<br />${suds.currency.locale}<br />${suds.currency.digits} digits</td></tr>
    <tr><td>Qualify column name with table <br />(e.g. "where tablename.columnname=value")</td><td>${suds.fixWhere}</td></tr>
     </tbody>
    </table>`;

  if (suds.audit.include) {
    output += `
        <h3>Audit trail Included</h3><p>`;
    if (suds.audit.trim) {
      output += `<br />Audit trail trimmed back to ${suds.audit.trim[0]}
       most recent entries, when the number of entries goes over ${suds.audit.trim[1]}`;
    }
    output += `
     </p>`;


  }

  output += `<h3>Database</h3>
    <table class=".table-bordered" style="width: 900px; margin-bottom: 10px;">
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





  /* ****************************************
     *
     *  Search parameters
     *
     **************************************** */
  output += `
    <a name="sp"></a><h2>Searches</h2>
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
    </p>`;





  /* ****************************************
    *
    *  Permission sets
    *
    **************************************** */
  output += `
   <a name="ps"></a><h1>Permission sets</h1>
    <p>`;
  for (let set of Object.keys(suds.permissionSets)) {
    output += `
        ${set} (<i>${suds.permissionSets[set]}</i>)<br /> `;
  }
  output += `
    </p>
    <hr class="sudsreporthr">`;


  /* ****************************************
    *
    *  Available input types
    *
    **************************************** */
  output += `
  <br />  
  <a name="it"></a><h3>Input types</h3>
      <p>
        The following input types are handled as a standard input tag with no special handling. 
      </p>
      <p>[
    `;
  let inputFieldTypes = suds.inputFieldTypes;
  for (let i = 0; i < inputFieldTypes.length; i++) {
    output += `
        ${inputFieldTypes[i]},&nbsp;`;
  }
  output += `
    ]</p>
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
  for (let js of suds.inputTypeHandlers) {
    docs = await require(`./input/${js}`).documentation;
    output += `
         <tr><td>${js}</td><td>${docs.friendlyName}</td><td>${docs.description}</td></tr> `;
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
    <a name="ds"></a><h1>Database structure</h1>
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
          <a name="${table}"><h2>Table: ${friendlyName}</h2>`;
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
        if (groupData.static) {
          output += `This is a static group. `;
          first = false;
        }
        if (groupData.open && groupData.open != 'none') {
          if (!first) { output += '<br />' };
          output += `Listing of ${groupData.open} child records is automatically opened.`;
          first = false;
        }
        if (groupData.permission) {
          if (!first) { output += '<br />' };
          first = false;
          output += `Default permissions for columns in group: <br /><i>`;
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
        let line = `${prop}: ${value}`;
        if (prop == 'permission') { // like this { edit: ['none'], view: ['all'] }, 
          line = `Permissions`;
          for (let i = 0; i < permissions.length; i++) {  // try all the permissions
            if (value[permissions[i]]) {    // say permissions[i] == edit then this is ['none'] like this 
              line += `<br />&nbsp;&nbsp;${permissions[i]}: `;
              for (let j = 0; j < value[permissions[i]].length; j++) {
                line += `${value[permissions[i]][j]}, `;
              }
            }
          }
        }
        if (prop == 'primaryKey' && properties[col][prop]) {
          line = "This is then primary key."
        }
        if (prop == 'autoincrement' && properties[col][prop]) {
          line = "This is an autoincrement field."
        }
        if (prop == 'database') {
          line = `Database field (may be specific to ${suds.database.client}.)`;
          trace.log(properties[col][prop]);
          for (let subprop of Object.keys(properties[col][prop])) {
            line += `<br />&nbsp;&nbsp;${subprop}: ${properties[col][prop][subprop]}: `;
          }
        }
        if (prop == 'process') {
          line = `Process`;
          for (let subprop of Object.keys(properties[col][prop])) {
            let content = `${subprop}: ${properties[col][prop][subprop]}: `;
            if (subprop == 'updatedBy') { content = `This field will be automatically populated.` }
            if (subprop == 'updatedAt') { content = `This field will be automatically populated.` }
            if (subprop == 'createdAt') { content = `This field will be automatically populated.` }
            line += `<br />&nbsp;&nbsp;${content} `;
          }
        }

        if (prop == 'type') {
          line = `Data type: ${value}`;
        }

        if (prop == 'input') {
          line = `Input specification`;
          for (let key of Object.keys(value)) {
            if (key == 'class' && value[key] == suds.input.class) { continue }
            if (key == 'search' && typeof value[key] == 'object') {
              let andor = 'and';
              if (value[key].andor && value[key].andor == 'or') { andor = 'or' }
              line += `<br />&nbsp;&nbsp;search:`;
              for (let i = 0; i < value[key].searches.length; i++) {
                if (i > 0) { line += `<br />&nbsp;&nbsp;&nbsp;&nbsp;${andor}` }
                let search = value[key].searches[i];
                line += `<br />&nbsp;&nbsp;&nbsp;&nbsp;${search[0]} ${search[1]} ${search[2]}`;
              }
            }
            else {
              if (key == 'values') {
                line += `<br />&nbsp;&nbsp;Values:`;
                let values = value[key];
                for (let type of Object.keys(values)) {
                  line += `<br />&nbsp;&nbsp;&nbsp;&nbsp;${type}: ${values[type]}`;
                }
              }
              else {
                line += `<br />&nbsp;&nbsp;${key}: ${value[key]}`;
              }
            }
          }
        }

        if (prop == 'display') {
          if (Object.keys(value).length == 0) { continue }
          else {
            line = `Output format: `;
            for (let key of Object.keys(value)) {
              let name = key;
              if (key == 'linkedTable') { name = 'Lookup in table' }
              line += `<br />&nbsp;&nbsp;${name}: ${value[key]}`;
              if (key == 'titleField') { line += `&nbsp;&nbsp;(<i>Shown this field in the linked table</i>)`; }
            }
          }
        }

        if (prop == 'collectionList') {
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
        }

        if (prop == 'validations') {
          if (Object.keys(value).length == 0) { continue }
          else {
            line = `Validations: `;
            for (let key of Object.keys(value)) {
              line += `<br />&nbsp;&nbsp;${key}: ${value[key]}`;
            }
          }
        }

        if (prop == 'extendedDescription') { line = `Extended description: <br /><i>${value}</i>` }

        if (prop == 'required') { line = `Required` }
        if (prop == 'model') { line = `Links to table ${properties[col].model}` }
        if (prop == 'example') { line = `Example:  ${properties[col].example}` }
        output += line + '<br>\n';
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

  let result = sendView(res, 'admin', output);
  return result;

}