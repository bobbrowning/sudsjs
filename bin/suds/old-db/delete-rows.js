


/* 

  friendlyName: 'Delete table row',
  description: 'Delete table row.',
  inputs: {
    permission: {
      type: 'string',
      description: 'The permission set of the logged-in user',
    },
    table: {
      type: 'string',
      description: 'The table being listed',
    },
    id: {
      type: 'number',
      description: 'The key of the row being listed',
    },
  },
*/

let trace = require('track-n-trace');
let suds = require('../../config/suds');
let classes = require('../../config/classes');
let lang = require('../../config/language')['EN'];
const knex = require('knex')(suds.database);


module.exports = async function (table, spec) {
  trace.log({ input: arguments });
  if (spec && spec.searches.length) {
    if (!spec.instruction) {
      spec.instruction = getInstruction(table, spec);
    }
    let instruction = spec.instruction[0];
    let bindings = spec.instruction[1];


    try {
      await knex(table).whereRaw(instruction, bindings).del();

    } catch (err) {
      console.log(`Database error deleting Rows in table ${table} `, err);
      message = 'Unexpected error 51';
    }
    output = `
    <h2>Deleting records</h2>
    <DIV CLASS="footerlinks">
   
     <button class="btn btn-primary" onclick="window.location='${suds.mainPage}?table=${table}&mode=list'">${lang.tableList}</button>
         <button class="btn btn-primary" onclick="window.location='${suds.mainPage}'">${lang.backToTables}</button>
  </DIV>
`;
  }
  else {
    output = `
    <h2>Deleting records failed - no search specification</h2>
     
    <DIV CLASS="footerlinks">
   
     <button class="btn btn-primary" onclick="window.location='${suds.mainPage}?table=${table}&mode=list'">${lang.tableList}</button>
         <button class="btn btn-primary" onclick="window.location='${suds.mainPage}'">${lang.backToTables}</button>
  </DIV>
`;    
  }
  return (output);


}

