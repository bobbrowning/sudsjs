
  let friendlyName= 'File upload';
  let  description= 'Not working - do not use';



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
  if (arguments[0] == 'documentation') { return ({ friendlyName:friendlyName, description: description }) }
  trace = require('track-n-trace');
  trace.log(arguments);

    let results = `
      <div class="col-sm-10">
        <input type="file" 
         class="form-control-file" 
          id="${fieldName}" 
        >
  </div>`;
    return (results);

  }




