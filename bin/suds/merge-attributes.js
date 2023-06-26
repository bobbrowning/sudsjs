"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('loading db 1');
const trace = require('track-n-trace');
const dcopy = require('deep-copy');
const invertGroups = require('./invert-groups');
const suds = require('../../config/suds');
const humaniseFieldname = require('./humanise-fieldname');
let cache = {};
let tableData;
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
    trace.log({ inputs: arguments });
    if (table == 'clear-cache') {
        cache = {};
        return;
    }
    if (!additionalAttributes) {
        additionalAttributes = {};
    }
    trace.log({ table, permission, cached: Object.keys(cache) });
    if (suds.jsonSchema.includes(table)) {
        tableData = require('../../tables/' + table + '.json');
    }
    else {
        tableData = require('../../tables/' + table);
    }
    if (!tableData) {
        throw new Error(`merge-attributes.pl::Table: ${table} - Can't find any config data for this table. Suggest running ${suds.baseURL}/validateconfig`);
    }
    //   if (tableData.attributes_merged) {return attributes}   // only do this once
    //   tableData.attributes_merged=true;
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
          */
        let standardHeader = {};
        if (tableData.standardHeader) {
            standardHeader = require('../../config/standard-header')[suds[suds.dbDriver].standardHeader];
        }
        trace.log(standardHeader);
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
        if (!tableData.attributes && tableData.properties) {
            tableData.attributes = tableData.properties;
        } // for compatibility with the JSON schema standard
        const rawAttributes = { ...standardHeader, ...tableData.attributes, ...additionalAttributes };
        trace.log(table, rawAttributes, { level: 's2' });
        dereference(rawAttributes, tableData);
        decomment(tableData);
        decomment(rawAttributes);
        trace.log(tableData);
        if (tableData.children) {
            for (const key of Object.keys(tableData.children)) {
                rawAttributes[key] = tableData.children[key];
            }
        }
        trace.log(tableData);
        jsonSchemaConvert(rawAttributes, tableData, tableData);
        /** Make a deep copy of the attributes (properties) */
        const rawAttributesDeep = dcopy(rawAttributes);
        trace.log({ header: standardHeader, rawAttributes: rawAttributesDeep, level: 'verbose' });
        /** Create lookup with the group for each attribute (top level attribute).
         * This is so that permissions can be propogated through the group.
         * */
        const groupLookup = invertGroups(tableData, rawAttributesDeep);
        trace.log(groupLookup, { level: 'verbose' });
        /** Standardise attributes */
        const standardisedAttributes = standardise(table, rawAttributesDeep, groupLookup, [], [], permission);
        cache[cachekey] = standardisedAttributes;
        /** create friendlyName for each top level item in the subschema
        * This seems to have some unwarrentled assumptions - like the subschema is added at the top level.
        */
        if (subschemas && tableData.list && tableData.list.subschemaName) {
            for (const key of Object.keys(additionalAttributes)) {
                cache[cachekey][key].friendlyName = `${suds.subschemaGroups[tableData.list.subschemaName]}: ${cache[cachekey][key].friendlyName}`;
            }
        }
        /** If there is a record type column - set the recordtypefix boolean for that element */
        if (tableData.recordTypeColumn && cache[cachekey][tableData.recordTypeColumn]) {
            cache[cachekey][tableData.recordTypeColumn].recordType = true;
            if (tableData.recordTypeFix) {
                cache[cachekey][tableData.recordTypeColumn].recordTypeFix = true;
            }
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
 * @param {object} tableData
 * @param {object} parent
 */
function dereference(properties, tableData) {
    trace.log(tableData.friendlyName);
    /*   couldn't get this to work  *********
   const deref = require('json-schema-deref-sync');
   const schema=JSON.stringify(properties)
   try {
   deref(schema,{baseFolder:'/home/bob/suds/tables'})
   console.log(JSON.parse(schema))
   process.exit()
   }
   catch (err) {
     throw new Error (`problem with schema for ${tableData.friendlyName}
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
                    if (!(tableData['$defs'])) {
                        throw new Error(`merge-attributes.js::No $defs object for ${ref}`);
                    }
                    if (!(tableData['$defs'][ref])) {
                        throw new Error(`merge-attributes.js::No $defs/${ref} object`);
                    }
                    for (const jr of Object.keys(tableData['$defs'][ref])) {
                        trace.log(jr, tableData['$defs'][ref][jr]);
                        properties[jr] = tableData['$defs'][ref][jr];
                    }
                }
            }
            delete properties[key];
        }
        else {
            if (properties[key].type == 'object') {
                trace.log(properties[key].properties);
                //        if (properties[key].object) dereference(properties[key].object, tableData)
                if (properties[key].properties)
                    dereference(properties[key].properties, tableData);
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
 * @param (object) tableData - the original top level object
 * @param (object) parent - the object containg these properties
 */
function jsonSchemaConvert(properties, tableData, parent) {
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
            jsonSchemaConvert(properties[key].object, tableData, properties[key]);
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
                    jsonSchemaConvert(properties[key].object, tableData, properties[key]);
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
        trace.log({ next: key, attr: merged[key], level: 'verbose' });
        if (!merged[key].type) {
            merged[key].type = 'string';
        }
        merged[key].key = key;
        if (!merged[key].friendlyName) {
            merged[key].friendlyName = humaniseFieldname(key);
        }
        if (parentQualifiedName.length == 0) {
            merged[key].qualifiedName = [key];
            merged[key].qualifiedFriendlyName = [merged[key].friendlyName];
        }
        else {
            merged[key].qualifiedName = [];
            merged[key].qualifiedFriendlyName = [];
            for (let i = 0; i < parentQualifiedName.length; i++) {
                merged[key].qualifiedName[i] = parentQualifiedName[i];
                merged[key].qualifiedFriendlyName[i] = parentQualifiedFriendlyName[i];
            }
            trace.log({ key, qname: merged[key].qualifiedName, qfname: merged[key].qualifiedFriendlyName }, { level: 'norm' });
            merged[key].qualifiedName.push(key);
            merged[key].qualifiedFriendlyName.push(merged[key].friendlyName);
            trace.log({ key, qname: merged[key].qualifiedName, qfname: merged[key].qualifiedFriendlyName }, { level: 'norm' });
        }
        if (merged[key].type === 'object') {
            if (!merged[key].object && merged[key].properties) {
                merged[key].object = merged[key].properties;
            }
            trace.log(key, merged[key].object);
            standardise(table, merged[key].object, {}, merged[key].qualifiedName, merged[key].qualifiedFriendlyName);
        }
        /**
          *
          * Guarantee that certain sub-object/values are there with default values
          *
          * */
        if (!merged[key].input) {
            merged[key].input = {};
        }
        if (!merged[key].database) {
            merged[key].database = {};
        }
        if (!merged[key].process) {
            merged[key].process = {};
        }
        if (!merged[key].display) {
            merged[key].display = {};
        }
        /** field type */
        if (merged[key].primaryKey && suds[suds.dbDriver].dbkey) {
            merged[key].type = suds[suds.dbDriver].dbkey;
        }
        if (merged[key].model && suds[suds.dbDriver].dbkey) {
            merged[key].type = suds[suds.dbDriver].dbkey;
        }
        if (merged[key].type != 'string' && merged[key].type != 'number' && merged[key].type != 'boolean' && merged[key].type != 'object') {
            throw new Error(`merge-attributes.pl::Table: ${table}, Attribute: ${key} Type: ${merged[key].type} is invalid. Suggest running ${suds.baseURL}/validateconfig`);
        }
        /** Input and input type */
        if (merged[key].type == 'boolean' && !merged[key].input.type) {
            merged[key].input.type = 'checkbox';
        }
        if (merged[key].type == 'number' && !merged[key].input.type) {
            merged[key].input.type = 'number';
        }
        /** Anything else is text! */
        if (!merged[key].input.type) {
            merged[key].input.type = 'text';
        }
        if (!merged[key].input.validations) {
            merged[key].input.validations = {};
        } // guarantee that there is an validations object.
        if (!merged[key].input.class) {
            merged[key].input.class = suds.input.class;
        } // Default class for input fields.
        /** display type */
        if (!merged[key].display.type) {
            merged[key].display.type = '';
        }
        /** Description  */
        if (!merged[key].description) {
            merged[key].description = merged[key].friendlyName;
        }
        if (merged[key].description.includes('"')) {
            merged[key].description = merged[key].description.replace(/"/g, '&quot;');
        }
        if (merged[key].description.includes('`')) {
            merged[key].description = merged[key].description.replace(/`/g, '&quot;');
        }
        /** Help text */
        merged[key].helpText = '';
        const intype = merged[key].input.type;
        if (suds.inputTypes[intype] && suds.inputTypes[intype].helpText) {
            merged[key].helpText = suds.inputTypes[intype].helpText;
        }
        /** Record type and record type column = e.g. Customer type or product type. Special functiopns for this
        merged[key].recordTypeColumn = false;
        merged[key].recordTypes = {};
        if (key == tableData.recordTypeColumn) {
          merged[key].recordTypeColumn = true;
          merged[key].recordTypes = tableData.recordTypes;
        }
    */
        trace.log({ key, type: merged[key], level: 'norm' });
        trace.log({ key, type: merged[key].input.type, level: 'norm' });
        /* ************************************************
        *
        *   Permission
        *   set up new attributes: canView and canEdit
        *   for each field.
        *
        ************************************************ */
        trace.log({ key, group: groupLookup[key], permission }, { level: 'norm' });
        merged[key].canEdit = true; // assume all permissions OK
        merged[key].canView = true;
        if (permission == '#superuser#') {
            continue;
        }
        trace.log(merged[key].qualifiedName);
        //  If there is no  field-level permission object, default to the group permission
        if (!merged[key].permission) {
            let groupkey = key;
            if (merged[key].qualifiedName[0]) {
                groupkey = merged[key].qualifiedName[0];
            }
            ;
            trace.log(groupkey, groupLookup[groupkey]);
            if (tableData.groups[groupLookup[groupkey]]) {
                const groupPermission = tableData.groups[groupLookup[groupkey]].permission;
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
            trace.log({ text: 'check permission', key, merged: merged[key], level: key });
            /* if there is an  'all' permission set then this applies to edit and view */
            if (merged[key].permission.all) { // If there is a specific view permission
                if (merged[key].permission.all.includes(permission) || // and it doesn't include this user
                    merged[key].permission.all.includes('all') // or all:['all']}
                ) {
                    merged[key].canEdit = true; // assume all permissions OK
                    merged[key].canView = true;
                }
            }
            /* if there is a view permission this applies */
            if (merged[key].permission.view) { // If there is a specific view permission
                if (merged[key].permission.view.includes(permission) || // and it doesn't include this user
                    merged[key].permission.view.includes('all') // or view:['all']}
                ) {
                    merged[key].canView = true; // then can't view
                }
            }
            /* if there is a edit permission this applies */
            if (merged[key].permission.edit) { // If there is a specific edit permission
                if (merged[key].permission.edit.includes(permission) || // and it doesn't include this user
                    merged[key].permission.edit.includes('all') // or all:['all']}
                ) {
                    merged[key].canEdit = true; // then can't edit
                }
            }
            trace.log({ table, text: 'permission', key, merged: merged[key], permission: merged[key].permission, canedit: merged[key].canEdit, canview: merged[key].canView });
        }
        trace.log({ text: 'end loop', key, merged: merged[key], level: 'norm' });
        trace.log({ text: 'end loop', key, merged: merged[key], level: key });
    }
    return merged;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2UtYXR0cmlidXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9tZXJnZS1hdHRyaWJ1dGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUMzQixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2xDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQy9DLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFJekQsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFBO0FBQ2QsSUFBSSxTQUFTLENBQUE7QUFFYjs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNILE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxvQkFBb0I7SUFDNUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBQ2hDLElBQUksS0FBSyxJQUFJLGFBQWEsRUFBRTtRQUMxQixLQUFLLEdBQUcsRUFBRSxDQUFBO1FBQ1YsT0FBTTtLQUNQO0lBQ0QsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1FBQUUsb0JBQW9CLEdBQUcsRUFBRSxDQUFBO0tBQUU7SUFDeEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzVELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxD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