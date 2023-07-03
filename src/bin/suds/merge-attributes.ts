
console.log('loading db 1')
const trace = require('track-n-trace')
const dcopy = require('deep-copy')
const invertGroups = require('./invert-groups')
const suds = require('../../config/suds')
const humaniseFieldname = require('./humanise-fieldname')

import { Property, Properties, Schema, Cache } from '../types-schema.js'


let cache: Cache = {};

let schema: Schema;

/**
 * Doesn't really merge things any more. It standardises the properties to that they all have the
 * same structure.
 * 
 * This module 'compiles' the schema  by standardising the object and making sure that every 
 * part of the schema object is there, even if empty.
 * 
 * The standardised properties object is then cached.  Tge cache is re-evaluated if the permission of the
 * user changed.
 *
 * @param {string} table
 * @param {string} permission
 * @param {string} subschemas
 * @param {object} additionalAttributes
 * @returns
 */
module.exports = function (table: string, permission: string, subschemas: string[], additionalAttributes: Properties) {
  trace.log({ inputs: arguments })

  if (table === 'clear-cache') {
    cache = {}
    return
  }
  if (!additionalAttributes) { additionalAttributes = {} }
  trace.log({ table, permission, cached: Object.keys(cache) })
  if (suds.jsonSchema.includes(table)) {
    schema = require('../../tables/' + table + '.json')
  } else {
    schema = require('../../tables/' + table)
  }
  if (!schema) {
    throw new Error(`merge-attributes.pl::Table: ${table} - Can't find any config data for this table. Suggest running ${suds.baseURL}/validateconfig`)
  }
  //   if (schema.attributes_merged) {return attributes}   // only do this once
  //   schema.attributes_merged=true;
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
      * Connebted out becauce we now use $def to insert the standard header. See the JOSO-Schema standard.
    
    let standardHeader = {}
    if (schema.standardHeader) {
      standardHeader = require('../../config/standard-header')[suds[suds.dbDriver].standardHeader]
    }
    trace.log(standardHeader)
*/
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
    let rawAttributes: Properties = {};
    if (!schema.attributes && schema.properties) { schema.attributes = schema.properties }  // for compatibility with the JSON schema standard
    rawAttributes = { /*...standardHeader,*/ ...schema.attributes, ...additionalAttributes }
    trace.log(table, rawAttributes, { level: 's2' })
    dereference(rawAttributes, schema)
    decomment(schema)
    decomment(rawAttributes)
    trace.log(schema)

    /** Legacy: The children data used to be mixed in with Properties. This is because
     * I was following the sailsjs.com standard.  It's just plain wrong but this kludge
     * reverts back to this format.
     */
    if (schema.children) {
      for (const key of Object.keys(schema.children)) {
        rawAttributes[key] = schema.children[key]
      }
    }
    trace.log(schema)

    jsonSchemaConvert(rawAttributes, schema, schema)

    /** Make a deep copy of the attributes (properties) */
    const rawAttributesDeep = dcopy(rawAttributes)
    trace.log({ rawAttributes: rawAttributesDeep, level: 'verbose' })

    /** Create lookup with the group for each attribute (top level attribute).
     * This is so that permissions can be propogated through the group.
     * */
    const groupLookup = invertGroups(schema, rawAttributesDeep)
    trace.log(groupLookup, { level: 'verbose' })

    /** Standardise attributes */
    const standardisedAttributes = standardise(table, rawAttributesDeep, groupLookup, [], [], permission)
    cache[cachekey] = standardisedAttributes

    /** create friendlyName for each top level item in the subschema
    * This seems to have some unwarrentled assumptions - like the subschema is added at the top level.
    */
    if (subschemas && schema.list && schema.list.subschemaName) {
      for (const key of Object.keys(additionalAttributes)) {
        cache[cachekey][key].friendlyName = `${suds.subschemaGroups[schema.list.subschemaName]}: ${cache[cachekey][key].friendlyName}`
      }
    }

    /** If there is a record type column - set the recordtypefix boolean for that element */
    if (schema.recordTypeColumn && cache[cachekey][schema.recordTypeColumn]) {
      cache[cachekey][schema.recordTypeColumn].recordType = true
      //      if (schema.recordTypeFix) { cache[cachekey][schema.recordTypeColumn].recordTypeFix = true }
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
 *                 mainly type Properties - except a value can be a string ($ref) or type Property
 *                 This is only in data passed to this function and string | Property doesn't seem to work?
 *                 Once dereferenced the string values are all replaced, so the Properties type works everywhere else..
 * @param {object} schema 
 * @param {object} parent 
 */
function dereference(properties: any, schema: Schema) {
  trace.log(schema.friendlyName)
  /*   couldn't get this to work  *********
 const deref = require('json-schema-deref-sync');
 const schema=JSON.stringify(properties)
 try {
 deref(schema,{baseFolder:'/home/bob/suds/tables'})
 console.log(JSON.parse(schema))
 process.exit()
 }
 catch (err) {
   throw new Error (`problem with schema for ${schema.friendlyName}
   ${err}`)
 }
 */
  trace.log(properties)
  for (const key of Object.keys(properties)) {
    trace.log({ key: key, properties: properties[key] })
    if (key === '$ref') {
      /**
       *  Only $ref supported are: 
       * #/$defs/aaa   retrieved bbb from object $defs in the current document
       * filename.js#/aaa   object aaa in filename.js  which is in the tables directory
       */
      let jsonFragments
      if (properties[key].includes('{{dbDriver}}')) { properties[key] = properties[key].replace('{{dbDriver}}', suds.dbDriver) }
      let [address, ref] = properties[key].split('#/')
      trace.log(address, ref)
      if (address) {
        jsonFragments = require(`../../tables/${address}`)
        trace.log(`Replacing $ref with object in ${address} - ${ref}`)
        for (const jr of Object.keys(jsonFragments[ref])) {
          properties[jr] = jsonFragments[ref][jr]
        }
      } else {
        if (ref.includes('$defs/')) {
          ref = ref.replace('$defs/', '')
          if (!(schema['$defs'])) { throw new Error(`merge-attributes.js::No $defs object for ${ref}`) }
          if (!(schema['$defs'][ref])) { throw new Error(`merge-attributes.js::No $defs/${ref} object`) }
          for (const jr of Object.keys(schema['$defs'][ref])) {
            trace.log(jr, schema['$defs'][ref][jr])
            properties[jr] = schema['$defs'][ref][jr]
          }

        }

      }
      delete properties[key]
    } else {
      if (properties[key].type == 'object') {
        trace.log(properties[key].properties)
        //        if (properties[key].object) dereference(properties[key].object, schema)
        if (properties[key].properties) dereference(properties[key].properties, schema)
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
function decomment(obj: object) {
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
 * @param (object) schema - the original top level object
 * @param (object) parent - the object containg these properties
 */
function jsonSchemaConvert(properties: Properties, schema: Schema, parent: Schema) {
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
      jsonSchemaConvert(properties[key].object, schema, properties[key])
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
          jsonSchemaConvert(properties[key].object, schema, properties[key])
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
        if (properties[key].type === 'integer') {
          properties[key].type = 'number'
          properties[key].input.isInteger = true
          if (!properties[key].input.step) { properties[key].input.step = 1 }
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
function standardise(
  table: string,
  merged: Properties,
  groupLookup: string[],
  parentQualifiedName: string[],
  parentQualifiedFriendlyName: string[],
  permission: string,
) {
  trace.log({ arguments, level: 'verbose' })
  trace.log(table, parentQualifiedName)

  /** main loop throiugh fields  */
  for (const key of Object.keys(merged)) {
    // loop through fields (columns) in the table
    const property: Property=merged[key];
    trace.log({ next: key, attr: property, level: 'verbose' })
    if (!property.type) { property.type = 'string' }
    property.key = key
    if (!property.friendlyName) { property.friendlyName = humaniseFieldname(key) }
    if (parentQualifiedName.length == 0) {
      property.qualifiedName = [key]
      property.qualifiedFriendlyName = [property.friendlyName]
    } else {
      property.qualifiedName = []
      property.qualifiedFriendlyName = []
      for (let i = 0; i < parentQualifiedName.length; i++) {
        property.qualifiedName[i] = parentQualifiedName[i]
        property.qualifiedFriendlyName[i] = parentQualifiedFriendlyName[i]
      }
      trace.log({ key, qname: property.qualifiedName, qfname: property.qualifiedFriendlyName }, { level: 'norm' })
      property.qualifiedName.push(key)
      property.qualifiedFriendlyName.push(property.friendlyName)
      trace.log({ key, qname: property.qualifiedName, qfname: property.qualifiedFriendlyName }, { level: 'norm' })
    }
    if (property.type === 'object') {
      if (!property.object && property.properties) { property.object = property.properties }
      trace.log(key, property.object)
      standardise(table, property.object, [], property.qualifiedName, property.qualifiedFriendlyName, permission)
    }
    /**
      *
      * Guarantee that certain sub-object/values are there with default values
      *
      * */
    if (!property.input) { property.input = {} }
    if (!property.database) { property.database = {} }
    if (!property.process) { property.process = {} }
    if (!property.display) { property.display = {} }
    /** field type */
    if (property.primaryKey && suds[suds.dbDriver].dbkey) { property.type = suds[suds.dbDriver].dbkey }
    if (property.model && suds[suds.dbDriver].dbkey) { property.type = suds[suds.dbDriver].dbkey }

    if (property.type != 'string' && property.type != 'number' && property.type != 'boolean' && property.type != 'object') {
      throw new Error(`merge-attributes.pl::Table: ${table}, Attribute: ${key} Type: ${property.type} is invalid. Suggest running ${suds.baseURL}/validateconfig`)
    }

    /** Input and input type */
    if (property.type == 'boolean' && !property.input.type) { property.input.type = 'checkbox' }

    if (property.type == 'number' && !property.input.type) { property.input.type = 'number' }

    /** Anything else is text! */
    if (!property.input.type) { property.input.type = 'text' }

    if (!property.input.validations) { property.input.validations = {} } // guarantee that there is an validations object.
    if (!property.input.class) { property.input.class = suds.input.class } // Default class for input fields.

    /** display type */
    if (!property.display.type) { property.display.type = '' }

    /** Description  */

    if (!property.description) { property.description = property.friendlyName }
    if (property.description.includes('"')) { property.description = property.description.replace(/"/g, '&quot;') }
    if (property.description.includes('`')) { property.description = property.description.replace(/`/g, '&quot;') }

    /** Help text */
    property.helpText = ''
    const intype = property.input.type
    if (suds.inputTypes[intype] && suds.inputTypes[intype].helpText) { property.helpText = suds.inputTypes[intype].helpText }

    /** Record type and record type column = e.g. Customer type or product type. Special functiopns for this
    property.recordTypeColumn = false;
    property.recordTypes = {};
    if (key == schema.recordTypeColumn) {
      property.recordTypeColumn = true;
      property.recordTypes = schema.recordTypes;
    }
*/

    trace.log({ key, type: property, level: 'norm' })
    trace.log({ key, type: property.input.type, level: 'norm' })

    /* ************************************************
    *
    *   Permission
    *   set up new attributes: canView and canEdit
    *   for each field.
    *
    ************************************************ */
    trace.log({ key, group: groupLookup[key], permission }, { level: 'norm' })
    property.canEdit = true // assume all permissions OK
    property.canView = true
    if (permission == '#superuser#') { continue }
    trace.log(property.qualifiedName)
    //  If there is no  field-level permission object, default to the group permission
    if (!property.permission) {
      let groupkey = key
      if (property.qualifiedName[0]) { groupkey = property.qualifiedName[0] };
      trace.log(groupkey, groupLookup[groupkey])
      if (schema.groups[groupLookup[groupkey]]) {
        const groupPermission = schema.groups[groupLookup[groupkey]].permission
        if (groupPermission) {
          property.permission = groupPermission
        }
      }
    }

    trace.log(table, key, permission, property.permission, { level: 'norm' })
    trace.log(table, key, permission, property.permission, { level: key })

    /* if this field has a permission set then the default no longer applies */
    if (property.permission) {
      property.canEdit = false
      property.canView = false
      trace.log({ text: 'check permission', key, merged: property, level: key })

      /* if there is an  'all' permission set then this applies to edit and view */
      if (property.permission.all) { // If there is a specific view permission
        if (property.permission.all.includes(permission) || // and it doesn't include this user
          property.permission.all.includes('all') // or all:['all']}
        ) {
          property.canEdit = true // assume all permissions OK
          property.canView = true
        }
      }

      /* if there is a view permission this applies */
      if (property.permission.view) { // If there is a specific view permission
        if (property.permission.view.includes(permission) || // and it doesn't include this user
          property.permission.view.includes('all') // or view:['all']}
        ) {
          property.canView = true // then can't view
        }
      }

      /* if there is a edit permission this applies */
      if (property.permission.edit) { // If there is a specific edit permission
        if (property.permission.edit.includes(permission) || // and it doesn't include this user
          property.permission.edit.includes('all') // or all:['all']}
        ) {
          property.canEdit = true // then can't edit
        }
      }
      trace.log({ table, text: 'permission', key, merged: property, permission: property.permission, canedit: property.canEdit, canview: property.canView })
    }

    trace.log({ text: 'end loop', key, merged: property, level: 'norm' })
    trace.log({ text: 'end loop', key, merged: property, level: key })
  }
  return merged
}
