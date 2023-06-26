"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../../config/suds');
const documentation = {
    friendlyName: 'Autocomplete input.',
    description: `Generates autocomplete field. This can be based in a fixed set of items which are in the model (isIn), 
  or more normally based on a linked table. In this case the field must be a key to some other table. 
  The user either enters the key of the linked file, or starts typing the 
  value in the linked table that is specified (e.g.someone's name). 
  A list of candidates is shown and one can be selected or more characters typed to narrow it down. 
  The selected name is shown on screen and the record key ('id' always) is stored in a hidden field. 
  `
};
const trace = require('track-n-trace');
const lang = require('../../../config/language').EN;
const tableDataFunction = require('../table-data');
const db = require('../db');
const classes = require('../../../config/classes').input; // Links class codes to actual classes
const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, thisrecord) {
    trace.log(arguments);
    let results = '';
    const display = '';
    let title = ''; // starting value to put in filter
    let source;
    let values;
    if (typeof attributes.values === 'string') {
        source = attributes.values;
        if (fieldValue) {
            values = require(`../../../config/${attributes.values}`);
            title = values[fieldValue];
        }
    }
    let route = 'lookup';
    if (attributes.model) {
        route = 'auto';
    }
    if (attributes.input.route) {
        route = attributes.input.route;
    }
    ;
    trace.log(source);
    if (attributes.model) {
        source = attributes.model;
        trace.log({ model: source, id: fieldValue });
        // searching linked tble (the normal case)
        const tableData = tableDataFunction(source);
        let record = [];
        if (fieldValue) {
            fieldValue = db.standardiseId(fieldValue); // Must be a valid key
            record = await db.getRow(source, fieldValue); // populate record from database
            trace.log(record);
            if (record.err) {
                errorMsg = `<span class="text-danger">${record.errmsg}</span>`;
            }
            else {
                if (display) {
                    title = record[display];
                }
                else {
                    if (typeof (tableData.stringify) === 'string') {
                        title = record[tableData.stringify];
                    }
                    else {
                        title = await tableData.stringify(record);
                    }
                }
            }
        }
    }
    //  minLength = 2;
    //  if (attributes.input.minLength) { minLength = attributes.input.minLength };
    let limit = 5;
    if (attributes.input.limit) {
        limit = attributes.input.limit;
    }
    let placeholder = '';
    if (lang.type) {
        placeholder = lang.type;
    }
    if (attributes.input.placeholder) {
        placeholder = attributes.input.placeholder;
    }
    const size = 50;
    let width = suds.defaultInputFieldWidth;
    if (attributes.input.width) {
        width = attributes.input.width;
    }
    let searchparm = '';
    if (attributes.model) {
        let idPrefix = 'ID: ';
        if (attributes.input.idPrefix) {
            idPrefix = attributes.input.idPrefix;
        }
        if (!attributes.input.search) {
            console.log(`Field ${fieldName} in table being edited requires search  in config file`);
            return `Field ${fieldName} in table being edited requires search  in config file`;
        }
        if (typeof attributes.input.search === 'string') {
            searchparm = `&andor=and&searchfield_1=${attributes.input.search}&compare_1=contains&value_1=%23input`;
        }
        else {
            if (attributes.input.search && attributes.input.search.searches) {
                let andor = 'and';
                if (attributes.input.search.andor) {
                    andor = attributes.input.search.andor;
                }
                searchparm = `&andor=${andor}`;
                for (let i = 0; i < attributes.input.search.searches.length; i++) {
                    let j = i + 1;
                    let value = attributes.input.search.searches[i][2];
                    if (value == '#input') {
                        value = '%23input';
                    }
                    if (value.substr(0, 1) == '$') {
                        value = thisrecord[value.substr(1)];
                    }
                    if (!value) {
                        break;
                    }
                    searchparm += `&searchfield_${j}=${attributes.input.search.searches[i][0]}`;
                    searchparm += `&compare_${j}=${attributes.input.search.searches[i][1]}`;
                    searchparm += `&value_${j}=${value}`;
                }
            }
        }
    }
    let sortparm = '';
    if (attributes.input.search && attributes.input.search.sort) {
        sortparm = `&sortfield=${attributes.input.search.sort[0]}&sortdirection=${attributes.input.search.sort[1]}`;
    }
    let onblur = '';
    if (attributes.input.onblur) {
        onblur = attributes.input.onblur;
    }
    let onchange = '';
    if (attributes.input.onchange) {
        onchange = attributes.input.onchange;
        onchange = onchange.replace('{{fieldValue}}', fieldValue);
    }
    results = `
    <div class="${classes.autocompleteContainer}"> <!--  autcomplete container --> 
    <input 
      id="autoid_${fieldName}" 
      name="${fieldName}"  
      value="${fieldValue}"
      type="hidden">
        <input 
          class="form-control" 
          style="width: ${attributes.input.width}; float: left;" 
          id="${fieldName}" 
          name="${fieldName}disp"
          value="${title}"
          placeholder="${placeholder}" 
          aria-describedby="${attributes.description}"
          oninput="auto('${route}','${fieldName}','${source}','${display}','${limit}','${searchparm}','${sortparm}','${onchange}')"
          onblur="${onblur}"
          >
          <span id="msg_${fieldName}"></span>
          <span id="err_${fieldName}" class="sudserror">
            ${errorMsg}
          </span>
          <span 
          class="${classes.autoRemove}"
          onclick="document.getElementById('autoid_${fieldName}').value=''; document.getElementById('${fieldName}').value=''"
          >
            ${lang.deleteIcon} ${lang.clear}
          </span>
    </div>  <!--  autcomplete container end -->
  `;
    return results;
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2NvbXBsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Jpbi9zdWRzL2lucHV0L2F1dG9jb21wbGV0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBRTVDLE1BQU0sYUFBYSxHQUFHO0lBRXBCLFlBQVksRUFBRSxxQkFBcUI7SUFDbkMsV0FBVyxFQUFFOzs7Ozs7R0FNWjtDQUNGLENBQUE7QUFFRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsRUFBRSxDQUFBO0FBQ25ELE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ2xELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUMzQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQyxLQUFLLENBQUEsQ0FBQyxzQ0FBc0M7QUFFL0YsTUFBTSxFQUFFLEdBQUcsS0FBSyxXQUFXLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVTtJQUMzRixLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBRXBCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQTtJQUNoQixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFDbEIsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFBLENBQUMsa0NBQWtDO0lBRWpELElBQUksTUFBTSxDQUFBO0lBQ1YsSUFBSSxNQUFNLENBQUE7SUFDVixJQUFJLE9BQU8sVUFBVSxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUU7UUFDekMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUE7UUFDMUIsSUFBSSxVQUFV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