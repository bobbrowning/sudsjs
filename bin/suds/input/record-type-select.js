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
    friendlyName: 'Select',
    description: `Create select dropdown based on values in the table definition, 
or values in a linked table, or provided by a function.`
};
const lang = require('../../../config/language').EN;
const getLabelsValues = require('../get-labels-values');
const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record, tableData, tabs) {
    const trace = require('track-n-trace');
    trace.log(arguments);
    let results = '';
    trace.log(tableData.recordTypes);
    const values = Object.keys(tableData.recordTypes);
    const labels = [];
    let i = 0;
    let omits = '      {';
    for (const key of values) {
        labels[i++] = tableData.recordTypes[key].friendlyName;
        if (tableData.recordTypes[key].omit) {
            omits += `
          ${key}:[`;
            for (const omit of tableData.recordTypes[key].omit) {
                omits += `'${omit}',`;
            }
            omits += '],';
        }
    }
    omits += `
        }`;
    trace.log(omits, tabs);
    let groups = '[';
    for (const item of tabs) {
        groups += `'${item}', `;
    }
    groups += ']';
    results = `
          <script>
              function recordType(fieldName) {
                  let allGroups=${groups};
                  for (let group of allGroups) {
                    document.getElementById('group_'+group).style.display="block"; 
                    document.getElementById('tab_'+group).style.display="block"; 
                  }
                  let omits=${omits}
                  let type=document.getElementById(fieldName).value;
                  console.log(type);
                  if (omits[type]) {
                      console.log('omitting',omits[type]);
                      for (let group of omits[type]) {
                          if (document.getElementById('group_'+group)) {
                        document.getElementById('group_'+group).style.display="none"; 
                        document.getElementById('tab_'+group).style.display="none"; 
                          }
                      }
                  }

           }
          </script>
          <select name="${fieldName}"  class="form-control" aria-label="${attributes.friendlyName}"  id="${fieldName}" onchange="recordType('${fieldName}')" style="width: ${attributes.input.width}" >
          <option value="">${lang.select}</option>`;
    for (let i = 0; i < values.length; i++) {
        selected = '';
        if (values[i] == fieldValue) {
            selected = 'selected';
        }
        results += `
          <option value="${values[i]}" ${selected}>${labels[i]} </option>
     `;
    }
    results += `
        </select>
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
`;
    return (results);
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkLXR5cGUtc2VsZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Jpbi9zdWRzL2lucHV0L3JlY29yZC10eXBlLXNlbGVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBOzs7Ozs7O0tBT0s7QUFDTCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUU1QyxNQUFNLGFBQWEsR0FBRztJQUNwQixZQUFZLEVBQUUsUUFBUTtJQUN0QixXQUFXLEVBQUU7d0RBQ3lDO0NBQ3ZELENBQUE7QUFFRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxFQUFFLENBQUE7QUFDbkQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFFdkQsTUFBTSxFQUFFLEdBQUcsS0FBSyxXQUFXLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJO0lBQ3pHLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUNyQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3BCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQTtJQUNoQixLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUNoQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUNqRCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUE7SUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ1QsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFBO0lBQ3JCLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFO1FBQ3hCLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFBO1FBQ3JELElBQUksU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUU7WUFDbkMsS0FBSyxJQUFJO1lBQ0gsR0FBRyxJQUFJLENBQUE7WUFDYixLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFO2dCQUNsRCxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQTthQUN0QjtZQUNELEtBQUssSUFBSSxJQUFJLENBQUE7U0FDZDtLQUNGO0lBQ0QsS0FBSyxJQUFJO1VBQ0QsQ0FBQTtJQUNSLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ3RCLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQTtJQUNoQixLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksRUFBRTtRQUFFLE1BQU0sSUFBSSxJQUFJLElBQUksS0FBSyxDQUFBO0tBQUU7SUFFcEQsTUFBTSxJQUFJLEdBQUcsQ0FBQTtJQUViLE9BQU8sR0FBRzs7O2tDQUdzQixNQUFNOzs7Ozs4QkFLVixLQUFLOzs7Ozs7Ozs7Ozs7Ozs7MEJBZVQsU0FBUyx1Q0FBdUMsVUFBVSxDQUFDLFlBQVksVUFBVSxTQUFTLDJCQUEyQixTQUFTLHFCQUFxQixVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUs7NkJBQ3RLLElBQUksQ0FBQyxNQUFNLFdBQVcsQ0FBQTtJQUNqRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN0QyxRQUFRLEdBQUcsRUFBRSxDQUFBO1FBQ2IsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxFQUFFO1lBQUUsUUFBUSxHQUFHLFVBQVUsQ0FBQTtTQUFFO1FBQ3RELE9BQU8sSUFBSTsyQkFDWSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7TUFDeEQsQ0FBQTtLQUNIO0lBQ0QsT0FBTyxJQUFJOzt3QkFFVyxTQUFTLHdCQUF3QixRQUFRO0NBQ2hFLENBQUE7SUFFQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDbEIsQ0FBQyxDQUFBO0FBRUQsT0FBTyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7QUFDckMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUEifQ==