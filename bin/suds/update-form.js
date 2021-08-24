
let suds = require('../../config/suds');
let trace = require('track-n-trace');
let mergeAttributes = require('./merge-attributes');
let tableDataFunction = require('./table-data');
let classes = require('../../config/classes');
let lang = require('../../config/language')['EN'];
let db=require('./db');
//let getRow = require('./get-row');
//let updateRow = require('./update-row');
//let createRow = require('./create-row');
let listRow = require('./list-row');
let createField = require('./create-field');
let displayField = require('./display-field');


/* Identification division  (for COBOL people)
 * Update form
 *  http://mint/nodejs/admin/update/?table=notes&id=2
 * 
 *  Creates update form  from the model and processes submitted form 
 * 
 * @description :: generic update form.
 * 
 */

/* Environment division 
 * 
 *     Tested on 
 *        Mint v 20  Cinnamon
 *        Node.js  v 12.18
 */



module.exports = async function (permission, table, id, mode, record, loggedInUser,open,openGroup) {

  // Data Division 
  /*
    friendlyName: 'Update form',
    description: 'Create form based on the model, and update the database from submit.',
    inputs: {
      permission: {
        type: 'string',
        description: 'The permission set of the logged-in user',
      },
      table: {
        type: 'string',
        description: 'The table being listed',
      },
      id: {
        type: 'number',
        description: 'The key of the row being listed',
      },
      mode: {
        type: 'string',
        description: 'Typ[e of operation (new, populate, update',
      },
      record: {
        type: 'ref',
        description: 'All of the input parameters. For mode new or populate will be missing',
      },
      loggedInUser: { type: 'string' }
    },
  
    */


  trace.log({ start: 'Update', inputs: arguments, break: '#', level: 'min' });


  /* ************************************************
  *
  *   set up the data
  *
  ************************************************ */
  let mainPage = suds.mainPage;
  if (!mainPage) { mainPage = '/'; }
  let tableData = tableDataFunction(table, permission);
  let tableName = tableData.friendlyName;
  const attributes = await mergeAttributes(table, permission);  // attributes and extraattributes merged
  if (id && typeof id == 'string') { id = Number(id); }
  trace.log({
    text: 'Control information',
    table: table,
    mode: mode,
    id: id,
  });

  /* *******************************************************
  * 
  *  set defaults
  * 
  ****************************************************** */
  if (mode == 'new') {
    for (let key of Object.keys(attributes)) {
      if (attributes[key].collection) { continue; }  // not intersted in collections
      let value;
      if (!record[key]) {                           // might be pre-set
        value = attributes[key].input.default;
      }
      trace.log({ mode: mode, key: key, value: value, level: 'verbose' });
      if (value && typeof value == 'string') { trace.log(value.substring(6, 7)); }
      if (value) {
        if (value == '#loggedInUser') {
          record[key] = loggedInUser;
        }
        else {
          if (value && typeof value == 'string' && value.substring(0, 6) == '#today') {
            let date = new Date;
            let sign = value.substring(6, 7);
            if (sign) {
              let delta = Number(value.substring(7));
              trace.log(delta);
              if (delta != 'NaN') {
                if (sign == '-') { date.setDate(date.getDate() - delta); }
                if (sign == '+') { date.setDate(date.getDate() + delta); }
              }
            }
            if (attributes[key].type == 'string') {
              let iso = date.toISOString();
              record[key] = iso.split('T')[0];
            }
            else {
              record[key] = date.getTime();
            }
          }
          else {
            record[key] = value;
          }
        }
      }
    }
  }
  trace.log(record);
  /* *******************************************************
   * 
   *  Populate data to update record or display
   * 
   ****************************************************** */


  if (mode == 'populate') {                           // if this is not from a submitted form and not new
    record = await db.getRow(table, id);     // populate record from database
    if (record.err) {
      console.log(`Can\'t find record ${id} on ${table}`, err);
      return exits.success(`<h1>Unexpected error ${record.errmsg}</h1><p>More info on console</p>`);
    }

    /*
    //  If the database structure has been changed and a new column added
    // this might be null  which is a bad idea.
    // so check 
    for (let key of Object.keys(attributes)) {
      if (record[key] == null) {
        if (attributes[key].type == 'number') { record[key] = 0 } else { record[key] = '' }
      }
    }
    */
  }

  let errors = {};
  let errCount = 0;
  trace.log(record);


  /* *******************************************************
   * 
   *  process data  from input
   * 
   ****************************************************** */
  if (mode == 'update') {     // if we are coming from submitted form 
    for (let key of Object.keys(attributes)) {
      if (!attributes[key].canEdit) { continue; }  // can't process if not editable
      if (attributes[key].collection) { continue; }  // not intersted in collections
      if (key == 'createdAt' || key == 'updatedAt') { continue; }  // can't process auto updated fields

      /* Bug in Summernote - intermittently doubles up the input!   */
      /* You might look for an alternative for serious production  */
      if (attributes[key].input.type == 'summernote' && Array.isArray(record[key])) {
        console.log(`warning - summernote has produced two copies of input field ${key}.  The first copy is being used. `);
        record[key] = record[key[0]]
      }
      if (key == 'updatedBy') { record[key] = loggedInUser; }
      if (attributes[key].input.type == 'file') {
        // doesn't work
        trace.log();
        let result = await upload(inputs.req, inputs.res, key);
        trace.log(result);

      }
      if (attributes[key].type == 'boolean') {
        if (record[key]) { record[key] = true; } else { record[key] = false; }
      }
      if (attributes[key].input.type == 'date'
        && attributes[key].type == 'number'
      ) {
        let value = record[key];
        trace.log(value);
        value = Number(value);
        trace.log(value);
        if (isNaN(value)) {
          trace.log(value);
          record[key] = new Date(record[key]).getTime();
          trace.log(record[key]);
        }
      }
      if (attributes[key].type == 'number')      // Note mergeattributes makes type:number for link fields
      {
        if (record[key]) {
          record[key] = Number(record[key]);
        }
        else {
          record[key] = null;
        }
      }
      if (Array.isArray(record[key]) && attributes[key].type == 'string') {
        let value = '';
        for (let i = 0; i < record[key].length; i++) {
          value += record[key][i] + ',';
        }
        record[key] = value;
      }

      /*
              if (
                attributes[key].type == 'number'
                || (attributes[key].input
                  && (
                    attributes[key].input.isNumber || attributes[key].input.isInteger
                  )
                )
              ) {
                if (!attributes.required && !record[key]) { record[key] = 0 }  // Has to be a number of some sort
              }
      */


      if (attributes[key].input && attributes[key].input.server_side) {
        let err = attributes[key].input.server_side(record);
        if (err) {
          errors[key] = `<span class="${classes.error}">${err}</span>`;
          errCount++;
        }

      }

    }

  }


  delete record.mode;                                     // but remove item we don't want


  trace.log({
    table: table,
    id: id,
    mode: mode,
    record: record,
    errors: errors,
    errCount: errCount,
  });


  /* *******************************************************
   * 
   *  Update database
   * 
   *  Update file if the controller is called with mode = 'update';
   *  if we have an id it means that record is on the database 
   *  and should be updated
   * 
   ****************************************************** */
  let operation = '';

  if (mode == 'update' && errCount == 0) {
    trace.log('update processing', mode);
    if (tableData.edit.preProcess) { record = await tableData.edit.preProcess(record) }
    var message = '';
    let operation;
    let rec = {};
    /* If the record is on the database       */
    if (id) {
      operation = 'update';
      trace.log({ Updating: id, table: table });
      await db.updateRow(table, record);                                         // ref record from database
      message = lang.rowUpdated + tableName;

      /*      No id so we need to add record   */
    } else {
      operation = 'addNew';
      for (let key of Object.keys(attributes)) {
        if (attributes[key].primaryKey) { continue }
        if (record[key]) {
          rec[key] = record[key];
        }
        else {
          rec[key] = null;
          if (attributes[key].type == 'string') { rec[key] = ''; }
          if (attributes[key].type == 'number') { rec[key] = 0; }
          if (attributes[key].type == 'boolean') { rec[key] = false; }
          if (attributes[key].process.createdAt) { rec[key] = Date.now() }
          if (attributes[key].process.updatedAt) { rec[key] = Date.now() }
          if (attributes[key].process.updatedBy) { rec[key] = loggedInUser }
        }
      }
      trace.log('New record', table, rec);
      try {
        let created = await db.createRow(table, rec);
        record[tableData.primaryKey] = id = created[tableData.primaryKey];
      }
      catch (err) {
        console.log('Database error creating recod on' + table, err);
        return exits.success('<h1>Unexpected error 3/h1>');
      }
      message = `${lang.rowAdded} ${id}`;
    }

    /* Post process processing and switch to list the record */
    trace.log('postprocess', record, operation);
    if (tableData.edit.postProcess) { await tableData.edit.postProcess(record, operation) }
    trace.log('switching to list record');
    let output = listRow(
      permission,
      table,
      id,
      open,
      openGroup,
    );
    return (output);

  }

  if (tableData.edit.preForm) { await tableData.edit.preForm(record, mode) }


  trace.log({
    mode: mode,
    columns: Object.keys(attributes),
    record: record,
  });
  /* *******************************************************
    * 
    *  Create the form, in a local variable and spurt it
    * out at the end....
    * 
    * First make a list of fields that will be in the form
    * 
    ****************************************************** */


  let form = '';

  let formList = [];
  for (const key of Object.keys(attributes)) {
    if (attributes[key].primaryKey
      || attributes[key].process.createdAt
      || attributes[key].process.updatedAt
      || attributes[key].process.updatedBy
    ) { continue; }
    if (attributes[key].collection) { continue; }  // not intersted in collections
    if (!attributes[key].canEdit) { continue; }
    if (attributes[key].input.hidden) { continue; }
    formList.push(key);
  }


  /* *******************************************************
      * 
      * Create form group
      * If the input form is split into groups make sure the 
      * 'other' group has everything that isn't in a stated group
      * If not, create a single static group called 'other' 
      * which contains all of the fields.
      * 
      * While we are about it we create the function to make the 
      * submenu work that allows users to select the group they
      * want to see.
      * 
      ****************************************************** */


  let openTab = '';
  let columnGroup = {};
  let visibleGroup = {};

  if (tableData.groups) {
    let incl = [];
    let tabs = [];
    trace.log({ formgroups: tableData.groups });
    for (let group of Object.keys(tableData.groups)) {
      trace.log({ group: group })
      if (!tableData.groups[group].static) { tabs.push(group) }      // Not static so we will need a tab function
      if (!tableData.groups[group].columns) {
        tableData.groups[group].columns = [];
      }
      if (tableData.groups[group].columns) {
        incl = incl.concat(tableData.groups[group].columns)
      }
    }
    if (!tableData.groups.other) { tableData.groups.other = {} }
    let all = formList;
    // need to remove the items in 'all' that are also in 'incl' and stor result in 
    //     tableData.groups.other.columns 
    //     tableData.groups.other.columns = all.filter(item => !incl.includes(item));
    if (!tableData.groups.other) { tableData.groups.other = {} }
    if (!tableData.groups.other.columns) { tableData.groups.other.columns = [] }
    for (let key of all) {
      if (!incl.includes(key)) {
        tableData.groups.other.columns.push(key);
      }
    }
    trace.log({ tabs: tabs, groups: tableData.groups })


    let first = true;
    for (let group of Object.keys(tableData.groups)) {
      trace.log(group);
      if (first && !tableData.groups[group].static) {
        openTab = group
        first = false;
      };
      for (let col of tableData.groups[group].columns) {
        if (!tableData.groups[group].static) {
          columnGroup[col] = group;
        }
        if (errors[col] && !tableData.groups[group].static) { openTab = group }
      }
    }
    trace.log({ columnGroup: columnGroup, openTab: openTab });
    for (let key of formList) {
      if (!attributes[key].input.hidden) {
        visibleGroup[columnGroup[key]] = true;
      }
    }

    trace.log(visibleGroup);



    if (tabs) {
      form += `
      <script>
      function tabclick (tab) { 
        console.log('tabclick:',tab); `;
      for (let tab of tabs) {
        if (!visibleGroup[tab]) { continue; }
        form += `
        if (tab == '${tab}') {
          console.log('opening: ${tab}');    
          document.getElementById('group_${tab}').style.display="block";
          document.getElementById('tab_${tab}').style.fontWeight="bold"
        }
        else {
          console.log('closing: ${tab}');    
          document.getElementById('group_${tab}').style.display="none";
          document.getElementById('tab_${tab}').style.fontWeight="normal"
        }`;
      }
      form += ` 
      }          
      </script>`;
    }

  }
  else {
    tableData.groups = { other: { static: true, } };
    tableData.groups.other.columns = formList;

  }
  let groups = tableData.groups;
  trace.log({ groups: groups });



  /* *******************************************************
   * 
   *  loop hrough fields in table storing field title and html.
   * 
   ****************************************************** */

  let fieldNo = 0;  //  create array of clear names and form elements
  let formData = {};
  for (const key of formList) {
    trace.log({
      key: key,
      type: attributes[key].type,
      data: record[key],
      typeof: typeof record[key],
      permission: attributes[key].permission,
    });
    let linkedTable = null;
    let fieldValue = '';
    formField = '';

    if (typeof record[key] != 'undefined') { fieldValue = record[key] };

    trace.log('field Value', fieldValue, typeof fieldValue);


    // don't need this with new version because attributes are passed...
    if (typeof attributes[key].model == 'string') { linkedTable = attributes[key].model; }





    /* *******************************************************
    * 
    *  Create form elements
    * 
    ****************************************************** */
    trace.log({
      element: key,
      type: attributes[key].input.type,
      clearname: attributes[key].friendlyName,
      LinkedTable: linkedTable,
      value: fieldValue,
      titlefield: attributes[key].titlefield,
      group: columnGroup[key],
    });
    let errorMsg = '';
    if (errors[key]) {
      errorMsg += ` ${errors[key]}`;
    }
    if (fieldValue == null) {              // can;'t pass null as a value
      if (attributes[key].type == 'number') {
        fieldValue = 0;
      }
      else {
        fieldValue = '';
      }
    }
    if (attributes[key].input.type== 'hidden') {
      formField = `
        <input type="hidden" name="${key}" value="${fieldValue}">`;
    }
    else {
      formField = await createField(key, fieldValue, attributes, errorMsg,'update',record);
      let format = suds.input.default;
      if (attributes[key].input.format) { format = attributes[key].input.format }
      let groupClass;
      let labelClass;
      let fieldClass;
      if (format == 'row') {
        groupClass = classes.input.row.group;
        labelClass = classes.input.row.label;
        fieldClass = classes.input.row.field;
      }
      else {
        groupClass = classes.input.col.group;
        labelClass = classes.input.col.label;
        fieldClass = classes.input.col.field;
      }
      formField = `
        <div class="${classes.input.group} ${groupClass}">  <!-- Form group for ${attributes[key].friendlyName} -->
          <div class="${labelClass}">
            <label class="${classes.label}" for="${key}"  title="${attributes[key].description}" id="label_${key}">
              ${attributes[key].friendlyName}
            </label>
          </div>  <!-- names column -->
          <div class="${fieldClass}">
  ${formField}
          </div> <!-- fields column -->
        </div>  <!--  Form group for ${key} -->`;
    }
    //  store clear name of the field and html in two arrays.
    formData[key] = formField;
    trace.log({ key: key, formField: formField, level: 'verbose' });

    /* *******************************************************
    * 
    *  End of loop
    * 
    *  Create validation function
    * 
    ****************************************************** */
  }
  form += `
    <script>
      function validateForm() {
        console.log('validateForm');
        let errCount=0;
        let value='';
        let columnError;`;
  for (let key of Object.keys(attributes)) {
    if (attributes[key].collection) { continue; }  // not intersted in collections
    if (!attributes[key].canEdit) { continue; }  // can't validate if not editable
    if (attributes[key].input.hidden) { continue; }

    if (attributes[key].primaryKey || key == 'createdAt' || key == 'updatedAt') { continue; }  // can't validate auto updated fields

    trace.log({ attributes: attributes[key], level: 'verbose' });
    form += `
      // ********** Start of validation for ${attributes[key].friendlyName}  ***************
 
      columnError=false;`;
    trace.log(key, record[key], attributes[key]);
    let vals = 0;
    if (attributes[key].type == 'number') {
      form += `
        value=Number(document.forms['mainform']['${key}'].value);`;
    }
    else {
      form += `
        value=document.forms['mainform']['${key}'].value;`;
    }
    form += `
       document.getElementById("err_${key}").innerHTML='';`;
    trace.log(attributes[key].required, attributes[key].input.required);
    if (attributes[key].required || attributes[key].input.required) {       // Required
      form += `
        if (true) {          // Start of validation for ${key} `;
    }
    else {
      form += `
        if (value) {                    // ${key} is not mandatory so validation only needed
                                        // if there is something in the field`;
    }
    // Start of generating code for the validations for this field
    if (attributes[key].required || attributes[key].input.required) {
      vals++;
      form += `
            if (!value) {
              document.getElementById("err_${key}").innerHTML="${lang.mandatory}";
              columnError=true;
              errCount++;

            }`;
    }

    if (
      attributes[key].type == 'number'
      || (attributes[key].input && attributes[key].input.isNumber)
    ) {
      vals++;
      form += `
           if (value == 'NaN') {
              document.getElementById("err_${key}").innerHTML="${lang.nan}";
              columnError=true;
              errCount++;
            }`;
    }

    if (attributes[key].input) {

      if (attributes[key].input.isInteger) {
        vals++;
        form += `
            if (!Number.isInteger(value)) {
              document.getElementById("err_${key}").innerHTML="${lang.notInt}";
              columnError=true;
              errCount++;
            }`;
      }

      if (attributes[key].input.isEmail) {
        vals++;
        form += `
            if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)) {
              document.getElementById("err_${key}").innerHTML="${lang.notEmail}";
              columnError=true;
              errCount++;
            }`;
      }

      if (attributes[key].input.max) {
        vals++;
        form += `
            if (value > ${attributes[key].input.max}) {
              document.getElementById("err_${key}").innerHTML="${lang.max} ${attributes[key].input.max}";
              columnError=true;
              errCount++;
            }`;
      }
      if (attributes[key].input.min) {
        vals++;
        form += `
            if (value < ${attributes[key].input.min}) {
              document.getElementById("err_${key}").innerHTML="${lang.min} ${attributes[key].input.min}";
              columnError=true;
              errCount++;
            }`;
      }

      if (attributes[key].input.maxLength) {
        vals++;
        form += `
            if (value.length > ${attributes[key].input.maxLength}) {
              document.getElementById("err_${key}").innerHTML="${lang.maxLength} ${attributes[key].input.maxLength}";
              columnError=true;
              errCount++;
            }`;
      }

      if (attributes[key].input.minLength) {
        vals++;
        form += `
            if (value.length < ${attributes[key].input.minLength}) {
              document.getElementById("err_${key}").innerHTML="${lang.minLength} ${attributes[key].input.minLength}";
              columnError=true;
              errCount++;
            }`;

      }

    }

    // finished all the validations here                                 

    if (vals == 0) {
      form += `
                  // No inline validations for ${key} `;
    }
    else {
      trace.log({ key: key, group: columnGroup[key] });
      if (columnGroup[key]) {
        form += `
            if (columnError) {tabclick('${columnGroup[key]}')}`;
      }

    }
    form += `
  
          }       // end of validation for ${key}`;
  }




  form += `
        if (errCount > 0) { return false; }  else {  return true; }
      }
    </script>
    `;

  trace.log({ table: tableData, record: record });



  /* *******************************************************
   * 
    * 
   *  Create form
   * 
   ****************************************************** */

  if (mode == 'populate') { operation = lang.update; }
  if (mode == 'update') { operation = lang.update; }
  if (mode == 'new') { operation = lang.addRow; }
  // let from = '';
  //  if (allParms['#from#']) { from = allParms['#from#']; }

  if (message) { form += `\n<P>${message}</P>` }
  form += `
    <h2>${operation} ${lang.forTable}: ${tableName}</h2>`;

  //       enctype="multipart/form-data" 
  
 let query=`table=${table}&mode=update`;
 if (open) {query+=`&open=${open}`}
 if (openGroup) {query+=`&opengroup=${openGroup}`}

  form += `
    <form 
        action="${mainPage}?${query}"
        method="post" 
        name="mainform" 
        class="${classes.input.form}"
        onsubmit="return validateForm()"
    >
      <input type="hidden" name="_csrf" value="" id="csrf" />`;
  //   <input type="hidden" name="table" value="${table}">`;
  //  <input type="hidden" name="#parent#" value="${parent}" >
  //  <input type="hidden" name="#parentkey#" value="${parentKey}" >
  //      <input type="hidden" name="#from#" value="${from}" >`;
  if (id) {
    form += `
      <input type="hidden" name="id" value="${id}">`;
  }
  //form += `
  //   <input type="hidden" name="mode" value="update">
  //`;

  if (tableData.edit && tableData.edit.parentData && record[tableData.edit.parentData.link]) {
    let link = attributes[tableData.edit.parentData.link].model;
    let columns = tableData.edit.parentData.columns;
    linkAttributes = await mergeAttributes(link, permission);
    trace.log({ record: record, link: tableData.edit.parentData.link, data: record[tableData.edit.parentData.link] });
    let linkRec = await db.getRow(link, record[tableData.edit.parentData.link]);
    trace.log(linkRec);
    let linkTableData = tableDataFunction(link, permission);
    let linkName = link;
    if (linkTableData.rowTitle) { linkName = linkTableData.rowTitle(linkRec); }
    form += `
    <div class="${classes.parentData}">
    <h3>${linkName}</h3>`;
    for (let key of columns) {
      let display = await displayField(linkAttributes[key], linkRec[key], 0, permission);
      let title = linkAttributes[key].friendlyName;
      let description = '';
      if (linkAttributes[key].description) {
        description = linkAttributes[key].description.replace(/"/g, `'`);
      }
      form += `

          <div class="${classes.input.group} ${classes.input.row.group}"> 
            <div class="${classes.input.row.label}">
               ${linkAttributes[key].friendlyName}
            </div>
            <div class="${classes.input.row.field}">
  ${display}
            </div> <!-- fields column -->
          </div>  <!--  Form group for ${key} -->`;
    }
    form += `
    </div>`;
  }


  trace.log(groups);
  let tabs = [];
  groupform = [];
  for (let group of Object.keys(groups)) {                   // run through the groups (there may only be one...)
    trace.log(group);
    if (groups[group].static) {                              //   if the group is static, 
      for (let key of groups[group].columns) {
        trace.log(key);               //      just output the fields
        if (!formData[key]) { continue }
        form += `
      <!-- --- --- form-group for ${key} --- ---  -->`;
        form += `
            ${formData[key]}
              `;
      }
    }                                                       // end of static      
    else {
      // then run through the columns
      if (visibleGroup[group]) {
        tabs.push(group);                             // add the group to a list of groups that will be on tabs 
      }
    }
  }
  trace.log(tabs);
  if (tabs) {                                              // if there are any tabs
    if (tabs.length > 1) {
      form += `
          <!-- this section controlled by tabs -->
          <div class="${classes.input.groupLinks.row}">
          <div class="${classes.input.groupLinks.envelope}">
              <span class="${classes.input.groupLinks.spacing}">${lang.formGroup}</span>`;
      for (let group of tabs) {                              // run through the tabs
        trace.log(openTab, group);
        let friendlyName = group;
        if (groups[group].friendlyName) { friendlyName = groups[group].friendlyName; }
        let linkClass;
        if (openTab == group) { linkClass = classes.input.groupLinks.selected; } else { linkClass = classes.input.groupLinks.link; }   // the first will be shown the rest hidden
        form += `
          <a class="${classes.input.groupLinks.spacing} ${linkClass}" id="tab_${group}" href="#" onclick="tabclick('${group}')">
             ${friendlyName}
          </a>`;        // outputting a list of links
      }
      form += `
        </div>
        </div>
        `;
    }
    let disp;
    for (let group of tabs) {                               // then go through the non-statiuc groups
      if (openTab == group) { disp = 'block'; } else { disp = 'none' }   // the first will be shown the rest hidden
      form += `
       <!--  --------------------------- ${group} ---------------------- -->
        <div id="group_${group}" style="display: ${disp}">`;         // div aroiun dthem
      trace.log({ group: group, columns: groups[group].columns });
      for (let key of groups[group].columns) {               // then run through the columns
        if (!formData[key]) { continue }                     // sending out the fields as before
        form += `
  <!-- --- --- form-group for ${key} --- ---  -->
        ${formData[key]}
  `;
      }
      first = false;    // thhis will switch on the hidden grouos after first
      form += `
        </div>  <!-- end of ${group} --> `;
    }
  }

  //       <label for="${fieldName}" class="col-sm-2 col-form-label">&nbsp;</label>


  form += `
      <!-- --- --- end of form groups-- - --- -->
      <div class="${classes.input.buttons}">
   
          <button type="submit" class="btn btn-primary">
            ${lang.submit}
          </button>`;
  if (id) {
    form += `
          <span style="margin-right: 10px; margin-left: 10px;">
            <a class="btn btn-primary" href="${mainPage}?table=${table}&mode=listrow&id=${id}">${lang.listRow}</a>
          </span>
      `;
  }

  form += `
          <span style="margin-right: 10px; margin-left: 10px;">
            <a class="btn btn-primary" href="${mainPage}?table=${table}&mode=list">${lang.tableList}</a>
          </span>
          <a class="btn btn-primary" href="${mainPage}">${lang.backToTables}</a>
        </div>
      </form >


      `;
  // form += `\n < P > <A HREF="${mainPage}?table=${table}&mode=list">${lang.tableList}</a></p > `;
  // form += `\n < P > <A HREF="${mainPage}">${lang.backToTables}</a></p > `;
  let footnote = '';
  if (mode != 'new') {
    let created = new Date(record['createdAt']).toDateString();
    let updated = new Date(record['updatedAt']).toDateString();
    footnote = `${lang.rowNumber}: ${id} ${lang.createdAt}: ${created} ${lang.updatedAt}: ${updated}`;
  }
  else { footnote = ''; }
  trace.log(form);
  return ({ html: form, footnote: footnote });
  //  return exits.success(form);


  // *************** end of export *************
}


