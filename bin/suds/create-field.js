const suds = require('../../config/suds')
const generic = require('./input/generic').fn

module.exports = createField

/**
 *
 * Create one field in an input form.
 * @param {string} key           Field namre
 * @param {*} fieldValue         Value
 * @param {object} attributes    Attributes on this field
 * @param {string} errorMsg
 * @param {string} mode
 * @param {string} record
 * @param {object} tableData
 * @param {array} tabs
 * @returns
 */
async function createField(key, fieldValue, attributes, errorMsg, mode, record, tableData, tabs) {
  trace = require('track-n-trace')
  trace.log({ inputs: arguments, maxdepth: 4 })
  trace.log({ attributes })
  const inputFieldTypes = suds.inputFieldTypes
  trace.log({ key, types: inputFieldTypes, level: 'iftbug' })

  /* *******************************************************
     *
     *  Extract field type. (defaults to text)
     *  If it is not a simple 'input' HTML tag, work out the helper name.
     *  The helpers are all input-fieldtype.js e.g field-radio.js
     *  new helpers can be added without changing this program.
     *
     * If there is no helper put out a message to the console and
     * treat as 'text'
     *
     ******************************************************  */
  let formField = ''
  let headerTags = ''
  let fieldType = 'text' // default
  if (attributes.input.type == 'boolean') {
    fieldType = 'checkbox' // but defaults to checkbox if this is a boolean
  }
  if (attributes.input.type == 'number') {
    fieldType = 'number'
  }

  if (attributes.input && attributes.input.type) {
    fieldType = attributes.input.type
  }
  trace.log({ fieldType })
  if (attributes.type == 'number' && attributes.input.type == 'date') { // have to make binary date readable
    if (fieldValue) {
      fieldValue = new Date(Number(fieldValue)).toISOString()
    } else {
      fieldValue = new Date().toISOString()
    }
    fieldValue = fieldValue.split('T')[0]
  }

  /** Special processing for process fields */
  if (
    (attributes.primaryKey ||
      (attributes.process && attributes.process.createdAt) ||
      (attributes.process && attributes.process.updatedAt)
    ) &&
    (mode != 'search')
  ) {
    if (attributes.primaryKey) {
      formField = fieldValue
    } else {
      formField = new Date(fieldValue).toDateString()
    }
  } else {
    let helperName = ''
    let helperModule
    let helper
    trace.log({ fieldType })
    trace.log(key, inputFieldTypes.length, inputFieldTypes.includes(fieldType), { level: 'iftbug' })
    //  if not a simple input tag or display - look for helper
    if (!inputFieldTypes.includes(fieldType)) {
      helperName = ''
      for (let i = 0; i < fieldType.length; i++) {
        if (fieldType.charAt(i) == fieldType.charAt(i).toUpperCase()) {
          helperName += '-'
        }
        helperName += fieldType.charAt(i).toLowerCase()
      }
      trace.log(helperName)
      helperModule = require('./input/' + helperName)
      if (helperModule.fn) {
        helper = helperModule.fn
      } else {
        helper = helperModule
      }
      if (!helper) {
        console.log(`*** invalid field type ${fieldType} in field ${key} ***`)
        fieldType = 'text'
        helperName = ''
      }
    }

    if (
      attributes.recordType &&
      mode != 'checkRecordType' &&
      attributes.input.recordTypeFix &&
      (mode != 'search')
    ) {
      helperName = 'readonly'
      helperModule = require('./input/' + helperName)
      if (helperModule.fn) {
        helper = helperModule.fn
      } else {
        helper = helperModule
      }
    }
    trace.log({ helpername: helperName, helper: typeof (helper) })

    const passedValue = fieldValue
    let passedName = key
    if (mode == 'search') { passedName = '{{fieldname}}' }

    if (inputFieldTypes.includes(fieldType)) {
      trace.log('Regular input field', fieldType)
      formField = await generic(fieldType, passedName, passedValue, attributes, errorMsg,record,tableData)
    } else {
      if (helperName) {
        trace.log('calling helper', helperName)
        const result = await helper(fieldType, passedName, passedValue, attributes, errorMsg, record, tableData, tabs)
        if (Array.isArray(result)) {
          formField = result[0]
          headerTags = result[1]
        } else {
          formField = result
        }
      }
    }
  }
  let after = ''
  if (attributes.input.after && mode != 'search') {
    after = attributes.input.after.replace('{{fieldValue}}', fieldValue)
  }
  let before = ''
  if (attributes.input.before && mode != 'search') {
    before = attributes.input.before.replace('{{fieldValue}}', fieldValue)
  }
  formField = before + formField + after
  trace.log({ field: formField })

  return ([formField, headerTags])
}
