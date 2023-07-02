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
 * Doesn't really merge things any more. It standardises the attributes to that they all have the
 * same structure.
 *
 * This module 'compiles' the schema  by standardising the object and making sure that every
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2UtYXR0cmlidXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9tZXJnZS1hdHRyaWJ1dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUMzQixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2xDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQy9DLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFLekQsSUFBSSxLQUFLLEdBQVUsRUFBRSxDQUFDO0FBRXRCLElBQUksTUFBYyxDQUFDO0FBRW5COzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQWEsRUFBRSxVQUFrQixFQUFFLFVBQW9CLEVBQUUsb0JBQWdDO0lBQ2xILEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUVoQyxJQUFJLEtBQUssS0FBSyxhQUFhLEVBQUU7UUFDM0IsS0FBSyxHQUFHLEVBQUUsQ0FBQTtRQUNWLE9BQU07S0FDUDtJQUNELElBQUksQ0FBQyxvQkFBb0IsRUFBRTtRQUFFLG9CQUFvQixHQUFHLEVBQUUsQ0FBQTtLQUFFO0lBQ3hELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUM1RCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtB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O1lBQUUsUUFBUSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7U0FBRTtRQUMvRyxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQUUsUUFBUSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7U0FBRTtRQUUvRyxnQkFBZ0I7UUFDaEIsUUFBUSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7UUFDdEIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUE7UUFDbEMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO1lBQUUsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQTtTQUFFO1FBRXpIOzs7Ozs7O01BT0Y7UUFFRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7UUFDakQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7UUFFNUQ7Ozs7OzsyREFNbUQ7UUFDbkQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7UUFDMUUsUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUEsQ0FBQyw0QkFB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