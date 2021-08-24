


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
let tableDataFunction = require('./table-data');


module.exports = async function(permission,table,id) {
  trace = require('track-n-trace');
 trace.log({ start: 'Delete table row', inputs: arguments, break: '#', level: 'min' });
 let mainPage = suds.mainPage;
 let tableData=tableDataFunction(table);
 if (!mainPage) { mainPage = '/'; }
 let message = 'Deleting record';

  try {
    let condition={};
    condition[tableData.primaryKey]=id;
    await knex(table).where(condition).del();
   
  } catch (err) {
    console.log(`Database error deleting Row ${id} in table ${table} `, err);
    message = 'Unexpected error 51';
  }
  output = `
    <h2>${message}</h2>
    <DIV CLASS="footerlinks">
   
     <button class="btn btn-primary" onclick="window.location='${mainPage}?table=${table}&mode=list'">${lang.tableList}</button>
         <button class="btn btn-primary" onclick="window.location='${mainPage}'">${lang.backToTables}</button>
  </DIV>
`;
  return (output);


}

