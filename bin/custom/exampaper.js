
/** ************************************************
 * Given an exam subject key, the program returns the 
 * list of papers as an array.
 ***************************************************** */
 let trace = require('track-n-trace');
 let suds = require('../../config/suds');
 let db = require('../suds/'+suds.dbDriver);
module.exports=  async function (query) {
    let exam=query.exam;
    let examDoc = await db.getRow('subjectsdenorm',exam)
    return ([examDoc.papers,examDoc.papers]);

}