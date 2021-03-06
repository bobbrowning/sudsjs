
/**
 *   list.js
 * 
 * Userd to display ists of values, e.g. from checkboxes. 
 * Also used when there is an array object in the data
 * 
 * 
 */
let getLabelsValues = require('../get-labels-values');

module.exports = async function (attributes, fieldValue) {
  let trace = require('track-n-trace');
  trace.log(arguments);
  let values;
  let labels;
  let results = '';
  linkedTable = attributes.input.model;
  if (attributes.input.linkedTable) linkedTable = attributes.input.linkedTable;    /* Historical */
  let fieldValues = [];
  if ((fieldValue && attributes.array && attributes.array.type == 'single')
    ||
    fieldValue && attributes.process == 'JSON') {
    fieldValues = JSON.parse(fieldValue);

  }
  if (!Array.isArray(fieldValues)) { fieldValues = [fieldValues] };
  trace.log(fieldValues);
  if (attributes.values || attributes.model) {
    [values, labels] = await getLabelsValues(attributes, {});
    trace.log({ values: values, labels: labels, });
    for (let i = 0; i < fieldValues.length; i++) {
      if (i) {
        results += `<br />
      ` }
      for (j = 0; j < values.length; j++) {
        if (fieldValues[i] == values[j]) {
          results += labels[j];
          break;
        }
      }
    }
  }
  else {
    for (let i = 0; i < fieldValues.length; i++) {
      if (i) {
        results += `<br />
      ` }
      results += fieldValues[i];


    }
  }

  return results;
}
