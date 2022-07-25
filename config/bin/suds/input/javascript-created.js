

/*inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

},*/
let suds = require('../../../config/suds');

let documentation = {
  friendlyName: 'js',
  description: `Create container for javascript-created field field.`,
}


let lang = require('../../../config/language')['EN'];
let getLabelsValues = require('../get-labels-values');

let fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record) {
  if (arguments[0] == suds.documentation) { return ({ friendlyName: friendlyName, description: description }) }
  trace = require('track-n-trace');
  trace.log(arguments);
  let content='';
  let onclick = '';
  if (attributes.input.oncick) {
    onclick = `onblur="${attributes.input.onclick}"`;
    onclick=onclick.replace('{{fieldName}}',fieldName);
  }
  let results = `
    <div id="${fieldName}_html">
    </div>
   <div id="${fieldName}_switch"      ${onclick}>
    click here
    </div>
      `;
  

  return (results);
}

exports.documentation = documentation;
exports.fn = fn;

