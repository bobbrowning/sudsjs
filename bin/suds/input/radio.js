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
    friendlyName: 'Radio Buttons',
    description: 'Create radio buttons'
};
const lang = require('../../../config/language').EN;
const getLabelsValues = require('../get-labels-values');
let trace = require('track-n-trace');
const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record) {
    trace.log(arguments);
    let results = '';
    let [values, labels] = await getLabelsValues(attributes, record);
    trace.log({ values, labels });
    for (let i = 0; i < values.length; i++) {
        let selected = '';
        if (values[i] == fieldValue) {
            selected = 'checked';
        }
        results += `
        <div class="form-check-inline" id="${fieldName}" style="margin-right: 20px">  
          <input type="radio" 
            name="${fieldName}"  
            class="form-check-input"  
            id="${fieldName}_${i}" 
            value="${values[i]}" ${selected}>
          <label for "${fieldName}_${i}" class="form-check-label">
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFkaW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmluL3N1ZHMvaW5wdXQvcmFkaW8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7Ozs7OztLQU9LO0FBQ0wsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFFNUMsTUFBTSxhQUFhLEdBQUc7SUFDcEIsWUFBWSxFQUFFLGVBQWU7SUFDN0IsV0FBVyxFQUFFLHNCQUFzQjtDQUNwQyxDQUFBO0FBRUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsRUFBRSxDQUFBO0FBQ25ELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ3ZELElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUVwQyxNQUFNLEVBQUUsR0FBRyxLQUFLLFdBQVcsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNO0lBQ3ZGLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFFcEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsTUFBTSxlQUFlLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQy9ELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN2QyxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7UUFDaEIsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxFQUFFO1lBQUUsUUFBUSxHQUFHLFNBQVMsQ0FBQTtTQUFFO1FBQ3JELE9BQU8sSUFBSTs2Q0FDOEIsU0FBUzs7b0JBRWxDLFNBQVM7O2tCQUVYLFNBQVMsSUFBSSxDQUFDO3FCQUNYLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRO3dCQUNuQixTQUFTLElBQUksQ0FBQztjQUN4QixNQUFNLENBQUMsQ0FBQyxDQUFDOztlQUVSLENBQUE7S0FDWjtJQUNELE9BQU8sSUFBSTt3QkFDVyxTQUFTLHdCQUF3QixRQUFRO09BQzFELENBQUE7SUFDTCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDbEIsQ0FBQyxDQUFBO0FBRUQsT0FBTyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7QUFDckMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUEifQ==