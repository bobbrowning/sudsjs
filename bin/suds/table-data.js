const suds = require('../../config/suds');
let trace = require('track-n-trace');
const { attributes } = require('../../tables/user');
let humanise = require('./humanise-fieldname');


module.exports = function (table, permission) {
  // merge extra attributes with attributes 
  trace.log({ inputs: arguments, level: `verbose` });

  let merged = {}
  let tableData = require('../../tables/' + table);

  if (!suds.tables.includes(table)) {    // Check that table exists in model.
    console.log('Error in suds.js - table does not exist: ' + table);
    return ({});
  }

  for (let key of Object.keys(tableData)) {
    // merged is a merge of the attributes in the model with the extra attributes in the 
    // suds config file.  These give field properties for things like the input type 
    // and dipsplay format.  
    // loop through fields (columns) in the table
    if (key != 'attributes') {
      merged[key] = tableData[key]
      trace.log(merged[key], {level: 'verbose'});
    }
  }

  /* add primary key as a top level value in the tableData object. */
  for (let key of Object.keys(tableData.attributes)) {
    if (tableData.attributes[key].primaryKey) {
      merged.primaryKey = key;
      break;
    }
  }
  /* If we haven't found one then use the first autoincrement field we find */
  if (!merged.primaryKey) {
    for (let key of Object.keys(tableData.attributes)) {
      if (tableData.attributes[key].autoincrement) {
        merged.primaryKey = key;
        break;
      }
    }
  }
  trace.log({ primaryKey: tableData.primaryKey, level: 'verbose' });

  if (!merged.friendlyName) { merged.friendlyName = humanise(table); }
  trace.log(merged.friendlyName);

  if (!merged.description) { merged.description = table; }
  if (!merged.edit) { merged.edit = {}; }
  if (!merged.list) { merged.list = {}; }

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

  if (merged.permission.view) {                       // If there is a specific view permission
    if (merged.permission.view.includes('all')         // and it doesn't include all
      || merged.permission.view.includes(permission)    // and it doesn't include this user
    ) {
      merged.canView = true;                             // then can't view
    }
  }

  if (merged.permission.edit) {                       // If there is a specific edit permission
    if (merged.permission.edit.includes('all')         // and it doesn't include all
      || merged.permission.edit.includes(permission)    // and it doesn't include this user
    ) {
      merged.canEdit = true;                             // then can't edit
    }
  }

  if (merged.permission.delete) {                         // If there is a specific edit permission
    if (merged.permission.delete.includes('all')         // and it doesn't include all
      || merged.permission.delete.includes(permission)    // and it doesn't include this user
    ) {
      merged.canDelete = true;                             // then can't edit
    }
  }

  if (merged.permission.all) {                         // If there is a specific edit permission
    if (merged.permission.all.includes('all')         // and it doesn't include all
      || merged.permission.all.includes(permission)    // and it doesn't include this user
    ) {
      merged.canView = true;
      merged.canEdit = true;
      merged.canDelete = true;
    }
  }

  trace.log({ canedit: merged.canEdit, permission: permission, mergedpermission: merged.permission, tableData: merged, maxdepth: 3, level: 'verbose' });
  // trace.log({edit:merged, level: 'bob'});

  return (merged);
}

