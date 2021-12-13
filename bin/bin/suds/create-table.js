
let trace = require('track-n-trace');
let suds = require('../../config/suds');
const knex = require('knex')(suds.database);
let mergeAttributes = require('./merge-attributes');


module.exports = async function (req, res) {
    // trace.log({ input: arguments });
    let output = '';
    let knextype = {
        string: 'string',
        number: 'integer',
        boolean: 'boolean',
    };
 
    for (let table of suds.tables) {
        exists = await knex.schema.hasTable(table);
        console.log('exists:', exists)
        if (exists) {
            output += `Table ${table} exists - no action taken.<br />`;

        }
        else {
            output += `Creating table ${table}<br />`;

            let type = 'string';
            let length;
            let tableData = require('./table-data')(table, '#superuser#');

            let attributes = await mergeAttributes(table, '#superuser#');  // Merve field attributes in model with config.suds tables

            await knex.schema.createTable(table, function (t) {
                for (let key of Object.keys(attributes)) {
                    if (attributes[key].collection) {continue}
                    if (knextype[attributes[key].type]) { type = knextype[attributes[key].type] }
                    if (attributes[key].database.type) { type = attributes[key].database.type }
                    if (attributes[key].database.length) { length = attributes[key].database.length, places=0; }
                    if (attributes[key].database.places) { places = attributes[key].database.places; }
                    if (attributes[key].autoincrement) { type = 'increments' };

                    if (key == tableData.primaryKey) {
                        t[type](key).primary();
                    }
                    else {
                        if (length) {
                            t[type](key, length,places);
                        }
                        else {
                            t[type](key);
                        }
                    }
                }
            });
        }
    }

    output += `<a href="${suds.mainPage}">admin page</a>`;
    res.send(output);
}