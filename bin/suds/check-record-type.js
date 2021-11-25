

let documentation={
 friendlyName: 'Check record type',
 description: 'Creates form  to check record type. ',
}


let suds = require('../../config/suds');                 // Primary configuration file
let trace = require('track-n-trace');                    // Debug tool
let mergeAttributes = require('./merge-attributes');     // Standardises attributes for a table, filling in any missing values with defaults
let tableDataFunction = require('./table-data');         // Extracts non-attribute data from the table definition, filling in missinh =g values
let classes = require('../../config/classes');           // Links class codes to actual classes
let lang = require('../../config/language')['EN'];       // Object with language data
let db = require('./db');                                // Database routines
let createField = require('./create-field');             // Creates an input field
let displayField = require('./display-field');           // displays a column value

let fn= async function (permission, table, inputQuery,csrf) {

  trace.log({ start: 'Check record type', inputs: arguments, break: '#', level: 'min' });

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

  if (!tableData.canEdit
    && !(tableData.demoRow && tableData.demoRow == id && permission == '#guest#')) {
    return `<p>Sorry - you don't have permission to edit ${tableData.friendlyName} (${table})`;
  }
  let key = tableData.recordTypeColumn;
  let query = `table=${table}&mode=new`;
  if (inputQuery.prepopulate) {
    query += `&prepopulate=${inputQuery.prepopulate}&${inputQuery.prepopulate}=${inputQuery[inputQuery.prepopulate]}`;
  }
  else {
    query += `&prepopulate=${key}`;
  }
  let [formField, headerTags] = await createField(key, '', attributes, '', 'checkRecordType');
  let format = suds.input.default;
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

  let form = `
  <h2>${tableName} - ${lang.select}</h2>
  <form 
  action="${mainPage}?${query}"
  id="mainform"
  method="post" 
  name="mainform" 
  class="${classes.input.form}"
>

<input type="hidden" name="table" value="${table}" />
<input type="hidden" name="mode"  value="new" />
<input type="hidden" name="_csrf" value="${csrf}" id="csrf" />
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
</div>
<button type="submit" class="btn btn-primary">
            ${lang.submit}
          </button>                                         <!--Form group for ${attributes[key].friendlyName} end-->
</form>
  `;


  footnote = '';
  trace.log(form);
  return ({ output: form, footnote: footnote, headerTags: headerTags });
  //  return exits.success(form);


  // *************** end of export *************
}



exports.documentation=documentation;
exports.fn=fn;

