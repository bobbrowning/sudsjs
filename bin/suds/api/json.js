/* ****************************************************
* uique AJAX response.
*
* *************************************************** */
let suds = require('../../../config/suds');
let trace = require('track-n-trace');
let db = require('../'+suds.dbDriver);

module.exports = async function (req, res) {
    trace.log('#json called ', req.query);
    let table = req.query.table;
     let fieldValue = req.query.value;
     let obj;
    try {
        obj = JSON.parse(fieldValue);
   
    }
    catch(err) {
        trace.log({err:err.message,type: Array.isArray(err)});
        let more='';
        let idx=err.message.match(/(position )([0-9]*)/);
        let pos=Number(idx[2]);
        trace.log(pos);
        more=fieldValue.substring(pos-8,pos+8)
        return res.json([
            'validationError',
            `${err.message} - around this (<b>${more}</b>)`,
        ]);
    }
    trace.log(obj);
    return res.json(['OK']); 
}