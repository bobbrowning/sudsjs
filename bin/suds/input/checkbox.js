
/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */
const suds = require('../../../config/suds')
const documentation = {
  friendlyName: 'Checkbox',
  description: 'Creates a checkbox field. '
}

const lang = require('../../../config/language').EN
const getLabelsValues = require('../get-labels-values')

const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
  trace = require('track-n-trace')
  trace.log(arguments)

  let results = ''
  let checked = ''
  if (fieldValue && fieldValue != 'false') {
    checked = 'checked'
  }
  results = `
        <div class="form-check-inline">
          <input 
            type="checkbox" 
            name="${fieldName}" 
            class="form-check-input" 
            id="${fieldName}" 
            value="true" ${checked}
            > 
          <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
       </div>`
  return (results)
}

exports.documentation = documentation
exports.fn = fn
