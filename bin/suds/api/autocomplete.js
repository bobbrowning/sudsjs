"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** ****************************************************
 *
 * automplete  response.
 * returns set of table rows depending on what has been typed in.
 * Input data
 *    - linkedtable: table to be searched
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
const suds = require('../../../config/suds');
const trace = require('track-n-trace');
const tableDataFunction = require('../table-data');
const db = require('../db');
module.exports = async function (req, res) {
    trace.log('#autocomplete called ', req.query, req.session);
    const allParms = req.query;
    const linkedTable = req.query.linkedtable;
    const permission = req.session.permission;
    trace.log(permission, linkedTable);
    /**
     * Sort out the field to be displayed, or the function that returns the
     * displayed text.
     */
    const tableData = tableDataFunction(linkedTable, permission);
    trace.log(tableData);
    if (!permission || !tableData.canView) {
        const names = [['You do not have permission to access this table'], [0]];
        trace.log('#43 ', names);
        return res.json(names);
    }
    /** display is field to be displayed
     * displayFunction is function to create string
     */
    let display = false;
    let displayFunction = false;
    if (allParms.display) {
        display = allParms.display;
    }
    else {
        if (tableData.stringify) {
            if (typeof tableData.stringify === 'string') {
                display = tableData.stringify;
            }
            else {
                displayFunction = tableData.stringify;
            }
        }
    }
    if (!display && !displayFunction) {
        trace.log(allParms.display, tableData.stringify);
        return res.json([['No stringify field or function has been defined - please check the configuration'], []]);
    }
    trace.log(display);
    const term = allParms.term;
    const limit = Number(allParms.limit);
    trace.log({ linkedTable, term, limit });
    /**
     * Created the sort specification from the supplied data.
     */
    const search = {
        andor: 'and',
        limit,
        searches: []
    };
    if (req.query.sortfield) {
        search.sort = [req.query.sortfield, req.query.sortdirection];
    }
    if (allParms.andor) {
        search.andor = allParms.andor;
    }
    for (let i = 0; i < suds.search.maxConditions; i++) {
        j = i + 1;
        let value = allParms['value_' + j];
        if (value == '#input') {
            value = term;
        }
        if (value == 'true') {
            value = true;
        }
        if (value == 'false') {
            value = false;
        }
        if (allParms['searchfield_' + j]) {
            search.searches[i] = [allParms['searchfield_' + j], allParms['compare_' + j], value];
        }
    }
    /**
     * store names and IDs arrays of labels/values
     */
    let names = [];
    const labels = [];
    const values = [];
    const records = await db.getRows(linkedTable, search);
    trace.log({ records, display });
    for (let i = 0; i < records.length; i++) {
        trace.log(i, labels.length);
        let show;
        if (display) {
            show = records[i][display];
        }
        else {
            if (typeof (tableData.stringify) === 'string') {
                show = records[i][tableData.stringify];
            }
            else {
                show = await tableData.stringify(records[i]);
            }
            //     show = displayFunction(records[i]);
        }
        trace.log(tableData.stringify, i, show, records[i]);
        /*
            names[i] = {};
            names[i].label = records[i][tableData.primaryKey] + ':' + show;
            names[i].value = show;
        */
        labels.push(show);
        values.push(records[i][tableData.primaryKey]);
    }
    const id = Number(term);
    if (!isNaN(id)) {
        const record = await db.getRow(id);
        if (record) {
            let show;
            if (display) {
                show = record[display];
            }
            else {
                if (typeof (tableData.stringify) === 'string') {
                    show = record[tableData.stringify];
                }
                else {
                    show = await tableData.stringify(record);
                }
                //          show = await displayFunction(record);
            }
            trace.log('34', i, display, record);
            /*
                  let label = record[tableData.primaryKey] + ':' + show;
                  let value = show;
      
                  names.push({ label: label, value: value });
                  */
            labels.push(show);
            values.push(record[tableData.primaryKey]);
        }
    }
    names = [labels, values];
    trace.log('#58 ', names);
    //  return array
    return res.json(names);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2NvbXBsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Jpbi9zdWRzL2FwaS9hdXRvY29tcGxldGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7eURBb0J5RDtBQUN6RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUM1QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDbEQsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBRTNCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHO0lBQ3ZDLEtBQUssQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDMUQsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQTtJQUMxQixNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQTtJQUN6QyxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQTtJQUN6QyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUNsQzs7O09BR0c7SUFDSCxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUE7SUFDNUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNwQixJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRTtRQUNyQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsaURBQWlELENBQUMsRUFBRSxDQUFDLENB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