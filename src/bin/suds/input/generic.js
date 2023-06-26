const suds = require('../../../config/suds')

const documentation = {
  friendlyName: 'Generic input',
  description: 'Generic routine geneating an input tag.'
}

const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg,record,tableData) {
  /*
    inputs: {
      fieldType: { type: 'string' },
      fieldName: { type: 'string' },
      fieldValue: { type: 'string' },
      attributes: { type: 'ref' },
      errorMsg: { type: 'string' },
    },
  */

  const trace = require('track-n-trace')
  trace.log(arguments)
  const input = attributes.input
  let pretag = '';

  if (typeof fieldValue === 'string' && fieldValue.includes('"')) { fieldValue = fieldValue.replace(/"/g, '&quot;') }
  let apicall = ''
  if (input.api) {
    apicall = `onchange="apiCheck('${fieldName}','${input.api.route}','${tableData.tableName}','${record[tableData.primaryKey]}')"
          oninput="apiWait('${fieldName}')"`
  }
  // field size is in table input config, or default size or 100
  let result = `
        <input 
          type="${fieldType}" 
          class="${input.class}" 
          id="${fieldName}" 
          name="${fieldName}"
          aria-describedby="${attributes.description}"
          value="${fieldValue}"
          ${apicall} `

  // Any other items in the input property in the config file
  //  are copied in here.
  // e.g {rows: '5', cols: '60', placeholder: 'Plea...'}
  const ignore = ['type', 'name', 'validations', 'required', 'class','isInteger','api']
  for (const inprop of Object.keys(input)) {
    if (ignore.includes(inprop)) { continue } // skip the ones we have already done
    result += `
          ${inprop}="${input[inprop]}" `
  }
  if (suds.useHTML5Validation) {
    if (input.required) {
      result += `
    required`
    }    
  }
  trace.log(fieldName,fieldType,attributes.values, )
  if (attributes.values && Array.isArray(attributes.values)) {
      pretag=`
      <datalist id="${fieldName}_enum">`
      for (const val of attributes.values) pretag += `\n         <option value="${val}">`
      pretag+=`
      </datalist>`
      result+=`
          list="${fieldName}_enum"`
    }
  result += `>
        ${pretag}
        <span id="err_${fieldName}" class="sudserror">${errorMsg}</span>
      `
  trace.log(result)
  return (result)
}

exports.documentation = documentation
exports.fn = fn
