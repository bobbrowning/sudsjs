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
    record = unpackInput(entered, attributes);
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
            if (record['err']) {
                return (record['errtext']);
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
            [formData[key], headerTag] = await createFieldArray(key, attributes[key], record[key]);
        }
        else {
            if (attributes[key].type == 'object') {
                [formData[key], headerTag] = await createFieldObject(key, attributes[key], record[key]);
            }
            else {
                trace.log(key, record[key]);
                [formData[key], headerTag] = await createOneFieldHTML(key, attributes[key], record[key]);
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
        const created = new Date(record['createdAt']).toDateString();
        const updated = new Date(record['updatedAt']).toDateString();
        const updatedBy = { fullName: 'Nobody' };
        if (record['updatedBy']) {
            const updatedBy = await db.getRow('user', record['updatedBy']);
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
    function unpackInput(entered, attributes) {
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
                            if (!Number.isNaN(delta)) {
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
                /*       if (suds.dbtype == 'nosql') {
                         target = db.stringifyId(id)
                       }
               */
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
                /*       if (i >= data.length) { datum = {} }*/
                [field, tag] = await createFieldObject(subqualname, attributes, subdata);
            }
            else {
                /*       if (i >= data.length) { datum = '' }*/
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
    async function createFieldObject(qualifiedName, attributes, data) {
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
                [subhtml, subhead] = await createFieldArray(subqualname, subattributes, subData);
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
        for (let i = 0; i < data.length + bite; i++) { // number of array alements generated
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvdXBkYXRlLWZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7O0dBSUc7O0FBRUgsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFBO0FBQzdCLE1BQU0sV0FBVyxHQUFHLHFFQUFxRSxDQUFBO0FBRXpGOzs7OztHQUtHO0FBRUgsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUEsQ0FBQyw2QkFBNkI7QUFDdkUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBLENBQUMsYUFBYTtBQUNwRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQSxDQUFDLG1GQUFtRjtBQUN6SSxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQSxDQUFDLHNGQUFzRjtBQUN4SSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQSxDQUFDLHNDQUFzQztBQUN0RixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLENBQUEsQ0FBQyw0QkFBNEI7QUFDN0UsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBLENBQUMsb0JBQW9CO0FBQy9DLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQSxDQUFDLG9FQUFvRTtBQUMxRyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQSxDQUFDLHlCQUF5QjtBQUN2RSxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQSxDQUFDLDBCQUEwQjtBQUMxRSxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDN0MsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUks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