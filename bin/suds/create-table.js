
let trace = require('track-n-trace');
let suds = require('../../config/suds');
const knex = require('knex')({
    client: suds[suds.dbDriver].client,
    connection: suds[suds.dbDriver].connection
}
);
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
        trace.log(exists);
        if (exists) {
            let msg = `Table ${table} exists - no action taken.<br />`;
            output += msg;
            console.log(msg);

        }
        else {
            let msg = `Creating table ${table}<br />`;
            output += msg;
            console.log(msg);

            let tableData = require('./table-data')(table, '#superuser#');

            let attributes = await mergeAttributes(table, '#superuser#');  // Merve field attributes in model with config.suds tables

            await knex.schema.createTable(table, function (t) {
                for (let key of Object.keys(attributes)) {
                    let type = 'string';
                    let length;
                    let places;
                    if (attributes[key].collection) { continue }
                    if (knextype[attributes[key].type]) { type = knextype[attributes[key].type] }
                    if (attributes[key].database.type) { type = attributes[key].database.type }
                    if (attributes[key].database.length) { length = attributes[key].database.length, places = 0; }
                    if (attributes[key].database.places) { places = attributes[key].database.places; }
                    if (attributes[key].autoincrement) { type = 'increments' };
                    trace.log(key, type, length, places);
                    if (key == tableData.primaryKey) {
                        t[type](key).primary();
                    }
                    else {
                        if (length) {
                            t[type](key, length, places);
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