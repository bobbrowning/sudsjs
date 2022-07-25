/* ****************************************************
* uique AJAX response.
*
* *************************************************** */
let suds = require('../../config/suds');
let trace = require('track-n-trace');
let db = require('../../bin/suds/'+suds.dbDriver);

module.exports = async function (data) {
    trace.log('#get record called ', data.exam); 
    let examDocument=await db.getRow('subjectsdenorm',data.exam) 
    let labels=examDocument.papers;
    trace.log(labels)
    return([labels,labels]);
}

