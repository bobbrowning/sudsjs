

/*inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

},*/

let suds = require('../../../config/suds');

let documentation = {
  friendlyName: 'Select',
  description: `Create select dropdown based on values in the table definition, 
om values in a linked table, or provided by a function.`,
}


let lang = require('../../../config/language')['EN'];
let getLabelsValues = require('../get-labels-values');

let fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record) {
  if (arguments[0] == suds.documentation) { return ({ friendlyName: friendlyName, description: description }) }
  trace = require('track-n-trace');
  trace.log(arguments);
  let results = '';



  /** onload not supported for select so we do it ourselves */
  let onload = '';
  if (attributes.input.onload) {
    let ol = attributes.input.onload;
    ol = ol.replace(/{{fieldName}}/, fieldName);
    ol = ol.replace(/{{fieldValue}}/, fieldValue);
    onload = `
    <script defer>
    ${ol}
    </script>`;
  }

  /** for compatability - use onevents object for preference */
  let onchange = '';
  if (attributes.input.onchange) {
    onchange = attributes.input.onchange;
    onchange = onchange.replace(/{{fieldValue}}/, fieldValue)
  }

  let onevents = '';
  if (attributes.input.onevents) {
    for (let on of Object.keys(attributes.input.onevents)) {
      let onev = attributes.input.onevents[on];
      onev = onev.replace(/{{fieldValue}}/, fieldValue)
      onev = onev.replace(/{{fieldName}}/, fieldName)
      onevents += `
      ${on}="${onev}"`;
    }
  }
  [values, labels] = await getLabelsValues(attributes, record);
  trace.log(labels, values, fieldValue);
  results = `
          <select 
          name="${fieldName}"  
          class="form-control" 
          aria-label="${attributes.friendlyName}"  
          id="${fieldName}" 
          style="width: ${attributes.input.width}"
          onchange="${onchange}"
          ${onevents}
           >
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
        ${onload}
 `;

  return (results);
}

exports.documentation = documentation;
exports.fn = fn;

