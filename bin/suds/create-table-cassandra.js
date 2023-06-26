"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const suds = require('../../config/suds');
const knex = require('knex')(suds.database);
const mergeAttributes = require('./merge-attributes');
module.exports = async function (req, res) {
    // trace.log({ input: arguments });
    let output = '';
    const knextype = {
        string: 'string',
        number: 'integer',
        boolean: 'boolean'
    };
    for (const table of suds.tables) {
        exists = await knex.schema.hasTable(table);
        if (exists) {
            const msg = `Table ${table} exists - no action taken.<br />`;
            output += msg;
            console.log(msg);
        }
        else {
            const msg = `Creating table ${table}<br />`;
            output += msg;
            console.log(msg);
            const tableData = require('./table-data')(table, '#superuser#');
            const attributes = await mergeAttributes(table, '#superuser#'); // Merve field attributes in model with config.suds tables
            await knex.schema.createTable(table, function (t) {
                for (const key of Object.keys(attributes)) {
                    let type = 'string';
                    let length;
                    let places;
                    if (attributes[key].collection) {
                        continue;
                    }
                    if (knextype[attributes[key].type]) {
                        type = knextype[attributes[key].type];
                    }
                    if (attributes[key].database.type) {
                        type = attributes[key].database.type;
                    }
                    if (attributes[key].database.length) {
                        length = attributes[key].database.length, places = 0;
                    }
                    if (attributes[key].database.places) {
                        places = attributes[key].database.places;
                    }
                    if (attributes[key].autoincrement) {
                        type = 'increments';
                    }
                    ;
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXRhYmxlLWNhc3NhbmRyYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9jcmVhdGUtdGFibGUtY2Fzc2FuZHJhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDM0MsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFFckQsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLEdBQUc7SUFDdkMsbUNBQW1DO0lBQ25DLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQTtJQUNmLE1BQU0sUUFBUSxHQUFHO1FBQ2YsTUFBTSxFQUFFLFFBQVE7UUFDaEIsTUFBTSxFQUFFLFNBQVM7UUFDakIsT0FBTyxFQUFFLFNBQVM7S0FDbkIsQ0FBQTtJQUVELEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUMvQixNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUMxQyxJQUFJLE1BQU0sRUFBRTtZQUNWLE1BQU0sR0FBRyxHQUFHLFNBQVMsS0FBSyxrQ0FBa0MsQ0FBQTtZQUM1RCxNQUFNLElBQUksR0FBRyxDQUFBO1lBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNqQjthQUFNO1lBQ0wsTUFBTSxHQUFHLEdBQUcsa0JBQWtCLEtBQUssUUFBUSxDQUFBO1lBQzNDLE1BQU0sSUFBSSxHQUFHLENBQUE7WUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBRWhCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUE7WUFFL0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxlQUFlLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFBLENBQUMsMERBQTBEO1lBRXpILE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQztnQkFDOUMsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUN6QyxJQUFJLElBQUksR0FBRyxRQUFRLENBQUE7b0JBQ25CLElBQUksTUFBTSxDQUFBO29CQUNWLElBQUksTUFBTSxDQUFBO29CQUNWLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRTt3QkFBRSxTQUFRO3FCQUFFO29CQUM1QyxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQUUsSUFBSSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7cUJBQUU7b0JBQzdFLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7d0JBQUUsSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFBO3FCQUFFO29CQUMzRSxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO3dCQUFFLE1BQU0sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFBO3FCQUFFO29CQUM3RixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO3dCQUFFLE1BQU0sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQTtxQkFBRTtvQkFDakYsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsYUFBYSxFQUFFO3dCQUFFLElBQUksR0FBRyxZQUFZLENBQUE7cUJBQUU7b0JBQUEsQ0FBQztvQkFDM0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtvQkFDcEMsSUFBSSxHQUFHLElBQUksU0FBUyxDQUFDLFVBQVUsRUFBRTt3QkFDL0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO3FCQUN2Qjt5QkFBTTt3QkFDTCxJQUFJLE1BQU0sRUFBRTs0QkFDVixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTt5QkFDN0I7NkJBQU07NEJBQ0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO3lCQUNiO3FCQUNGO2lCQUNGO1lBQ0gsQ0FBQyxDQUFDLENBQUE7U0FDSDtLQUNGO0lBRUQsTUFBTSxJQUFJLFlBQVksSUFBSSxDQUFDLFFBQVEsa0JBQWtCLENBQUE7SUFDckQsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNsQixDQUFDLENBQUEifQ==