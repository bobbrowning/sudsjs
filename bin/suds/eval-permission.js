"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const suds = require('../../config/suds');
const tableDataFunction = require('./table-data');
module.exports = function (permission, toEval, has) {
    /**  Given eval={all: xxx , view: yyy} works out if this user has permission to 'has' */
    trace.log({ permission, toeval: toEval, has });
    let hasPermission = false;
    // Superusers can do anything
    if (permission == '#superuser#') {
        return (true);
    }
    // This user is in the 'all' group for this table so can do anything
    if (toEval.all) {
        if (toEval.all.includes(permission)) {
            hasPermission = true;
        }
        if (toEval.all.includes('all')) {
            hasPermission = true;
        }
    }
    if (has == 'all') { // can this person do everything with this table
        if ((toEval.edit && toEval.edit.includes(permission)) &&
            (toEval.delete && toEval.delete.includes(permission)) &&
            (toEval.view && toEval.view.includes(permission))) {
            hasPermission = true;
        }
        if ((toEval.edit && toEval.edit.includes('all')) &&
            (toEval.delete && toEval.delete.includes('all')) &&
            (toEval.views && toEval.view.includes('all'))) {
            hasPermission = true;
        }
    } // end all
    if (has == 'any') {
        trace.log(toEval.view, permission);
        if ((toEval.all && toEval.all.includes(permission)) ||
            (toEval.edit && toEval.edit.includes(permission)) ||
            (toEval.delete && toEval.delete.includes(permission)) ||
            (toEval.view && toEval.view.includes(permission))) {
            hasPermission = true;
        }
        if ((toEval.all && toEval.all.includes('all')) ||
            (toEval.edit && toEval.edit.includes('all')) ||
            (toEval.delete && toEval.delete.includes('all')) ||
            (toEval.view && toEval.view.includes('all'))) {
            hasPermission = true;
        }
    } // end any
    if (has == 'edit' &&
        (toEval.edit && toEval.edit.includes(permission))) {
        hasPermission = true;
    }
    if (has == 'view' &&
        (toEval.view && toEval.view.includes(permission))) {
        hasPermission = true;
    }
    if (has == 'delete' &&
        (toEval.delete && toEval.delete.includes(permission))) {
        hasPermission = true;
    }
    if (has == 'edit' &&
        (toEval.all && toEval.all.includes('all'))) {
        hasPermission = true;
    }
    if (has == 'view' &&
        (toEval.view && toEval.view.includes('all'))) {
        hasPermission = true;
    }
    if (has == 'delete' &&
        (toEval.delete && toEval.delete.includes('all'))) {
        hasPermission = true;
    }
    // Don't check for 'none' because assumed there is no such permission set.
    trace.log(hasPermission);
    return (hasPermission);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbC1wZXJtaXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9zdWRzL2V2YWwtcGVybWlzc2lvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN0QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUN6QyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUVqRCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHO0lBQ2hELHdGQUF3RjtJQUN4RixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUM5QyxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUE7SUFDekIsNkJBQTZCO0lBQzdCLElBQUksVUFBVSxJQUFJLGFBQWEsRUFBRTtRQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUFFO0lBRWxELG9FQUFvRTtJQUNwRSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUU7UUFDZCxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQUUsYUFBYSxHQUFHLElBQUksQ0FBQTtTQUFFO1FBQzdELElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFBRSxhQUFhLEdBQUcsSUFBSSxDQUFBO1NBQUU7S0FDekQ7SUFDRCxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUUsRUFBRSxnREFBZ0Q7UUFDbEUsSUFDRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDakQsQ0FBQyxNQUFNLENBQUMs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