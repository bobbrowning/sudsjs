"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../config/suds');
const tableDataFunction = require('./table-data');
const lang = require('../../config/language').EN;
const trace = require('track-n-trace');
const mergeAttributes = require('./merge-attributes');
const lookup = require('./lookup');
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
    async function (table, col, val) {
        return await lookup(mergeAttributes(table)[col], val);
    };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9va3VwLXZhbHVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9zdWRzL2xvb2t1cC12YWx1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2pELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUNoRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFDckQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ2xDLE1BQU0sWUFBWSxHQUFHLDJDQUEyQyxDQUFBO0FBQ2hFLE1BQU0sV0FBVyxHQUFHO3VEQUNtQyxDQUFBO0FBRXZEOzs7Ozs7OztJQVFJO0FBRUosTUFBTSxDQUFDLE9BQU87SUFFWixLQUFLLFdBQVcsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHO1FBQzdCLE9BQU8sTUFBTSxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZELENBQUMsQ0FBQSJ9