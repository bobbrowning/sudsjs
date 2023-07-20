
import {  LabelsValues } from "../types";
/** ************************************************
 * Given an exam subject key, the program returns the 
 * list of papers as labels/values array array.
 ***************************************************** */
 let trace = require('track-n-trace');
 let suds = require('../../config/suds');
 import { Record } from '../types'
 let db = require('../suds/db');
module.exports=  async function (query:Record) : Promise<LabelsValues> {
    trace.log(query);
    let exam=query.parentValue0;
    if (!exam) {
        return ([[],[]])
    }
    let examDoc = await db.getRow('subjectsdenorm',exam)
    if (examDoc.err) {
        return([['error'],['examDoc.msg']])
    }
    let labels: string[]=[];
    let values: string[]=[];
    trace.log(examDoc);
    for (let i=0; i<examDoc.papers.length; i++){ 
       values[i]=examDoc.papers[i].name; 
       labels[i]=values[i]
    }
    trace.log(labels,values)
    return ([labels,values]); 
}

