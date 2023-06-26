"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../../config/suds');
const documentation = {
    friendlyName: 'Generic input',
    description: 'Generic routine geneating an input tag.'
};
const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record, tableData) {
    /*
      inputs: {
        fieldType: { type: 'string' },
        fieldName: { type: 'string' },
        fieldValue: { type: 'string' },
        attributes: { type: 'ref' },
        errorMsg: { type: 'string' },
      },
    */
    const trace = require('track-n-trace');
    trace.log(arguments);
    const input = attributes.input;
    let pretag = '';
    if (typeof fieldValue === 'string' && fieldValue.includes('"')) {
        fieldValue = fieldValue.replace(/"/g, '&quot;');
    }
    let apicall = '';
    if (input.api) {
        apicall = `onchange="apiCheck('${fieldName}','${input.api.route}','${tableData.tableName}','${record[tableData.primaryKey]}')"
          oninput="apiWait('${fieldName}')"`;
    }
    // field size is in table input config, or default size or 100
    let result = `
        <input 
          type="${fieldType}" 
          class="${input.class}" 
          id="${fieldName}" 
          name="${fieldName}"
          aria-describedby="${attributes.description}"
          value="${fieldValue}"
          ${apicall} `;
    // Any other items in the input property in the config file
    //  are copied in here.
    // e.g {rows: '5', cols: '60', placeholder: 'Plea...'}
    const ignore = ['type', 'name', 'validations', 'required', 'class', 'isInteger', 'api'];
    for (const inprop of Object.keys(input)) {
        if (ignore.includes(inprop)) {
            continue;
        } // skip the ones we have already done
        result += `
          ${inprop}="${input[inprop]}" `;
    }
    if (suds.useHTML5Validation) {
        if (input.required) {
            result += `
    required`;
        }
    }
    trace.log(fieldName, fieldType, attributes.values);
    if (attributes.values && Array.isArray(attributes.values)) {
        pretag = `
      <datalist id="${fieldName}_enum">`;
        for (const val of attributes.values)
            pretag += `\n         <option value="${val}">`;
        pretag += `
      </datalist>`;
        result += `
          list="${fieldName}_enum"`;
    }
    result += `>
        ${pretag}
        <span id="err_${fieldName}" class="sudserror">${errorMsg}</span>
      `;
    trace.log(result);
    return (result);
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJpYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iaW4vc3Vkcy9pbnB1dC9nZW5lcmljLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFFNUMsTUFBTSxhQUFhLEdBQUc7SUFDcEIsWUFBWSxFQUFFLGVBQWU7SUFDN0IsV0FBVyxFQUFFLHlDQUF5QztDQUN2RCxDQUFBO0FBRUQsTUFBTSxFQUFFLEdBQUcsS0FBSyxXQUFXLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUMsTUFBTSxFQUFDLFNBQVM7SUFDaEc7Ozs7Ozs7O01BUUU7SUFFRixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDdEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNwQixNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFBO0lBQzlCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUVoQixJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQUUsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQUU7SUFDbkgsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2hCLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRTtRQUNiLE9BQU8sR0FBRyx1QkFBdUIsU0FBUyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxNQUFNLFNBQVMsQ0FBQyxTQUFTLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7OEJBQ2hHLFNBQVMsS0FBSyxDQUFBO0tBQ3pDO0lBQ0QsOERBQThEO0lBQzlELElBQUksTUFBTSxHQUFHOztrQkFFRyxTQUFTO21CQUNSLEtBQUssQ0FBQyxLQUFLO2dCQUNkLFNBQVM7a0JBQ1AsU0FBUzs4QkFDRyxVQUFVLENBQUMsV0FBVzttQkFDakMsVUFBVTtZQUNqQixPQUFPLEdBQUcsQ0FBQTtJQUVwQiwyREFBMkQ7SUFDM0QsdUJBQXVCO0lBQ3ZCLHNEQUFzRDtJQUN0RCxNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUMsV0FBVyxFQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3JGLEtBQUssTUFBTSxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUN2QyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFBRSxTQUFRO1NBQUUsQ0FBQyxxQ0FBcUM7UUFDL0UsTUFBTSxJQUFJO1lBQ0YsTUFBTSxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFBO0tBQ3JDO0lBQ0QsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7UUFDM0IsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ2xCLE1BQU0sSUFBSTthQUNILENBQUE7U0FDUjtLQUNGO0lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUMsU0FBUyxFQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsQ0FBQTtJQUNsRCxJQUFJLFVBQVUsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDdkQsTUFBTSxHQUFDO3NCQUNTLFNBQVMsU0FBUyxDQUFBO1FBQ2xDLEtBQUssTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLE1BQU07WUFBRSxNQUFNLElBQUksNkJBQTZCLEdBQUcsSUFBSSxDQUFBO1FBQ25GLE1BQU0sSUFBRTtrQkFDSSxDQUFBO1FBQ1osTUFBTSxJQUFFO2tCQUNJLFNBQVMsUUFBUSxDQUFBO0tBQzlCO0lBQ0gsTUFBTSxJQUFJO1VBQ0YsTUFBTTt3QkFDUSxTQUFTLHVCQUF1QixRQUFRO09BQ3pELENBQUE7SUFDTCxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNqQixDQUFDLENBQUE7QUFFRCxPQUFPLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtBQUNyQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQSJ9