"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../config/suds');
const trace = require('track-n-trace');
const humanise = require('./humanise-fieldname');
const mergeAttributes = require('./merge-attributes');
module.exports = function (table, permission) {
    // merge extra attributes with attributes
    trace.log({ inputs: arguments, level: 'verbose' });
    if (!suds.tables.includes(table)) { // Check that table exists in model.
        throw new error('Error in suds.js - table does not exist: ' + table);
    }
    const merged = {};
    let schema = `${table}.js`;
    if (suds.jsonSchema.includes(table))
        schema = `${table}.json`;
    let tableData;
    try {
        tableData = require(`../../tables/${schema}`);
    }
    catch (err) {
        throw new Error(`can't load ${schema}`);
    }
    trace.log({ tabledata: tableData, level: 'verbose' });
    let properties = mergeAttributes(table);
    /** compatibility with legacy data */
    if (tableData.rowTitle) {
        tableData.stringify = tableData.rowTitle;
    }
    ;
    /* sometimes we just pass tabledata as a parameter */
    merged.tableName = table;
    for (const key of Object.keys(tableData)) {
        // merged is a merge of the attributes in the model with the extra attributes in the
        // suds config file.  These give field properties for things like the input type
        // and dipsplay format.
        // loop through fields (columns) in the table
        if (key != 'attributes') {
            merged[key] = tableData[key];
            trace.log(key, merged[key], { level: 'verbose' });
        }
    }
    let standardHeader = {};
    if (tableData.standardHeader) {
        standardHeader = require('../../config/standard-header')[suds[suds.dbDriver].standardHeader];
    }
    /** default priomary key t the first field */
    if (!merged.primaryKey) {
        merged.primaryKey = properties[Object.keys(properties)[0]];
    }
    /* add primary key as a top level value in the tableData object. */
    for (const key of Object.keys(properties)) {
        if (properties[key].primaryKey) {
            merged.primaryKey = key;
        }
        if (properties[key].process && properties[key].process.type == 'createdAt') {
            merged.createdAt = key;
        }
        if (properties[key].process && properties[key].process.type == 'updatedAt') {
            merged.updatedAt = key;
        }
    }
    /* If we haven't found one then use the first autoincrement field we find */
    if (!merged.primaryKey) {
        for (const key of Object.keys(properties)) {
            if (properties[key].autoincrement) {
                merged.primaryKey = key;
                break;
            }
        }
    }
    trace.log({ primaryKey: tableData.primaryKey, level: 'verbose' });
    if (!merged.friendlyName) {
        merged.friendlyName = humanise(table);
    }
    trace.log(merged.friendlyName);
    if (!merged.description) {
        merged.description = table;
    }
    if (!merged.edit) {
        merged.edit = {};
    }
    if (!merged.list) {
        merged.list = {};
    }
    if (!merged.groups) {
        merged.groups = {};
    }
    /* Superused can do anything.  If there is no permission for the table then */
    /* eveyone can do anything - so in either case - all done.                  */
    if (permission == '#superuser#' || !merged.permission) {
        merged.canView = true;
        merged.canEdit = true;
        merged.canDelete = true;
        return (merged);
    }
    merged.canView = false;
    merged.canEdit = false;
    merged.canDelete = false;
    if (merged.permission.view) { // If there is a specific view permission
        if (merged.permission.view.includes('all') || // and it doesn't include all
            merged.permission.view.includes(permission) // and it doesn't include this user
        ) {
            merged.canView = true; // then can't view
        }
    }
    if (merged.permission.edit) { // If there is a specific edit permission
        if (merged.permission.edit.includes('all') || // and it doesn't include all
            merged.permission.edit.includes(permission) // and it doesn't include this user
        ) {
            merged.canEdit = true; // then can't edit
        }
    }
    if (merged.permission.delete) { // If there is a specific edit permission
        if (merged.permission.delete.includes('all') || // and it doesn't include all
            merged.permission.delete.includes(permission) // and it doesn't include this user
        ) {
            merged.canDelete = true; // then can't edit
        }
    }
    if (merged.permission.all) { // If there is a specific edit permission
        if (merged.permission.all.includes('all') || // and it doesn't include all
            merged.permission.all.includes(permission) // and it doesn't include this user
        ) {
            merged.canView = true;
            merged.canEdit = true;
            merged.canDelete = true;
        }
    }
    trace.log({ table, canedit: merged.canEdit, canView: merged.canView, permission, mergedpermission: merged.permission, tableData: merged, maxdepth: 3, level: 'verbose' });
    // trace.log({edit:merged, level: 'bob'});
    return (merged);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy90YWJsZS1kYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDekMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0FBRXJELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLEVBQUUsVUFBVTtJQUMxQyx5Q0FBeUM7SUFDekMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsb0NBQW9DO1FBQ3RFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLEdBQUcsS0FBSyxDQUFDLENBQUE7S0FDckU7SUFDRCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUE7SUFDakIsSUFBSSxNQUFNLEdBQUcsR0FBRyxLQUFLLEtBQUssQ0FBQztJQUMzQixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUFFLE1BQU0sR0FBRyxHQUFHLEtBQUssT0FBTyxDQUFBO0lBQzdELElBQUksU0FBUyxDQUFBO0lBQ2IsSUFBSTtRQUNGLFNBQVMsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLE1BQU0sRUFBRSxDQUFDLENBQUE7S0FDOUM7SUFDRCxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsY0FBYyxNQUFNLEVBQUUsQ0FBQyxDQUFB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