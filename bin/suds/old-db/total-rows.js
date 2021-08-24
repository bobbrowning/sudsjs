
let trace = require('track-n-trace');
let suds = require('../../config/suds');
let getInstruction = require('./get-instruction');

const knex = require('knex')(suds.database);
/* ******************************************
    spec = {                                             // search specification
      andor: 'and',
      searches: [
        ['userType', 'eq', 'C'],
        ['fullName', 'contains', '#fullName']             // Name assigned in suds-home.js 
      ],
      sort: ['id', 'DESC'],
       limit: 20,
    }  

  creates an sql search and bindings * won't work with MONGO *
 
* **************************************** */

module.exports = async function (table, spec, col) {

    trace.log({ input: arguments });
    let countobj={};
     if (spec && spec.searches.length) {
        if (!spec.instruction) {
            spec.instruction = getInstruction(table, spec);
        }
        let instruction=spec.instruction[0];
        let bindings=spec.instruction[1];
        trace.log({table: table,  instruction: instruction, bindings: bindings});
       try {
        countobj = await knex(table).sum(col).whereRaw(instruction, bindings);
       }
       catch(err) {
         console.log(err);
       }
      }
    else {
        countobj = await knex(table).sum(col);       
    }
    let countkey = Object.keys(countobj[0])[0]
    let count = countobj[0][countkey];
    trace.log(count);


    return (count);
}


