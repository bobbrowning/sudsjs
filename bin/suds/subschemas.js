


let suds = require('../../config/suds');                 // Primary configuration file
let trace = require('track-n-trace');                    // Debug tool
let db = require('./db');                                // Database routines

/**
 * 
  * @param {object} tableData 
 * @returns {array} array of subschema keys, 
 */

module.exports = async function (subschemas) { ``
  let additionalAttributes = {};
  trace.log(subschemas);
  if (subschemas) {
    if (!Array.isArray(subschemas)) { subschemas = [subschemas] }
    for (let i = 0; i < subschemas.length; i++) {
      let subschemaRecord = await db.getRow('subschema', subschemas[i]);
      let attr = {}
      trace.log(subschemaRecord);
      for (let j = 0; j < subschemaRecord.item.length; j++) {
        trace.log(j,subschemaRecord.item[j].name,subschemaRecord.item[j].spec);
        attr[subschemaRecord.item[j].name] = JSON.parse(subschemaRecord.item[j].spec);
      }
      trace.log(attr);
      additionalAttributes = { ...additionalAttributes, ...attr };
    }
  }
  trace.log(additionalAttributes);
  return additionalAttributes;
} 