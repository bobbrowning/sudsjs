"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../config/suds');
const tableDataFunction = require('./table-data');
const lang = require('../../config/language').EN;
const trace = require('track-n-trace');
const db = require('./db');
const friendlyName = 'Look up text corresponding to field value';
const description = `Looks up the value in a values object in the table 
definition, or a linked table if this is a foreign key`;
/*
    inputs: {
      attributes: { type: 'ref' },      // Merged attributes of the field
      value: { type: 'ref' },           // Value of the field
      children: { type: 'number' },
      permission: { type: 'string' },    // Permission set of the current logged in user
    },

  */
module.exports =
    async function (attributes, val) {
        if (arguments[0] == suds.documentation) {
            return ({ friendlyName, description });
        }
        trace.log(arguments);
        let display = false;
        let value = val;
        /** The field is a key to another table.  */
        if (attributes.model) {
            trace.log(attributes.model);
            value = db.standardiseId(value);
            trace.log(attributes.model, value);
            if (value && value != 'NaN' && value != '0') {
                const tableData = tableDataFunction(attributes.model);
                if (tableData.stringify) {
                    trace.log({ table: attributes.model, value, stringify: tableData.stringify });
                    const record = await db.getRow(attributes.model, value); // linked parent record
                    trace.log(record);
                    if (record.err) {
                        display = `<span class="text-danger">${record.errmsg}</span>`;
                    }
                    else {
                        if (typeof (tableData.stringify) === 'string') {
                            display = record[tableData.stringify];
                        }
                        else {
                            display = await tableData.stringify(record);
                        }
                    }
                }
                else {
                    display = value;
                }
                trace.log(display);
                let listLink = lang.listParentLink;
                if (attributes.child === false) {
                    listLink = lang.listLink;
                }
                let openLink = '';
                if (attributes.display.openGroup) {
                    openLink += `&opengroup=${attributes.display.openGroup}`;
                }
                if (attributes.display.open) {
                    openLink += `&open=${attributes.display.open}`;
                }
                display += `
            &nbsp;<a href="${suds.mainPage}?table=${attributes.model}&mode=listrow&id=${value}${openLink}" >
            ${listLink} 
          </a>`;
            }
            else {
                display = lang.notSpecified;
            }
        }
        /** Look up text based on values in the table definition onbject.
         * This may be:
         * - a function
         * - an array of valid values in which case no action
         * - an object
         */
        else {
            if (attributes.values && value) {
                if (typeof attributes.values === 'function') {
                    const lvObject = attributes.values();
                    if (Array.isArray(lvObject)) {
                        return (value);
                    }
                    display = lvObject[value];
                }
                else {
                    if (Array.isArray(attributes.values)) {
                        display = value;
                    }
                    else {
                        if (typeof attributes.values === 'string') {
                            const values = require(`../../config/${attributes.values}`);
                            display = values[value];
                        }
                        else {
                            display = attributes.values[value];
                        }
                    }
                }
            }
            else {
                display = value;
            }
        }
        trace.log(display);
        return (display);
    };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9va3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9zdWRzL2xvb2t1cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2pELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUNoRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBRTFCLE1BQU0sWUFBWSxHQUFHLDJDQUEyQyxDQUFBO0FBQ2hFLE1BQU0sV0FBVyxHQUFHO3VEQUNtQyxDQUFBO0FBRXZEOzs7Ozs7OztJQVFJO0FBRUosTUFBTSxDQUFDLE9BQU87SUFFWixLQUFLLFdBQVcsVUFBVSxFQUFFLEdBQUc7UUFDN0IsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUFFLE9BQU8sQ0FBQyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFBO1NBQUU7UUFDbEYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNwQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUE7UUFDbkIsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFBO1FBQ2YsNENBQTRDO1FBQzVDLElBQUksVUFBVSxDQUFDLEtBQUssRUFBRTtZQUNwQixLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUMzQixLQUFLLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUMvQixLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUs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