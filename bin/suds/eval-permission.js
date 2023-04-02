const trace = require('track-n-trace')
const suds = require('../../config/suds')
const tableDataFunction = require('./table-data')

module.exports = function (permission, toEval, has) {
  /**  Given eval={all: xxx , view: yyy} works out if this user has permission to 'has' */
  trace.log({ permission, toeval: toEval, has })
  let hasPermission = false
  // Superusers can do anything
  if (permission == '#superuser#') { return (true) }

  // This user is in the 'all' group for this table so can do anything
  if (toEval.all) {
    if (toEval.all.includes(permission)) { hasPermission = true }
    if (toEval.all.includes('all')) { hasPermission = true }
  }
  if (has == 'all') { // can this person do everything with this table
    if (
      (toEval.edit && toEval.edit.includes(permission)) &&
      (toEval.delete && toEval.delete.includes(permission)) &&
      (toEval.view && toEval.view.includes(permission))
    ) {
      hasPermission = true
    }
    if (
      (toEval.edit && toEval.edit.includes('all')) &&
      (toEval.delete && toEval.delete.includes('all')) &&
      (toEval.views && toEval.view.includes('all'))
    ) {
      hasPermission = true
    }
  } // end all

  if (has == 'any') {
    trace.log(toEval.view, permission)
    if (
      (toEval.all && toEval.all.includes(permission)) ||
      (toEval.edit && toEval.edit.includes(permission)) ||
      (toEval.delete && toEval.delete.includes(permission)) ||
      (toEval.view && toEval.view.includes(permission))
    ) {
      hasPermission = true
    }
    if (
      (toEval.all && toEval.all.includes('all')) ||
      (toEval.edit && toEval.edit.includes('all')) ||
      (toEval.delete && toEval.delete.includes('all')) ||
      (toEval.view && toEval.view.includes('all'))
    ) {
      hasPermission = true
    }
  } // end any

  if (has == 'edit' &&
    (toEval.edit && toEval.edit.includes(permission))
  ) { hasPermission = true }

  if (has == 'view' &&
    (toEval.view && toEval.view.includes(permission))
  ) { hasPermission = true }

  if (has == 'delete' &&
    (toEval.delete && toEval.delete.includes(permission))
  ) { hasPermission = true }

  if (has == 'edit' &&
    (toEval.all && toEval.all.includes('all'))
  ) { hasPermission = true }

  if (has == 'view' &&
    (toEval.view && toEval.view.includes('all'))
  ) { hasPermission = true }

  if (has == 'delete' &&
    (toEval.delete && toEval.delete.includes('all'))
  ) { hasPermission = true }

  // Don't check for 'none' because assumed there is no such permission set.

  trace.log(hasPermission)
  return (hasPermission)
}
