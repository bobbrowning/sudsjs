"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../../config/suds');
const documentation = {
    friendlyName: 'Textarea',
    description: 'Creates a textarea field.'
};
/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */
const lang = require('../../../config/language').EN;
const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
    const trace = require('track-n-trace');
    trace.log(arguments);
    let results = '';
    let rows = 4;
    let cols = 20;
    let placeholder = '';
    if (attributes.input.rows) {
        rows = attributes.input.rows;
    }
    if (attributes.input.cols) {
        cols = attributes.input.cols;
    }
    if (attributes.input.placeholder) {
        placeholder = attributes.input.placeholder;
    }
    let apicall = '';
    if (attributes.input.validations.api) {
        apicall = `onchange="apiCheck('${fieldName}','${attributes.input.validations.api.route}')"
            oninput="apiWait('${fieldName}')"`;
    }
    results = `
     
        <textarea name="${fieldName}"  
          class="form-control"  
          id="${fieldName}" 
          rows="${rows}" 
          style="width: ${attributes.input.width};" 
          cols="${cols}"`;
    const ignore = ['type', 'name', 'validations', 'required', 'class', 'isInteger'];
    for (const inprop of Object.keys(attributes.input)) {
        if (ignore.includes(inprop)) {
            continue;
        } // skip the ones we have already done
        results += `
          ${inprop}="${attributes.input[inprop]}" `;
    }
    if (suds.useHTML5Validation) {
        if (input.required) {
            result += `
            required`;
        }
    }
    if (apicall) {
        results += `
          ${apicall}`;
    }
    results += `
          placeholder = "${placeholder}" >${fieldValue}</textarea >
      <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
    `;
    return (results);
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dGFyZWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmluL3N1ZHMvaW5wdXQvdGV4dGFyZWEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUM1QyxNQUFNLGFBQWEsR0FBRztJQUNwQixZQUFZLEVBQUUsVUFBVTtJQUN4QixXQUFXLEVBQUUsMkJBQTJCO0NBQ3pDLENBQUE7QUFFRDs7Ozs7OztLQU9LO0FBRUwsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsRUFBRSxDQUFBO0FBRW5ELE1BQU0sRUFBRSxHQUFHLEtBQUssV0FBVyxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUTtJQUNoRixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDckMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUVwQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFFaEIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFBO0lBQ1osSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO0lBQ2IsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFBO0lBQ3BCLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFBRSxJQUFJLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUE7S0FBRTtJQUMzRCxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQUUsSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFBO0tBQUU7SUFDM0QsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRTtRQUFFLFdBQVcsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQTtLQUFFO0lBQ2hGLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQTtJQUNoQixJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtRQUNwQyxPQUFPLEdBQUcsdUJBQXVCLFNBQVMsTUFBTSxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSztnQ0FDMUQsU0FBUyxLQUFLLENBQUE7S0FDM0M7SUFFRCxPQUFPLEdBQUc7OzBCQUVjLFNBQVM7O2dCQUVuQixTQUFTO2tCQUNQLElBQUk7MEJBQ0ksVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLO2tCQUM5QixJQUFJLEdBQUcsQ0FBQTtJQUN2QixNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUE7SUFDaEYsS0FBSyxNQUFNLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNsRCxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFBRSxTQUFRO1NBQUUsQ0FBQyxxQ0FBcUM7UUFDL0UsT0FBTyxJQUFJO1lBQ0gsTUFBTSxLQUFLLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQTtLQUNoRDtJQUNELElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO1FBQzNCLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtZQUNsQixNQUFNLElBQUk7cUJBQ0ssQ0FBQTtTQUNoQjtLQUNGO0lBQ0QsSUFBSSxPQUFPLEVBQUU7UUFDWCxPQUFPLElBQUk7WUFDSCxPQUFPLEVBQUUsQ0FBQTtLQUNsQjtJQUNELE9BQU8sSUFBSTsyQkFDYyxXQUFXLE1BQU0sVUFBVTtzQkFDaEMsU0FBUyx3QkFBd0IsUUFBUTtLQUMxRCxDQUFBO0lBQ0gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ2xCLENBQUMsQ0FBQTtBQUVELE9BQU8sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO0FBQ3JDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBIn0=