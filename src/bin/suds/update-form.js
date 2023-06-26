
/* Identification division  (for COBOL people)
 * Update form
 *  http://localhost:3000/admin?table=notes&mode=populate&id=2
 *
 */

const friendlyName = 'Update'
const description = 'Creates update form  from the model and processes submitted form . '

/* Environment division
 *
 *     Tested on
 *        zorin 16
 *        Node.js  v 12.18
 */

const suds = require('../../config/suds') // Primary configuration file
const trace = require('track-n-trace') // Debug tool
const mergeAttributes = require('./merge-attributes') // Standardises attributes for a table, filling in any missing values with defaults
const tableDataFunction = require('./table-data') // Extracts non-attribute data from the table definition, filling in missinh =g values
const classes = require('../../config/classes') // Links class codes to actual classes
const lang = require('../../config/language').EN // Object with language data
const db = require('./db') // Database routines
const listRow = require('./list-row') // List one row of the table plus a limited number of child roecords
const createField = require('./create-field') // Creates an input field
const displayField = require('./display-field') // displays a column value
const addSubschemas = require('./subschemas')
const fs = require('fs')

/** Data Division */
module.exports = async function (
  permission, // Permission set of the current user
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

  let tableData // Standardised data from the schema excluding the attributes
  let tableName
  let attributes // Standardised attributes data form the schema.
  let err
  let errors = {} // Errors from validation
  let errCount // Number of errors
  let form
  let formList
  let openTab
  let columnGroup
  let visibleGroup
  let groups
  let hideGroup
  let tabs
  const formData = {}
  let headerTags = ''
  let mainPage
  const operation = ''
  const message = ''
  let record = {};

  /** Procedure division */
  if (arguments[0] == 'documentation') { return ({ friendlyName, description }) }

  trace.log({ start: 'Update', inputs: arguments, break: '#', level: 'min' })

  trace.log({ openGroup })
  trace.log({ user: loggedInUser, level: 'user' })

  /** ************************************************
  *
  *   set up the data
  *
  ************************************************ */
  mainPage = suds.mainPage
  if (!mainPage) { mainPage = '/' }
  tableData = tableDataFunction(table, permission)

  tableName = tableData.friendlyName
  trace.log(permission)
  attributes = mergeAttributes(table, permission, subschemas) // attributes and extraattributes merged plus permissions
  trace.log(attributes)
  if (id && typeof id === 'string' && suds.dbkey == 'number') { id = Number(id) }
  if (id == '0') { id = 0 }
  trace.log({
    text: 'Control information',
    table,
    mode,
    id
  })
  /** Stop from editing if no permission
   *        One exception - this row is a demonstration row and this is a guest user
   */
  if (!tableData.canEdit &&
    !(tableData.demoRow && tableData.demoRow == id && permission == '#guest#')) {
    return `<p>Sorry - you don't have permission to edit ${tableData.friendlyName} (${table})`
  }

  /**  */
  trace.log('before unpack')
  record = unpackInput(entered, {}, attributes, '')
  trace.log({ stage: 'unpacked', level: 'min' })
  trace.log(record)

  trace.log({ subschemas })

  switch (mode) {
    case 'new':
      err = blankFormData()
      if (err) { return (err) }
      trace.log(record)
      break
    case 'populate':
      trace.log({ subschemas })
      record = await populateFormData()
      if (record.err) { return (record.errtext) }
      trace.log({ stage: 'populated record', level: 'min' })
      trace.log({ subschemas, attributes, maxdepth: 2 })
      break
    case 'update':
      errors = await validateData()
      trace.log({ stage: 'validated', level: 'min' })
      errCount = Object.keys(errors).length
      break
  }

  trace.log({ subschemas, record })

  if (mode == 'update' && errCount == 0) {
    await updateDatabase()
    trace.log({ stage: 'Database updated', level: 'min' })

    return postProcess()
  }

  trace.log({
    table,
    id,
    mode,
    record,
    errors,
    errCount,
    openGroup
  })

  /** *
   *
   * Now create the input form. Note that if we were updating then the program switched
   * to listing the row in the previous stage.
   *
   *
   */
  if (tableData.edit.preForm) { await tableData.edit.preForm(record, mode) }

  form = ''

  formList = fieldList(attributes, false)
  trace.log({ formList, permission })

  openTab = ''
  columnGroup = {}
  visibleGroup = {}
  hideGroup = {}
  tabs = []
  if (tableData.groups) {
    await createFormGroups()
  } else {
    tableData.groups = { other: { static: true } }
    tableData.groups.other.columns = formList
  }
  groups = tableData.groups
  trace.log({ groups })

  /** * *******************************************************
   *
   *  loop hrough fields in top level storing field title and html.
   *
   ****************************************************** */

  for (const key of formList) {
    trace.log(key, record[key], attributes[key].array, attributes[key].type)
    let headerTag;
    if (attributes[key].array && attributes[key].array.type != 'single') {
      [formData[key], headerTag] = await createFieldArray(key, attributes[key], record[key], '')
    } else {
      if (attributes[key].type == 'object') {
        [formData[key], headerTag] = await createFieldObject(key, attributes[key], record[key], '')
      } else {
        trace.log(key, record[key]);
        [formData[key], headerTag] = await createOneFieldHTML(key, attributes[key], record[key], key, '')
      }
    }
    //  [formData[key], headerTag] = await createFieldHTML(key, attributes[key], record[key], '');
    trace.log({ key, form: formData[key], tag: headerTag, level: 'verbose' })
    trace.log({ stage: `form field ${key} created`, level: 'min' })
    if (!headerTags.includes(headerTag)) {
      headerTags += headerTag
    }
  }
  trace.log({ stage: 'form fields created', level: 'min' })

  await createValidationScript()
  trace.log({ subschemas })
  await createForm()
  trace.log({ stage: 'form created', level: 'min' })
  trace.log(record)

  let footnote = ''
  if (mode != 'new') {
    const created = new Date(record.createdAt).toDateString()
    const updated = new Date(record.updatedAt).toDateString()
    const updatedBy = { fullName: 'Nobody' }
    if (record.updatedBy) { const updatedBy = await db.getRow('user', record.updatedBy) }
    trace.log(updatedBy)
    footnote = `${lang.rowNumber}: ${id} ${lang.createdAt}: ${created} ${lang.updatedAt}: ${updated}  ${lang.updatedBy} ${updatedBy.fullName}`
  } else { footnote = '' }
  trace.log(form)
  trace.log({ stage: 'exiting update-form.js', level: 'min' })

  return ({ output: form, footnote, headerTags })
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

  function unpackInput () {
    trace.log({ entered, permission })

    const formList = fieldList(attributes, true)
    trace.log(formList)
    record = {}
    for (const key of formList) {
      trace.log(key, attributes[key], entered[key])

      if (attributes[key].array) {
        record[key] = unpackArray(key, attributes[key])
        trace.log(key, record[key])
      } else {
        if (attributes[key].type == 'object') {
          record[key] = unpackObject(key, attributes[key])
          trace.log(key, record[key])
        } else {
          if (typeof entered[key] !== 'undefined') {
            trace.log(key, entered[key], typeof entered[key])
            record[key] = entered[key]
          }
        }
      }
    }
    trace.log(record)
    //  throw 'stopped'
    return record
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
  function unpackArray (fieldName, attributes) {
    trace.log(arguments)
    const arry = []
    let length = 0
    if (!entered[fieldName + '.length']) {
      length = 0
      return []
    }
    length = parseInt(entered[fieldName + '.length'])

    trace.log({ length })
    let next = 0
    for (let i = 0; i < length; i++) {
      const subFieldName = `${fieldName}.${i + 1}`
      trace.log({
        fieldName,
        i,
        next,
        type: attributes.type,
        fieldname: subFieldName,
        value: entered[subFieldName],
        delete: entered[subFieldName + '.delete']
      })
      if (attributes.type != 'object') {
        /** Skip blank entries. */
        if (!entered[subFieldName]) { continue }
        /** Skip deleted entries */
        if (entered[subFieldName + '.delete']) { continue }
        trace.log(next, entered[subFieldName])
        arry[next++] = entered[subFieldName]
      } else {
        /** Skip deleted entries */
        if (entered[subFieldName + '.delete']) { continue }
        arry[next++] = unpackObject(subFieldName, attributes)
      }
    }
    trace.log({arry:arry, json: attributes.process})
    /** array type 'single' refers to checkboxes, where the array is treated as a single field
     * that has multiple values. There may be other types of input in the future.   
     * this is for relational databases where checkboxes are stored as a JSON field. */
    if (attributes.process == 'JSON') {
      trace.log('returning',JSON.stringify(arry))
      return JSON.stringify(arry);
    } else {
      return arry
    }
  }

  function unpackObject (fieldName, attributes) {
    const obj = {}
    trace.log({ fieldNme: fieldName, attributes })

    for (const subkey of Object.keys(attributes.object)) {
      const subFieldName = fieldName + '.' + subkey
      trace.log({ subkey, subFieldName, entered: entered[subFieldName], type: attributes.object[subkey].type })
      trace.log(attributes.object[subkey].array)
      if (attributes.object[subkey].array) {
        obj[subkey] = unpackArray(subFieldName, attributes.object[subkey])
      } else {
        if (attributes.object[subkey].type == 'object') {
          obj[subkey] = unpackObject(subFieldName, attributes.object[subkey])
        } else {
          if (entered[subFieldName]) {
            obj[subkey] = entered[subFieldName]
          } else {
            obj[subkey] = ''
          }
          trace.log(subkey, obj[subkey])
        }
      }
    }
    trace.log(obj)
    return obj
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
  function blankFormData () {
    trace.log(record)
    const err = ''
    for (const key of Object.keys(attributes)) {
      if (attributes[key].collection) { continue } // not interested in collections
      let value
      if (!record[key]) { // might be pre-set
        if (typeof attributes[key].input.default === 'function') {
          value = attributes[key].input.default(record)
        } else {
          if (attributes[key].input.default == '!table') {
            value = table
          } else {
            value = attributes[key].input.default
          }
        }
      }
      trace.log({ key, value, level: 'verbose' })
      if (value && typeof value === 'string') { trace.log(value.substring(6, 7)) }
      if (value) {
        if (value == '#loggedInUser') {
          record[key] = loggedInUser
        } else {
          if (value && typeof value === 'string' && value.substring(0, 6) == '#today') {
            const date = new Date()
            const sign = value.substring(6, 7)
            if (sign) {
              const delta = Number(value.substring(7))
              trace.log(delta)
              if (delta != 'NaN') {
                if (sign == '-') { date.setDate(date.getDate() - delta) }
                if (sign == '+') { date.setDate(date.getDate() + delta) }
              }
            }
            if (attributes[key].type == 'string') {
              const iso = date.toISOString()
              record[key] = iso.split('T')[0]
            } else {
              record[key] = date.getTime()
            }
          } else {
            record[key] = value
          }
        }
      }
    }
    trace.log(record)
    return (err)
  }

  /**
   * Addsubs - creeate object with additioonal attributes from subschemas
   * Subshemas are assumed to be a JSON object containsing an array of subschem keys
   * Only works with Document Databases
   *
   * @param {object} record
   * @returns {array} subschemas list, additional attributes
   */
  async function addSubs (record) {
    let additionalAttributes = {}
    if (tableData.subschema && // if there is a subschema array
      record[tableData.subschema.key] && // and there is a value in the record
      record[tableData.subschema.key].length //
    ) {
      subschemas = record[tableData.subschema.key]
      trace.log(subschemas)
      if (attributes[tableData.subschema.key].array &&
        attributes[tableData.subschema.key].array.type == 'single' &&
        attributes[tableData.subschema.key].process == 'JSON'
      ) {
        subschemas = JSON.parse(subschemas)
      }
      additionalAttributes = await addSubschemas(subschemas)
      trace.log(subschemas, additionalAttributes)
      attributes = mergeAttributes(table, permission, subschemas, additionalAttributes)
      trace.log({ subschemas, attributes, maxdepth: 2, permission })
    }
    return [subschemas, additionalAttributes]
  }

  /**
   *
   * Populate data to update record or display
   * @returns {object} Record retrieved
   */
  async function populateFormData () {
    const err = '' // if this is not from a submitted form and not new
    trace.log(table, id)
    trace.log(arguments)
    if (!id) { return {} }
    const record = await db.getRow(table, id) // populate record from database
    await addSubs(record)
    trace.log({ subschemas })

    trace.log({ record, id })
    if (record.err) {
      record.errtext = `update-form.js reports: Can\'t find record ${id} on ${table}`
      trace.error(record)
      return (record)
    } else {
      trace.log(record)
      return record
    }
  }

  /** *******************************************************
   *
   * Validate / process data  from input  if we are
   * coming from submitted form
   * @retuns {object} Errors - key/error
   *
   ****************************************************** */
  async function validateData () {
    const errors = {}
    for (const key of Object.keys(attributes)) {
      if (!attributes[key].canEdit) { continue } // can't process if not editable
      if (attributes[key].collection) { continue } // not intersted in collections
      if (attributes[key].process && attributes[key].process.type == 'createdAt') { continue } // can't validate auto updated fields
      if (attributes[key].process && attributes[key].process.type == 'updatedAt') { continue } // can't validate auto updated fields
      if (attributes[key].process && attributes[key].process.type == 'updatedBy') { continue } // can't validate auto updated fields
      trace.log({ key, value: record[key] })
      /* Bug in Summernote - intermittently doubles up the input!   */
      /* You might look for an alternative for serious production  */
      if (attributes[key].input.type == 'summernote' && Array.isArray(record[key])) {
        console.log(`warning - summernote has produced two copies of input field ${key}.  The first copy is being used. `)
        record[key] = record[key[0]]
      }

      if (attributes[key].process && attributes[key].process.type == 'updatedBy') { record[key] = loggedInUser }
      if (attributes[key].process &&
        record[key] &&
        attributes[key].process.type == 'JSON') {
        trace.log(record[key])
        record[key] = JSON.stringify(record[key])
        trace.log(record[key])
      }

      if (attributes[key].input.type == 'uploadFile' && files && files[key]) {
        let rootdir = __dirname
        rootdir = rootdir.replace('/bin/suds', '')
        let oldRecord = {}
        if (id) {
          oldRecord = await db.getRow(table, id) // populate record from database
        }

        trace.log(files[key], rootdir, oldRecord[key])
        if (oldRecord[key]) {
          try {
            fs.unlinkSync(`${rootdir}/public/uploads/${oldRecord[key]}`)
            console.log(`successfully deleted ${rootdir}/public/uploads/${oldRecord[key]}`)
          } catch (err) {
            console.log(`Can't delete ${rootdir}/public/uploads/${oldRecord[key]}`)
          }
        }
        let uploadname = Date.now().toString() + '-' + files[key].name
        uploadname = uploadname.replace(/ /g, '_')
        if (attributes[key].input.keepFileName) { uploadname = files[key].name }

        files[key].mv(`${rootdir}/public/uploads/${uploadname}`)
        record[key] = uploadname
        //   let result = await upload(inputs.req, inputs.res, key);
        //    trace.log(result);
      }
      if (attributes[key].type == 'boolean') {
        if (record[key]) { record[key] = true } else { record[key] = false }
      }

      if (attributes[key].input.type == 'date' &&
        attributes[key].type == 'number'
      ) {
        record[key] = Date.parse(record[key])
        trace.log(record[key])
        if (isNaN(record[key])) {
          record[key] = 0
        }
      }

      if (record[key] != undefined && attributes[key].type == 'number') {
        if (record[key]) {
          record[key] = Number(record[key])
        } else {
          record[key] = 0
        }
        trace.log(record[key])
      }

      if (attributes[key].input && attributes[key].input.server_side) {
        const err = attributes[key].input.server_side(record)
        if (err) {
          errors[key] = `<span class="${classes.error}">${err}</span>`
        }
      }
      trace.log({ after: key, value: record[key] })
    }
    return errors
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

  async function updateDatabase () {
    trace.log('update pre-processing', table, mode, id, record)
    if (tableData.edit.preProcess) { await tableData.edit.preProcess(record) }
    let message = ''
    let subschemas;
    let additionalAttributes;
    let operation
    const rec = {}
    trace.log('update/new processing', mode, id)
    /**
     *
     * If the record is on the database
     *
     * */
    if (id) {
      operation = 'update'
      trace.log({ Updating: id, table, user: loggedInUser })
      for (const key of Object.keys(attributes)) {
        if (attributes[key].process.type == 'updatedAt') { record[key] = Date.now() }
        if (attributes[key].process.type == 'updatedBy') { record[key] = loggedInUser }
      }
      try {
        trace.log(record);
        [subschemas, additionalAttributes] = await addSubs(record)
        await db.updateRow(table, record, subschemas, additionalAttributes) // ref record from database
        message = lang.rowUpdated + tableName
      } catch (err) {
        console.log(`Database error updating record ${id} on ${table}`, err)
        return `<h1>Database error updating record ${id} on ${table}<h1><p>${err}</p>`
      }

      /**
       *
       * No id so we need to add record
       *
       *  */
    } else {
      operation = 'addNew'
      trace.log('new record')
      for (const key of Object.keys(attributes)) {
        if (attributes[key].primaryKey) { continue }
        if (record[key]) {
          rec[key] = record[key]
        } else {
          rec[key] = null
          if (attributes[key].type == 'string') { rec[key] = '' }
          if (attributes[key].type == 'number') { rec[key] = 0 }
          if (attributes[key].type == 'boolean') { rec[key] = false }
          if (attributes[key].process.type == 'updatedBy') { rec[key] = loggedInUser }
          if (attributes[key].process.type == 'createdAt') { rec[key] = Date.now() }
          if (attributes[key].process.type == 'updatedAt') { rec[key] = Date.now() }
        }
      }
      trace.log('New record', table, rec)
      try {
        const created = await db.createRow(table, rec)
        if (typeof (created[tableData.primaryKey]) === undefined) {
          return ('Error adding row - see console log')
        }
        record[tableData.primaryKey] = id = created[tableData.primaryKey]
        if (suds.dbtype == 'nosql') {
          target = db.stringifyId(id)
        }

        trace.log({ created: record[tableData.primaryKey], key: tableData.primaryKey, id })
        if (auditId) {
          await db.updateRow('audit', { id: auditId, mode: 'new', row: id })
        }
      } catch (err) {
        console.log(`Database error creating record on ${table}`, err)
        return `<h1>Database error creating record on ${table}<h1><p>${err}</p>`
      }
      message = `${lang.rowAdded} ${id}`
    }
    return message
  }

  /**
   *
   * Post process processing and switch to list the record
   * @returns {object} HTML from ListRow
   *
   * */
  async function postProcess () {
    trace.log('postprocess', record, operation)
    if (tableData.edit.postProcess) {
      await tableData.edit.postProcess(record, operation)
      trace.log(record)
    }
    trace.log('switching to list record', id, record[tableData.primaryKey], tableData.primaryKey)
    const output = await listRow(
      permission,
      table,
      id,
      open,
      openGroup,
      subschemas
    )
    return (output)
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

  function fieldList (attributes, includeId) {
    trace.log(attributes)
    const formList = []
    trace.log(permission)
    for (const key of Object.keys(attributes)) {
      trace.log({ key, canedit: attributes[key].canEdit, permission })
      if (attributes[key].process.type == 'createdAt' ||
        attributes[key].process.type == 'updatedAt' ||
        attributes[key].process.type == 'updatedBy'
      ) { continue }
      if (attributes[key].primaryKey && !includeId) { continue }
      if (attributes[key].collection) { continue } // not intersted in collections
      if (!(attributes[key].canEdit)) { continue }
      if (attributes[key].input.hidden) { continue }
      formList.push(key)
    }
    trace.log(formList)
    return formList
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
  function createFormGroups () {
    trace.log({ formgroups: tableData.groups, formlist: formList })
    hideGroup = {}
    /** Cycle through groups
     * - creating a list creating a list of all the columns covered
     * - if a group applies to certain record types and the list for that group
     *    doesn't include that recoird ttype add to a list of hidden groups
     * - Create a list of non-static groups - these will be the tabs
     * - if there is no columns array (unlikely) - create an empty one
     *
     */
    let incl = []
    for (const group of Object.keys(tableData.groups)) {
      if (tableData.groups[group].recordTypes &&
        !tableData.groups[group].recordTypes.includes(record[tableData.recordTypeColumn])
      ) {
        trace.log({ hiding: group })
        hideGroup[group] = true
      }
      if (!tableData.groups[group].static) { tabs.push(group) } // Not static so we will need a tab function
      if (!tableData.groups[group].columns) {
        tableData.groups[group].columns = []
      }
      incl = incl.concat(tableData.groups[group].columns)
    }
    trace.log({ incl, hideGroup })

    /**
     * Clone the list of all columns = note these will be top level items only
     * need to remove the items in 'all' that are also in 'incl' and store result in
     * tableData.groups.other.columns
     * tableData.groups.other.columns = all.filter(item => !incl.includes(item));
     *
     * */
    const all = []
    for (let i = 0; i < formList.length; i++) { all[i] = formList[i] }
    if (!tableData.groups.other) { tableData.groups.other = {} }
    if (!tableData.groups.other.columns) { tableData.groups.other.columns = [] }
    for (const key of all) {
      if (!incl.includes(key)) {
        tableData.groups.other.columns.push(key)
      }
    }
    trace.log({ other: tableData.groups.other.columns })
    /**
     * Find the first non-static group and open this by default.
     * While about it - create table linking column to group
     */
    let first = true
    for (const group of Object.keys(tableData.groups)) {
      if (first && !tableData.groups[group].static) {
        openTab = group
        first = false
      };
      for (const col of tableData.groups[group].columns) {
        if (!tableData.groups[group].static) {
          columnGroup[col] = group
        }
        if (errors[col] && !tableData.groups[group].static) { openTab = group }
      }
    }
    trace.log({ columnGroup, openTab })
    /** Create a list of visible groups
     *  visibkeGroup just means that there is at least one field in the group that it not hidden
         * hiddenGroup means that we are just bot showing that group so has priority.
     */
    visibleGroup = {}
    for (const key of formList) {
      trace.log({ key, hidden: attributes[key].input.hidden, columngroup: columnGroup[key] })
      if (!attributes[key].input.hidden) {
        visibleGroup[columnGroup[key]] = true
      }
    }

    trace.log({ tabs, groups: tableData.groups, visible: visibleGroup, hide: hideGroup })

    if (tabs) {
      form += `
      <script>
      function tabclick (tab) { 
        console.log('tabclick:',tab); `
      for (const tab of tabs) {
        trace.log(tab, hideGroup[tab], visibleGroup[tab])
        if (hideGroup[tab]) { continue }
        if (!visibleGroup[tab]) { continue }
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
        }`
      }
      form += ` 
      }          
      </script>`
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

  async function createFieldArray (qualifiedName, attributes, data) {
    trace.log(arguments)
    let formField = ''
    let headerTag = ''
    let bite = 1
    if (attributes.array.bite) { bite = attributes.array.bite }
    if (!data) { data = [] }
    trace.log({ data, length: data.length })
    formField += `
    <div id="${qualifiedName}.envelope">                                 <!-- ---------------- ${qualifiedName} envelope start -------------------- -->
       <input type="hidden" id="${qualifiedName}.length" name= "${qualifiedName}.length" value="${data.length}">   <!-- Number of data items in array -->`
    trace.log(formField)
    for (let i = 0; i < data.length + 1; i++) {
      trace.log('before', i, data[i])
      let field
      const subdata = data[i]
      let tag
      const subqualname = `${qualifiedName}.${i + 1}` /** qualname is the qualified name  */
      const nextItem = `${qualifiedName}.${i + 2}` /** nextItem is the qualified name of the next array item */
      let display = 'inline' /** switched to none after the first empty field */
      const onclick = ''

      if (i >= data.length) {
        display = 'none'
      }
      if (attributes.type == 'object') {
        let datum;
        if (i >= data.length) { datum = {} }
        [field, tag] = await createFieldObject(subqualname, attributes, subdata)
      } else {
        if (i >= data.length) { datum = '' }
        [field, tag] = await createOneFieldHTML(subqualname, attributes, subdata)
      }
      /** if i is GT data.length then this is an empty field */
      formField += `
      
      <div style="display: ${display}" id="${subqualname}.fld" >   <!-- ----------- Array item  ${subqualname} start --------------- -->           
        <b>${attributes.friendlyName} #${i + 1}</b>
        <span style="padding-left: 50px; font-weight: normal">${lang.delete}&nbsp;&nbsp;  
        <input type="checkbox" name="${subqualname}.delete"></span>
        <br>
          ${field}
      </div>                      <!-- ---------------- Array item  ${subqualname} ends ------------------ -->  `
      headerTag += tag
      trace.log('after')
    }
    formField += `
    <div id="${qualifiedName}.more">      <!-- space for additional array entries -->
    </div>
       <br />
       <button type="button"  onclick="nextArrayItem('${qualifiedName}')" class="btn btn-primary btn-sm">
           Add  ${attributes.friendlyName} 
       </button>
       <br />
    </div>              <!-- ---------------- ${qualifiedName} envelope end -------------------- -->`
    trace.log(formField, headerTag)
    return [formField, headerTag]
  }

  /*
    if (attributes.type != 'object') {
      let fieldName = key;
      if (index) { fieldName = index + '.' + key };
      return await createOneFieldHTML(key, attributes, data, fieldName, index);
    }
    */
  async function createFieldObject (qualifiedName, attributes, data, index) {
    /** This is an object */

    trace.log({ type: attributes.type, data })
    let formField = ''
    let headerTag = ''
    if (!attributes.array) {
      formField += `
      <b>${attributes.friendlyName}</b><br>`
    }
    formField += `
      <input type="hidden" name= "${qualifiedName}.object" value="${Object.keys(attributes.object).length}">   <!-- number of keys in object -->`

    for (const subkey of Object.keys(attributes.object)) {
      trace.log(subkey, data)
      const subattributes = attributes.object[subkey]
      let fieldName;
      const subqualname = fieldName = `${qualifiedName}.${subkey}`
      let subData = ''
      if (data && data[subkey]) { subData = data[subkey] }
      let subhtml
      let subhead
      trace.log({ qualifiedname: subqualname, subkey, subattributes, subData })
      trace.log(subattributes.type, subattributes.array)
      if (subattributes.array && subattributes.array.type != 'single') {
        [subhtml, subhead] = await createFieldArray(subqualname, subattributes, subData, '')
      } else {
        if (subattributes.type == 'object') {
          if (!subData) { subData = {} }
          trace.log('creating object', subqualname);
          [subhtml, subhead] = await createFieldObject(subqualname, subattributes, subData)
          trace.log('after')
        } else {
          trace.log('creating field', subqualname);
          [subhtml, subhead] = await createOneFieldHTML(subqualname, subattributes, subData)
        }
      }
      //       trace.log(formField, subhtml)
      formField += subhtml
      headerTag += subhead
      trace.log(formField, subhtml)
    }
    trace.log(formField, headerTag)

    return [formField, headerTag]
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
  async function createOneFieldHTML (qualifiedName, attributes, data) {
    trace.log(arguments)
    let linkedTable = ''
    let fieldValue = ''
    let formField = ''
    let headerTag = ''
    //   recvalue = getRecValue(key, attributes, record);
    const itemNumber = ` (${qualifiedName})`

    let indent = ''
    for (let i = 1; i < attributes.qualifiedName.length; i++) {
      indent += '&nbsp;&nbsp;&nbsp;&nbsp;'
    }

    if (data != 'undefined') { fieldValue = data }
    trace.log(fieldValue)

    trace.log(headerTags)
    if (attributes.model) { linkedTable = attributes.model }
    let errorMsg = ''
    if (errors[qualifiedName]) { errorMsg = ` ${errors[qualifiedName]}` }

    trace.log({
      element: qualifiedName,
      type: attributes.input.type,
      clearname: attributes.friendlyName,
      LinkedTable: linkedTable,
      value: fieldValue,
      titlefield: attributes.titlefield,
      group: columnGroup[qualifiedName],
      errorMsg
    })
    trace.log({ attributes, level: 'verbose' })
    if (fieldValue == null) { // can;'t pass null as a value
      //   if (attributes.type == 'number') {
      //    fieldValue = 0
      //   } else {
      fieldValue = ''
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
    let result = []
    if (attributes.input.type == 'hidden') {
      formField += `
        <input type="hidden" name="${qualifiedName}" value="${fieldValue}">`
    } else {
      if (attributes.canEdit) {
        result = await createField(qualifiedName, fieldValue, attributes, errorMsg, 'update', record, tableData, tabs)
      } else {
        if (attributes.canView) {
          result = [await displayField(attributes, fieldValue), '']
          trace.log(result)
        }
      }
      trace.log(result)
      formField += result[0]
      headerTag = result[1]
      let format = suds.input.default
      if (attributes.input.format) { format = attributes.input.format }
      let groupClass
      let labelClass
      let fieldClass
      if (format == 'row') {
        groupClass = classes.input.row.group
        labelClass = classes.input.row.label
        fieldClass = classes.input.row.field
      } else {
        groupClass = classes.input.col.group
        labelClass = classes.input.col.label
        fieldClass = classes.input.col.field
      }
      const pretext = ''
      const posttext = ''
      let tooltip = attributes.description
      trace.log(attributes.helpText)
      if (attributes.helpText) {
        tooltip = `${attributes.description}
________________________________________________________
${attributes.helpText}`
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
        `
    }
    //  store clear name of the field and html in two arrays.

    trace.log({ qualifiedName, formField })
    return [formField, headerTag]
  }

  async function createValidationScript () {
    form += `
    <script>
      function validateForm() {
        let debug=false ;
        if (debug) {console.log(614, '*******validateForm******');}
        let errCount=0;
        let value='';
        let columnError;
        let mainform=document.getElementById('mainform');
        `
    for (const key of formList) {
      trace.log({ key: key, attributes: attributes[key], level: 's3' })
      if (attributes[key].collection) { continue } // not intersted in collections
      if (!attributes[key].canEdit) { continue } // can't validate if not editable
      if (attributes[key].input && attributes[key].input.type === 'hidden') { continue }
      trace.log({ key: key, level: 's3' })
      if (attributes[key].primaryKey ||
        attributes[key].process.type == 'createdAt' ||
        attributes[key].process.type == 'updatedAt'
      ) { continue } // can't validate auto updated fields
      if (attributes[key].array) {
        form += await createArrayValidation(attributes[key], key, record[key], key, columnGroup)
      } else {
        if (attributes[key].type == 'object') {
          form += await createObjectValidation(attributes[key], key, record[key], key, columnGroup)
        } else {
          form += await createFieldValidation(attributes[key], key, record[key], key, columnGroup)
        }
      }
    }
    form += `
        if (errCount > 0) { return false; }  else {  return true; }
      }
    </script>
    `
  }

  async function createArrayValidation (attributes, fieldName, data, topkey, columnGroup) {
    return ''
    let bite = 10
    if (attributes.array.bite) { bite = attributes.array.bite }
    if (!data) { data = [] }
    trace.log({ fieldName, data })
    let result = `
    { 
      let length=0;   
  //  let length=Number(document.getElementById('${fieldName}.length').innerHTML);
        console.log('${fieldName}.length',document.getElementById('${fieldName}.length'))
     //   console.log(document.getElementById('${fieldName}.length').innerHTML,length);      
   `
    for (i = 0; i < data.length + bite; i++) { // number of array alements generated
      trace.log(i)
      result += `
       if (${i}<length) {` // Number of array elements used
      const subFieldName = `${fieldName}.${i + 1}`

      if (attributes.type == 'object') {
        result += await createObjectValidation(attributes, subFieldName, data[i], topkey, columnGroup)
      } else {
        result += await createFieldValidation(attributes, subFieldName, data[i], topkey, columnGroup)
      }

      result += `
  }`
    }
    result += `
  }`
    trace.log(result)
    return result
  }

  async function createObjectValidation (attributes, fieldName, data, topkey, columnGroup) {
    let result = ''
    if (!data) { data = [] }
    trace.log({ fieldName, attributes, data, level: 'verbose' })
    for (const subkey of Object.keys(attributes.object)) {
      const subFieldName = fieldName + '.' + subkey
      let subData = data[fieldName]
      if (attributes.object[subkey].array) {
        result += await createArrayValidation(attributes.object[subkey], subFieldName, subData, topkey, columnGroup)
      } else {
        if (attributes.object[subkey].type == 'object') {
          result += await createObjectValidation(attributes.object[subkey], subFieldName, subData, topkey, columnGroup)
        } else {
          result += await createFieldValidation(attributes.object[subkey], subFieldName, subData, topkey, columnGroup)
        }
      }
    }
    return (result)
  }

  async function createFieldValidation (attributes, fieldName, data, topkey, columnGroup) {
    let form = ''

    trace.log({ fieldName, attributes, level: 'verbose' })
    form += `
      // ********** Start of validation for ${attributes.friendlyName}  ***************
      if (debug) {console.log('${fieldName}',' ','${attributes.input.type}')}
      columnError=false;`
    //  Has an api left an error message
    if (attributes.input.validations.api) {
      form += `
      if (document.getElementById('err_${fieldName}').innerHTML) {
        columnError=true;
        errCount++;
      }
      else {
        document.getElementById("err_${fieldName}").innerHTML='';
      }`
    }

    let vals = 0
    if (attributes.input.type == 'autocomplete') {
      form += `
      value=mainform['autoid_${fieldName}'].value;`
    } else {
      if (attributes.type == 'number') {
        form += `
      value=Number(mainform['${fieldName}'].value);`
      } else {
        form += `
      value=mainform['${fieldName}'].value;`
      }
    }
    form += `
    if (debug) {console.log('${fieldName}',' ',value)}`
    if (attributes.required || attributes.input.required) { // Required
      form += `
        if (true) {          // Start of validation for ${fieldName} `
    } else {
      form += `
        if (value) {                    // ${fieldName} is not mandatory so validation only needed                                        // if there is something in the field`
    }

    // Start of generating code for the validations for this field
    if (attributes.required || attributes.input.required) {
      vals++
      form += `
            if (!value) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.mandatory}";
              columnError=true;
              errCount++;

            }`
    }

    if (
      attributes.type == 'number' ||
      (attributes.input && attributes.input.isNumber)
    ) {
      vals++
      form += `
           if (value == 'NaN') {
              document.getElementById("err_${fieldName}").innerHTML="${lang.nan}";
              columnError=true;
              errCount++;
            }`
    }

    if (attributes.input) {
      if (attributes.input.isInteger) {
        vals++
        form += `
            if (!Number.isInteger(value)) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.notInt}";
              columnError=true;
              errCount++;
            }`
      }

      if (attributes.input.isEmail) {
        vals++
        form += `
            if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.notEmail}";
              columnError=true;
              errCount++;
            }`
      }

      if (attributes.input.max) {
        vals++
        form += `
            if (value > ${attributes.input.max}) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.max} ${attributes.input.max}";
              columnError=true;
              errCount++;
            }`
      }
      if (attributes.input.min) {
        vals++
        form += `
            if (value < ${attributes.input.min}) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.min} ${attributes.input.min}";
              columnError=true;
              errCount++;
            }`
      }

      if (attributes.input.maxLength) {
        vals++
        form += `
            if (value.length > ${attributes.input.maxLength}) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.maxLength} ${attributes.input.maxLength}";
              columnError=true;
              errCount++;
            }`
      }

      if (attributes.input.minLength) {
        vals++
        form += `
            if (value.length < ${attributes.input.minLength}) {
              document.getElementById("err_${fieldName}").innerHTML="${lang.minLength} ${attributes.input.minLength}";
              columnError=true;
              errCount++;
            }`
      }
    }

    // finished all the validations here

    if (vals == 0) {
      form += `
                  // No inline validations for ${fieldName} `
    } else {
      trace.log({ fieldName, topkey, group: columnGroup })
      if (columnGroup[topkey] && tabs.length > 1) {
        form += `
            if (columnError) {tabclick('${columnGroup[topkey]}')}`
      }
    }
    form += `
       if (!columnError) {
            document.getElementById("err_${fieldName}").innerHTML="";
      }
          }       // end of validation for ${fieldName}`
    return form
  }

  /* *******************************************************
   *
    *
   *  Create form
   *
   ****************************************************** */
  async function createForm () {
    trace.log({ subschemas })
    let displayOp = ''
    if (mode == 'populate') { displayOp = lang.update }
    if (mode == 'update') { displayOp = lang.update }
    if (mode == 'new') { displayOp = lang.addRow }
    // let from = '';
    //  if (allParms['#from#']) { from = allParms['#from#']; }

    if (message) { form += `\n<P>${message}</P>` }
    form += `
    <h2>${displayOp} ${lang.forTable}: ${tableName}</h2>`

    //       enctype="multipart/form-data"

    let query = `table=${table}&mode=update&id=${id}`
    if (open) { query += `&open=${open}` }
    if (openGroup) { query += `&opengroup=${openGroup}` }
    for (let i = 0; i < subschemas.length; i++) { query += `&subschema=${subschemas[i]}` }

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
      `
    //   <input type="hidden" name="table" value="${table}">`;
    //  <input type="hidden" name="#parent#" value="${parent}" >
    //  <input type="hidden" name="#parentkey#" value="${parentKey}" >
    //      <input type="hidden" name="#from#" value="${from}" >`;
    if (id) {
      form += `
      <input type="hidden" name="${tableData.primaryKey}" value="${id}">
`
    }
    // form += `
    //   <input type="hidden" name="mode" value="update">
    // `;
    let linkAttributes = {};
    if (tableData.edit && tableData.edit.parentData && record[tableData.edit.parentData.link]) {
      const link = attributes[tableData.edit.parentData.link].model
      const columns = tableData.edit.parentData.columns
      linkAttributes = await mergeAttributes(link, permission)
      trace.log({ record, link: tableData.edit.parentData.link, data: record[tableData.edit.parentData.link] })
      const linkRec = await db.getRow(link, record[tableData.edit.parentData.link])
      trace.log(linkRec)
      const linkTableData = tableDataFunction(link, permission)
      let linkName = link
      if (linkTableData.stringify) {
        if (typeof (linkTableData.stringify) === 'string') {
          linkName = linkRec[linkTableData.stringify]
        } else {
          linkName = linkTableData.stringify(linkRec)
        }
      }
      form += `
    <div class="${classes.parentData}">
    <h3>${linkName}</h3>`
      for (const key of columns) {
        const display = await displayField(linkAttributes[key], linkRec[key], 0, permission)
        const title = linkAttributes[key].friendlyName
        let description = ''
        if (linkAttributes[key].description) {
          description = linkAttributes[key].description.replace(/"/g, '\'')
        }
        form += `

          <div class="${classes.input.group} ${classes.input.row.group}"> 
            <div class="${classes.input.row.label}">
               ${linkAttributes[key].friendlyName}
            </div>
            <div class="${classes.input.row.field}">
  ${display}
            </div> <!-- fields column -->
          </div>  <!--  Form group for ${key} -->`
      }
      form += `
    </div>`
    }

    trace.log(groups)
    tabs = []
    // groupform = []
    for (const group of Object.keys(groups)) { // run through the groups (there may only be one...)
      if (hideGroup[group]) { continue }

      trace.log(group)
      if (groups[group].static) { //   if the group is static,
        for (const key of groups[group].columns) {
          trace.log(key) //      just output the fields
          if (!formData[key]) { continue }
          form += `
      <!-- --- --- --- --- --- --- Form group for ${key} --- --- --- --- --- ---  -->`
          form += `
            ${formData[key]}
              `
        }
      } // end of static
      else {
        // then run through the columns
        if (visibleGroup[group]) {
          tabs.push(group) // add the group to a list of groups that will be on tabs
        }
      }
    }
    trace.log(tabs)
    if (tabs) { // if there are any tabs
      if (tabs.length > 1) {
        form += `
          <!-- this section controlled by tabs -->
          <div class="${classes.input.groupLinks.row}">  <!-- group links row -->
          <div class="${classes.input.groupLinks.envelope}"> <!-- group links envelope -->
              <span class="${classes.input.groupLinks.spacing}">${lang.formGroup}</span>`
        for (const group of tabs) { // run through the tabs
          trace.log(openTab, group)
          let friendlyName = group
          if (groups[group].friendlyName) { friendlyName = groups[group].friendlyName }
          let linkClass
          if (openTab == group) { linkClass = classes.input.groupLinks.selected } else { linkClass = classes.input.groupLinks.link } // the first will be shown the rest hidden
          form += `
          <span class="${classes.input.groupLinks.spacing} ${linkClass}" id="tab_${group}" onclick="tabclick('${group}')">
             ${friendlyName}
          </span>` // outputting a list of links
        }
        form += `
        </div> <!-- group links row end -->
        </div> <!-- group links envelope end -->
        <div></div>`
      }
      trace.log(openTab, tabs)
      if (!tabs.includes(openTab)) { openTab = tabs[0] }
      let disp
      for (const group of tabs) { // then go through the non-statiuc groups
        if (openTab == group) { disp = 'block' } else { disp = 'none' } // the first will be shown the rest hidden
        form += `
       <!--  --------------------------- ${group} ---------------------- -->
        <div id="group_${group}" style="display: ${disp}">  <!-- Group ${group} -->` // div aroiun dthem
        trace.log({ group, columns: groups[group].columns })
        for (const key of groups[group].columns) { // then run through the columns
          if (!formData[key]) { continue } // sending out the fields as before
          form += `
  <!-- --- --- form-group for ${key} --- ---  -->
        ${formData[key]}
  `
        }
        // first = false // thhis will switch on the hidden grouos after first
        form += `
        </div>  <!-- Group ${group} end --> `
      }
    }

    //       <label for="${fieldName}" class="col-sm-2 col-form-label">&nbsp;</label>

    form += `
      <!-- --- --- end of form groups-- - --- -->
    <br clear="all">  
    <div class="${classes.input.buttons}">
   
    `
    if (permission == '#guest#') {
      form += `<button class="${classes.output.links.danger}" type="button" title="Guest users are not allowed to submit changes">
    ${lang.submit}
  </button>`
    } else {
      form += `<button type="submit" class="btn btn-primary" id="submitbutton">
            ${lang.submit}
          </button>`
    }
    if (id) {
      form += `
          <span style="margin-right: 10px; margin-left: 10px;">
            <a class="btn btn-primary" href="${mainPage}?table=${table}&mode=listrow&id=${id}">${lang.listRow}</a>
          </span>
      `
    }

    form += `
          <span style="margin-right: 10px; margin-left: 10px;">
            <a class="btn btn-primary" href="${mainPage}?table=${table}&mode=list">${lang.tableList}</a>
          </span>
          <a class="btn btn-primary" href="${mainPage}">${lang.backToTables}</a>
        </div>
      </form >


      `
  }
}
