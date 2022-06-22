

/**
 * 
 * merge-attributes
 * 
 * Doesn't really merge things any more. It standardises the attributes to that they all have the 
 * same structure. 
 * 
 */

let trace = require('track-n-trace');
let invertGroups = require('./invert-groups')
let suds = require('../../config/suds');
//const tableData = require('./table-data');
humaniseFieldname = require('./humanise-fieldname');
let cache = {};
let lastPermission = ':::';
let tableData;


module.exports = function (table, permission, subschemas, additionalAttributes) {
  trace.log({ inputs: arguments, });
  trace.log({ permission: permission, cached: Object.keys(cache) });
  // if (permission != lastPermission) {     //Clear cache if the permision level change.
  //   cache={};
  //  }
  lastPermission = permission;
  tableData = require('../../tables/' + table);
  if (!tableData) {
    trace.fatal(`Table: ${table} - Can't find any config data for this table. Suggest running ${suds.baseURL}/validateconfig`)
    process.exit(1);
  }
  //   if (tableData.attributes_merged) {return attributes}   // only do this once
  //   tableData.attributes_merged=true;
  let cachekey = '';
  if (permission) { cachekey = permission + '.' }
  cachekey += table;
  if (subschemas) {
    for (let i = 0; i < subschemas.length; i++) { cachekey += '.' + subschemas[i] }
  }
  if (!cache[cachekey]) {   // only do this once

    trace.log({
      tableData: tableData,
      cached: Object.keys(cache),
      table: table,
      attributes: tableData.attributes,
      level: 'verbose'
    });
    /** deep clone the attributes object 
     * adding additonal attributes if present.
     * and standard header if required
    */
    if (!additionalAttributes) { additionalAttributes = {};}
      standardHeader = {};
      if (tableData.standardHeader) {
        standardHeader = require('../../config/standard-header');
      }
      cache[cachekey] = { ...standardHeader, ...tableData.attributes, ...additionalAttributes };
     
      trace.log({header: standardHeader, cache: cache[cachekey], level: 'verbose'} );

      /** Create lookup with the group for each attribute. 
       * This is so that permissions can be propogated through the group. 
       * */
      let groupLookup = invertGroups(tableData, cache[cachekey]);
      trace.log(groupLookup, { level: 'verbose' });


      /** create a shallow copy of the attributes object. */


      /** Cycle through attributes standardising. If the attribute is an object descend a level and call the 
       * function recursively.
       */


      standardise(table, cache[cachekey], groupLookup, [], [], permission);

      if (tableData.recordTypeColumn && cache[cachekey][tableData.recordTypeColumn]) {
        cache[cachekey][tableData.recordTypeColumn].recordType = true;
        if (tableData.recordTypeFix) { cache[cachekey][tableData.recordTypeColumn].recordTypeFix = true; }
      }
    }
    trace.log({ permission: permission, key: cachekey, attributes: cache[cachekey], cached: Object.keys(cache), level: 'norm', maxdepth: 2 });
    return (cache[cachekey]);
  }


  function standardise(
    table,
    merged,
    groupLookup,
    parentQualifiedName,
    parentQualifiedFriendlyName,
    permission,
  ) {
    trace.log({
      arguments: arguments, level: 'verbose',
    });


    for (const key of Object.keys(merged)) {
      // merged is a merge of the attributes in the model with the extra attributes in the 
      // suds config file.  These give field properties for things like the input type 
      // and dipsplay format.  
      // loop through fields (columns) in the table
      trace.log({ next: key, attr: merged[key], level: 'verbose' })
      if (!merged[key].type) { merged[key].type = 'string'; }
      merged[key].key = key;
      if (!merged[key].friendlyName) { merged[key].friendlyName = humaniseFieldname(key); }
      if (parentQualifiedName.length == 0) {
        merged[key].qualifiedName = [key]
        merged[key].qualifiedFriendlyName = [merged[key].friendlyName]
      }
      else {
        merged[key].qualifiedName = [];
        merged[key].qualifiedFriendlyName = [];
        for (let i = 0; i < parentQualifiedName.length; i++) {
          merged[key].qualifiedName[i] = parentQualifiedName[i];
          merged[key].qualifiedFriendlyName[i] = parentQualifiedFriendlyName[i];
        }
        trace.log({ key: key, qname: merged[key].qualifiedName, qfname: merged[key].qualifiedFriendlyName }, { level: 'norm' });
        merged[key].qualifiedName.push(key);
        merged[key].qualifiedFriendlyName.push(merged[key].friendlyName)
        trace.log({ key: key, qname: merged[key].qualifiedName, qfname: merged[key].qualifiedFriendlyName }, { level: 'norm' });
      }
      if (merged[key].type == 'object') {

        standardise(table, merged[key].object, {}, merged[key].qualifiedName, merged[key].qualifiedFriendlyName)
      }
      /** 
        * 
        * Guarantee that certain sub-object/values are there with default values 
        * 
        * */
      if (!merged[key].input) { merged[key].input = {} }
      if (!merged[key].database) { merged[key].database = {}; }
      if (!merged[key].process) { merged[key].process = {}; }
      if (!merged[key].display) { merged[key].display = {}; }
      /** field type */
      if (merged[key].primaryKey) { merged[key].type = suds.dbkey }
      if (merged[key].model && suds.dbkey) { merged[key].type = suds.dbkey; }

      if (merged[key].type != 'string' && merged[key].type != 'number' && merged[key].type != 'boolean' && merged[key].type != 'object' && merged[key].type != 'array') {
        trace.fatal(`Attribute: ${key} Type: ${merged[key].type} is invalid. Suggest running ${suds.baseURL}/validateconfig`);
        process.exit(1);
      }

      /** Input and input type */
      if (merged[key].type == 'boolean' && !merged[key].input.type) { merged[key].input.type = 'checkbox'; }

      if (merged[key].type == 'number' && !merged[key].input.type) { merged[key].input.type = 'number'; }

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


      /** Record type and record type column = e.g. Customer type or product type. Special functiopns for this  
      merged[key].recordTypeColumn = false;
      merged[key].recordTypes = {};
      if (key == tableData.recordTypeColumn) {
        merged[key].recordTypeColumn = true;
        merged[key].recordTypes = tableData.recordTypes;
      }
  */











      trace.log({ key: key, type: merged[key], level: 'norm' })
      trace.log({ key: key, type: merged[key].input.type, level: 'norm' })






      /* ************************************************
      *
      *   Permission
      *   set up new attributes: canView and canEdit 
      *   for each field.
      *
      ************************************************ */
      trace.log({ key: key, group: groupLookup[key], permission: permission }, { level: 'norm' });
      merged[key].canEdit = true;                              // assume all permissions OK
      merged[key].canView = true;
      if (permission == '#superuser#') { continue; }
      trace.log(merged[key].qualifiedName);
      //  If there is no  field-level permission object, default to the group permission
      if (!merged[key].permission) {
        let groupkey = key;
        if (merged[key].qualifiedName[0]) { groupkey = merged[key].qualifiedName[0] };
        trace.log(groupkey, groupLookup[groupkey]);
        if (tableData.groups[groupLookup[groupkey]]) {
          let groupPermission = tableData.groups[groupLookup[groupkey]].permission;
          if (groupPermission) {
            merged[key].permission = groupPermission;
          }
        }

      }



      trace.log(table, key, permission, merged[key].permission, { level: 'norm' });
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
       trace.log({ table: table, text: 'permission', key: key, merged: merged[key], permission: merged[key].permission, canedit:  merged[key].canEdit, canview: merged[key].canView,  })
      }

      trace.log({ text: 'end loop', key: key, merged: merged[key], level: 'norm' })
      trace.log({ text: 'end loop', key: key, merged: merged[key], level: key })

    }
  }



