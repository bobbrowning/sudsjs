"use strict";
/**
 * Create a pair of arrays containing values and corresponding descriptions
 * to use is a select, chekboxes etc.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tableDataFunction = require('../table-data');
// let getRows = require('../get-rows');
const db = require('../db');
module.exports = async function (attributes, record) {
    const trace = require('track-n-trace');
    trace.log(arguments);
    let linkedTable = '';
    if (attributes.model) {
        linkedTable = attributes.model;
    }
    if (attributes.input.linkedTable)
        linkedTable = attributes.input.linkedTable;
    const values = [];
    const labels = [];
    if (linkedTable) {
        trace.log(linkedTable);
        const tableData = tableDataFunction(linkedTable);
        let pk = tableData.primaryKey;
        if (!pk) {
            pk = 'id';
        }
        let stringify = function (data) { return (data[pk]); };
        if (tableData.stringify) {
            if (typeof tableData.stringify === 'function') {
                stringify = tableData.stringify;
            }
            else {
                stringify = function (data) { return (data[tableData.stringify]); };
            }
        }
        trace.log(stringify);
        const search = {};
        if (attributes.input.search) {
            if (attributes.input.search.andor) {
                search.andor = attributes.input.search.andor;
            }
            search.searches = [];
            for (let i = 0; i < attributes.input.search.searches.length; i++) {
                trace.log(i, attributes.input.search.searches[i]);
                let itemValue = attributes.input.search.searches[i][2];
                if (itemValue.substr(0, 1) == '$') {
                    itemValue = record[itemValue.substr(1)];
                }
                if (!itemValue) {
                    break;
                }
                search.searches[i] = [];
                search.searches[i][0] = attributes.input.search.searches[i][0];
                search.searches[i][1] = attributes.input.search.searches[i][1];
                search.searches[i][2] = value;
            }
        }
        records = await db.getRows(linkedTable, search);
        for (let i = 0; i < records.length; i++) {
            trace.log(records[i]);
            values[i] = records[i][pk];
            labels[i] = await stringify(records[i]);
        }
    }
    else {
        if (attributes.values) {
            if (typeof attributes.values === 'function') {
                const lvObject = attributes.values();
                for (const key of Object.keys(lvObject)) {
                    values.push(key);
                    labels.push(lvObject[key]);
                }
            }
            else {
                if (Array.isArray(attributes.values)) {
                    for (let i = 0; i < attributes.values.length; i++) {
                        values[i] = labels[i] = attributes.values[i];
                    }
                }
                else {
                    if (typeof attributes.values === 'string') {
                        const lookup = require(`../../../config/${attributes.values}`);
                        for (const key of Object.keys(lookup)) {
                            values.push(key);
                            labels.push(lookup[key]);
                        }
                    }
                    else {
                        for (const key of Object.keys(attributes.values)) {
                            values.push(key);
                            labels.push(attributes.values[key]);
                        }
                    }
                }
            }
        }
        else {
            console.log(`No source for ${attributes.friendlyName}`);
            return ('No source');
        }
    }
    trace.log({ values, labels });
    return ([values, labels]);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LWxhYmVscy12YWx1ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmluL3N1ZHMvaW5wdXQvZ2V0LWxhYmVscy12YWx1ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7R0FHRzs7QUFFSCxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUNsRCx3Q0FBd0M7QUFDeEMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBRTNCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLFVBQVUsRUFBRSxNQUFNO0lBQ2xELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUNyQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3BCLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQTtJQUNwQixJQUFJLFVBQVUsQ0FBQyxLQUFLLEVBQUU7UUFBRSxXQUFXLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQTtLQUFFO0lBQ3hELElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxXQUFXO1FBQUUsV0FBVyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFBO0lBRTVFLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTtJQUNqQixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUE7SUFFakIsSUFBSSxXQUFXLEVBQUU7UUFDZixLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ3RCLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ2hELElBQUksRUFBRSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUE7UUFDN0IsSUFBSSxDQUFDLEVBQUUsRUFBRTtZQUFFLEVBQUUsR0FBRyxJQUFJLENBQUE7U0FBRTtRQUN0QixJQUFJLFNBQVMsR0FBRyxVQUFVLElBQUksSUFBSSxPQUFPLENBQUMs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