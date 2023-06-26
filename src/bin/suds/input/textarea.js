
const suds = require('../../../config/suds')
const documentation = {
  friendlyName: 'Textarea',
  description: 'Creates a textarea field.'
}

/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */

const lang = require('../../../config/language').EN

const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
 const trace = require('track-n-trace')
  trace.log(arguments)

  let results = ''

  let rows = 4
  let cols = 20
  let placeholder = ''
  if (attributes.input.rows) { rows = attributes.input.rows }
  if (attributes.input.cols) { cols = attributes.input.cols }
  if (attributes.input.placeholder) { placeholder = attributes.input.placeholder }
  let apicall = ''
  if (attributes.input.validations.api) {
    apicall = `onchange="apiCheck('${fieldName}','${attributes.input.validations.api.route}')"
            oninput="apiWait('${fieldName}')"`
  }

  results = `
     
        <textarea name="${fieldName}"  
          class="form-control"  
          id="${fieldName}" 
          rows="${rows}" 
          style="width: ${attributes.input.width};" 
          cols="${cols}"`
  const ignore = ['type', 'name', 'validations', 'required', 'class', 'isInteger']
  for (const inprop of Object.keys(attributes.input)) {
    if (ignore.includes(inprop)) { continue } // skip the ones we have already done
    results += `
          ${inprop}="${attributes.input[inprop]}" `
  }
  if (suds.useHTML5Validation) {
    if (input.required) {
      result += `
            required`
    }
  }
  if (apicall) {
    results += `
          ${apicall}`
  }
  results += `
          placeholder = "${placeholder}" >${fieldValue}</textarea >
      <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
    `
  return (results)
}

exports.documentation = documentation
exports.fn = fn
