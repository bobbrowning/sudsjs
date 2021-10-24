
/*inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

},*/

let suds = require('../../../config/suds');
friendlyName='Yes-No radio buttons.';
description=`Radio buttons alternative to checkbox.`

let lang = require('../../../config/language')['EN'];


module.exports = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
  if (arguments[0] == suds.documentation) { return ({ friendlyName: friendlyName, description: description }) }
  trace = require('track-n-trace');
  trace.log(arguments);
  let results = '';
  let button1='';
  let button2='';
  let value1='false';
  let value2='false';
  if (fieldValue) {button1='checked';} else {button2='checked'; }
    
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
      </div>`;
  results += `
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
      `;
  return (results);
}


