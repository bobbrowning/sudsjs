/* ****************************************************
* uique AJAX response.
*
* *************************************************** */
let suds = require('../../config/suds');
let trace = require('track-n-trace');
let db = require('../../bin/suds/'+suds.dbDriver);

module.exports = async function (query) { 
    trace.log('#get record called ', query);
     let id=query.parentValue0;
    let record=await db.getRow('products',id);
    trace.log(id,record.variants);
    let labels=[];
    let values=[];
    for (let i=0;i<record.variants.length;i++) {
        labels[i]=values[i]=record.variants[i].friendlyName
    }
    trace.log(labels,values);
    return ([labels,values]);
}

/*
module.exports = async function (req, res) {
    trace.log('#get record called ', req.query);
     let id=req.query.id;
    let record=await db.getRow('products',id);
    trace.log(id,record.variants);
    let variants=[];
    for (let i=0;i<record.variants.length;i++) {
        variants[i]=record.variants[i].friendlyName
    }
    trace.log(variants);
    return res.json(variants);
}
*/ 