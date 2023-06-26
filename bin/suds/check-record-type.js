"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRecordType = void 0;
const suds = require('../../config/suds'); // Primary configuration file
const trace = require('track-n-trace'); // Debug tool
const mergeAttributes = require('./merge-attributes'); // Standardises attributes for a table, filling in any missing values with defaults
const tableDataFunction = require('./table-data'); // Extracts non-attribute data from the table definition, filling in missinh =g values
const classes = require('../../config/classes'); // Links class codes to actual classes
const lang = require('../../config/language').EN; // Object with language data
const createField = require('./create-field'); // Creates an input field
async function checkRecordType(permission, table, inputQuery, csrf) {
    trace.log({ start: 'Check record type', inputs: arguments, break: '#', level: 'min' });
    /** ************************************************
    *
    *   set up the data
    *
    ************************************************ */
    let mainPage = suds.mainPage;
    if (!mainPage) {
        mainPage = '/';
    }
    const tableData = tableDataFunction(table, permission);
    let tableName = tableData.friendlyName;
    const attributes = mergeAttributes(table, permission); // attributes and extraattributes merged plus permissions
    if (!tableData.canEdit) {
        throw new Error(`<p>Sorry - you don't have permission to edit ${tableData.friendlyName} (${table})`);
    }
    const key = tableData.recordTypeColumn;
    let query = `table=${table}&mode=new`;
    if (inputQuery.prepopulate) {
        query += `&prepopulate=${inputQuery.prepopulate}&${inputQuery.prepopulate}=${inputQuery[inputQuery.prepopulate]}`;
    }
    query += `&prepopulate=${key}`;
    /*   needs node 17
    let attr=attributes[key];
    if (tableData.recordTypeInput) {
      attr=structuredClone(attributes[key]);
       attr.input.type=tableData.recordTypeInput;
  
    }
    */
    const oldInputType = attributes[key].input.type;
    /** Different input format for record type selection */
    if (tableData.recordTypeInput) {
        attributes[key].input.type = tableData.recordTypeInput;
    }
    const [formField, headerTags] = await createField(key, '', attributes[key], '', 'checkRecordType');
    attributes[key].input.type = oldInputType;
    const format = suds.input.default;
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
    let tooltip = attributes[key].description;
    if (attributes[key].helpText) {
        tooltip = `${attributes[key].description}
________________________________________________________
${attributes[key].helpText}`;
    }
    const form = `
  <h2>${tableName} - ${lang.select}</h2>
  <form 
  action="${mainPage}?${query}"
  id="mainform"
  method="post" 
  name="mainform" 
  class="${classes.input.form}"
>
<input type="hidden" name="_csrf" value="${csrf}" id="csrf" />
<div class="${classes.input.group} ${groupClass}">    <!-- Form group for ${attributes[key].friendlyName} start -->
<div class="${labelClass}">                      <!--  Names column start -->
  <label class="${classes.input.label}" for="${key}"  title="${tooltip}" id="label_${key}">
    ${attributes[key].friendlyName}
  </label>
</div>                                      <!-- Names column end -->
<div class="${fieldClass}">                      <!-- Fields column start -->
${pretext}
${formField}
${posttext}
</div>                                       <!-- Fields column end -->
</div>
<button type="submit" class="btn btn-primary">
            ${lang.submit}
          </button>                                         <!--Form group for ${attributes[key].friendlyName} end-->
</form>
  `;
    let footnote = '';
    trace.log(form);
    return ({ output: form, footnote: footnote, headertags: headerTags });
    //  return exits.success(form);
    // *************** end of export *************
}
exports.checkRecordType = checkRecordType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stcmVjb3JkLXR5cGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvY2hlY2stcmVjb3JkLXR5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUEsQ0FBQyw2QkFBNkI7QUFDdkUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBLENBQUMsYUFBYTtBQUNwRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQSxDQUFDLG1GQUFtRjtBQUN6SSxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQSxDQUFDLHNGQUFzRjtBQUN4SSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQSxDQUFDLHNDQUFzQztBQUN0RixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLENBQUEsQ0FBQyw0QkFBNEI7QUFDN0UsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUEsQ0FBQyx5QkFBeUI7QUFFaEUsS0FBSyxVQUFVLGVBQWUsQ0FBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJO0lBQ3hFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBRXRGOzs7O3VEQUltRDtJQUNuRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFBO0lBQzVCLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFBRSxRQUFRLEdBQUcsR0FBRyxDQUFBO0tBQUU7SUFDakMsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxF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