module.exports = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {

  /*
    inputs: {
      fieldType: { type: 'string' },
      fieldName: { type: 'string' },
      fieldValue: { type: 'string' },
      attributes: { type: 'ref' },
      errorMsg: { type: 'string' },
    },
  */

    if (arguments[0] == 'documentation') { return ({ friendlyName:friendlyName, description: description }) }
    trace = require('track-n-trace');
  trace.log(arguments);
  let input = attributes.input;
  if (attributes.model) { fieldType = 'number' };
  if (typeof fieldValue == 'string' && fieldValue.includes('"')) { fieldValue = fieldValue.replace(/"/g, '&quot;') }

  // field size is in table input config, or default size or 100
  let result = `
        <input 
          type="${fieldType}" 
          class="${input.class}" 
          style="width: ${input.width};" 
          id="${fieldName}" 
          name="${fieldName}"
          aria-describedby="${attributes.description}"
          value="${fieldValue}"`;

  // Any other items in the input property in the config file 
  //  are copied in here. 
  // e.g {rows: '5', cols: '60', placeholder: 'Plea...'}
  for (let inprop of Object.keys(input)) {
    if (inprop == 'type' || inprop == 'name' || inprop == 'width') { continue }  // skip the ones we have already done
    result += `
          ${inprop}="${input[inprop]}" `;
  }
  result += `>
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
      `;
  trace.log(result);
  return (result);
}

