/* ****************************************************
* uique AJAX response.
*
* *************************************************** */
let suds = require('../../config/suds');
let trace = require('track-n-trace');
let db = require('../../bin/suds/db'); 

module.exports = async function (query) {
    trace.log('#get record called ', query);
     let id =      query.parentValue0;
     let variant = query.parentValue1;
    let record=await db.getRow('products',id);
    trace.log(id,record.variants);
    let variants=[];
    for (let i=0;i<record.variants.length; i++) {
        trace.log(i,record.variants[i].friendlyName, variant)
        if (record.variants[i].friendlyName==variant) {
            for (j=0; j<record.variants[i].subvariants.length; j++) {
                trace.log(j);
                variants[j]=record.variants[i].subvariants[j].friendlyName;
              }
             break;
        }
    }
    trace.log(variants);
    return ([variants,variants]);
}



/*
module.exports = async function (req, res) {
    trace.log('#get record called ', req.query);
     let id=req.query.id;
     let variant=req.query.variant_id;
    let record=await db.getRow('products',id);
    trace.log(id,record.variants);
    let variants=[];
    for (let i=0;i<record.variants.length; i++) {
        trace.log(i,record.variants[i].friendlyName, variant)
        if (record.variants[i].friendlyName==variant) {
            for (j=0; j<record.variants[i].subvariants.length; j++) {
                trace.log(j);
                variants[j]=record.variants[i].subvariants[j].friendlyName;
              }
             break;
        }
    }
    trace.log(variants);
    return res.json(variants);
}*/