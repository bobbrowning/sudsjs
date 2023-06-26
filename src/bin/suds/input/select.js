
/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */

const suds = require('../../../config/suds')
const trace = require('track-n-trace')

const documentation = {
  friendlyName: 'Select',
  description: `Create select dropdown based on values in the table definition, 
om values in a linked table, or provided by a function.`
}

const lang = require('../../../config/language').EN
const getLabelsValues = require('../get-labels-values')

const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record) {
  if (arguments[0] == suds.documentation) { return ({ friendlyName, description }) }
  trace.log(arguments)
  let results = ''
  let onchange = ''
  if (attributes.input.onchange) {
    onchange = attributes.input.onchange
    onchange = onchange.replace(/{{fieldValue}}/, fieldValue)
  }
  let onload = ''
  const onevent = ''
  let onevents = ''
  if (attributes.input.onevents) {
    for (const evname of Object.keys(attributes.input.onevents)) {
      let evaction = attributes.input.onevents[evname]
      evaction = evaction.replace(/{{fieldValue}}/, fieldValue)
      evaction = evaction.replace(/{{fieldName}}/, fieldName)
      if (evname == 'onload') {
        onload = `
    <script defer>
       ${evaction} 
    </script>
    `
      } else {
        onevents += `
              ${evname}="${evaction}"`
      }
    }
    if (onchange) {
      onevents += `
              onchange="${onchange}" `
    }
  }

 let  [values, labels] = await getLabelsValues(attributes, record)
  trace.log(labels, values, fieldValue)
  results = `
          <select 
            name="${fieldName}"  
            class="form-control" 
            aria-label="${attributes.friendlyName}"  
            id="${fieldName}" 
            style="width: ${attributes.input.width}"
            ${onevents}
          >
          <option value="">${lang.select}</option>`
  for (let i = 0; i < values.length; i++) {
    let selected = ''
    if (values[i] == fieldValue) { selected = 'selected' }
    results += `
          <option value="${values[i]}" ${selected}>${labels[i]} </option>
     `
  }
  results += `
        </select>
        ${onload}
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
 `

  return (results)
}

exports.documentation = documentation
exports.fn = fn
