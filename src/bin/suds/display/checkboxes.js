
const getLabelsValues = require('../get-labels-values')
const list = require('./list')

module.exports = async function (attributes, fieldValue) {
  return await list(attributes, fieldValue)
}
