
/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */

const suds = require('../../../config/suds')
const documentation = {
  friendlyName: 'Yes-No radio buttons.',
  description: 'Radio buttons alternative to checkbox.'
}

const lang = require('../../../config/language').EN

const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
  let trace = require('track-n-trace')
  trace.log(arguments)
  let results = ''
  let button1 = ''
  let button2 = ''
  const value1 = 'false'
  const value2 = 'false'
  if (fieldValue) { button1 = 'checked' } else { button2 = 'checked' }

  results = `
        <div class="form-check-inline" id="${fieldName}" style="margin-right: 20px">  
          <input type="radio" 
            name="${fieldName}"  
            class="form-check-input"  
            id="${fieldName}_1" 
            value="true" ${button1}
            >
          <label for="${fieldName}_1" class="form-check-label">
            ${lang.yes}
          </label>    
        </div>
        <div class="form-check-inline" id="${fieldName}" style="margin-right: 20px">  
        <input type="radio" 
          name="${fieldName}"  
          class="form-check-input"  
          id="${fieldName}_2" 
          value="" ${button2}
          >
        <label for="${fieldName}_2" class="form-check-label">
          ${lang.no}
        </label>    
      </div>`
  results += `
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
      `
  return (results)
}

exports.documentation = documentation
exports.fn = fn
