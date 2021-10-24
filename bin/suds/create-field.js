let suds = require('../../config/suds');
let generic = require('./input/generic');




module.exports = async function (key, fieldValue, attributes, errorMsg, mode, record,tableData) {

  trace = require('track-n-trace');
  trace.log({ inputs: arguments, maxdepth: 2 });
  const inputFieldTypes = suds.inputFieldTypes;


  /* *******************************************************
     * 
     *  Extract field type from extra attributes. (defaults to text) 
     *  If it is not a simple 'input' HTML tag, work out the helper name. 
     *  The helpers are all input-fieldtype.js e.g field-radio.js
     *  new helpers can be added without changing this program.
     * 
     * If there is no helper put out a ,essage to the consoe and 
     * treat as 'text'
     * 
     ******************************************************  */
  let formField='';
  let headerTags='';
  let fieldType = 'text';                        // default
  if (attributes[key].input.type == 'boolean') {
    fieldType = 'checkbox';                 // but defaults to checkbox if this is a boolean
  }
  if (attributes[key].input && attributes[key].input.type) {
    fieldType = attributes[key].input.type;
  }
  trace.log({ fieldType: fieldType });
  if (attributes[key].type == 'number' && attributes[key].input.type == 'date') {   // have to make binary date readable
    if (fieldValue) {
      fieldValue = new Date(Number(fieldValue)).toISOString();
    }
    else {
      fieldValue = new Date().toISOString();
    }
    fieldValue = fieldValue.split('T')[0];
  }
  if (
    (attributes[key].primaryKey || key == 'createdAt' || key == 'updatedAt')
    && (mode != 'search')
  ) {
    if (Attributes[key].primaryKey) {
      formField = fieldValue;
    }
    else {

      formField = new Date(fieldValue).toDateString();
    }

  }
  else {
    let helperName = '';
    let helper;
    trace.log({ fieldType: fieldType });
    //  if not a simple input tag or display - look for helper   
    if (!inputFieldTypes.includes(fieldType)) {
      // e.g sails.helpers.suds-input-checkbox()
      helperName = '';
      for (let i = 0; i < fieldType.length; i++) {
        if (fieldType.charAt(i) == fieldType.charAt(i).toUpperCase()) {
          helperName += '-';
        }
        helperName += fieldType.charAt(i).toLowerCase();
      }
      trace.log({ helpername: helperName });
      helper = require('./input/' + helperName);
      if (!helper) {
        console.log(`*** invalid field type ${fieldType} in field ${key} ***`);
        fieldType = 'text';
        helperName = '';
      }
    }

    let passedValue = fieldValue;
    let passedName = key;
    if (mode == 'search') { passedName = '{{fieldname}}' }

    if (inputFieldTypes.includes(fieldType)) {
      trace.log('Regular input field', fieldType);
      formField = await generic(fieldType, passedName, passedValue, attributes[key], errorMsg);
    }
    else {
      if (helperName) {
        trace.log('calling helper', helperName);
        let result = await helper(fieldType, passedName, passedValue, attributes[key], errorMsg,record,tableData);
        if (Array.isArray(result)) {
          formField=result[0];
          headerTags=result[1];
        }
        else {
          formField=result;
        }

      }
    }
  }

  trace.log({ field: formField });

  return ([formField,headerTags]);

}




