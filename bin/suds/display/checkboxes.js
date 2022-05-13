
let getLabelsValues = require('../get-labels-values');
let list=require('./list');

module.exports = async function (attributes, fieldValue) {
  return await list(attributes, fieldValue);
}
