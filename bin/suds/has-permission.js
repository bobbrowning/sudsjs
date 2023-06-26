"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const suds = require('../../config/suds');
const tableDataFunction = require('./table-data');
module.exports = function (permission, table, has) {
    trace.log({ permission, table, has });
    let hasPermission = false;
    // Superusers can do anything
    if (permission == '#superuser#') {
        return (true);
    }
    const tableData = tableDataFunction(table);
    // if the table is not mentioned in the suds.config file - no access
    // if (!sails.config.sudstables[table]) { return exits.success(false); }
    // if the table is mentioned but no permissions then no access
    if (!tableData.permission) {
        return (false);
    }
    // there is a permisiom table, so extract it.
    const tablePermission = tableData.permission;
    trace.log({ tablepermission: tablePermission });
    // This user is in the 'all' group for this table so can do anything
    if (tablePermission.all) {
        if (tablePermission.all.includes(permission)) {
            hasPermission = true;
        }
        if (tablePermission.all.includes('all')) {
            hasPermission = true;
        }
    }
    if (has == 'all') { // can this person do everything with this table
        if ((tablePermission.edit && tablePermission.edit.includes(permission)) &&
            (tablePermission.delete && tablePermission.delete.includes(permission)) &&
            (tablePermission.view && tablePermission.view.includes(permission))) {
            hasPermission = true;
        }
        if ((tablePermission.edit && tablePermission.edit.includes('all')) &&
            (tablePermission.delete && tablePermission.delete.includes('all')) &&
            (tablePermission.views && tablePermission.view.includes('all'))) {
            hasPermission = true;
        }
    } // end all
    if (has == 'any') {
        trace.log(tablePermission.view, permission);
        if ((tablePermission.all && tablePermission.all.includes(permission)) ||
            (tablePermission.edit && tablePermission.edit.includes(permission)) ||
            (tablePermission.delete && tablePermission.delete.includes(permission)) ||
            (tablePermission.view && tablePermission.view.includes(permission))) {
            hasPermission = true;
        }
        if ((tablePermission.all && tablePermission.all.includes('all')) ||
            (tablePermission.edit && tablePermission.edit.includes('all')) ||
            (tablePermission.delete && tablePermission.delete.includes('all')) ||
            (tablePermission.view && tablePermission.view.includes('all'))) {
            hasPermission = true;
        }
    } // end any
    if (has == 'edit' &&
        (tablePermission.edit && tablePermission.edit.includes(permission))) {
        hasPermission = true;
    }
    if (has == 'view' &&
        (tablePermission.view && tablePermission.view.includes(permission))) {
        hasPermission = true;
    }
    if (has == 'delete' &&
        (tablePermission.delete && tablePermission.delete.includes(permission))) {
        hasPermission = true;
    }
    if (has == 'edit' &&
        (tablePermission.all && tablePermission.all.includes('all'))) {
        hasPermission = true;
    }
    if (has == 'view' &&
        (tablePermission.view && tablePermission.view.includes('all'))) {
        hasPermission = true;
    }
    if (has == 'delete' &&
        (tablePermission.delete && tablePermission.delete.includes('all'))) {
        hasPermission = true;
    }
    // Don't check for 'none' because assumed there is no such permission set.
    trace.log(hasPermission);
    return (hasPermission);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzLXBlcm1pc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvaGFzLXBlcm1pc3Npb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDekMsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUE7QUFFakQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLFVBQVUsRUFBRSxLQUFLLEVBQUUsR0FBRztJQUMvQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFBO0lBQ3JDLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQTtJQUN6Qiw2QkFBNkI7SUFDN0IsSUFBSSxVQUFVLElBQUksYUFBYSxFQUFFO1FBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQUU7SUFDbEQsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDMUMsb0VBQW9FO0lBQ3BFLHdFQUF3RTtJQUN4RSw4REFBOEQ7SUFDOUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUU7UUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7S0FBRTtJQUU3Qyw2Q0FBNkM7SUFDN0MsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQTtJQUM1QyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUE7SUFDL0Msb0VBQW9FO0lBQ3BFLElBQUksZUFBZSxDQUFDLEdBQUcsRUFBRTtRQUN2QixJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQUUsYUFBYSxHQUFHLElB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