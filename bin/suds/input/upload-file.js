
  let suds = require('../../../config/suds');
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



module.exports = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
  if (arguments[0] == suds.documentation) { return ({ friendlyName: friendlyName, description: description }) }
  trace = require('track-n-trace');
  trace.log(arguments);
  let message='';
  if (fieldValue) {
    message= `${lang.uploaded}  <a href="/uploads/${fieldValue}" target="_blank">${fieldValue}</a>`;
  }
    let results = `
      <div class="col-sm-10">
        <input 
          type="file" 
          class="form-control-file" 
          id="${fieldName}" 
          name="${fieldName}"
        >
        <br /><span id="msg_${fieldName}" class="sudsmessage">${message}</span>
  </div>`;
    return (results);

  }




