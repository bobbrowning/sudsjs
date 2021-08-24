let trace = require('track-n-trace');
const suds = require('../../config/suds');
let tableDataFunction = require('./table-data');

module.exports = function (permission, table, has) {
  trace.log({ permission: permission, table: table, has: has });
  let hasPermission = false;
  // Superusers can do anything
  if (permission == '#superuser#') { return (true); }
  let tableData = tableDataFunction(table);
  // if the table is not mentioned in the suds.config file - no access
  // if (!sails.config.sudstables[table]) { return exits.success(false); }
  // if the table is mentioned but no permissions then no access
  if (!tableData.permission) { return (false); }

  // there is a permisiom table, so extract it.
  let tablePermission = tableData.permission;
  trace.log({ tablepermission: tablePermission });
  // This user is in the 'all' group for this table so can do anything
  if (tablePermission.all) {
    if (tablePermission.all.includes(permission)) { hasPermission = true; }
    if (tablePermission.all.includes('all')) { hasPermission = true; }
  }
  if (has == 'all') {  // can this person do everything with this table
    if (
      (tablePermission.edit && tablePermission.edit.includes(permission))
      && (tablePermission.delete && tablePermission.delete.includes(permission))
      && (tablePermission.view && tablePermission.view.includes(permission))
    ) {
      hasPermission = true;
    }
    if (
      (tablePermission.edit && tablePermission.edit.includes('all'))
      && (tablePermission.delete && tablePermission.delete.includes('all'))
      && (tablePermission.views && tablePermission.view.includes('all'))
    ) {
      hasPermission = true;
    }

  } // end all

  if (has == 'any') {
    if (
      (tablePermission.all && tablePermission.all.includes(permission))
      || (tablePermission.edit && tablePermission.edit.includes(permission))
      || (tablePermission.delete && tablePermission.delete.includes(permission))
      || (tablePermission.view && tablePermission.view.includes(permission))
    ) {
      hasPermission = true;
    }
    if (
      (tablePermission.all && tablePermission.all.includes('all'))
      || (tablePermission.edit && tablePermission.edit.includes('all'))
      || (tablePermission.delete && tablePermission.delete.includes('all'))
      || (tablePermission.view && tablePermission.view.includes('all'))
    ) {
      hasPermission = true;
    }
  }  // end any

  if (has == 'edit'
    && (tablePermission.edit && tablePermission.edit.includes(permission))
  ) { hasPermission = true; }

  if (has == 'view'
    && (tablePermission.view && tablePermission.view.includes(permission))
  ) { hasPermission = true; }

  if (has == 'delete'
    && (tablePermission.delete && tablePermission.delete.includes(permission))
  ) { hasPermission = true; }

  if (has == 'edit'
    && (tablePermission.all && tablePermission.all.includes('all'))
  ) { hasPermission = true; }

  if (has == 'view'
    && (tablePermission.view && tablePermission.view.includes('all'))
  ) { hasPermission = true; }

  if (has == 'delete'
    && (tablePermission.delete && tablePermission.delete.includes('all'))
  ) { hasPermission = true; }

  // Don't check for 'none' because assumed there is no such permission set.

  trace.log(hasPermission);
  return (hasPermission);


}

