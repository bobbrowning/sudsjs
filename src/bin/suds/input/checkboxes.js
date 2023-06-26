
const documentation = {
  friendlyName: 'Multiple Checkboxes',
  description: `Create check boxes based on the values in the configuration file or a linked table. 
 Data is stored in a text field  as an array in JSON format`
}

/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */

const lang = require('../../../config/language').EN
const getLabelsValues = require('../get-labels-values')
const suds = require('../../../config/suds')
const trace = require('track-n-trace')

const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record) {
  trace.log(arguments)
  let results = ''
  let labels
  let values;
  [values, labels] = await getLabelsValues(attributes, record)
  let checked = []
  trace.log(fieldValue, typeof fieldValue)
  if (attributes.array) {
    if (attributes.array.type == 'single' &&
      fieldValue &&
      typeof fieldValue === 'string') {
      trace.log(fieldValue);
      try {
        checked = JSON.parse(fieldValue)
      }
      catch {
        console.log(`*********************** Problem ******************
      field ${fieldName}
      contains invalid JSON. Clearing field.`)
        fieldValue = '';
      }
    } else {
      checked = fieldValue
    }
  } else {
    if (fieldValue && attributes.process == 'JSON') { checked = JSON.parse(fieldValue) }
  }
  trace.log(fieldValue)
  if (!Array.isArray(checked)) { checked = [checked] };
  trace.log(checked)
  results += `
  <input type="hidden" name="${fieldName}.length" value="${values.length}"> `
  for (let i = 0; i < values.length; i++) {
    let selected = ''
    if (checked.includes(values[i])) { selected = 'checked' }
    results += `
    <div class="form-check-inline" id="${fieldName}" style="margin-right: 20px"> 
         <input type="checkbox" 
            name="${fieldName}.${i + 1}"  
            class="form-check-input"  
            id="${fieldName}.${i}" 
            value="${values[i]}" ${selected}>
          <label for "${fieldName}.${i}" class="form-check-label">
            ${labels[i]}
          </label>    
        </div>`
  }
  results += `
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
      `
  return (results)
}

exports.documentation = documentation
exports.fn = fn
