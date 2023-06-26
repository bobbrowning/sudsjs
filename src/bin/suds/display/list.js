
/**
 *   list.js
 *
 * Userd to display ists of values, e.g. from checkboxes.
 * Also used when there is an array object in the data
 *
 *
 */
const getLabelsValues = require('../get-labels-values')

module.exports = async function (attributes, fieldValue) {
  const trace = require('track-n-trace')
  trace.log(arguments)
  let values
  let labels
  let results = ''
  const linkedTable = attributes.input.model
  if (attributes.input.linkedTable) linkedTable = attributes.input.linkedTable /* Historical */
  let fieldValues = []
  if (fieldValue && attributes.process == 'JSON') {
    fieldValues = JSON.parse(fieldValue)
  } else {
    fieldValues = fieldValue
  }
  if (!Array.isArray(fieldValues)) { fieldValues = [fieldValues] };
  trace.log(fieldValues)
  if (attributes.values || attributes.model) {
    [values, labels] = await getLabelsValues(attributes, {})
    trace.log({ values, labels })
    for (let i = 0; i < fieldValues.length; i++) {
      if (i) {
        results += `<br />
      `
      }
      for (let j = 0; j < values.length; j++) {
        if (fieldValues[i] == values[j]) {
          results += labels[j]
          break
        }
      }
    }
  } else {
    for (let i = 0; i < fieldValues.length; i++) {
      if (i) {
        results += `<br />
      `
      }
      results += fieldValues[i]
    }
  }
  trace.log(results)
  return results
}
