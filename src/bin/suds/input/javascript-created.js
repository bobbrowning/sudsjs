
/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */
const suds = require('../../../config/suds')

const documentation = {
  friendlyName: 'js',
  description: 'Create container for javascript-created field field.'
}

const lang = require('../../../config/language').EN
const getLabelsValues = require('../get-labels-values')

const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record) {
  if (arguments[0] == suds.documentation) { return ({ friendlyName, description }) }
 const trace = require('track-n-trace')
  trace.log(arguments)
  const content = ''
  let onclick = ''
  if (attributes.input.oncick) {
    onclick = `onblur="${attributes.input.onclick}"`
    onclick = onclick.replace('{{fieldName}}', fieldName)
  }
  const results = `
    <div id="${fieldName}_html">
    </div>
   <div id="${fieldName}_switch"      ${onclick}>
    click here
    </div>
      `

  return (results)
}

exports.documentation = documentation
exports.fn = fn
