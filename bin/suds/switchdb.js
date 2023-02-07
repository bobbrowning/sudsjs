let trace = require('track-n-trace');
let sendView = require('./send-view');
let suds=require('../../config/suds');
let mergeAttributes = require('./merge-attributes');     // Standardises attributes for a table, filling in any missing values with defaults
let db = require('./db');                                // Database routines

module.exports = async function (req, res) {
 
      let newdb=req.query.newdb;
     mergeAttributes('clear-cache');
     suds.dbDriver=newdb;
     db.connect();
    res.send (`Database switched to ${suds[newdb].friendlyName}. 
    <br />
    <a href="${suds.mainPage}">admin page</a>`)
    return;
 


}