
let suds = require('../../../config/suds');
let friendlyName= 'Textarea';
 let  description= 'Creates a textarea field.';



/*inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

},*/

let lang = require('../../../config/language')['EN'];
let getLabelsValues = require('./get-labels-values');


module.exports = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
  if (arguments[0] == suds.documentation) { return ({ friendlyName: friendlyName, description: description }) }
  trace = require('track-n-trace');
  trace.log(arguments);

  let results = '';
  
    let rows = 4;
    let cols = 20;
    let placeholder='';
    if (attributes.input.rows) {rows=attributes.input.rows}
    if (attributes.input.cols) {cols=attributes.input.cols}
    if (attributes.input.placeholder) {placeholder=attributes.input.placeholder}
    results = `
     
        <textarea name="${fieldName}"  
          class="form-control"  
          id="${fieldName}" 
          rows="${rows}" 
          style="width: ${attributes.input.width};" 
          cols="${cols}" 
          placeholder="${placeholder}">${fieldValue}</textarea>
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
    `;
    return (results);

  }



