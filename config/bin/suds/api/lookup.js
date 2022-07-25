/** ****************************************************
 * 
 * automplete  response.
 * returns set of table rows depending on what has been typed in.
 * Input data 
 *    - object: object to be searched
 *    - display: feld to display if no display function.
 *    - term
 *    - limit
 *    - andor
 *    - searchfield_1   (_2, _3 etc)
 *    - compare_1   (_2, _3 etc)
 *    - value_1   (_2, _3 etc)
 *     
 *  If the term is numeric also looks for an exact match with 
 *  the record key 
 * 
 * returns [labels, values] where labels and values 
 * are matching arrays
 * 
 * *************************************************** */
let suds = require('../../../config/suds');
let trace = require('track-n-trace');



module.exports = async function (req, res) {
    trace.log('#lookup called ', req.query);
    let allParms = req.query;
    let source = allParms.linkedtable;

    /**
     * Sort out the field to be displayed, or the function that returns the 
     * displayed text.
     */
    let display = allParms.display;
    let displayFunction = false;
    let term = allParms.term;
    let limit = Number(allParms.limit);
    trace.log({ source: source, term: term, limit: limit });
    /**
     * Created the sort specification from the supplied data.
     */


    let labels = [];
    let values = [];
    let records = require(`../../../config/${source}`);
 
    let len = term.length;
    let i=0;
    for (key of Object.keys(records)) {
        trace.log(records[key],term,len);
        if (records[key].includes(term)) {
            trace.log('match');
            labels.push(records[key]);
            values.push(key);
            if(i++>limit){break}
        }
    }


    names = [labels, values];
    trace.log('#58 ', names);

    //  return array
    return res.json(names);
}