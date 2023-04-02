
const suds = require('../../../config/suds')
const documentation = {
  friendlyName: 'File upload',
  description: ''
}

/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */

const lang = require('../../../config/language').EN

const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
  trace = require('track-n-trace')
  trace.log(arguments)
  let message = ''
  if (fieldValue) {
    message = `${lang.uploaded}  <a href="/uploads/${fieldValue}" target="_blank">${fieldValue}</a>`
  }
  const results = `
      <div class="col-sm-10">
        <input 
          type="file" 
          class="form-control-file" 
          id="${fieldName}" 
          name="${fieldName}"
        >
        <br /><span id="msg_${fieldName}" class="sudsmessage">${message}</span>
  </div>`
  return (results)
}

exports.documentation = documentation
exports.fn = fn
