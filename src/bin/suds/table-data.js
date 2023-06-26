const suds = require('../../config/suds')
const trace = require('track-n-trace')
const humanise = require('./humanise-fieldname')
const mergeAttributes = require('./merge-attributes')

module.exports = function (table, permission) {
  // merge extra attributes with attributes
  trace.log({ inputs: arguments, level: 'verbose' })
  if (!suds.tables.includes(table)) { // Check that table exists in model.
    throw new error('Error in suds.js - table does not exist: ' + table)
  }
  const merged = {}
  let schema = `${table}.js`;
  if (suds.jsonSchema.includes(table)) schema = `${table}.json`
  let tableData
  try {
    tableData = require(`../../tables/${schema}`)
  }
  catch (err) {
    throw new Error(`can't load ${schema}`)
  }
  trace.log({ tabledata: tableData, level: 'verbose' })
  let properties = mergeAttributes(table)

  /** compatibility with legacy data */
  if (tableData.rowTitle) { tableData.stringify = tableData.rowTitle };

  /* sometimes we just pass tabledata as a parameter */
  merged.tableName = table

  for (const key of Object.keys(tableData)) {
    // merged is a merge of the attributes in the model with the extra attributes in the
    // suds config file.  These give field properties for things like the input type
    // and dipsplay format.
    // loop through fields (columns) in the table
    if (key != 'attributes') {
      merged[key] = tableData[key]
      trace.log(key, merged[key], { level: 'verbose' })
    }
  }

  let standardHeader = {}
  if (tableData.standardHeader) {
    standardHeader = require('../../config/standard-header')[suds[suds.dbDriver].standardHeader]
  }
  /** default priomary key t the first field */
  if (!merged.primaryKey) { merged.primaryKey = properties[Object.keys(properties)[0]] }

  /* add primary key as a top level value in the tableData object. */
  for (const key of Object.keys(properties)) {
    if (properties[key].primaryKey) {
      merged.primaryKey = key
    }
    if (properties[key].process && properties[key].process.type == 'createdAt') {
      merged.createdAt = key
    }
    if (properties[key].process && properties[key].process.type == 'updatedAt') {
      merged.updatedAt = key
    }
  }
  /* If we haven't found one then use the first autoincrement field we find */
  if (!merged.primaryKey) {
    for (const key of Object.keys(properties)) {
      if (properties[key].autoincrement) {
        merged.primaryKey = key
        break
      }
    }
  }
  trace.log({ primaryKey: tableData.primaryKey, level: 'verbose' })

  if (!merged.friendlyName) { merged.friendlyName = humanise(table) }
  trace.log(merged.friendlyName)

  if (!merged.description) { merged.description = table }
  if (!merged.edit) { merged.edit = {} }
  if (!merged.list) { merged.list = {} }
  if (!merged.groups) { merged.groups = {} }

  /* Superused can do anything.  If there is no permission for the table then */
  /* eveyone can do anything - so in either case - all done.                  */
  if (permission == '#superuser#' || !merged.permission) {
    merged.canView = true
    merged.canEdit = true
    merged.canDelete = true
    return (merged)
  }
  merged.canView = false
  merged.canEdit = false
  merged.canDelete = false

  if (merged.permission.view) { // If there is a specific view permission
    if (merged.permission.view.includes('all') || // and it doesn't include all
      merged.permission.view.includes(permission) // and it doesn't include this user
    ) {
      merged.canView = true // then can't view
    }
  }

  if (merged.permission.edit) { // If there is a specific edit permission
    if (merged.permission.edit.includes('all') || // and it doesn't include all
      merged.permission.edit.includes(permission) // and it doesn't include this user
    ) {
      merged.canEdit = true // then can't edit
    }
  }

  if (merged.permission.delete) { // If there is a specific edit permission
    if (merged.permission.delete.includes('all') || // and it doesn't include all
      merged.permission.delete.includes(permission) // and it doesn't include this user
    ) {
      merged.canDelete = true // then can't edit
    }
  }

  if (merged.permission.all) { // If there is a specific edit permission
    if (merged.permission.all.includes('all') || // and it doesn't include all
      merged.permission.all.includes(permission) // and it doesn't include this user
    ) {
      merged.canView = true
      merged.canEdit = true
      merged.canDelete = true
    }
  }

  trace.log({ table, canedit: merged.canEdit, canView: merged.canView, permission, mergedpermission: merged.permission, tableData: merged, maxdepth: 3, level: 'verbose' })
  // trace.log({edit:merged, level: 'bob'});

  return (merged)
}
