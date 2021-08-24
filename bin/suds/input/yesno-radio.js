
/*inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

},*/

friendlyName='Yes-No radio buttons.';
description=`Radio buttons alternative to checkbox.`

let lang = require('../../../config/language')['EN'];


module.exports = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
  if (arguments[0] == 'documentation') { return ({ friendlyName:friendlyName, description: description }) }
  trace = require('track-n-trace');
  trace.log(arguments);
  let results = '';
  let values = [lang.true, lang.false];
  let labels = [lang.yes, lang.no];
  trace.log({ values: values, labels: labels });
  for (let i = 0; i < values.length; i++) {
    selected = '';
    if (values[i] == fieldValue) { selected = 'checked' }
    results += `
        <div class="form-check-inline" id="${fieldName}" style="margin-right: 20px">  
          <input type="radio" 
            name="${fieldName}"  
            class="form-check-input"  
            id="${fieldName}_${i}" 
            value="${values[i]}" ${selected}>
          <label for="${fieldName}_${i}" class="form-check-label">
            ${labels[i]}
          </label>    
        </div>`;
  }
  results += `
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
      `;
  return (results);
}


