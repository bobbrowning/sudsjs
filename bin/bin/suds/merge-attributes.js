
let trace = require('track-n-trace');
let invertGroups = require('./invert-groups')
let suds = require('../../config/suds');


module.exports = function (table, permission) {
  // merge extra attributes with attributes 
  trace.log({ inputs: arguments, });

  tableData = require('../../tables/' + table);
  humaniseFieldname = require('./humanise-fieldname');
  trace.log({ tableData: tableData, level: 'verbose' });
  if (!tableData) {
    console.log(`********************* Table ${table} not found  ****************`);
    return;
  }


  const attributes = tableData.attributes;
  trace.log({ table: table, attributes: attributes, level: 'verbose' });

  let groupLookup = invertGroups(tableData, attributes);


  trace.log(groupLookup, { level: 'verbose' });

  let merged = {};

  for (const key of Object.keys(attributes)) {
    // merged is a merge of the attributes in the model with the extra attributes in the 
    // suds config file.  These give field properties for things like the input type 
    // and dipsplay format.  
    // loop through fields (columns) in the table


    trace.log({ key: key }, { level: 'verbose' });


    merged[key] = attributes[key];

    
    /** 
     * 
     * Guarantee that certain sub-object/values are there with default values 
     * 
     * */
    if (!merged[key].input) { merged[key].input = {} }
    if (!merged[key].database) { merged[key].database = {}; }
    if (!merged[key].process) { merged[key].process = {}; }
    if (!merged[key].display) { merged[key].display = {}; }
  
    if (!merged[key].friendlyName) { merged[key].friendlyName = humaniseFieldname(key); }

    /** field type */
    if (!merged[key].type) { merged[key].type = 'string'; }
    if (merged[key].model) { merged[key].type = 'number'; }

    /** Input and input type */
    if (merged[key].type == 'boolean' && !merged[key].input.type) { merged[key].input.type = 'checkbox'; }

    if (merged[key].type == 'number' && !merged[key].input.type) {
      merged[key].input.type = 'number';
    }
    /** Anything else is text! */
    if (!merged[key].input.type) { merged[key].input.type = 'text' }

    if (!merged[key].input.validations) { merged[key].input.validations = {} }   // guarantee that there is an validations object.
    if (!merged[key].input.class) { merged[key].input.class = suds.input.class; }  // Default class for input fields.


    /** display type */
    if (!merged[key].display.type) { merged[key].display.type = ''; }

    /** Description  */

    if (!merged[key].description) {
      if (merged[key].collection) {
        merged[key].description = `Linked from: '${merged[key].collection}' via column '${merged[key].via}'.`;
      }
      else {
        merged[key].description = merged[key].friendlyName;
      }
    }
    if (merged[key].description.includes('"')) { merged[key].description = merged[key].description.replace(/"/g, '&quot;') }
    if (merged[key].description.includes('`')) { merged[key].description = merged[key].description.replace(/`/g, '&quot;') }

    /** Help text */
    merged[key].helpText = '';
    let intype = merged[key].input.type;
    if (suds.inputTypes[intype] && suds.inputTypes[intype].helpText) { merged[key].helpText = suds.inputTypes[intype].helpText }


    /** Record type and record type column = e.g. Customer type or product type. Special functiopns for this  */
    merged[key].recordTypeColumn = false;
    merged[key].recordTypes = {};
    if (key == tableData.recordTypeColumn) {
      merged[key].recordTypeColumn = true;
      merged[key].recordTypes = tableData.recordTypes;
    }












    trace.log({ key: key, type: merged[key], level: 'verbose' })
    trace.log({ key: key, type: merged[key].input.type, level: 'verbose' })






    /* ************************************************
    *
    *   Permission
    *   set up new attributes: canView and canEdit 
    *   for each field.
    *
    ************************************************ */
    trace.log({ key: key, group: groupLookup[key], permission: permission }, { level: 'verbose' });
    merged[key].canEdit = true;                              // assume all permissions OK
    merged[key].canView = true;
    if (permission == '#superuser#') { continue; }

    //  If there is no  field-level permission object, default to the group permission
    if (!merged[key].permission) {
      let groupPermission = tableData.groups[groupLookup[key]].permission;
      if (groupPermission) {
        merged[key].permission = groupPermission;
      }
    }



    trace.log(table, key, permission, merged[key].permission, { level: 'verbose' });
    trace.log(table, key, permission, merged[key].permission, { level: key });

    /* if this field has a permission set then the default no longer applies */
    if (merged[key].permission) {
      merged[key].canEdit = false;
      merged[key].canView = false;
      trace.log({ text: 'end loop', key: key, merged: merged[key], level: key })

      /* if there is an  'all' permission set then this applies to edit and view */
      if (merged[key].permission.all) {                         // If there is a specific view permission
        if (merged[key].permission.all.includes(permission)    // and it doesn't include this user
          || merged[key].permission.all.includes('all')          // or all:['all']}
        ) {
          merged[key].canEdit = true;                              // assume all permissions OK
          merged[key].canView = true;
        }
      }

      trace.log({ text: 'end loop', key: key, merged: merged[key], level: key })
      /* if there is a view permission this applies */
      if (merged[key].permission.view) {                       // If there is a specific view permission
        if (merged[key].permission.view.includes(permission)    // and it doesn't include this user
          || merged[key].permission.view.includes('all')          // or view:['all']}
        ) {
          merged[key].canView = true;                             // then can't view
        }
      }

      /* if there is a edit permission this applies */
      if (merged[key].permission.edit) {                         // If there is a specific edit permission
        if (merged[key].permission.edit.includes(permission)    // and it doesn't include this user
          || merged[key].permission.edit.includes('all')          // or all:['all']}
        ) {
          merged[key].canEdit = true;                             // then can't edit
        }
      }
    }

    trace.log({ text: 'end loop', key: key, merged: merged[key], level: 'verbose' })
    trace.log({ text: 'end loop', key: key, merged: merged[key], level: key })

  }

  if (tableData.recordTypeColumn && merged[tableData.recordTypeColumn]) {
     merged[tableData.recordTypeColumn].recordType=true;
    if (tableData.recordTypeFix) {merged[tableData.recordTypeColumn].recordTypeFix=true;}
  }
 
  trace.log({ merged: merged, level: 'verbose' });
  return (merged);
}



