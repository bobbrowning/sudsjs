

/*inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

},*/
let suds = require('../../../config/suds');

let friendlyName='Select';
let description=`Create select dropdown based on values in the table definition, 
om values in a linked table, or provided by a function.`;


let lang = require('../../../config/language')['EN'];
let getLabelsValues= require('./get-labels-values');

module.exports = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record) {
  if (arguments[0] == suds.documentation) { return ({ friendlyName: friendlyName, description: description }) }
  trace = require('track-n-trace');
  trace.log(arguments);
    let results = '';
  
    [values,labels]=await getLabelsValues(attributes, record);
 
    results = `
          <select name="${fieldName}"  class="form-control" aria-label="${attributes.friendlyName}"  id="${fieldName}" style="width: ${attributes.input.width}" >
          <option value="">${lang.select}</option>`;
    for (let i = 0; i < values.length; i++) {
      selected = '';
      if (values[i] == fieldValue) { selected = 'selected' }
      results += `
          <option value="${values[i]}" ${selected}>${labels[i]} </option>
     `;
    }
    results += `
        </select>
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
`;

    return (results);
  }























