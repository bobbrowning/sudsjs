

const suds = require('../../config/suds') // Primary configuration file
const trace = require('track-n-trace') // Debug tool
const mergeAttributes = require('./merge-attributes') // Standardises attributes for a table, filling in any missing values with defaults
const tableDataFunction = require('./table-data') // Extracts non-attribute data from the table definition, filling in missinh =g values
const classes = require('../../config/classes') // Links class codes to actual classes
const lang = require('../../config/language').EN // Object with language data
const createField = require('./create-field') // Creates an input field

export async function checkRecordType (permission, table, inputQuery, csrf) {
  trace.log({ start: 'Check record type', inputs: arguments, break: '#', level: 'min' })

  /** ************************************************
  *
  *   set up the data
  *
  ************************************************ */
  let mainPage = suds.mainPage
  if (!mainPage) { mainPage = '/' }
  const tableData = tableDataFunction(table, permission)

  let tableName: string = tableData.friendlyName

  const attributes = mergeAttributes(table, permission) // attributes and extraattributes merged plus permissions

  if (!tableData.canEdit) {
    throw new Error(`<p>Sorry - you don't have permission to edit ${tableData.friendlyName} (${table})`)
  }
  const key = tableData.recordTypeColumn
  let query = `table=${table}&mode=new`
  if (inputQuery.prepopulate) {
    query += `&prepopulate=${inputQuery.prepopulate}&${inputQuery.prepopulate}=${inputQuery[inputQuery.prepopulate]}`
  }
  query += `&prepopulate=${key}`
  /*   needs node 17
  let attr=attributes[key];
  if (tableData.recordTypeInput) {
    attr=structuredClone(attributes[key]);
     attr.input.type=tableData.recordTypeInput;

  }
  */
  const oldInputType = attributes[key].input.type
  /** Different input format for record type selection */
  if (tableData.recordTypeInput) {
    attributes[key].input.type = tableData.recordTypeInput
  }
  const [formField, headerTags] = await createField(key, '', attributes[key], '', 'checkRecordType')
  attributes[key].input.type = oldInputType
  const format = suds.input.default
  let groupClass
  let labelClass
  let fieldClass
  if (format == 'row') {
    groupClass = classes.input.row.group
    labelClass = classes.input.row.label
    fieldClass = classes.input.row.field
  } else {
    groupClass = classes.input.col.group
    labelClass = classes.input.col.label
    fieldClass = classes.input.col.field
  }
  const pretext = ''
  const posttext = ''
  let tooltip = attributes[key].description
  if (attributes[key].helpText) {
    tooltip = `${attributes[key].description}
________________________________________________________
${attributes[key].helpText}`
  }

  const form = `
  <h2>${tableName} - ${lang.select}</h2>
  <form 
  action="${mainPage}?${query}"
  id="mainform"
  method="post" 
  name="mainform" 
  class="${classes.input.form}"
>
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
  `

  let footnote = ''
  trace.log(form)
  return ({ output: form, footnote:footnote, headertags: headerTags })
  //  return exits.success(form);

  // *************** end of export *************
}


