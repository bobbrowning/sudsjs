"use strict";
/* Identification division  (for COBOL people)
 * Update form
 *  http://localhost:3000/admin?table=notes&mode=populate&id=2
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const friendlyName = 'Update';
const description = 'Creates update form  from the model and processes submitted form . ';
/* Environment division
 *
 *     Tested on
 *        zorin 16
 *        Node.js  v 12.18
 */
const suds = require('../../config/suds'); // Primary configuration file
const trace = require('track-n-trace'); // Debug tool
const mergeAttributes = require('./merge-attributes'); // Standardises attributes for a table, filling in any missing values with defaults
const tableDataFunction = require('./table-data'); // Extracts non-attribute data from the table definition, filling in missinh =g values
const classes = require('../../config/classes'); // Links class codes to actual classes
const lang = require('../../config/language').EN; // Object with language data
const db = require('./db'); // Database routines
const listRow = require('./list-row'); // List one row of the table plus a limited number of child roecords
const createField = require('./create-field'); // Creates an input field
const displayField = require('./display-field'); // displays a column value
const addSubschemas = require('./subschemas');
const fs = require('fs');
/** Data Division */
module.exports = async function (permission, // Permission set of the current user
table, // table / collection name
id, // record key (for MongoDB this is the hex string not the object)
mode, // Operation to be performed
entered, // record containing any presets
loggedInUser, // ID of the logged in user
open, // Table/collection name of the child list to be opened
openGroup, // Group to be opened
files, // file or files to be uploaded from the req object
subschemas, // Array of subschema keys
auditId, // ID of the audit record - updated with ID for new records
csrf // csrf code
) {
    /** * Globals */
    let tableData; // Standardised data from the schema excluding the attributes
    let tableName;
    let attributes; // Standardised attributes data form the schema.
    let err;
    let errors = {}; // Errors from validation
    let errCount; // Number of errors
    let form;
    let formList;
    let openTab;
    let columnGroup;
    let visibleGroup;
    let groups;
    let hideGroup;
    let tabs;
    const formData = {};
    let headerTags = '';
    let mainPage;
    const operation = '';
    const message = '';
    let record = {};
    /** Procedure division */
    if (arguments[0] == 'documentation') {
        return ({ friendlyName, description });
    }
    trace.log({ start: 'Update', inputs: arguments, break: '#', level: 'min' });
    trace.log({ openGroup });
    trace.log({ user: loggedInUser, level: 'user' });
    /** ************************************************
    *
    *   set up the data
    *
    ************************************************ */
    mainPage = suds.mainPage;
    if (!mainPage) {
        mainPage = '/';
    }
    tableData = tableDataFunction(table, permission);
    tableName = tableData.friendlyName;
    trace.log(permission);
    attributes = mergeAttributes(table, permission, subschemas); // attributes and extraattributes merged plus permissions
    trace.log(attributes);
    if (id && typeof id === 'string' && suds.dbkey == 'number') {
        id = Number(id);
    }
    if (id == '0') {
        id = 0;
    }
    trace.log({
        text: 'Control information',
        table,
        mode,
        id
    });
    /** Stop from editing if no permission
     *        One exception - this row is a demonstration row and this is a guest user
     */
    if (!tableData.canEdit &&
        !(tableData.demoRow && tableData.demoRow == id && permission == '#guest#')) {
        return `<p>Sorry - you don't have permission to edit ${tableData.friendlyName} (${table})`;
    }
    /**  */
    trace.log('before unpack');
    record = unpackInput(entered, {}, attributes, '');
    trace.log({ stage: 'unpacked', level: 'min' });
    trace.log(record);
    trace.log({ subschemas });
    switch (mode) {
        case 'new':
            err = blankFormData();
            if (err) {
                return (err);
            }
            trace.log(record);
            break;
        case 'populate':
            trace.log({ subschemas });
            record = await populateFormData();
            if (record.err) {
                return (record.errtext);
            }
            trace.log({ stage: 'populated record', level: 'min' });
            trace.log({ subschemas, attributes, maxdepth: 2 });
            break;
        case 'update':
            errors = await validateData();
            trace.log({ stage: 'validated', level: 'min' });
            errCount = Object.keys(errors).length;
            break;
    }
    trace.log({ subschemas, record });
    if (mode == 'update' && errCount == 0) {
        await updateDatabase();
        trace.log({ stage: 'Database updated', level: 'min' });
        return postProcess();
    }
    trace.log({
        table,
        id,
        mode,
        record,
        errors,
        errCount,
        openGroup
    });
    /** *
     *
     * Now create the input form. Note that if we were updating then the program switched
     * to listing the row in the previous stage.
     *
     *
     */
    if (tableData.edit.preForm) {
        await tableData.edit.preForm(record, mode);
    }
    form = '';
    formList = fieldList(attributes, false);
    trace.log({ formList, permission });
    openTab = '';
    columnGroup = {};
    visibleGroup = {};
    hideGroup = {};
    tabs = [];
    if (tableData.groups) {
        await createFormGroups();
    }
    else {
        tableData.groups = { other: { static: true } };
        tableData.groups.other.columns = formList;
    }
    groups = tableData.groups;
    trace.log({ groups });
    /** * *******************************************************
     *
     *  loop hrough fields in top level storing field title and html.
     *
     ****************************************************** */
    for (const key of formList) {
        trace.log(key, record[key], attributes[key].array, attributes[key].type);
        let headerTag;
        if (attributes[key].array && attributes[key].array.type != 'single') {
            [formData[key], headerTag] = await createFieldArray(key, attributes[key], record[key], '');
        }
        else {
            if (attributes[key].type == 'object') {
                [formData[key], headerTag] = await createFieldObject(key, attributes[key], record[key], '');
            }
            else {
                trace.log(key, record[key]);
                [formData[key], headerTag] = await createOneFieldHTML(key, attributes[key], record[key], key, '');
            }
        }
        //  [formData[key], headerTag] = await createFieldHTML(key, attributes[key], record[key], '');
        trace.log({ key, form: formData[key], tag: headerTag, level: 'verbose' });
        trace.log({ stage: `form field ${key} created`, level: 'min' });
        if (!headerTags.includes(headerTag)) {
            headerTags += headerTag;
        }
    }
    trace.log({ stage: 'form fields created', level: 'min' });
    await createValidationScript();
    trace.log({ subschemas });
    await createForm();
    trace.log({ stage: 'form created', level: 'min' });
    trace.log(record);
    let footnote = '';
    if (mode != 'new') {
        const created = new Date(record.createdAt).toDateString();
        const updated = new Date(record.updatedAt).toDateString();
        const updatedBy = { fullName: 'Nobody' };
        if (record.updatedBy) {
            const updatedBy = await db.getRow('user', record.updatedBy);
        }
        trace.log(updatedBy);
        footnote = `${lang.rowNumber}: ${id} ${lang.createdAt}: ${created} ${lang.updatedAt}: ${updated}  ${lang.updatedBy} ${updatedBy.fullName}`;
    }
    else {
        footnote = '';
    }
    trace.log(form);
    trace.log({ stage: 'exiting update-form.js', level: 'min' });
    return ({ output: form, footnote, headerTags });
    //  return exits.success(form);
    /** * **************************************** Functions ********************************** */
    /** ********************************************************
    *
    *  Unpack Input
    *
    * Process unstructured data from the form and produce an object
    * reflecting the record structure defined in the schema.
    *
    * The function loops through the top-level data. It is not called
    * recursively.
    *
    * @returns {object} Record
    ***************************************************** */
    function unpackInput() {
        trace.log({ entered, permission });
        const formList = fieldList(attributes, true);
        trace.log(formList);
        record = {};
        for (const key of formList) {
            trace.log(key, attributes[key], entered[key]);
            if (attributes[key].array) {
                record[key] = unpackArray(key, attributes[key]);
                trace.log(key, record[key]);
            }
            else {
                if (attributes[key].type == 'object') {
                    record[key] = unpackObject(key, attributes[key]);
                    trace.log(key, record[key]);
                }
                else {
                    if (typeof entered[key] !== 'undefined') {
                        trace.log(key, entered[key], typeof entered[key]);
                        record[key] = entered[key];
                    }
                }
            }
        }
        trace.log(record);
        //  throw 'stopped'
        return record;
    }
    /** ********************************************************
     *
     * Ths function fills an array from the input data.  Array data field names
     * have a numeric postfix starting 1, e.g. user.1, user.2 etc.
     *
     * If this is further down the structure the name may be qualiufied
     * e.g. user.firstname - this is given in the index field.
     * So an array item that is part of an object that is part of another array might
     * be name.2.firstame.3 for example.
     *
     * @param(string) key of the array being unpacked
     * @param {string} index -  The prefix to the field name
     * @param {string} attributes - the arttributes of this field only
     ****************************************************** */
    function unpackArray(fieldName, attributes) {
        trace.log(arguments);
        const arry = [];
        let length = 0;
        if (!entered[fieldName + '.length']) {
            length = 0;
            return [];
        }
        length = parseInt(entered[fieldName + '.length']);
        trace.log({ length });
        let next = 0;
        for (let i = 0; i < length; i++) {
            const subFieldName = `${fieldName}.${i + 1}`;
            trace.log({
                fieldName,
                i,
                next,
                type: attributes.type,
                fieldname: subFieldName,
                value: entered[subFieldName],
                delete: entered[subFieldName + '.delete']
            });
            if (attributes.type != 'object') {
                /** Skip blank entries. */
                if (!entered[subFieldName]) {
                    continue;
                }
                /** Skip deleted entries */
                if (entered[subFieldName + '.delete']) {
                    continue;
                }
                trace.log(next, entered[subFieldName]);
                arry[next++] = entered[subFieldName];
            }
            else {
                /** Skip deleted entries */
                if (entered[subFieldName + '.delete']) {
                    continue;
                }
                arry[next++] = unpackObject(subFieldName, attributes);
            }
        }
        trace.log({ arry: arry, json: attributes.process });
        /** array type 'single' refers to checkboxes, where the array is treated as a single field
         * that has multiple values. There may be other types of input in the future.
         * this is for relational databases where checkboxes are stored as a JSON field. */
        if (attributes.process == 'JSON') {
            trace.log('returning', JSON.stringify(arry));
            return JSON.stringify(arry);
        }
        else {
            return arry;
        }
    }
    function unpackObject(fieldName, attributes) {
        const obj = {};
        trace.log({ fieldNme: fieldName, attributes });
        for (const subkey of Object.keys(attributes.object)) {
            const subFieldName = fieldName + '.' + subkey;
            trace.log({ subkey, subFieldName, entered: entered[subFieldName], type: attributes.object[subkey].type });
            trace.log(attributes.object[subkey].array);
            if (attributes.object[subkey].array) {
                obj[subkey] = unpackArray(subFieldName, attributes.object[subkey]);
            }
            else {
                if (attributes.object[subkey].type == 'object') {
                    obj[subkey] = unpackObject(subFieldName, attributes.object[subkey]);
                }
                else {
                    if (entered[subFieldName]) {
                        obj[subkey] = entered[subFieldName];
                    }
                    else {
                        obj[subkey] = '';
                    }
                    trace.log(subkey, obj[subkey]);
                }
            }
        }
        trace.log(obj);
        return obj;
    }
    /**
     *
     * Ths function fills an array from the input data.  The key
     * is the qualified field name including index.
     *
     * @param {object} entered
     * @param {string} key
  
     function fillObject(entered, key, index,attributes) {
      let obj={};
      for (let subkey of Object.keys(attributes[key].object) {
           trace.log(key,subkey,Index);
  
          if (attributes[subkey].type != 'object') {
          obj[subkey]=entered[key+'.'+Index]
          }
          else {
            arry[i]=fillObject(entered,key,index,attributes);
          }
  
        }
        trace.log(arry);
        return arry;
    }
  
  */
    /** *******************************************************
    *
    * Set defaults for blank form in the global: record.
    * There may be some pre-populated values in the record.
    * Othewise there may be values such as #today, #today+5
    * or #loggedInUser
    * @param {object} Attributes
    * @param {object} Mainly empty record, but may contain any pre-set data
    * @returns (string) Any errors. record is updated inb-place.
    *
    ****************************************************** */
    function blankFormData() {
        trace.log(record);
        const err = '';
        for (const key of Object.keys(attributes)) {
            if (attributes[key].collection) {
                continue;
            } // not interested in collections
            let value;
            if (!record[key]) { // might be pre-set
                if (typeof attributes[key].input.default === 'function') {
                    value = attributes[key].input.default(record);
                }
                else {
                    if (attributes[key].input.default == '!table') {
                        value = table;
                    }
                    else {
                        value = attributes[key].input.default;
                    }
                }
            }
            trace.log({ key, value, level: 'verbose' });
            if (value && typeof value === 'string') {
                trace.log(value.substring(6, 7));
            }
            if (value) {
                if (value == '#loggedInUser') {
                    record[key] = loggedInUser;
                }
                else {
                    if (value && typeof value === 'string' && value.substring(0, 6) == '#today') {
                        const date = new Date();
                        const sign = value.substring(6, 7);
                        if (sign) {
                            const delta = Number(value.substring(7));
                            trace.log(delta);
                            if (delta != 'NaN') {
                                if (sign == '-') {
                                    date.setDate(date.getDate() - delta);
                                }
                                if (sign == '+') {
                                    date.setDate(date.getDate() + delta);
                                }
                            }
                        }
                        if (attributes[key].type == 'string') {
                            const iso = date.toISOString();
                            record[key] = iso.split('T')[0];
                        }
                        else {
                            record[key] = date.getTime();
                        }
                    }
                    else {
                        record[key] = value;
                    }
                }
            }
        }
        trace.log(record);
        return (err);
    }
    /**
     * Addsubs - creeate object with additioonal attributes from subschemas
     * Subshemas are assumed to be a JSON object containsing an array of subschem keys
     * Only works with Document Databases
     *
     * @param {object} record
     * @returns {array} subschemas list, additional attributes
     */
    async function addSubs(record) {
        let additionalAttributes = {};
        if (tableData.subschema && // if there is a subschema array
            record[tableData.subschema.key] && // and there is a value in the record
            record[tableData.subschema.key].length //
        ) {
            subschemas = record[tableData.subschema.key];
            trace.log(subschemas);
            if (attributes[tableData.subschema.key].array &&
                attributes[tableData.subschema.key].array.type == 'single' &&
                attributes[tableData.subschema.key].process == 'JSON') {
                subschemas = JSON.parse(subschemas);
            }
            additionalAttributes = await addSubschemas(subschemas);
            trace.log(subschemas, additionalAttributes);
            attributes = mergeAttributes(table, permission, subschemas, additionalAttributes);
            trace.log({ subschemas, attributes, maxdepth: 2, permission });
        }
        return [subschemas, additionalAttributes];
    }
    /**
     *
     * Populate data to update record or display
     * @returns {object} Record retrieved
     */
    async function populateFormData() {
        const err = ''; // if this is not from a submitted form and not new
        trace.log(table, id);
        trace.log(arguments);
        if (!id) {
            return {};
        }
        const record = await db.getRow(table, id); // populate record from database
        await addSubs(record);
        trace.log({ subschemas });
        trace.log({ record, id });
        if (record.err) {
            record.errtext = `update-form.js reports: Can\'t find record ${id} on ${table}`;
            trace.error(record);
            return (record);
        }
        else {
            trace.log(record);
            return record;
        }
    }
    /** *******************************************************
     *
     * Validate / process data  from input  if we are
     * coming from submitted form
     * @retuns {object} Errors - key/error
     *
     ****************************************************** */
    async function validateData() {
        const errors = {};
        for (const key of Object.keys(attributes)) {
            if (!attributes[key].canEdit) {
                continue;
            } // can't process if not editable
            if (attributes[key].collection) {
                continue;
            } // not intersted in collections
            if (attributes[key].process && attributes[key].process.type == 'createdAt') {
                continue;
            } // can't validate auto updated fields
            if (attributes[key].process && attributes[key].process.type == 'updatedAt') {
                continue;
            } // can't validate auto updated fields
            if (attributes[key].process && attributes[key].process.type == 'updatedBy') {
                continue;
            } // can't validate auto updated fields
            trace.log({ key, value: record[key] });
            /* Bug in Summernote - intermittently doubles up the input!   */
            /* You might look for an alternative for serious production  */
            if (attributes[key].input.type == 'summernote' && Array.isArray(record[key])) {
                console.log(`warning - summernote has produced two copies of input field ${key}.  The first copy is being used. `);
                record[key] = record[key[0]];
            }
            if (attributes[key].process && attributes[key].process.type == 'updatedBy') {
                record[key] = loggedInUser;
            }
            if (attributes[key].process &&
                record[key] &&
                attributes[key].process.type == 'JSON') {
                trace.log(record[key]);
                record[key] = JSON.stringify(record[key]);
                trace.log(record[key]);
            }
            if (attributes[key].input.type == 'uploadFile' && files && files[key]) {
                let rootdir = __dirname;
                rootdir = rootdir.replace('/bin/suds', '');
                let oldRecord = {};
                if (id) {
                    oldRecord = await db.getRow(table, id); // populate record from database
                }
                trace.log(files[key], rootdir, oldRecord[key]);
                if (oldRecord[key]) {
                    try {
                        fs.unlinkSync(`${rootdir}/public/uploads/${oldRecord[key]}`);
                        console.log(`successfully deleted ${rootdir}/public/uploads/${oldRecord[key]}`);
                    }
                    catch (err) {
                        console.log(`Can't delete ${rootdir}/public/uploads/${oldRecord[key]}`);
                    }
                }
                let uploadname = Date.now().toString() + '-' + files[key].name;
                uploadname = uploadname.replace(/ /g, '_');
                if (attributes[key].input.keepFileName) {
                    uploadname = files[key].name;
                }
                files[key].mv(`${rootdir}/public/uploads/${uploadname}`);
                record[key] = uploadname;
                //   let result = await upload(inputs.req, inputs.res, key);
                //    trace.log(result);
            }
            if (attributes[key].type == 'boolean') {
                if (record[key]) {
                    record[key] = true;
                }
                else {
                    record[key] = false;
                }
            }
            if (attributes[key].input.type == 'date' &&
                attributes[key].type == 'number') {
                record[key] = Date.parse(record[key]);
                trace.log(record[key]);
                if (isNaN(record[key])) {
                    record[key] = 0;
                }
            }
            if (record[key] != undefined && attributes[key].type == 'number') {
                if (record[key]) {
                    record[key] = Number(record[key]);
                }
                else {
                    record[key] = 0;
                }
                trace.log(record[key]);
            }
            if (attributes[key].input && attributes[key].input.server_side) {
                const err = attributes[key].input.server_side(record);
                if (err) {
                    errors[key] = `<span class="${classes.error}">${err}</span>`;
                }
            }
            trace.log({ after: key, value: record[key] });
        }
        return errors;
    }
    /** *******************************************************
     *
     *  Update database
     *
     *  Update file if the controller is called with mode = 'update'
     *  and the validation checks have been passed.
     *
     *  If we have an id it means that record is on the database
     *  and should be updated. Otherwise add a new row.
     *
     ****************************************************** */
    async function updateDatabase() {
        trace.log('update pre-processing', table, mode, id, record);
        if (tableData.edit.preProcess) {
            await tableData.edit.preProcess(record);
        }
        let message = '';
        let subschemas;
        let additionalAttributes;
        let operation;
        const rec = {};
        trace.log('update/new processing', mode, id);
        /**
         *
         * If the record is on the database
         *
         * */
        if (id) {
            operation = 'update';
            trace.log({ Updating: id, table, user: loggedInUser });
            for (const key of Object.keys(attributes)) {
                if (attributes[key].process.type == 'updatedAt') {
                    record[key] = Date.now();
                }
                if (attributes[key].process.type == 'updatedBy') {
                    record[key] = loggedInUser;
                }
            }
            try {
                trace.log(record);
                [subschemas, additionalAttributes] = await addSubs(record);
                await db.updateRow(table, record, subschemas, additionalAttributes); // ref record from database
                message = lang.rowUpdated + tableName;
            }
            catch (err) {
                console.log(`Database error updating record ${id} on ${table}`, err);
                return `<h1>Database error updating record ${id} on ${table}<h1><p>${err}</p>`;
            }
            /**
             *
             * No id so we need to add record
             *
             *  */
        }
        else {
            operation = 'addNew';
            trace.log('new record');
            for (const key of Object.keys(attributes)) {
                if (attributes[key].primaryKey) {
                    continue;
                }
                if (record[key]) {
                    rec[key] = record[key];
                }
                else {
                    rec[key] = null;
                    if (attributes[key].type == 'string') {
                        rec[key] = '';
                    }
                    if (attributes[key].type == 'number') {
                        rec[key] = 0;
                    }
                    if (attributes[key].type == 'boolean') {
                        rec[key] = false;
                    }
                    if (attributes[key].process.type == 'updatedBy') {
                        rec[key] = loggedInUser;
                    }
                    if (attributes[key].process.type == 'createdAt') {
                        rec[key] = Date.now();
                    }
                    if (attributes[key].process.type == 'updatedAt') {
                        rec[key] = Date.now();
                    }
                }
            }
            trace.log('New record', table, rec);
            try {
                const created = await db.createRow(table, rec);
                if (typeof (created[tableData.primaryKey]) === undefined) {
                    return ('Error adding row - see console log');
                }
                record[tableData.primaryKey] = id = created[tableData.primaryKey];
                if (suds.dbtype == 'nosql') {
                    target = db.stringifyId(id);
                }
                trace.log({ created: record[tableData.primaryKey], key: tableData.primaryKey, id });
                if (auditId) {
                    await db.updateRow('audit', { id: auditId, mode: 'new', row: id });
                }
            }
            catch (err) {
                console.log(`Database error creating record on ${table}`, err);
                return `<h1>Database error creating record on ${table}<h1><p>${err}</p>`;
            }
            message = `${lang.rowAdded} ${id}`;
        }
        return message;
    }
    /**
     *
     * Post process processing and switch to list the record
     * @returns {object} HTML from ListRow
     *
     * */
    async function postProcess() {
        trace.log('postprocess', record, operation);
        if (tableData.edit.postProcess) {
            await tableData.edit.postProcess(record, operation);
            trace.log(record);
        }
        trace.log('switching to list record', id, record[tableData.primaryKey], tableData.primaryKey);
        const output = await listRow(permission, table, id, open, openGroup, subschemas);
        return (output);
    }
    /** *******************************************************
      *
      *
      * Make a list of *top* level fields that will be in the form.
      * including object type fields which have a lower level
      * fields below.
      * All the columns excluding automatically updated columns
      * and collections.
      *
      * @param {object} attributes
      * @param {boolean}  true if id is to be included in fieldlist
      * @returns {array} List of top level fields/objects
      *
      ****************************************************** */
    function fieldList(attributes, includeId) {
        trace.log(attributes);
        const formList = [];
        trace.log(permission);
        for (const key of Object.keys(attributes)) {
            trace.log({ key, canedit: attributes[key].canEdit, permission });
            if (attributes[key].process.type == 'createdAt' ||
                attributes[key].process.type == 'updatedAt' ||
                attributes[key].process.type == 'updatedBy') {
                continue;
            }
            if (attributes[key].primaryKey && !includeId) {
                continue;
            }
            if (attributes[key].collection) {
                continue;
            } // not intersted in collections
            if (!(attributes[key].canEdit)) {
                continue;
            }
            if (attributes[key].input.hidden) {
                continue;
            }
            formList.push(key);
        }
        trace.log(formList);
        return formList;
    }
    /** *******************************************************
        *
        * Create form group
        * If the input form is split into groups make sure the
        * 'other' group has everything that isn't in a stated group
        * If not, create a single static group called 'other'
        * which contains all of the fields.
        *
        * While we are about it we create the function to make the
        * submenu work that allows users to select the group they
        * want to see.
        *
        ****************************************************** */
    function createFormGroups() {
        trace.log({ formgroups: tableData.groups, formlist: formList });
        hideGroup = {};
        /** Cycle through groups
         * - creating a list creating a list of all the columns covered
         * - if a group applies to certain record types and the list for that group
         *    doesn't include that recoird ttype add to a list of hidden groups
         * - Create a list of non-static groups - these will be the tabs
         * - if there is no columns array (unlikely) - create an empty one
         *
         */
        let incl = [];
        for (const group of Object.keys(tableData.groups)) {
            if (tableData.groups[group].recordTypes &&
                !tableData.groups[group].recordTypes.includes(record[tableData.recordTypeColumn])) {
                trace.log({ hiding: group });
                hideGroup[group] = true;
            }
            if (!tableData.groups[group].static) {
                tabs.push(group);
            } // Not static so we will need a tab function
            if (!tableData.groups[group].columns) {
                tableData.groups[group].columns = [];
            }
            incl = incl.concat(tableData.groups[group].columns);
        }
        trace.log({ incl, hideGroup });
        /**
         * Clone the list of all columns = note these will be top level items only
         * need to remove the items in 'all' that are also in 'incl' and store result in
         * tableData.groups.other.columns
         * tableData.groups.other.columns = all.filter(item => !incl.includes(item));
         *
         * */
        const all = [];
        for (let i = 0; i < formList.length; i++) {
            all[i] = formList[i];
        }
        if (!tableData.groups.other) {
            tableData.groups.other = {};
        }
        if (!tableData.groups.other.columns) {
            tableData.groups.other.columns = [];
        }
        for (const key of all) {
            if (!incl.includes(key)) {
                tableData.groups.other.columns.push(key);
            }
        }
        trace.log({ other: tableData.groups.other.columns });
        /**
         * Find the first non-static group and open this by default.
         * While about it - create table linking column to group
         */
        let first = true;
        for (const group of Object.keys(tableData.groups)) {
            if (first && !tableData.groups[group].static) {
                openTab = group;
                first = false;
            }
            ;
            for (const col of tableData.groups[group].columns) {
                if (!tableData.groups[group].static) {
                    columnGroup[col] = group;
                }
                if (errors[col] && !tableData.groups[group].static) {
                    openTab = group;
                }
            }
        }
        trace.log({ columnGroup, openTab });
        /** Create a list of visible groups
         *  visibkeGroup just means that there is at least one field in the group that it not hidden
             * hiddenGroup means that we are just bot showing that group so has priority.
         */
        visibleGroup = {};
        for (const key of formList) {
            trace.log({ key, hidden: attributes[key].input.hidden, columngroup: columnGroup[key] });
            if (!attributes[key].input.hidden) {
                visibleGroup[columnGroup[key]] = true;
            }
        }
        trace.log({ tabs, groups: tableData.groups, visible: visibleGroup, hide: hideGroup });
        if (tabs) {
            form += `
      <script>
      function tabclick (tab) { 
        console.log('tabclick:',tab); `;
            for (const tab of tabs) {
                trace.log(tab, hideGroup[tab], visibleGroup[tab]);
                if (hideGroup[tab]) {
                    continue;
                }
                if (!visibleGroup[tab]) {
                    continue;
                }
                form += `
        if (tab == '${tab}') {
          console.log('opening: ${tab}');    
          document.getElementById('group_${tab}').style.display="block";
          document.getElementById('tab_${tab}').style.fontWeight="bold"
        }
        else {
          console.log('closing: ${tab}');    
          document.getElementById('group_${tab}').style.display="none";
          document.getElementById('tab_${tab}').style.fontWeight="normal"
        }`;
            }
            form += ` 
      }          
      </script>`;
        }
    }
    /** *******************************************************
     *
     *      createFieldArray
     *
     * Create the HTML for one item in the data structure.
     * If the item is an array it loops through the data calling
     * itself recursively.  The form fields for multiple values
     * havve a name which includes an index starting 1.
     *
     * If it is an object it runs through the keys calling itself
     * recursively.
     *
     * If not an object it creates the HTML usin createOneFieldHTML
     *
     * The structure of the HTML for an array item/object called xxxx
     * with two sets of values is as follows
     *
     * There is always a blank entry as the last one in the array
     * which is hidden. So a new document will always have at least
     * one array entry.
     *
     * <hidden-field id=xxxx.length value 2>
     * <div id=xxxx.1.fld>
     *      HTML for xxxx.1
     * <div id=xxxx.2.fld>
     *      HTML for xxxx.2
     * <div id=xxxx.3.fld>
     *      HTML for xxxx.3
     *
     * When a new item is added with the 'new xxxx' button
     * 1 the last .fld div is copied
     * 2 the index nunber incremented in the copy
     * 3 the .length hidden field is incrememented.
     * 4 the old last entry (now penultimate) entry is un-hidden
     *
     * This all happens in the suds.js file in the public/javascript directory.
     *
     *
     * @param {*} key
     * @param {*} attributes for this key only
     * @param {*} data data for this field
     * @param {*} index blank - then 1,2,3 if an array within an array 1.1 1.2 etc
     * @returns { array } the HTML and data required for the header if any
     ********************************************************* */
    async function createFieldArray(qualifiedName, attributes, data) {
        trace.log(arguments);
        let formField = '';
        let headerTag = '';
        let bite = 1;
        if (attributes.array.bite) {
            bite = attributes.array.bite;
        }
        if (!data) {
            data = [];
        }
        trace.log({ data, length: data.length });
        formField += `
    <div id="${qualifiedName}.envelope">                                 <!-- ---------------- ${qualifiedName} envelope start -------------------- -->
       <input type="hidden" id="${qualifiedName}.length" name= "${qualifiedName}.length" value="${data.length}">   <!-- Number of data items in array -->`;
        trace.log(formField);
        for (let i = 0; i < data.length + 1; i++) {
            trace.log('before', i, data[i]);
            let field;
            const subdata = data[i];
            let tag;
            const subqualname = `${qualifiedName}.${i + 1}`; /** qualname is the qualified name  */
            const nextItem = `${qualifiedName}.${i + 2}`; /** nextItem is the qualified name of the next array item */
            let display = 'inline'; /** switched to none after the first empty field */
            const onclick = '';
            if (i >= data.length) {
                display = 'none';
            }
            if (attributes.type == 'object') {
                let datum;
                if (i >= data.length) {
                    datum = {};
                }
                [field, tag] = await createFieldObject(subqualname, attributes, subdata);
            }
            else {
                if (i >= data.length) {
                    datum = '';
                }
                [field, tag] = await createOneFieldHTML(subqualname, attributes, subdata);
            }
            /** if i is GT data.length then this is an empty field */
            formField += `
      
      <div style="display: ${display}" id="${subqualname}.fld" >   <!-- ----------- Array item  ${subqualname} start --------------- -->           
        <b>${attributes.friendlyName} #${i + 1}</b>
        <span style="padding-left: 50px; font-weight: normal">${lang.delete}&nbsp;&nbsp;  
        <input type="checkbox" name="${subqualname}.delete"></span>
        <br>
          ${field}
      </div>                      <!-- ---------------- Array item  ${subqualname} ends ------------------ -->  `;
            headerTag += tag;
            trace.log('after');
        }
        formField += `
    <div id="${qualifiedName}.more">      <!-- space for additional array entries -->
    </div>
       <br />
       <button type="button"  onclick="nextArrayItem('${qualifiedName}')" class="btn btn-primary btn-sm">
           Add  ${attributes.friendlyName} 
       </button>
       <br />
    </div>              <!-- ---------------- ${qualifiedName} envelope end -------------------- -->`;
        trace.log(formField, headerTag);
        return [formField, headerTag];
    }
    /*
      if (attributes.type != 'object') {
        let fieldName = key;
        if (index) { fieldName = index + '.' + key };
        return await createOneFieldHTML(key, attributes, data, fieldName, index);
      }
      */
    async function createFieldObject(qualifiedName, attributes, data, index) {
        /** This is an object */
        trace.log({ type: attributes.type, data });
        let formField = '';
        let headerTag = '';
        if (!attributes.array) {
            formField += `
      <b>${attributes.friendlyName}</b><br>`;
        }
        formField += `
      <input type="hidden" name= "${qualifiedName}.object" value="${Object.keys(attributes.object).length}">   <!-- number of keys in object -->`;
        for (const subkey of Object.keys(attributes.object)) {
            trace.log(subkey, data);
            const subattributes = attributes.object[subkey];
            let fieldName;
            const subqualname = fieldName = `${qualifiedName}.${subkey}`;
            let subData = '';
            if (data && data[subkey]) {
                subData = data[subkey];
            }
            let subhtml;
            let subhead;
            trace.log({ qualifiedname: subqualname, subkey, subattributes, subData });
            trace.log(subattributes.type, subattributes.array);
            if (subattributes.array && subattributes.array.type != 'single') {
                [subhtml, subhead] = await createFieldArray(subqualname, subattributes, subData, '');
            }
            else {
                if (subattributes.type == 'object') {
                    if (!subData) {
                        subData = {};
                    }
                    trace.log('creating object', subqualname);
                    [subhtml, subhead] = await createFieldObject(subqualname, subattributes, subData);
                    trace.log('after');
                }
                else {
                    trace.log('creating field', subqualname);
                    [subhtml, subhead] = await createOneFieldHTML(subqualname, subattributes, subData);
                }
            }
            //       trace.log(formField, subhtml)
            formField += subhtml;
            headerTag += subhead;
            trace.log(formField, subhtml);
        }
        trace.log(formField, headerTag);
        return [formField, headerTag];
    }
    /**
     * Create the HTML to enter one field
     *
     * @param {string} key: element name
     * @param {object} Attributes for this field
     * @param {*} data for this field
     * @param {string} field name
     * @param {string} index - qualified name
     * @returns {array} HTML for this field + Header tags required
     */
    async function createOneFieldHTML(qualifiedName, attributes, data) {
        trace.log(arguments);
        let linkedTable = '';
        let fieldValue = '';
        let formField = '';
        let headerTag = '';
        //   recvalue = getRecValue(key, attributes, record);
        const itemNumber = ` (${qualifiedName})`;
        let indent = '';
        for (let i = 1; i < attributes.qualifiedName.length; i++) {
            indent += '&nbsp;&nbsp;&nbsp;&nbsp;';
        }
        if (data != 'undefined') {
            fieldValue = data;
        }
        trace.log(fieldValue);
        trace.log(headerTags);
        if (attributes.model) {
            linkedTable = attributes.model;
        }
        let errorMsg = '';
        if (errors[qualifiedName]) {
            errorMsg = ` ${errors[qualifiedName]}`;
        }
        trace.log({
            element: qualifiedName,
            type: attributes.input.type,
            clearname: attributes.friendlyName,
            LinkedTable: linkedTable,
            value: fieldValue,
            titlefield: attributes.titlefield,
            group: columnGroup[qualifiedName],
            errorMsg
        });
        trace.log({ attributes, level: 'verbose' });
        if (fieldValue == null) { // can;'t pass null as a value
            //   if (attributes.type == 'number') {
            //    fieldValue = 0
            //   } else {
            fieldValue = '';
            //   }
        }
        /**
         *
         *   If a field requires server-side processing
         *
    
        if (attributes.input.validations.api ) {
          formField += `
            <script>
              function apiWait_${qualifiedName}() {
                console.log(apiWait_${qualifiedName});
                document.getElementById('err_${qualifiedName}').innerHTML='${lang.apiWait}';
              }
              function apiCheck_${qualifiedName}() {
                let value=document.getElementById('mainform')['${qualifiedName}'].value;
                let url='${attributes.input.validations.api.route}?table=${table}&id=${id}&field=${qualifiedName}&value='+value;
                let result=[];
                document.getElementById('err_${qualifiedName}').innerHTML='${lang.apiCheck}';
                console.log(url);
                fetch(url).then(function (response) {
                  // The API call was successful!
                  return response.json();
                }).then(function (data) {
                  // This is the JSON from our response
                  result=data;
                  console.log(result);
                  if (result[0]=='validationError'){
                    document.getElementById('err_${qualifiedName}').innerHTML=result[1];
                  }
                  else {
                    document.getElementById('err_${qualifiedName}').innerHTML='';
    
                  }
                 }).catch(function (err) {
                  // There was an error
                  console.warn('Something went wrong.', err);
                });
              }
                </script>
            `;
    
        }
    */
        let result = [];
        if (attributes.input.type == 'hidden') {
            formField += `
        <input type="hidden" name="${qualifiedName}" value="${fieldValue}">`;
        }
        else {
            if (attributes.canEdit) {
                result = await createField(qualifiedName, fieldValue, attributes, errorMsg, 'update', record, tableData, tabs);
            }
            else {
                if (attributes.canView) {
                    result = [await displayField(attributes, fieldValue), ''];
                    trace.log(result);
                }
            }
            trace.log(result);
            formField += result[0];
            headerTag = result[1];
            let format = suds.input.default;
            if (attributes.input.format) {
                format = attributes.input.format;
            }
            let groupClass;
            let labelClass;
            let fieldClass;
            if (format == 'row') {
                groupClass = classes.input.row.group;
                labelClass = classes.input.row.label;
                fieldClass = classes.input.row.field;
            }
            else {
                groupClass = classes.input.col.group;
                labelClass = classes.input.col.label;
                fieldClass = classes.input.col.field;
            }
            const pretext = '';
            const posttext = '';
            let tooltip = attributes.description;
            trace.log(attributes.helpText);
            if (attributes.helpText) {
                tooltip = `${attributes.description}
________________________________________________________
${attributes.helpText}`;
            }
            formField = `
         <div class="${classes.input.group} ${groupClass}">    <!-- Form group for ${attributes.friendlyName} start -->
          <div class="${labelClass}">                      <!--  Names column start -->
            <label class="${classes.input.label}" for="${qualifiedName}"  title="${tooltip}" id="label_${qualifiedName}">
              ${indent}${attributes.friendlyName}
            </label>
          </div>                                      <!-- Names column end -->
          <div class="${fieldClass}">                      <!-- Fields column start -->
          ${pretext}
          ${formField}
          ${posttext}
          </div>                                       <!-- Fields column end -->
        </div>                                         <!--Form group for ${attributes.friendlyName} end-->
        `;
        }
        //  store clear name of the field and html in two arrays.
        trace.log({ qualifiedName, formField });
        return [formField, headerTag];
    }
    async function createValidationScript() {
        form += `
    <script>
      function validateForm() {
        let debug=false ;
        if (debug) {console.log(614, '*******validateForm******');}
        let errCount=0;
        let value='';
        let columnError;
        let mainform=document.getElementById('mainform');
        `;
        for (const key of formList) {
            trace.log({ key: key, attributes: attributes[key], level: 's3' });
            if (attributes[key].collection) {
                continue;
            } // not intersted in collections
            if (!attributes[key].canEdit) {
                continue;
            } // can't validate if not editable
            if (attributes[key].input && attributes[key].input.type === 'hidden') {
                continue;
            }
            trace.log({ key: key, level: 's3' });
            if (attributes[key].primaryKey ||
                attributes[key].process.type == 'createdAt' ||
                attributes[key].process.type == 'updatedAt') {
                continue;
            } // can't validate auto updated fields
            if (attributes[key].array) {
                form += await createArrayValidation(attributes[key], key, record[key], key, columnGroup);
            }
            else {
                if (attributes[key].type == 'object') {
                    form += await createObjectValidation(attributes[key], key, record[key], key, columnGroup);
                }
                else {
                    form += await createFieldValidation(attributes[key], key, record[key], key, columnGroup);
                }
            }
        }
        form += `
        if (errCount > 0) { return false; }  else {  return true; }
      }
    </script>
    `;
    }
    async function createArrayValidation(attributes, fieldName, data, topkey, columnGroup) {
        return '';
        let bite = 10;
        if (attributes.array.bite) {
            bite = attributes.array.bite;
        }
        if (!data) {
            data = [];
        }
        trace.log({ fieldName, data });
        let result = `
    { 
      let length=0;   
  //  let length=Number(document.getElementById('${fieldName}.length').innerHTML);
        console.log('${fieldName}.length',document.getElementById('${fieldName}.length'))
     //   console.log(document.getElementById('${fieldName}.length').innerHTML,length);      
   `;
        for (i = 0; i < data.length + bite; i++) { // number of array alements generated
            trace.log(i);
            result += `
       if (${i}<length) {`; // Number of array elements used
            const subFieldName = `${fieldName}.${i + 1}`;
            if (attributes.type == 'object') {
                result += await createObjectValidation(attributes, subFieldName, data[i], topkey, columnGroup);
            }
            else {
                result += await createFieldValidation(attributes, subFieldName, data[i], topkey, columnGroup);
            }
            result += `
  }`;
        }
        result += `
  }`;
        trace.log(result);
        return result;
    }
    async function createObjectValidation(attributes, fieldName, data, topkey, columnGroup) {
        let result = '';
        if (!data) {
            data = [];
        }
        trace.log({ fieldName, attributes, data, level: 'verbose' });
        for (const subkey of Object.keys(attributes.object)) {
            const subFieldName = fieldName + '.' + subkey;
            let subData = data[fieldName];
            if (attributes.object[subkey].array) {
                result += await createArrayValidation(attributes.object[subkey], subFieldName, subData, topkey, columnGroup);
            }
            else {
                if (attributes.object[subkey].type == 'object') {
                    result += await createObjectValidation(attributes.object[subkey], subFieldName, subData, topkey, columnGroup);
                }
                else {
                    result += await createFieldValidation(attributes.object[subkey], subFieldName, subData, topkey, columnGroup);
                }
            }
        }
        return (result);
    }
    async function createFieldValidation(attributes, fieldName, data, topkey, columnGroup) {
        let form = '';
        trace.log({ fieldName, attributes, level: 'verbose' });
        form += `
      // ********** Start of validation for ${attributes.friendlyName}  ***************
      if (debug) {console.log('${fieldName}',' ','${attributes.input.type}')}
      columnError=false;`;
        //  Has an api left an error message
        if (attributes.input.validations.api) {
            form += `
      if (document.getElementById('err_${fieldName}').innerHTML) {
        columnError=true;
        errCount++;
      }
      else {
        document.getElementById("err_${fieldName}").innerHTML='';
      }`;
        }
        let vals = 0;
        if (attributes.input.type == 'autocomplete') {
            form += `
      value=mainform['autoid_${fieldName}'].value;`;
        }
        else {
            if (attributes.type == 'number') {
                form += `
      value=Number(mainform['${fieldName}'].value);`;
            }
            else {
                form += `
      value=mainform['${fieldName}'].value;`;
            }
        }
        form += `
    if (debug) {console.log('${fieldName}',' ',value)}`;
        if (attributes.required || attributes.input.required) { // Required
            form += `
        if (true) {          // Start of validation for ${fieldName} `;
        }
        else {
            form += `
        if (value) {                    // ${fieldName} is not mandatory so validation only needed                                        // if there is something in the field`;
        }
        // Start of generating code for the validations for this field
        if (attributes.required || attributes.input.required) {
            vals++;
            form += `
            if (!value) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.mandatory}";
              columnError=true;
              errCount++;

            }`;
        }
        if (attributes.type == 'number' ||
            (attributes.input && attributes.input.isNumber)) {
            vals++;
            form += `
           if (value == 'NaN') {
              document.getElementById("err_${fieldName}").innerHTML="${lang.nan}";
              columnError=true;
              errCount++;
            }`;
        }
        if (attributes.input) {
            if (attributes.input.isInteger) {
                vals++;
                form += `
            if (!Number.isInteger(value)) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.notInt}";
              columnError=true;
              errCount++;
            }`;
            }
            if (attributes.input.isEmail) {
                vals++;
                form += `
            if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.notEmail}";
              columnError=true;
              errCount++;
            }`;
            }
            if (attributes.input.max) {
                vals++;
                form += `
            if (value > ${attributes.input.max}) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.max} ${attributes.input.max}";
              columnError=true;
              errCount++;
            }`;
            }
            if (attributes.input.min) {
                vals++;
                form += `
            if (value < ${attributes.input.min}) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.min} ${attributes.input.min}";
              columnError=true;
              errCount++;
            }`;
            }
            if (attributes.input.maxLength) {
                vals++;
                form += `
            if (value.length > ${attributes.input.maxLength}) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.maxLength} ${attributes.input.maxLength}";
              columnError=true;
              errCount++;
            }`;
            }
            if (attributes.input.minLength) {
                vals++;
                form += `
            if (value.length < ${attributes.input.minLength}) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.minLength} ${attributes.input.minLength}";
              columnError=true;
              errCount++;
            }`;
            }
        }
        // finished all the validations here
        if (vals == 0) {
            form += `
                  // No inline validations for ${fieldName} `;
        }
        else {
            trace.log({ fieldName, topkey, group: columnGroup });
            if (columnGroup[topkey] && tabs.length > 1) {
                form += `
            if (columnError) {tabclick('${columnGroup[topkey]}')}`;
            }
        }
        form += `
       if (!columnError) {
            document.getElementById("err_${fieldName}").innerHTML="";
      }
          }       // end of validation for ${fieldName}`;
        return form;
    }
    /* *******************************************************
     *
      *
     *  Create form
     *
     ****************************************************** */
    async function createForm() {
        trace.log({ subschemas });
        let displayOp = '';
        if (mode == 'populate') {
            displayOp = lang.update;
        }
        if (mode == 'update') {
            displayOp = lang.update;
        }
        if (mode == 'new') {
            displayOp = lang.addRow;
        }
        // let from = '';
        //  if (allParms['#from#']) { from = allParms['#from#']; }
        if (message) {
            form += `\n<P>${message}</P>`;
        }
        form += `
    <h2>${displayOp} ${lang.forTable}: ${tableName}</h2>`;
        //       enctype="multipart/form-data"
        let query = `table=${table}&mode=update&id=${id}`;
        if (open) {
            query += `&open=${open}`;
        }
        if (openGroup) {
            query += `&opengroup=${openGroup}`;
        }
        for (let i = 0; i < subschemas.length; i++) {
            query += `&subschema=${subschemas[i]}`;
        }
        form += `
    <form 
        action="${mainPage}?${query}"
        id="mainform"
        method="post" 
        name="mainform" 
        class="${classes.input.form}"
       onsubmit="return validateForm()"
        autocomplete="off"
        enctype="multipart/form-data"
    >
      <input type="hidden" name="_csrf" value="${csrf}" id="csrf" />
      `;
        //   <input type="hidden" name="table" value="${table}">`;
        //  <input type="hidden" name="#parent#" value="${parent}" >
        //  <input type="hidden" name="#parentkey#" value="${parentKey}" >
        //      <input type="hidden" name="#from#" value="${from}" >`;
        if (id) {
            form += `
      <input type="hidden" name="${tableData.primaryKey}" value="${id}">
`;
        }
        // form += `
        //   <input type="hidden" name="mode" value="update">
        // `;
        let linkAttributes = {};
        if (tableData.edit && tableData.edit.parentData && record[tableData.edit.parentData.link]) {
            const link = attributes[tableData.edit.parentData.link].model;
            const columns = tableData.edit.parentData.columns;
            linkAttributes = await mergeAttributes(link, permission);
            trace.log({ record, link: tableData.edit.parentData.link, data: record[tableData.edit.parentData.link] });
            const linkRec = await db.getRow(link, record[tableData.edit.parentData.link]);
            trace.log(linkRec);
            const linkTableData = tableDataFunction(link, permission);
            let linkName = link;
            if (linkTableData.stringify) {
                if (typeof (linkTableData.stringify) === 'string') {
                    linkName = linkRec[linkTableData.stringify];
                }
                else {
                    linkName = linkTableData.stringify(linkRec);
                }
            }
            form += `
    <div class="${classes.parentData}">
    <h3>${linkName}</h3>`;
            for (const key of columns) {
                const display = await displayField(linkAttributes[key], linkRec[key], 0, permission);
                const title = linkAttributes[key].friendlyName;
                let description = '';
                if (linkAttributes[key].description) {
                    description = linkAttributes[key].description.replace(/"/g, '\'');
                }
                form += `

          <div class="${classes.input.group} ${classes.input.row.group}"> 
            <div class="${classes.input.row.label}">
               ${linkAttributes[key].friendlyName}
            </div>
            <div class="${classes.input.row.field}">
  ${display}
            </div> <!-- fields column -->
          </div>  <!--  Form group for ${key} -->`;
            }
            form += `
    </div>`;
        }
        trace.log(groups);
        tabs = [];
        // groupform = []
        for (const group of Object.keys(groups)) { // run through the groups (there may only be one...)
            if (hideGroup[group]) {
                continue;
            }
            trace.log(group);
            if (groups[group].static) { //   if the group is static,
                for (const key of groups[group].columns) {
                    trace.log(key); //      just output the fields
                    if (!formData[key]) {
                        continue;
                    }
                    form += `
      <!-- --- --- --- --- --- --- Form group for ${key} --- --- --- --- --- ---  -->`;
                    form += `
            ${formData[key]}
              `;
                }
            } // end of static
            else {
                // then run through the columns
                if (visibleGroup[group]) {
                    tabs.push(group); // add the group to a list of groups that will be on tabs
                }
            }
        }
        trace.log(tabs);
        if (tabs) { // if there are any tabs
            if (tabs.length > 1) {
                form += `
          <!-- this section controlled by tabs -->
          <div class="${classes.input.groupLinks.row}">  <!-- group links row -->
          <div class="${classes.input.groupLinks.envelope}"> <!-- group links envelope -->
              <span class="${classes.input.groupLinks.spacing}">${lang.formGroup}</span>`;
                for (const group of tabs) { // run through the tabs
                    trace.log(openTab, group);
                    let friendlyName = group;
                    if (groups[group].friendlyName) {
                        friendlyName = groups[group].friendlyName;
                    }
                    let linkClass;
                    if (openTab == group) {
                        linkClass = classes.input.groupLinks.selected;
                    }
                    else {
                        linkClass = classes.input.groupLinks.link;
                    } // the first will be shown the rest hidden
                    form += `
          <span class="${classes.input.groupLinks.spacing} ${linkClass}" id="tab_${group}" onclick="tabclick('${group}')">
             ${friendlyName}
          </span>`; // outputting a list of links
                }
                form += `
        </div> <!-- group links row end -->
        </div> <!-- group links envelope end -->
        <div></div>`;
            }
            trace.log(openTab, tabs);
            if (!tabs.includes(openTab)) {
                openTab = tabs[0];
            }
            let disp;
            for (const group of tabs) { // then go through the non-statiuc groups
                if (openTab == group) {
                    disp = 'block';
                }
                else {
                    disp = 'none';
                } // the first will be shown the rest hidden
                form += `
       <!--  --------------------------- ${group} ---------------------- -->
        <div id="group_${group}" style="display: ${disp}">  <!-- Group ${group} -->`; // div aroiun dthem
                trace.log({ group, columns: groups[group].columns });
                for (const key of groups[group].columns) { // then run through the columns
                    if (!formData[key]) {
                        continue;
                    } // sending out the fields as before
                    form += `
  <!-- --- --- form-group for ${key} --- ---  -->
        ${formData[key]}
  `;
                }
                // first = false // thhis will switch on the hidden grouos after first
                form += `
        </div>  <!-- Group ${group} end --> `;
            }
        }
        //       <label for="${fieldName}" class="col-sm-2 col-form-label">&nbsp;</label>
        form += `
      <!-- --- --- end of form groups-- - --- -->
    <br clear="all">  
    <div class="${classes.input.buttons}">
   
    `;
        if (permission == '#guest#') {
            form += `<button class="${classes.output.links.danger}" type="button" title="Guest users are not allowed to submit changes">
    ${lang.submit}
  </button>`;
        }
        else {
            form += `<button type="submit" class="btn btn-primary" id="submitbutton">
            ${lang.submit}
          </button>`;
        }
        if (id) {
            form += `
          <span style="margin-right: 10px; margin-left: 10px;">
            <a class="btn btn-primary" href="${mainPage}?table=${table}&mode=listrow&id=${id}">${lang.listRow}</a>
          </span>
      `;
        }
        form += `
          <span style="margin-right: 10px; margin-left: 10px;">
            <a class="btn btn-primary" href="${mainPage}?table=${table}&mode=list">${lang.tableList}</a>
          </span>
          <a class="btn btn-primary" href="${mainPage}">${lang.backToTables}</a>
        </div>
      </form >


      `;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvdXBkYXRlLWZvcm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7O0dBSUc7O0FBRUgsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFBO0FBQzdCLE1BQU0sV0FBVyxHQUFHLHFFQUFxRSxDQUFBO0FBRXpGOzs7OztHQUtHO0FBRUgsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUEsQ0FBQyw2QkFBNkI7QUFDdkUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBLENBQUMsYUFBYTtBQUNwRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQSxDQUFDLG1GQUFtRjtBQUN6SSxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQSxDQUFDLHNGQUFzRjtBQUN4SSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQSxDQUFDLHNDQUFzQztBQUN0RixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLENBQUEsQ0FBQyw0QkFBNEI7QUFDN0UsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBLENBQUMsb0JBQW9CO0FBQy9DLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQSxDQUFDLG9FQUFvRTtBQUMxRyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQSxDQUFDLHlCQUF5QjtBQUN2RSxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQSxDQUFDLDBCQUEwQjtBQUMxRSxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDN0MsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUks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