
let getLabelsValues= require('../get-labels-values');

module.exports = async function (attributes, fieldValue) {
  let trace = require('track-n-trace');
  trace.log(arguments);

  let results = '';
  linkedTable = attributes.input.model;
  if (attributes.input.linkedTable) linkedTable = attributes.input.linkedTable;
  let fieldValues=[];
  if (fieldValue) {fieldValues=JSON.parse(fieldValue);}
  if (!Array.isArray(fieldValues))  {fieldValues=[fieldValues]};
  trace.log(fieldValues);
  [values,labels]=await getLabelsValues(attributes, {});
 
  trace.log({ values: values, labels: labels, });
  for (let i = 0; i < fieldValues.length; i++) {
    if (i) {results+='<br />'}
    for (j=0;j<values.length; j++){
      if (fieldValues[i] == values[j]) {
        results += labels[j];
        break;
      }
    }
  }
  return results;
}
