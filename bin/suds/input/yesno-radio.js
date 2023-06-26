"use strict";
/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../../config/suds');
const documentation = {
    friendlyName: 'Yes-No radio buttons.',
    description: 'Radio buttons alternative to checkbox.'
};
const lang = require('../../../config/language').EN;
const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
    let trace = require('track-n-trace');
    trace.log(arguments);
    let results = '';
    let button1 = '';
    let button2 = '';
    const value1 = 'false';
    const value2 = 'false';
    if (fieldValue) {
        button1 = 'checked';
    }
    else {
        button2 = 'checked';
    }
    results = `
        <div class="form-check-inline" id="${fieldName}" style="margin-right: 20px">  
          <input type="radio" 
            name="${fieldName}"  
            class="form-check-input"  
            id="${fieldName}_1" 
            value="true" ${button1}
            >
          <label for="${fieldName}_1" class="form-check-label">
            ${lang.yes}
          </label>    
        </div>
        <div class="form-check-inline" id="${fieldName}" style="margin-right: 20px">  
        <input type="radio" 
          name="${fieldName}"  
          class="form-check-input"  
          id="${fieldName}_2" 
          value="" ${button2}
          >
        <label for="${fieldName}_2" class="form-check-label">
          ${lang.no}
        </label>    
      </div>`;
    results += `
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
      `;
    return (results);
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWVzbm8tcmFkaW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmluL3N1ZHMvaW5wdXQveWVzbm8tcmFkaW8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7Ozs7O0tBT0s7O0FBRUwsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFDNUMsTUFBTSxhQUFhLEdBQUc7SUFDcEIsWUFBWSxFQUFFLHVCQUF1QjtJQUNyQyxXQUFXLEVBQUUsd0NBQXdDO0NBQ3RELENBQUE7QUFFRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxFQUFFLENBQUE7QUFFbkQsTUFBTSxFQUFFLEdBQUcsS0FBSyxXQUFXLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRO0lBQy9FLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUNwQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3BCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQTtJQUNoQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFDaEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2hCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQTtJQUN0QixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUE7SUFDdEIsSUFBSSxVQUFVLEVBQUU7UUFBRSxPQUFPLEdBQUcsU0FBUyxDQUFBO0tBQUU7U0FBTTtRQUFFLE9BQU8sR0FBRyxTQUFTLENBQUE7S0FBRTtJQUVwRSxPQUFPLEdBQUc7NkNBQ2lDLFNBQVM7O29CQUVsQyxTQUFTOztrQkFFWCxTQUFTOzJCQUNBLE9BQU87O3dCQUVWLFNBQVM7Y0FDbkIsSUFBSSxDQUFDLEdBQUc7Ozs2Q0FHdUIsU0FBUzs7a0JBRXBDLFNBQVM7O2dCQUVYLFNBQVM7cUJBQ0osT0FBTzs7c0JBRU4sU0FBUztZQUNuQixJQUFJLENBQUMsRUFBRTs7YUFFTixDQUFBO0lBQ1gsT0FBTyxJQUFJO3dCQUNXLFNBQVMsd0JBQXdCLFFBQVE7T0FDMUQsQ0FBQTtJQUNMLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNsQixDQUFDLENBQUE7QUFFRCxPQUFPLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtBQUNyQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQSJ9