"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */
const suds = require('../../../config/suds');
const documentation = {
    friendlyName: 'Checkbox',
    description: 'Creates a checkbox field. '
};
const lang = require('../../../config/language').EN;
const getLabelsValues = require('../get-labels-values');
const trace = require('track-n-trace');
const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
    trace.log(arguments);
    let results = '';
    let checked = '';
    if (fieldValue && fieldValue != 'false') {
        checked = 'checked';
    }
    results = `
        <div class="form-check-inline">
          <input 
            type="checkbox" 
            name="${fieldName}" 
            class="form-check-input" 
            id="${fieldName}" 
            value="true" ${checked}
            > 
          <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
       </div>`;
    return (results);
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmluL3N1ZHMvaW5wdXQvY2hlY2tib3guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7Ozs7OztLQU9LO0FBQ0wsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFDNUMsTUFBTSxhQUFhLEdBQUc7SUFDcEIsWUFBWSxFQUFFLFVBQVU7SUFDeEIsV0FBVyxFQUFFLDRCQUE0QjtDQUMxQyxDQUFBO0FBRUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsRUFBRSxDQUFBO0FBQ25ELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ3RELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUV2QyxNQUFNLEVBQUUsR0FBRyxLQUFLLFdBQVcsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVE7SUFDOUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNyQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFDaEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2hCLElBQUksVUFBVSxJQUFJLFVBQVUsSUFBSSxPQUFPLEVBQUU7UUFDdkMsT0FBTyxHQUFHLFNBQVMsQ0FBQTtLQUNwQjtJQUNELE9BQU8sR0FBRzs7OztvQkFJUSxTQUFTOztrQkFFWCxTQUFTOzJCQUNBLE9BQU87OzBCQUVSLFNBQVMsd0JBQXdCLFFBQVE7Y0FDckQsQ0FBQTtJQUNaLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNsQixDQUFDLENBQUE7QUFFRCxPQUFPLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtBQUNyQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQSJ9