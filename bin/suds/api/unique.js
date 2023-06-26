"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* ****************************************************
* uique AJAX response.
*
* *************************************************** */
const suds = require('../../../config/suds');
const trace = require('track-n-trace');
const tableDataFunction = require('../table-data');
const db = require('../db');
module.exports = async function (req, res) {
    trace.log('#unique called ', req.query);
    const table = req.query.table;
    const tableData = tableDataFunction(table, '#superuser#');
    const fieldName = req.query.field;
    const fieldValue = req.query.value;
    const count = await db.countRows(table, {
        andor: 'and',
        searches: [
            [fieldName, 'eq', fieldValue],
            ['id', 'ne', req.query.id]
        ]
    });
    trace.log(count);
    if (count == 0) {
        return res.json(['OK']);
    }
    else {
        return res.json([
            'validationError',
            'Sorry that is not unique. '
        ]);
    }
    //  return array
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pcXVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Jpbi9zdWRzL2FwaS91bmlxdWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7O3dEQUd3RDtBQUN4RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUM1QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDbEQsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBRTNCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHO0lBQ3ZDLEtBQUssQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3ZDLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFBO0lBQzdCLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUN6RCxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQTtJQUNqQyxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQTtJQUNsQyxNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFO1FBQ3RDLEtBQUssRUFBRSxLQUFLO1FBQ1osUUFBUSxFQUFFO1lBQ1IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQztZQUM3QixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7U0FDM0I7S0FDRixDQUFDLENBQUE7SUFDRixLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hCLElBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtRQUNkLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDeEI7U0FBTTtRQUNMLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztZQUNkLGlCQUFpQjtZQUNqQiw0QkFBNEI7U0FDN0IsQ0FBQyxDQUFBO0tBQ0g7SUFDRCxnQkFBZ0I7QUFDbEIsQ0FBQyxDQUFBIn0=