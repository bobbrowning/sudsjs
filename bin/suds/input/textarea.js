
let suds = require('../../../config/suds');
let documentation={
  friendlyName: 'Textarea',
   description: 'Creates a textarea field.',
}



/*inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

},*/

let lang = require('../../../config/language')['EN'];



let fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
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

  exports.documentation=documentation;
  exports.fn=fn;

