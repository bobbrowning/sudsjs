"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const documentation = {
    friendlyName: 'Multiple Checkboxes',
    description: `Create check boxes based on the values in the configuration file or a linked table. 
 Data is stored in a text field  as an array in JSON format`
};
/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */
const lang = require('../../../config/language').EN;
const getLabelsValues = require('../get-labels-values');
const suds = require('../../../config/suds');
const trace = require('track-n-trace');
const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record) {
    trace.log(arguments);
    let results = '';
    let labels;
    let values;
    [values, labels] = await getLabelsValues(attributes, record);
    let checked = [];
    trace.log(fieldValue, typeof fieldValue);
    if (attributes.array) {
        if (attributes.array.type == 'single' &&
            fieldValue &&
            typeof fieldValue === 'string') {
            trace.log(fieldValue);
            try {
                checked = JSON.parse(fieldValue);
            }
            catch {
                console.log(`*********************** Problem ******************
      field ${fieldName}
      contains invalid JSON. Clearing field.`);
                fieldValue = '';
            }
        }
        else {
            checked = fieldValue;
        }
    }
    else {
        if (fieldValue && attributes.process == 'JSON') {
            checked = JSON.parse(fieldValue);
        }
    }
    trace.log(fieldValue);
    if (!Array.isArray(checked)) {
        checked = [checked];
    }
    ;
    trace.log(checked);
    results += `
  <input type="hidden" name="${fieldName}.length" value="${values.length}"> `;
    for (let i = 0; i < values.length; i++) {
        let selected = '';
        if (checked.includes(values[i])) {
            selected = 'checked';
        }
        results += `
    <div class="form-check-inline" id="${fieldName}" style="margin-right: 20px"> 
         <input type="checkbox" 
            name="${fieldName}.${i + 1}"  
            class="form-check-input"  
            id="${fieldName}.${i}" 
            value="${values[i]}" ${selected}>
          <label for "${fieldName}.${i}" class="form-check-label">
            ${labels[i]}
          </label>    
        </div>`;
    }
    results += `
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
      `;
    return (results);
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tib3hlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iaW4vc3Vkcy9pbnB1dC9jaGVja2JveGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsTUFBTSxhQUFhLEdBQUc7SUFDcEIsWUFBWSxFQUFFLHFCQUFxQjtJQUNuQyxXQUFXLEVBQUU7NERBQzZDO0NBQzNELENBQUE7QUFFRDs7Ozs7OztLQU9LO0FBRUwsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsRUFBRSxDQUFBO0FBQ25ELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ3ZELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQzVDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUV0QyxNQUFNLEVBQUUsR0FBRyxLQUFLLFdBQVcsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNO0lBQ3ZGLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDcEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2hCLElBQUksTUFBTSxDQUFBO0lBQ1YsSUFBSSxNQUFNLENBQUM7SUFDWCxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxNQUFNLGVBQWUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDNUQsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2hCLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE9BQU8sVUFBVSxDQUFDLENBQUE7SUFDeEMsSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFO1FBQ3BCLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksUUFBUTtZQUNuQyxVQUFVO1lBQ1YsT0FBTyxVQUFVLEtBQUssUUFBUSxFQUFFO1lBQ2hDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEIsSUFBSTtnQkFDRixPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTthQUNqQztZQUNELE1BQU07Z0JBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQztjQUNOLFNBQVM7NkNBQ3NCLENBQUMsQ0FBQTtnQkFDdEMsVUFBVSxHQUFHLEVBQUUsQ0FBQzthQUNqQjtTQUNGO2FBQU07WUFDTCxPQUFPLEdBQUcsVUFBVSxDQUFBO1NBQ3JCO0tBQ0Y7U0FBTTtRQUNMLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxPQUFPLElBQUksTUFBTSxFQUFFO1lBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7U0FBRTtLQUNyRjtJQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFBRSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUFFO0lBQUEsQ0FBQztJQUNyRCxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ2xCLE9BQU8sSUFBSTsrQkFDa0IsU0FBUyxtQkFBbUIsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFBO0lBQzNFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3RDLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQTtRQUNqQixJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFBRSxRQUFRLEdBQUcsU0FBUyxDQUFBO1NBQUU7UUFDekQsT0FBTyxJQUFJO3lDQUMwQixTQUFTOztvQkFFOUIsU0FBUyxJQUFJLENBQUMsR0FBRyxDQUFDOztrQkFFcEIsU0FBUyxJQUFJLENBQUM7cUJBQ1gsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVE7d0JBQ25CLFNBQVMsSUFBSSxDQUFDO2NBQ3hCLE1BQU0sQ0FBQyxDQUFDLENBQUM7O2VBRVIsQ0FBQTtLQUNaO0lBQ0QsT0FBTyxJQUFJO3dCQUNXLFNBQVMsd0JBQXdCLFFBQVE7T0FDMUQsQ0FBQTtJQUNMLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNsQixDQUFDLENBQUE7QUFFRCxPQUFPLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtBQUNyQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQSJ9