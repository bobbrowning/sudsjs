


/* Identification division  (for COBOL people)
 * Update form
 *  http://localhost:3000/admin?table=notes&mode=populate&id=2
 * 
 */

let friendlyName = 'Update';
let description = 'Creates update form  from the model and processes submitted form . ';

/* Environment division 
 * 
 *     Tested on 
 *        zorin 16
 *        Node.js  v 12.18
 */


let suds = require('../../config/suds');                 // Primary configuration file
let trace = require('track-n-trace');                    // Debug tool
let mergeAttributes = require('./merge-attributes');     // Standardises attributes for a table, filling in any missing values with defaults
let tableDataFunction = require('./table-data');         // Extracts non-attribute data from the table definition, filling in missinh =g values
let classes = require('../../config/classes');           // Links class codes to actual classes
let lang = require('../../config/language')['EN'];       // Object with language data
let db = require('./'+suds.dbDriver);                                // Database routines
let listRow = require('./list-row');                     // List one row of the table plus a limited number of child roecords
let createField = require('./create-field');             // Creates an input field
let displayField = require('./display-field');           // displays a column value
let fs = require('fs');

/** Data Division */
module.exports = async function (
  permission,
  table,
  id,
  mode,
  record,
  loggedInUser,
  open,
  openGroup,
  files,
  auditId,
  csrf,
) {

  /** Procedure division */
  if (arguments[0] == 'documentation') { return ({ friendlyName: friendlyName, description: description }) }

  trace.log({ start: 'Update', inputs: arguments, break: '#', level: 'min' });

  trace.log({ openGroup: openGroup, });

  /** ************************************************
  *
  *   set up the data
  *
  ************************************************ */
  let mainPage = suds.mainPage;
  if (!mainPage) { mainPage = '/'; }
  let tableData = tableDataFunction(table, permission);

  tableName = tableData.friendlyName;

  const attributes = mergeAttributes(table, permission);  // attributes and extraattributes merged plus permissions

  if (id && typeof id == 'string') { id = Number(id); }
  trace.log({
    text: 'Control information',
    table: table,
    mode: mode,
    id: id,
  });
  /** Stop from editing if no permission
   *        One exception - this row is a demonstration row and this is a guest user
   */
  if (!tableData.canEdit
    && !(tableData.demoRow && tableData.demoRow == id && permission == '#guest#')) {
    return `<p>Sorry - you don't have permission to edit ${tableData.friendlyName} (${table})`;
  }

  /* *******************************************************
  * 
  * Set defaults for blanck form.  
  * There may be some pre-populated values in the record.
  * Othewise there may be values such as #today, #today+5
  * or #loggedInUser
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
  }


  /** *******************************************************
   * 
   * Validate / process data  from input  if we are 
   * coming from submitted form  
   * 
   ****************************************************** */
  let errors = {};
  let errCount = 0;
  trace.log(record);

  if (mode == 'update') {
    for (let key of Object.keys(attributes)) {
      if (!attributes[key].canEdit) { continue; }  // can't process if not editable
      if (attributes[key].collection) { continue; }  // not intersted in collections
      if (attributes[key].process && attributes[key].process.createdAt) { continue; }  // can't validate auto updated fields
      if (attributes[key].process && attributes[key].process.updatedAt) { continue; }  // can't validate auto updated fields
      if (attributes[key].process && attributes[key].process.updatedBy) { continue; }  // can't validate auto updated fields
      trace.log({ key: key, value: record[key] });
      /* Bug in Summernote - intermittently doubles up the input!   */
      /* You might look for an alternative for serious production  */
      if (attributes[key].input.type == 'summernote' && Array.isArray(record[key])) {
        console.log(`warning - summernote has produced two copies of input field ${key}.  The first copy is being used. `);
        record[key] = record[key[0]]
      }


      if (attributes[key].process && attributes[key].process.updatedBy) { record[key] = loggedInUser; }
      if (attributes[key].process
        && record[key]
        && attributes[key].process.JSON) {
        trace.log(record[key]);
        record[key] = JSON.stringify(record[key]);
        trace.log(record[key]);
      }


      if (attributes[key].input.type == 'uploadFile' && files && files[key]) {
        let rootdir = __dirname;
        rootdir = rootdir.replace('/bin/suds', '');
        let oldRecord = {};
        if (id) {
          oldRecord = await db.getRow(table, id);     // populate record from database
        }

        trace.log(files[key], rootdir, oldRecord[key]);
        if (oldRecord[key]) {
          try {
            fs.unlinkSync(`${rootdir}/public/uploads/${oldRecord[key]}`);
            console.log(`successfully deleted ${rootdir}/public/uploads/${oldRecord[key]}`);
          } catch (err) {
            console.log(`Can't delete ${rootdir}/public/uploads/${oldRecord[key]}`);
          }
        }
        let uploadname = Date.now().toString() + '-' + files[key].name;
        if (attributes[key].input.keepFileName) { uploadname = files[key].name }
        files[key].mv(`${rootdir}/public/uploads/${uploadname}`);
        record[key] = uploadname;
        //   let result = await upload(inputs.req, inputs.res, key);
        //    trace.log(result);

      }
      if (attributes[key].type == 'boolean') {
        if (record[key]) { record[key] = true; } else { record[key] = false; }
      }

      if (attributes[key].input.type == 'date'
        && attributes[key].type == 'number'
      ) {
        record[key] = Date.parse(record[key]);
        trace.log(record[key]);
        if (isNaN(record[key])) {
          record[key] = 0;
        }
      }


      if (attributes[key].type == 'number')      // Note mergeattributes makes type:number for link fields
      {
        if (record[key]) {
          record[key] = Number(record[key]);
        }
        else {
          record[key] = 0;
        }
      }

      if (attributes[key].input && attributes[key].input.server_side) {
        let err = attributes[key].input.server_side(record);
        if (err) {
          errors[key] = `<span class="${classes.error}">${err}</span>`;
          errCount++;
        }

      }
    }
  }


  // delete record.mode;                                     // but remove item we don't want


  trace.log({
    table: table,
    id: id,
    mode: mode,
    record: record,
    errors: errors,
    errCount: errCount,
    openGroup: openGroup,
  });


  /** *******************************************************
   * 
   *  Update database
   * 
   *  Update file if the controller is called with mode = 'update'
   *  and the validation checks have been passed. 
   * 
   *  If we have an id it means that record is on the database 
   *  and should be updated. Otherwise add a new row.
   * 
   ****************************************************** */
  let operation = '';

  if (mode == 'update' && errCount == 0) {
    trace.log('update processing', mode);
    if (tableData.edit.preProcess) { await tableData.edit.preProcess(record) }
    var message = '';
    let operation;
    let rec = {};
    /** 
     * 
     * If the record is on the database       
     * 
     * */
    if (id) {
      operation = 'update';
      trace.log({ Updating: id, table: table });
      for (let key of Object.keys(attributes)) {
         if (attributes[key].process.updatedAt) { record[key] = Date.now() }
        if (attributes[key].process.updatedBy) { record[key] = loggedInUser }
      }
      try {
        await db.updateRow(table, record);                                         // ref record from database
        message = lang.rowUpdated + tableName;
      }
      catch (err) {
        console.log(`Database error updating record ${id} on ${table}`, err);
        return `<h1>Database error updating record ${id} on ${table}<h1><p>${err}</p>`;
      }

      /**  
       * 
       * No id so we need to add record  
       * 
       *  */
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
          if (attributes[key].process.updatedBy) { rec[key] = loggedInUser }
        }
      }
      trace.log('New record', table, rec);
      try {
        let created = await db.createRow(table, rec);
        if (typeof(created[tableData.primaryKey]) == undefined) {
          return("Error adding row - see console log");
        }
        record[tableData.primaryKey] = id = created[tableData.primaryKey];
        trace.log({created: record[tableData.primaryKey],key: tableData.primaryKey })
        if (auditId) {
          await db.updateRow('audit', { id: auditId, mode: 'new', row: id });
        }
      }
      catch (err) {
        console.log(`Database error creating record on ${table}`, err);
        return `<h1>Database error creating record on ${table}<h1><p>${err}</p>`;
      }
      message = `${lang.rowAdded} ${id}`;
    }

    /** 
     * 
     * Post process processing and switch to list the record 
     * 
     * */
    trace.log('postprocess', record, operation);
    if (tableData.edit.postProcess) { await tableData.edit.postProcess(record, operation) }
    trace.log('switching to list record',id,record[tableData.primaryKey],tableData.primaryKey);
    let output = listRow(
      permission,
      table,
      id,
      open,
      openGroup,
    );
    return (output);

  }

  trace.log({
    mode: mode,
    columns: Object.keys(attributes),
    record: record,
    openGroup: openGroup,
  });

  /* *******************************************************
    * 
    *  Create the form, in a local variable and spurt it
    * out at the end....
    * 
    * First make a list of fields that will be in the form.
    * All thebcolumns excluding automatically updated columns
    * and collections.
    * 
    ****************************************************** */

  trace.log('edit', tableData.edit.preForm);
  if (tableData.edit.preForm) { await tableData.edit.preForm(record, mode) }

  let form = '';
  let formList = [];

  for (const key of Object.keys(attributes)) {
    if (attributes[key].primaryKey
      || attributes[key].process.createdAt
      || attributes[key].process.updatedAt
      || attributes[key].process.updatedBy
    ) { continue; }
    if (attributes[key].collection) { continue; }  // not intersted in collections
    if (!(attributes[key].canEdit)) { continue; }
    if (attributes[key].input.hidden) { continue; }
    formList.push(key);
  }

  trace.log({ formList: formList });

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
  let hideGroup = {};

  let tabs = [];
  if (tableData.groups) {
    let incl = [];
    trace.log({ formgroups: tableData.groups });
    for (let group of Object.keys(tableData.groups)) {
      trace.log({ group: group })
      if (tableData.groups[group].recordTypes
        &&
        !tableData.groups[group].recordTypes.includes(record[tableData.recordTypeColumn])
      ) {
        hideGroup[group] = true;
      }
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

    /** visibkeGroup just means that there is at least one field in the group that it not hidden 
     * hiddenGroup means that we are just bot showing that group so has priority. 
    */
    trace.log({ tabs: tabs, groups: tableData.groups, visible: visibleGroup, hide: hideGroup })



    if (tabs) {
      form += `
      <script>
      function tabclick (tab) { 
        console.log('tabclick:',tab); `;
      for (let tab of tabs) {
        trace.log(tab, hideGroup[tab]);
        if (hideGroup[tab]) { continue; }
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
  let headerTags = '';

  for (const key of formList) {
    let linkedTable = '';
    let fieldValue = '';
    formField = '';
    if (typeof record[key] != 'undefined') { fieldValue = record[key] };
    if (attributes[key].model) { linkedTable = attributes[key].model; }
    let errorMsg = '';
    if (errors[key]) { errorMsg = ` ${errors[key]}`; }

    trace.log({
      element: key,
      type: attributes[key].input.type,
      clearname: attributes[key].friendlyName,
      LinkedTable: linkedTable,
      value: fieldValue,
      titlefield: attributes[key].titlefield,
      group: columnGroup[key],
      errorMsg: errorMsg,
    });

    if (fieldValue == null) {              // can;'t pass null as a value
      if (attributes[key].type == 'number') {
        fieldValue = 0;
      }
      else {
        fieldValue = '';
      }
    }
    /**
     * 
     *   If a field requires server-side processing
     * 
     */
    if (attributes[key].input.validations.api) {
      formField += `
        <script>
          function apiWait_${key}() {
            console.log(apiWait_${key});
            document.getElementById('err_${key}').innerHTML='${lang.apiWait}';
          }
          function apiCheck_${key}() {
            let value=document.getElementById('mainform').elements['${key}'].value;
            let url='${attributes[key].input.validations.api.route}?table=${table}&id=${id}&field=${key}&value='+value;
            let result=[];
            document.getElementById('err_${key}').innerHTML='${lang.apiCheck}';
            console.log(url);
            fetch(url).then(function (response) {
              // The API call was successful!
              return response.json();
            }).then(function (data) {
              // This is the JSON from our response
              result=data;
              console.log(result);
              if (result[0]=='validationError'){
                document.getElementById('err_${key}').innerHTML=result[1];
              } 
              else {
                document.getElementById('err_${key}').innerHTML='';
     
              }
             }).catch(function (err) {
              // There was an error
              console.warn('Something went wrong.', err);
            }); 
          }
            </script>
        `;



    }
    let result = '';
    if (attributes[key].input.type == 'hidden') {
      formField += `
        <input type="hidden" name="${key}" value="${fieldValue}">`;
    }
    else {
      if (attributes[key].canEdit) {
        result = await createField(key, fieldValue, attributes, errorMsg, 'update', record, tableData, tabs);
      }
      else {
        if (attributes[key].canView) {
          result = [await displayField(attributes[key], fieldValue), ''];
          trace.log(result);
        }

      }
      formField += result[0];
      if (!headerTags.includes(result[1])) {
        headerTags += result[1];
      }
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
      let pretext = '';
      let posttext = '';
      let tooltip = attributes[key].description;
      if (attributes[key].helpText) {
        tooltip = `${attributes[key].description}
________________________________________________________
${attributes[key].helpText}`;

      }
      formField = `
         <div class="${classes.input.group} ${groupClass}">    <!-- Form group for ${attributes[key].friendlyName} start -->
          <div class="${labelClass}">                      <!--  Names column start -->
            <label class="${classes.input.label}" for="${key}"  title="${tooltip}" id="label_${key}">
              ${attributes[key].friendlyName}
            </label>
          </div>                                      <!-- Names column end -->
          <div class="${fieldClass}">                      <!-- Fields column start -->
          ${pretext}
          ${formField}
          ${posttext}
          </div>                                       <!-- Fields column end -->
        </div>                                         <!--Form group for ${attributes[key].friendlyName} end-->
        `;
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
        let debug=false;
        if (debug) {console.log(614, '*******validateForm******');}
        let errCount=0;
        let value='';
        let columnError;
        let mainform=document.getElementById('mainform');
        `;
  for (const key of formList) {
    if (attributes[key].collection) { continue; }  // not intersted in collections
    if (!attributes[key].canEdit) { continue; }  // can't validate if not editable
    if (attributes[key].input.hidden) { continue; }

    if (attributes[key].primaryKey || key == 'createdAt' || key == 'updatedAt') { continue; }  // can't validate auto updated fields

    trace.log({ attributes: attributes[key], level: 'verbose' });
    form += `
      // ********** Start of validation for ${attributes[key].friendlyName}  ***************
      if (debug) {console.log('${key}',' ','${attributes[key].input.type}')}
      columnError=false;`;
    //  Has an api left an error message
    if (attributes[key].input.validations.api) {
      form += `
      if (document.getElementById('err_${key}').innerHTML) {
        columnError=true;
        errCount++;
      }
      else {
        document.getElementById("err_${key}").innerHTML='';
      }`;
    }

    trace.log(key, record[key], attributes[key]);
    let vals = 0;
    if (attributes[key].input.type == 'autocomplete') {
      form += `
      value=Number(mainform.autoid_${key}.value);`;
    }
    else {
      if (attributes[key].type == 'number') {
        form += `
      value=Number(mainform.${key}.value);`;
      }
      else {
        form += `
      value=mainform.${key}.value;`;
      }

    }
    form += `
    if (debug) {console.log('${key}',' ',value)}`;
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
      if (columnGroup[key] && tabs.length > 1) {
        form += `
            if (columnError) {tabclick('${columnGroup[key]}')}`;
      }

    }
    form += `
       if (!columnError) {
            document.getElementById("err_${key}").innerHTML="";
      }
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
  let displayOp = '';
  if (mode == 'populate') { displayOp = lang.update; }
  if (mode == 'update') { displayOp = lang.update; }
  if (mode == 'new') { displayOp = lang.addRow; }
  // let from = '';
  //  if (allParms['#from#']) { from = allParms['#from#']; }

  if (message) { form += `\n<P>${message}</P>` }
  form += `
    <h2>${displayOp} ${lang.forTable}: ${tableName}</h2>`;

  //       enctype="multipart/form-data" 

  let query = `table=${table}&mode=update&id=${id}`;
  if (open) { query += `&open=${open}` }
  if (openGroup) { query += `&opengroup=${openGroup}` }

  form += `
    <form 
        action="${mainPage}?${query}"
        id="mainform"
        method="post" 
        name="mainform" 
        class="${classes.input.form}"
       onsubmit="return validateForm()"
        autocomplete="off"
        enctype="multipart/form-data"
    >
      <input type="hidden" name="_csrf" value="${csrf}" id="csrf" />
      `;
  //   <input type="hidden" name="table" value="${table}">`;
  //  <input type="hidden" name="#parent#" value="${parent}" >
  //  <input type="hidden" name="#parentkey#" value="${parentKey}" >
  //      <input type="hidden" name="#from#" value="${from}" >`;
  if (id) {
    form += `
      <input type="hidden" name="${tableData.primaryKey}" value="${id}">
`;
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
    if (linkTableData.rowTitle) {
      if (typeof (linkTableData.rowTitle) == 'string') {
        linkName = linkRec[linkTableData.rowTitle];

      }
      else {
        linkName = linkTableData.rowTitle(linkRec);
      }
    }
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
  tabs = [];
  groupform = [];
  for (let group of Object.keys(groups)) {                 // run through the groups (there may only be one...)
    if (hideGroup[group]) { continue; }

    trace.log(group);
    if (groups[group].static) {                              //   if the group is static, 
      for (let key of groups[group].columns) {
        trace.log(key);               //      just output the fields
        if (!formData[key]) { continue }
        form += `
      <!-- --- --- --- --- --- --- Form group for ${key} --- --- --- --- --- ---  -->`;
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
          <div class="${classes.input.groupLinks.row}">  <!-- group links row -->
          <div class="${classes.input.groupLinks.envelope}"> <!-- group links envelope -->
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
        </div> <!-- group links row end -->
        </div> <!-- group links envelope end -->
        `;
    }
    trace.log(openTab, tabs);
    if (!tabs.includes(openTab)) { openTab = tabs[0]; }
    let disp;
    for (let group of tabs) {                               // then go through the non-statiuc groups
      if (openTab == group) { disp = 'block'; } else { disp = 'none' }   // the first will be shown the rest hidden
      form += `
       <!--  --------------------------- ${group} ---------------------- -->
        <div id="group_${group}" style="display: ${disp}">  <!-- Group ${group} -->`;         // div aroiun dthem
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
        </div>  <!-- Group ${group} end --> `;
    }
  }

  //       <label for="${fieldName}" class="col-sm-2 col-form-label">&nbsp;</label>


  form += `
      <!-- --- --- end of form groups-- - --- -->
    <br clear="all">  
    <div class="${classes.input.buttons}">
   
    `;
  if (permission == '#guest#') {
    form += `<button class="${classes.output.links.danger}" type="button" title="Guest users are not allowed to submit changes">
    ${lang.submit}
  </button>`;
  }
  else {
    form += `<button type="submit" class="btn btn-primary">
            ${lang.submit}
          </button>`;
  }
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
  return ({ output: form, footnote: footnote, headerTags: headerTags });
  //  return exits.success(form);


  // *************** end of export *************
}


