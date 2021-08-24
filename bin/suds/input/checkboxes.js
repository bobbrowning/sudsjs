const tableDataFunction = require('./suds-table-data');

let friendlyName= 'Multiple Checkboxes';
let description= `Create check boxes based on a list in the isIn attribute in the model or on a linked table. 
In the latter case, the label or each checkbox is either the value given by the rowTitle 
function for that table in the sudst ables config file, or just the ID.  Data is stored as a simple csv. 
So for the database-driven function the resulk is '1,3,5,6...'   For the isIn version the result would be 
'alpha,beta,delta ...'  This wouldn't work if the values contain commas. ` ;


/*inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

},*/

let lang = require('../../../config/language')['EN'];
let getLabelsValues = require('./get-labels-values');


module.exports = async function (fieldType, fieldName, fieldValue, attributes, errorMsg,record) {
  if (arguments[0] == 'documentation') { return ({ friendlyName:friendlyName, description: description }) }
  trace = require('track-n-trace');
  trace.log(arguments);

  let results = '';

    trace.log({ values: values, labels: labels, checked: checked });
    for (let i = 0; i < values.length; i++) {
      selected = '';
      if (checked[i]) { selected = 'checked' }
      results += `
        <div class="form-check-inline" id="${inputs.fieldName}" style="margin-right: 20px">  
          <input type="checkbox" 
            name="${inputs.fieldName}"  
            class="form-check-input"  
            id="${inputs.fieldName}_${i}" 
            value="${values[i]}" ${selected}>
          <label for "${inputs.fieldName}_${i}" class="form-check-label">
            ${labels[i]}
          </label>    
        </div>`;
    }
    results += `
        <span id="err_${inputs.fieldName}" class="sudserror"> ${inputs.errorMsg}</span>
      `;
    return (results);
  }
