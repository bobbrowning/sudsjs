
/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */
const suds = require('../../../config/suds')

const documentation = {
  friendlyName: 'Select',
  description: `Create select dropdown based on values in the table definition, 
or values in a linked table, or provided by a function.`
}

const lang = require('../../../config/language').EN
const getLabelsValues = require('../get-labels-values')

const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record, tableData, tabs) {
 const trace = require('track-n-trace')
  trace.log(arguments)
  let results = ''
  trace.log(tableData.recordTypes)
  const values = Object.keys(tableData.recordTypes)
  const labels = []
  let i = 0
  let omits = '      {'
  for (const key of values) {
    labels[i++] = tableData.recordTypes[key].friendlyName
    if (tableData.recordTypes[key].omit) {
      omits += `
          ${key}:[`
      for (const omit of tableData.recordTypes[key].omit) {
        omits += `'${omit}',`
      }
      omits += '],'
    }
  }
  omits += `
        }`
  trace.log(omits, tabs)
  let groups = '['
  for (const item of tabs) { groups += `'${item}', ` }

  groups += ']'

  results = `
          <script>
              function recordType(fieldName) {
                  let allGroups=${groups};
                  for (let group of allGroups) {
                    document.getElementById('group_'+group).style.display="block"; 
                    document.getElementById('tab_'+group).style.display="block"; 
                  }
                  let omits=${omits}
                  let type=document.getElementById(fieldName).value;
                  console.log(type);
                  if (omits[type]) {
                      console.log('omitting',omits[type]);
                      for (let group of omits[type]) {
                          if (document.getElementById('group_'+group)) {
                        document.getElementById('group_'+group).style.display="none"; 
                        document.getElementById('tab_'+group).style.display="none"; 
                          }
                      }
                  }

           }
          </script>
          <select name="${fieldName}"  class="form-control" aria-label="${attributes.friendlyName}"  id="${fieldName}" onchange="recordType('${fieldName}')" style="width: ${attributes.input.width}" >
          <option value="">${lang.select}</option>`
  for (let i = 0; i < values.length; i++) {
    selected = ''
    if (values[i] == fieldValue) { selected = 'selected' }
    results += `
          <option value="${values[i]}" ${selected}>${labels[i]} </option>
     `
  }
  results += `
        </select>
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
`

  return (results)
}

exports.documentation = documentation
exports.fn = fn
