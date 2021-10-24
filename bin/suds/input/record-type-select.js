

/*inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

},*/
let suds = require('../../../config/suds');

let friendlyName = 'Select';
let description = `Create select dropdown based on values in the table definition, 
or values in a linked table, or provided by a function.`;


let lang = require('../../../config/language')['EN'];
let getLabelsValues = require('./get-labels-values');

module.exports = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record, tableData) {
    if (arguments[0] == suds.documentation) { return ({ friendlyName: friendlyName, description: description }) }
    trace = require('track-n-trace');
    trace.log(arguments);
    let results = '';
    trace.log(tableData.recordTypes);
    let values = Object.keys(tableData.recordTypes);
    let labels = [];
    let i = 0;
    let omits = `      {`;
    for (let key of values) {
        labels[i++] = tableData.recordTypes[key].friendlyName;
        if (tableData.recordTypes[key].omit) {
            omits += `
          ${key}:[`;
            for (let omit of tableData.recordTypes[key].omit) {
               omits+=`'${omit}',`;
            }
            omits += `],`;
        }
    }
    omits+=`
        }`;
    trace.log(omits)


    results = `
          <script>
              function recordType(fieldName) {
                  let omits=${omits}
                  let type=document.getElementById(fieldName).value;
                  console.log(type);
                  if (omits[type]) {
                      console.log('omitting',omits[type]);
                      for (let group of omits[type]) {
                          if (document.getElementById('group_'+group)) {
                        document.getElementById('group_'+group).style.display="none"; 
                        document.getElementById('tab_'+group).style.display="none"; 
                          }
                      }
                  }

           }
          </script>
          <select name="${fieldName}"  class="form-control" aria-label="${attributes.friendlyName}"  id="${fieldName}" onchange="recordType('${fieldName}')" style="width: ${attributes.input.width}" >
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























