
console.log('loading db 1')
const trace = require('track-n-trace')
const dcopy = require('deep-copy')
const invertGroups = require('./invert-groups')
const suds = require('../../config/suds')
humaniseFieldname = require('./humanise-fieldname')
const jsonfrags = require('../../tables/fragments')
const jsonFragments = require('../../tables/fragments')


let cache = {}
let tableData

/**
 * Doesn't really merge things any more. It standardises the attributes to that they all have the
 * same structure.
 * 
 * This module 'compiles' the schema  by standarsifing the object and making sure that every 
 * part of the schema object is there, even if empty.
 * 
 * The standardised schems is then cached.
 *
 * @param {string} table
 * @param {string} permission
 * @param {string} subschemas
 * @param {object} additionalAttributes
 * @returns
 */
module.exports = function (table, permission, subschemas, additionalAttributes) {
  trace.log({ inputs: arguments })
  if (table == 'clear-cache') {
    cache = {}
    return
  }
  if (!additionalAttributes) { additionalAttributes = {} }
  trace.log({ table, permission, cached: Object.keys(cache) })
  if (suds.jsonSchema.includes(table)) {
    tableData = require('../../tables/' + table+'.json')    
  } else {
    tableData = require('../../tables/' + table)
  }
  if (!tableData) {
    throw new Error(`merge-attributes.pl::Table: ${table} - Can't find any config data for this table. Suggest running ${suds.baseURL}/validateconfig`)
  }
  //   if (tableData.attributes_merged) {return attributes}   // only do this once
  //   tableData.attributes_merged=true;
  let cachekey = ''
  if (permission) { cachekey = permission + 'Z' }
  cachekey += table
  if (subschemas) {
    for (let i = 0; i < subschemas.length; i++) { cachekey += 'Z' + subschemas[i] }
  }
  trace.log({ cachekey, cached: Object.keys(cache) })

  /**
   * Only do this once!
   *
   * Work out the standardised attributes and store them in a cache. The key of the cache is
   * [permission.]table[.subschema1][.subschema2]....
   *
   * So different caches for different permissions because the include things like
   * cenedit or canview.
   * */
  if (!cache[cachekey]) {
    trace.log({ creating: 'cache for ', table, cachekey })

    /**
      * Combines the standard header fields, the fields in the schema and fields in the subschema
      * Then make a deep copy
      * This is passed to the standardise routine. Note that if the attributes describe a structured
      * record with sub-objects it is called recursively.
      */
    standardHeader = {}
    if (tableData.standardHeader) {
      standardHeader = require('../../config/standard-header')[suds[suds.dbDriver].standardHeader]
    }
    trace.log(standardHeader)

    /** 
     * The original schema format was based on the Sails framework schema. This section converts 
     * the JSON schema standard to this format.  This is a kludge and long-term would
     * like to convert the system to use the JSON schema internally.
     * 
     * The properties object is renamed attributes and the standard header is added 
     *     (Standard header is nw redundant because we use  $ref i the test data)
     * dereference carries out the substitution of $ref entries
     * The children specifications are copied into the attributes secttion. 
     *     For some reasin they were there in the Sails framework
     * Then the schema is converted in a recursive function.
     * 
      */
    if (!tableData.attributes && tableData.properties) { tableData.attributes = tableData.properties }  // for compatibility with the JSON schema standard
    const rawAttributes = { ...standardHeader, ...tableData.attributes, ...additionalAttributes }
    trace.log(table, rawAttributes, { level: 's2' })
    dereference(rawAttributes, tableData)
    decomment(tableData)
    decomment(rawAttributes)
    trace.log(tableData)
    if (tableData.children) {
      for (const key of Object.keys(tableData.children)) {
        rawAttributes[key] = tableData.children[key]
      }
    }
    trace.log(tableData)
    jsonSchemaConvert(rawAttributes, tableData, tableData)

    /** Make a deep copy of the attributes (properties) */
    const rawAttributesDeep = dcopy(rawAttributes)
    trace.log({ header: standardHeader, rawAttributes: rawAttributesDeep, level: 'verbose' })

    /** Create lookup with the group for each attribute (top level attribute).
     * This is so that permissions can be propogated through the group.
     * */
    const groupLookup = invertGroups(tableData, rawAttributesDeep)
    trace.log(groupLookup, { level: 'verbose' })

    /** Standardise attributes */
    const standardisedAttributes = standardise(table, rawAttributesDeep, groupLookup, [], [], permission)
    cache[cachekey] = standardisedAttributes

    /** create friendlyName for each top level item in the subschema
    * This seems to have some unwarrentled assumptions - like the subschema is added at the top level.
    */
    if (subschemas && tableData.list && tableData.list.subschemaName) {
      for (const key of Object.keys(additionalAttributes)) {
        cache[cachekey][key].friendlyName = `${suds.subschemaGroups[tableData.list.subschemaName]}: ${cache[cachekey][key].friendlyName}`
      }
    }

    /** If there is a record type column - set the recordtypefix boolean for that element */
    if (tableData.recordTypeColumn && cache[cachekey][tableData.recordTypeColumn]) {
      cache[cachekey][tableData.recordTypeColumn].recordType = true
      if (tableData.recordTypeFix) { cache[cachekey][tableData.recordTypeColumn].recordTypeFix = true }
    }
  }

  /** Retun result. */
  trace.log({ table: table, permission, key: cachekey, attributes: cache[cachekey], cached: Object.keys(cache), level: 'verbose', maxdepth: 4 })
  return (cache[cachekey])
}


/**
 * 
 *   Dereference schema ab=nd remove comments
 * 
 * @param {object} properties 
 * @param {object} tableData 
 * @param {object} parent 
 */
function dereference (properties, tableData) {
  trace.log(properties)
  for (const key of Object.keys(properties)) {
    trace.log({ key: key, properties: properties[key] })
    if (key === '$ref') {
      let ref = properties[key]
      if (ref.includes('{{dbDriver}}')) { ref = ref.replace('{{dbDriver}}', suds.dbDriver) }
      if (ref.includes('#/$defs/')) {
        ref = ref.replace('#/$defs/', '')
        if (!(tableData['$defs'])) { throw new Error(`merge-attributes.js::No $defs object for ${ref}`) }
        if (!(tableData['$defs'][ref])) { throw new Error(`merge-attributes.js::No $defs/${ref} object`) }
        for (const jr of Object.keys(tableData['$defs'][ref])) {
          trace.log(jr, tableData['$defs'][ref][jr])
          properties[jr] = tableData['$defs'][ref][jr]
        }

      } else {
        trace.log(`Replacing $ref with object in ${properties[key]} = ${ref}`)
        for (const jr of Object.keys(jsonFragments[ref])) {
          properties[jr] = jsonFragments[ref][jr]
        }
      }
      delete properties[key]

    } else {
      if (properties[key].type == 'object') {
        trace.log(properties[key].properties)
        //        if (properties[key].object) dereference(properties[key].object, tableData)
        if (properties[key].properties) dereference(properties[key].properties, tableData)
      }
    }
  }
  trace.log(properties)
}

/**
 * 
 * Decomment obj 
 * 
 * @param {object} obj 
 */
function decomment (obj) {
  for (const key of Object.keys(obj)) {
    trace.log(key)
    if (key === '$comment') {
      delete obj[key]
      continue
    }
    if (key === 'properties') {
      decomment(obj[key])
    }
    if (key === 'items') {
      decomment(obj[key])
    }
    if (typeof obj[key] === 'object' && obj[key]['$comment']) {
      delete obj[key]['$comment']
    }
  }
  trace.log(obj)
}

/** ***********************************************************************
 *  Convert JSON  Schema format to internal format
 * 
 * Lonbg-term a better solution is needed.
 * 
 * @param {object} properties of the object being processed
 * @param (object) tableData - the original top level object
 * @param (object) parent - the object containg these properties
 */
function jsonSchemaConvert (properties, tableData, parent) {
  trace.log({ properties: properties, level: 's2' })

  trace.log(parent.required)
  if (parent && parent.required) {
    for (const key of parent.required) {
      if (!properties[key]) {
        throw new Error(`merge-attributes.pl::No properties for field name ${key}`)
      }
      if (!properties[key].input) { properties[key].input = {} }
      properties[key].input.required = true
    }
  }
  trace.log('required list processed')

  for (const key of Object.keys(properties)) {
    trace.log({ key: key, type: properties[key].type, level: 's2' })
    if (properties[key].type === 'object') {
      if (!properties[key].object && properties[key].properties) { properties[key].object = properties[key].properties }
      //     delete properties[key].properties
      trace.log('next level', key, properties[key].type)
      jsonSchemaConvert(properties[key].object, tableData, properties[key])
    } else {
      if (properties[key].type === 'array') {
        trace.log({ key: key, properties: properties[key], level: 's1' })
        properties[key].type = 'object'

        if (properties[key].input && properties[key].input.single) {
          properties[key].array = { type: 'single' }
        } else {
          properties[key].array = { type: 'multiple' }
        }

        if (properties[key].items.type === 'object') {
          properties[key].object = properties[key].items.properties
          trace.log('next level', key,)
          jsonSchemaConvert(properties[key].object, tableData, properties[key])
        }
        else {
          for (const item of Object.keys(properties[key].items)) {
            properties[key][item] = properties[key].items[item]
          }
        }
        //     delete properties[key].items
        trace.log({ key: key, type: properties[key], level: 's1' })
      } else {
        /* a real field */
        if (typeof properties[key].input === 'undefined') properties[key].input = {}
         if (properties[key].type === 'integer'){
          properties[key].type = 'number'
          properties[key].input.isInteger=true
          if (!properties[key].input.step) {properties[key].input.step=1}
         }
        trace.log(key)
        for (const subkey of Object.keys(properties[key])) {
          trace.log(subkey)
          let translate = {
            maximum: 'max',
            minimum: 'min',
            multipleOf: 'step',
            maxLength: 'maxlength',
            minLength: 'minlength',
            pattern: 'pattern',
            pattern: 'pattern',
          }
          if (subkey === 'enum') {
            properties[key].values = properties[key].enum
            delete properties[key].enum
          }
          if (translate[subkey]) {
            properties[key].input[translate[subkey]] = properties[key][subkey]
            delete properties[key][subkey]
          }
        }
      }
    }
  }
  trace.log(properties, { level: 's2' })
  return;
}



/**
 *
 * Cycle through attributes standardising. If the attribute is an object descend a level and call the
 * function recursively.
 *
 * merged is a merge of the attributes in the model with the extra attributes in the
 * suds config file and subschema fields.
 * These give field properties for things like the input type and dipsplay format.
 *
 * @param {string} table
 * @param {object} merged. Points to the rawAttributes object
 * @param {object} groupLookup links field to the group it belongs to
 * @param {array} parentQualifiedName
 * @param {array} parentQualifiedFriendlyName
 * @param {string} permission of currently logged-in user
 */
function standardise (
  table,
  merged,
  groupLookup,
  parentQualifiedName,
  parentQualifiedFriendlyName,
  permission
) {
  trace.log({ arguments, level: 'verbose' })
  trace.log(table, parentQualifiedName)

  /** main loop throiugh fields  */
  for (const key of Object.keys(merged)) {
    // loop through fields (columns) in the table

    trace.log({ next: key, attr: merged[key], level: 'verbose' })
    if (!merged[key].type) { merged[key].type = 'string' }
    merged[key].key = key
    if (!merged[key].friendlyName) { merged[key].friendlyName = humaniseFieldname(key) }
    if (parentQualifiedName.length == 0) {
      merged[key].qualifiedName = [key]
      merged[key].qualifiedFriendlyName = [merged[key].friendlyName]
    } else {
      merged[key].qualifiedName = []
      merged[key].qualifiedFriendlyName = []
      for (let i = 0; i < parentQualifiedName.length; i++) {
        merged[key].qualifiedName[i] = parentQualifiedName[i]
        merged[key].qualifiedFriendlyName[i] = parentQualifiedFriendlyName[i]
      }
      trace.log({ key, qname: merged[key].qualifiedName, qfname: merged[key].qualifiedFriendlyName }, { level: 'norm' })
      merged[key].qualifiedName.push(key)
      merged[key].qualifiedFriendlyName.push(merged[key].friendlyName)
      trace.log({ key, qname: merged[key].qualifiedName, qfname: merged[key].qualifiedFriendlyName }, { level: 'norm' })
    }
    if (merged[key].type === 'object') {
      if (!merged[key].object && merged[key].properties) { merged[key].object = merged[key].properties }
      trace.log(key, merged[key].object)
      standardise(table, merged[key].object, {}, merged[key].qualifiedName, merged[key].qualifiedFriendlyName)
    }
    /**
      *
      * Guarantee that certain sub-object/values are there with default values
      *
      * */
    if (!merged[key].input) { merged[key].input = {} }
    if (!merged[key].database) { merged[key].database = {} }
    if (!merged[key].process) { merged[key].process = {} }
    if (!merged[key].display) { merged[key].display = {} }
    /** field type */
    if (merged[key].primaryKey && suds[suds.dbDriver].dbkey) { merged[key].type = suds[suds.dbDriver].dbkey }
    if (merged[key].model && suds[suds.dbDriver].dbkey) { merged[key].type = suds[suds.dbDriver].dbkey }

    if (merged[key].type != 'string' && merged[key].type != 'number' && merged[key].type != 'boolean' && merged[key].type != 'object') {
      throw new Error(`merge-attributes.pl::Table: ${table}, Attribute: ${key} Type: ${merged[key].type} is invalid. Suggest running ${suds.baseURL}/validateconfig`)
    }

    /** Input and input type */
    if (merged[key].type == 'boolean' && !merged[key].input.type) { merged[key].input.type = 'checkbox' }

    if (merged[key].type == 'number' && !merged[key].input.type) { merged[key].input.type = 'number' }

    /** Anything else is text! */
    if (!merged[key].input.type) { merged[key].input.type = 'text' }

    if (!merged[key].input.validations) { merged[key].input.validations = {} } // guarantee that there is an validations object.
    if (!merged[key].input.class) { merged[key].input.class = suds.input.class } // Default class for input fields.

    /** display type */
    if (!merged[key].display.type) { merged[key].display.type = '' }

    /** Description  */

    if (!merged[key].description) {
      if (merged[key].collection) {
        merged[key].description = `Linked from: '${merged[key].collection}' via column '${merged[key].via}'.`
      } else {
        merged[key].description = merged[key].friendlyName
      }
    }
    if (merged[key].description.includes('"')) { merged[key].description = merged[key].description.replace(/"/g, '&quot;') }
    if (merged[key].description.includes('`')) { merged[key].description = merged[key].description.replace(/`/g, '&quot;') }

    /** Help text */
    merged[key].helpText = ''
    const intype = merged[key].input.type
    if (suds.inputTypes[intype] && suds.inputTypes[intype].helpText) { merged[key].helpText = suds.inputTypes[intype].helpText }

    /** Record type and record type column = e.g. Customer type or product type. Special functiopns for this
    merged[key].recordTypeColumn = false;
    merged[key].recordTypes = {};
    if (key == tableData.recordTypeColumn) {
      merged[key].recordTypeColumn = true;
      merged[key].recordTypes = tableData.recordTypes;
    }
*/

    trace.log({ key, type: merged[key], level: 'norm' })
    trace.log({ key, type: merged[key].input.type, level: 'norm' })

    /* ************************************************
    *
    *   Permission
    *   set up new attributes: canView and canEdit
    *   for each field.
    *
    ************************************************ */
    trace.log({ key, group: groupLookup[key], permission }, { level: 'norm' })
    merged[key].canEdit = true // assume all permissions OK
    merged[key].canView = true
    if (permission == '#superuser#') { continue }
    trace.log(merged[key].qualifiedName)
    //  If there is no  field-level permission object, default to the group permission
    if (!merged[key].permission) {
      let groupkey = key
      if (merged[key].qualifiedName[0]) { groupkey = merged[key].qualifiedName[0] };
      trace.log(groupkey, groupLookup[groupkey])
      if (tableData.groups[groupLookup[groupkey]]) {
        const groupPermission = tableData.groups[groupLookup[groupkey]].permission
        if (groupPermission) {
          merged[key].permission = groupPermission
        }
      }
    }

    trace.log(table, key, permission, merged[key].permission, { level: 'norm' })
    trace.log(table, key, permission, merged[key].permission, { level: key })

    /* if this field has a permission set then the default no longer applies */
    if (merged[key].permission) {
      merged[key].canEdit = false
      merged[key].canView = false
      trace.log({ text: 'check permission', key, merged: merged[key], level: key })

      /* if there is an  'all' permission set then this applies to edit and view */
      if (merged[key].permission.all) { // If there is a specific view permission
        if (merged[key].permission.all.includes(permission) || // and it doesn't include this user
          merged[key].permission.all.includes('all') // or all:['all']}
        ) {
          merged[key].canEdit = true // assume all permissions OK
          merged[key].canView = true
        }
      }

      /* if there is a view permission this applies */
      if (merged[key].permission.view) { // If there is a specific view permission
        if (merged[key].permission.view.includes(permission) || // and it doesn't include this user
          merged[key].permission.view.includes('all') // or view:['all']}
        ) {
          merged[key].canView = true // then can't view
        }
      }

      /* if there is a edit permission this applies */
      if (merged[key].permission.edit) { // If there is a specific edit permission
        if (merged[key].permission.edit.includes(permission) || // and it doesn't include this user
          merged[key].permission.edit.includes('all') // or all:['all']}
        ) {
          merged[key].canEdit = true // then can't edit
        }
      }
      trace.log({ table, text: 'permission', key, merged: merged[key], permission: merged[key].permission, canedit: merged[key].canEdit, canview: merged[key].canView })
    }

    trace.log({ text: 'end loop', key, merged: merged[key], level: 'norm' })
    trace.log({ text: 'end loop', key, merged: merged[key], level: key })
  }
  return merged
}
