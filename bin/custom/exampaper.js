
/** ************************************************
 * Given an exam subject key, the program returns the 
 * list of papers as labels/values array array.
 ***************************************************** */
 let trace = require('track-n-trace');
 let suds = require('../../config/suds');
 let db = require('../suds/'+suds.dbDriver);
module.exports=  async function (query) {
     trace.log(query);
    let exam=query.parentValue0;
    let examDoc = await db.getRow('subjectsdenorm',exam)
    if (examDoc.err) {
        return(['error'],['examDoc.msg'])
    }
    trace.log(examDoc);
    let values=examDoc.papers;
    let labels=[];
    for (let i=0;i<values.length; i++) {
        let paperDoc=await db.getRow('papersdenorm',values[i])
        labels[i]=paperDoc.name;
    }
    return ([labels,values]);

}