"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Create a pair of arrays containing values and corresponding descriptions
 * to use in select, chekboxes etc.
 */
const { trace } = require('console');
const suds = require('../../config/suds');
const tableDataFunction = require('./table-data');
const db = require('./db');
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
    trace.log(attributes.values);
    if (linkedTable) {
        trace.log(linkedTable);
        const tableData = tableDataFunction(linkedTable);
        let pk = tableData.primaryKey;
        if (!pk) {
            pk = 'id';
        }
        let stringify = function (record) { return (record[pk]); };
        if (tableData.stringify) {
            stringify = tableData.stringify;
        }
        const search = {};
        if (attributes.input.search) {
            if (attributes.input.search.andor) {
                search.andor = attributes.input.search.andor;
            }
            search.searches = [];
            for (let i = 0; i < attributes.input.search.searches.length; i++) {
                trace.log(i, attributes.input.search.searches[i]);
                let value = attributes.input.search.searches[i][2];
                if (value.substr(0, 1) == '$') {
                    value = record[value.substr(1)];
                }
                if (!value) {
                    break;
                }
                search.searches[i] = [];
                search.searches[i][0] = attributes.input.search.searches[i][0];
                search.searches[i][1] = attributes.input.search.searches[i][1];
                search.searches[i][2] = value;
            }
        }
        let records = await db.getRows(linkedTable, search);
        for (let i = 0; i < records.length; i++) {
            trace.log(records[i]);
            values[i] = records[i][pk];
            //   values[i]=db.stringifyId(values[i]);
            if (typeof (stringify) === 'function') {
                labels[i] = await stringify(records[i]);
            }
            else {
                labels[i] = records[i][stringify];
            }
        }
    }
    else {
        if (attributes.values) {
            if (typeof attributes.values === 'function') {
                const lvObject = attributes.values();
                if (Array.isArray(lvObject)) {
                    for (let i = 0; i < lvObject.length; i++) {
                        values[i] = labels[i] = lvObject[i];
                    }
                }
                else {
                    for (const key of Object.keys(lvObject)) {
                        values.push(key);
                        labels.push(lvObject[key]);
                    }
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
                        const lookup = require(`../../config/${attributes.values}`);
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
    }
    trace.log({ values, labels });
    return ([values, labels]);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LWxhYmVscy12YWx1ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvZ2V0LWxhYmVscy12YWx1ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7O0dBR0c7QUFDSCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3BDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2pELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUUxQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssV0FBVyxVQUFVLEVBQUUsTUFBTTtJQUNqRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDdEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNwQixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUE7SUFDcEIsSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFO1FBQUUsV0FBVyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUE7S0FBRTtJQUN4RCxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVztRQUFFLFdBQVcsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQTtJQUU1RSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUE7SUFDakIsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFBO0lBQ2pCLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBRTVCLElBQUksV0FBVyxFQUFFO1FBQ2YsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN0QixNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUNoRCxJQUFJ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