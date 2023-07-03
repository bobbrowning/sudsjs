"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('loading db 1');
const trace = require('track-n-trace');
const dcopy = require('deep-copy');
const invertGroups = require('./invert-groups');
const suds = require('../../config/suds');
const humaniseFieldname = require('./humanise-fieldname');
let cache = {};
let schema;
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
module.exports = function (table, permission, subschemas, additionalAttributes) {
    trace.log({ inputs: arguments });
    if (table === 'clear-cache') {
        cache = {};
        return;
    }
    if (!additionalAttributes) {
        additionalAttributes = {};
    }
    trace.log({ table, permission, cached: Object.keys(cache) });
    if (suds.jsonSchema.includes(table)) {
        schema = require('../../tables/' + table + '.json');
    }
    else {
        schema = require('../../tables/' + table);
    }
    if (!schema) {
        throw new Error(`merge-attributes.pl::Table: ${table} - Can't find any config data for this table. Suggest running ${suds.baseURL}/validateconfig`);
    }
    //   if (schema.attributes_merged) {return attributes}   // only do this once
    //   schema.attributes_merged=true;
    let cachekey = '';
    if (permission) {
        cachekey = permission + 'Z';
    }
    cachekey += table;
    if (subschemas) {
        for (let i = 0; i < subschemas.length; i++) {
            cachekey += 'Z' + subschemas[i];
        }
    }
    trace.log({ cachekey, cached: Object.keys(cache) });
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
        trace.log({ creating: 'cache for ', table, cachekey });
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
        let rawAttributes = {};
        if (!schema.attributes && schema.properties) {
            schema.attributes = schema.properties;
        } // for compatibility with the JSON schema standard
        rawAttributes = { /*...standardHeader,*/ ...schema.attributes, ...additionalAttributes };
        trace.log(table, rawAttributes, { level: 's2' });
        dereference(rawAttributes, schema);
        decomment(schema);
        decomment(rawAttributes);
        trace.log(schema);
        /** Legacy: The children data used to be mixed in with Properties. This is because
         * I was following the sailsjs.com standard.  It's just plain wrong but this kludge
         * reverts back to this format.
         */
        if (schema.children) {
            for (const key of Object.keys(schema.children)) {
                rawAttributes[key] = schema.children[key];
            }
        }
        trace.log(schema);
        jsonSchemaConvert(rawAttributes, schema, schema);
        /** Make a deep copy of the attributes (properties) */
        const rawAttributesDeep = dcopy(rawAttributes);
        trace.log({ rawAttributes: rawAttributesDeep, level: 'verbose' });
        /** Create lookup with the group for each attribute (top level attribute).
         * This is so that permissions can be propogated through the group.
         * */
        const groupLookup = invertGroups(schema, rawAttributesDeep);
        trace.log(groupLookup, { level: 'verbose' });
        /** Standardise attributes */
        const standardisedAttributes = standardise(table, rawAttributesDeep, groupLookup, [], [], permission);
        cache[cachekey] = standardisedAttributes;
        /** create friendlyName for each top level item in the subschema
        * This seems to have some unwarrentled assumptions - like the subschema is added at the top level.
        */
        if (subschemas && schema.list && schema.list.subschemaName) {
            for (const key of Object.keys(additionalAttributes)) {
                cache[cachekey][key].friendlyName = `${suds.subschemaGroups[schema.list.subschemaName]}: ${cache[cachekey][key].friendlyName}`;
            }
        }
        /** If there is a record type column - set the recordtypefix boolean for that element */
        if (schema.recordTypeColumn && cache[cachekey][schema.recordTypeColumn]) {
            cache[cachekey][schema.recordTypeColumn].recordType = true;
            //      if (schema.recordTypeFix) { cache[cachekey][schema.recordTypeColumn].recordTypeFix = true }
        }
    }
    /** Retun result. */
    trace.log({ table: table, permission, key: cachekey, attributes: cache[cachekey], cached: Object.keys(cache), level: 'verbose', maxdepth: 4 });
    return (cache[cachekey]);
};
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
function dereference(properties, schema) {
    trace.log(schema.friendlyName);
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
    trace.log(properties);
    for (const key of Object.keys(properties)) {
        trace.log({ key: key, properties: properties[key] });
        if (key === '$ref') {
            /**
             *  Only $ref supported are:
             * #/$defs/aaa   retrieved bbb from object $defs in the current document
             * filename.js#/aaa   object aaa in filename.js  which is in the tables directory
             */
            let jsonFragments;
            if (properties[key].includes('{{dbDriver}}')) {
                properties[key] = properties[key].replace('{{dbDriver}}', suds.dbDriver);
            }
            let [address, ref] = properties[key].split('#/');
            trace.log(address, ref);
            if (address) {
                jsonFragments = require(`../../tables/${address}`);
                trace.log(`Replacing $ref with object in ${address} - ${ref}`);
                for (const jr of Object.keys(jsonFragments[ref])) {
                    properties[jr] = jsonFragments[ref][jr];
                }
            }
            else {
                if (ref.includes('$defs/')) {
                    ref = ref.replace('$defs/', '');
                    if (!(schema['$defs'])) {
                        throw new Error(`merge-attributes.js::No $defs object for ${ref}`);
                    }
                    if (!(schema['$defs'][ref])) {
                        throw new Error(`merge-attributes.js::No $defs/${ref} object`);
                    }
                    for (const jr of Object.keys(schema['$defs'][ref])) {
                        trace.log(jr, schema['$defs'][ref][jr]);
                        properties[jr] = schema['$defs'][ref][jr];
                    }
                }
            }
            delete properties[key];
        }
        else {
            if (properties[key].type == 'object') {
                trace.log(properties[key].properties);
                //        if (properties[key].object) dereference(properties[key].object, schema)
                if (properties[key].properties)
                    dereference(properties[key].properties, schema);
            }
        }
    }
    trace.log(properties);
}
/**
 *
 * Decomment obj
 *
 * @param {object} obj
 */
function decomment(obj) {
    for (const key of Object.keys(obj)) {
        trace.log(key);
        if (key === '$comment') {
            delete obj[key];
            continue;
        }
        if (key === 'properties') {
            decomment(obj[key]);
        }
        if (key === 'items') {
            decomment(obj[key]);
        }
        if (typeof obj[key] === 'object' && obj[key]['$comment']) {
            delete obj[key]['$comment'];
        }
    }
    trace.log(obj);
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
function jsonSchemaConvert(properties, schema, parent) {
    trace.log({ properties: properties, level: 's2' });
    trace.log(parent.required);
    if (parent && parent.required) {
        for (const key of parent.required) {
            if (!properties[key]) {
                throw new Error(`merge-attributes.pl::No properties for field name ${key}`);
            }
            if (!properties[key].input) {
                properties[key].input = {};
            }
            properties[key].input.required = true;
        }
    }
    trace.log('required list processed');
    for (const key of Object.keys(properties)) {
        trace.log({ key: key, type: properties[key].type, level: 's2' });
        if (properties[key].type === 'object') {
            if (!properties[key].object && properties[key].properties) {
                properties[key].object = properties[key].properties;
            }
            //     delete properties[key].properties
            trace.log('next level', key, properties[key].type);
            jsonSchemaConvert(properties[key].object, schema, properties[key]);
        }
        else {
            if (properties[key].type === 'array') {
                trace.log({ key: key, properties: properties[key], level: 's1' });
                properties[key].type = 'object';
                if (properties[key].input && properties[key].input.single) {
                    properties[key].array = { type: 'single' };
                }
                else {
                    properties[key].array = { type: 'multiple' };
                }
                if (properties[key].items.type === 'object') {
                    properties[key].object = properties[key].items.properties;
                    trace.log('next level', key);
                    jsonSchemaConvert(properties[key].object, schema, properties[key]);
                }
                else {
                    for (const item of Object.keys(properties[key].items)) {
                        properties[key][item] = properties[key].items[item];
                    }
                }
                //     delete properties[key].items
                trace.log({ key: key, type: properties[key], level: 's1' });
            }
            else {
                /* a real field */
                if (typeof properties[key].input === 'undefined')
                    properties[key].input = {};
                if (properties[key].type === 'integer') {
                    properties[key].type = 'number';
                    properties[key].input.isInteger = true;
                    if (!properties[key].input.step) {
                        properties[key].input.step = 1;
                    }
                }
                trace.log(key);
                for (const subkey of Object.keys(properties[key])) {
                    trace.log(subkey);
                    let translate = {
                        maximum: 'max',
                        minimum: 'min',
                        multipleOf: 'step',
                        maxLength: 'maxlength',
                        minLength: 'minlength',
                        pattern: 'pattern',
                    };
                    if (subkey === 'enum') {
                        properties[key].values = properties[key].enum;
                        delete properties[key].enum;
                    }
                    if (translate[subkey]) {
                        properties[key].input[translate[subkey]] = properties[key][subkey];
                        delete properties[key][subkey];
                    }
                }
            }
        }
    }
    trace.log(properties, { level: 's2' });
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
function standardise(table, merged, groupLookup, parentQualifiedName, parentQualifiedFriendlyName, permission) {
    trace.log({ arguments, level: 'verbose' });
    trace.log(table, parentQualifiedName);
    /** main loop throiugh fields  */
    for (const key of Object.keys(merged)) {
        // loop through fields (columns) in the table
        const property = merged[key];
        trace.log({ next: key, attr: property, level: 'verbose' });
        if (!property.type) {
            property.type = 'string';
        }
        property.key = key;
        if (!property.friendlyName) {
            property.friendlyName = humaniseFieldname(key);
        }
        if (parentQualifiedName.length == 0) {
            property.qualifiedName = [key];
            property.qualifiedFriendlyName = [property.friendlyName];
        }
        else {
            property.qualifiedName = [];
            property.qualifiedFriendlyName = [];
            for (let i = 0; i < parentQualifiedName.length; i++) {
                property.qualifiedName[i] = parentQualifiedName[i];
                property.qualifiedFriendlyName[i] = parentQualifiedFriendlyName[i];
            }
            trace.log({ key, qname: property.qualifiedName, qfname: property.qualifiedFriendlyName }, { level: 'norm' });
            property.qualifiedName.push(key);
            property.qualifiedFriendlyName.push(property.friendlyName);
            trace.log({ key, qname: property.qualifiedName, qfname: property.qualifiedFriendlyName }, { level: 'norm' });
        }
        if (property.type === 'object') {
            if (!property.object && property.properties) {
                property.object = property.properties;
            }
            trace.log(key, property.object);
            standardise(table, property.object, [], property.qualifiedName, property.qualifiedFriendlyName, permission);
        }
        /**
          *
          * Guarantee that certain sub-object/values are there with default values
          *
          * */
        if (!property.input) {
            property.input = {};
        }
        if (!property.database) {
            property.database = {};
        }
        if (!property.process) {
            property.process = {};
        }
        if (!property.display) {
            property.display = {};
        }
        /** field type */
        if (property.primaryKey && suds[suds.dbDriver].dbkey) {
            property.type = suds[suds.dbDriver].dbkey;
        }
        if (property.model && suds[suds.dbDriver].dbkey) {
            property.type = suds[suds.dbDriver].dbkey;
        }
        if (property.type != 'string' && property.type != 'number' && property.type != 'boolean' && property.type != 'object') {
            throw new Error(`merge-attributes.pl::Table: ${table}, Attribute: ${key} Type: ${property.type} is invalid. Suggest running ${suds.baseURL}/validateconfig`);
        }
        /** Input and input type */
        if (property.type == 'boolean' && !property.input.type) {
            property.input.type = 'checkbox';
        }
        if (property.type == 'number' && !property.input.type) {
            property.input.type = 'number';
        }
        /** Anything else is text! */
        if (!property.input.type) {
            property.input.type = 'text';
        }
        if (!property.input.validations) {
            property.input.validations = {};
        } // guarantee that there is an validations object.
        if (!property.input.class) {
            property.input.class = suds.input.class;
        } // Default class for input fields.
        /** display type */
        if (!property.display.type) {
            property.display.type = '';
        }
        /** Description  */
        if (!property.description) {
            property.description = property.friendlyName;
        }
        if (property.description.includes('"')) {
            property.description = property.description.replace(/"/g, '&quot;');
        }
        if (property.description.includes('`')) {
            property.description = property.description.replace(/`/g, '&quot;');
        }
        /** Help text */
        property.helpText = '';
        const intype = property.input.type;
        if (suds.inputTypes[intype] && suds.inputTypes[intype].helpText) {
            property.helpText = suds.inputTypes[intype].helpText;
        }
        /** Record type and record type column = e.g. Customer type or product type. Special functiopns for this
        property.recordTypeColumn = false;
        property.recordTypes = {};
        if (key == schema.recordTypeColumn) {
          property.recordTypeColumn = true;
          property.recordTypes = schema.recordTypes;
        }
    */
        trace.log({ key, type: property, level: 'norm' });
        trace.log({ key, type: property.input.type, level: 'norm' });
        /* ************************************************
        *
        *   Permission
        *   set up new attributes: canView and canEdit
        *   for each field.
        *
        ************************************************ */
        trace.log({ key, group: groupLookup[key], permission }, { level: 'norm' });
        property.canEdit = true; // assume all permissions OK
        property.canView = true;
        if (permission == '#superuser#') {
            continue;
        }
        trace.log(property.qualifiedName);
        //  If there is no  field-level permission object, default to the group permission
        if (!property.permission) {
            let groupkey = key;
            if (property.qualifiedName[0]) {
                groupkey = property.qualifiedName[0];
            }
            ;
            trace.log(groupkey, groupLookup[groupkey]);
            if (schema.groups[groupLookup[groupkey]]) {
                const groupPermission = schema.groups[groupLookup[groupkey]].permission;
                if (groupPermission) {
                    property.permission = groupPermission;
                }
            }
        }
        trace.log(table, key, permission, property.permission, { level: 'norm' });
        trace.log(table, key, permission, property.permission, { level: key });
        /* if this field has a permission set then the default no longer applies */
        if (property.permission) {
            property.canEdit = false;
            property.canView = false;
            trace.log({ text: 'check permission', key, merged: property, level: key });
            /* if there is an  'all' permission set then this applies to edit and view */
            if (property.permission.all) { // If there is a specific view permission
                if (property.permission.all.includes(permission) || // and it doesn't include this user
                    property.permission.all.includes('all') // or all:['all']}
                ) {
                    property.canEdit = true; // assume all permissions OK
                    property.canView = true;
                }
            }
            /* if there is a view permission this applies */
            if (property.permission.view) { // If there is a specific view permission
                if (property.permission.view.includes(permission) || // and it doesn't include this user
                    property.permission.view.includes('all') // or view:['all']}
                ) {
                    property.canView = true; // then can't view
                }
            }
            /* if there is a edit permission this applies */
            if (property.permission.edit) { // If there is a specific edit permission
                if (property.permission.edit.includes(permission) || // and it doesn't include this user
                    property.permission.edit.includes('all') // or all:['all']}
                ) {
                    property.canEdit = true; // then can't edit
                }
            }
            trace.log({ table, text: 'permission', key, merged: property, permission: property.permission, canedit: property.canEdit, canview: property.canView });
        }
        trace.log({ text: 'end loop', key, merged: property, level: 'norm' });
        trace.log({ text: 'end loop', key, merged: property, level: key });
    }
    return merged;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2UtYXR0cmlidXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9tZXJnZS1hdHRyaWJ1dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUMzQixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2xDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQy9DLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFLekQsSUFBSSxLQUFLLEdBQVUsRUFBRSxDQUFDO0FBRXRCLElBQUksTUFBYyxDQUFDO0FBRW5COzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNILE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFhLEVBQUUsVUFBa0IsRUFBRSxVQUFvQixFQUFFLG9CQUFnQztJQUNsSCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFFaEMsSUFBSSxLQUFLLEtBQUssYUFBYSxFQUFFO1FBQzNCLEtBQUssR0FBRyxFQUFFLENBQUE7UUFDVixPQUFNO0tBQ1A7SUFDRCxJQUFJLENBQUMsb0JBQW9CLEVBQUU7UUFBRSxvQkFBb0IsR0FBRyxFQUFFLENBQUE7S0FBRTtJQUN4RCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDNUQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxL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