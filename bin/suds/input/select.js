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
const trace = require('track-n-trace');
const documentation = {
    friendlyName: 'Select',
    description: `Create select dropdown based on values in the table definition, 
om values in a linked table, or provided by a function.`
};
const lang = require('../../../config/language').EN;
const getLabelsValues = require('../get-labels-values');
const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record) {
    if (arguments[0] == suds.documentation) {
        return ({ friendlyName, description });
    }
    trace.log(arguments);
    let results = '';
    let onchange = '';
    if (attributes.input.onchange) {
        onchange = attributes.input.onchange;
        onchange = onchange.replace(/{{fieldValue}}/, fieldValue);
    }
    let onload = '';
    const onevent = '';
    let onevents = '';
    if (attributes.input.onevents) {
        for (const evname of Object.keys(attributes.input.onevents)) {
            let evaction = attributes.input.onevents[evname];
            evaction = evaction.replace(/{{fieldValue}}/, fieldValue);
            evaction = evaction.replace(/{{fieldName}}/, fieldName);
            if (evname == 'onload') {
                onload = `
    <script defer>
       ${evaction} 
    </script>
    `;
            }
            else {
                onevents += `
              ${evname}="${evaction}"`;
            }
        }
        if (onchange) {
            onevents += `
              onchange="${onchange}" `;
        }
    }
    let [values, labels] = await getLabelsValues(attributes, record);
    trace.log(labels, values, fieldValue);
    results = `
          <select 
            name="${fieldName}"  
            class="form-control" 
            aria-label="${attributes.friendlyName}"  
            id="${fieldName}" 
            style="width: ${attributes.input.width}"
            ${onevents}
          >
          <option value="">${lang.select}</option>`;
    for (let i = 0; i < values.length; i++) {
        let selected = '';
        if (values[i] == fieldValue) {
            selected = 'selected';
        }
        results += `
          <option value="${values[i]}" ${selected}>${labels[i]} </option>
     `;
    }
    results += `
        </select>
        ${onload}
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
 `;
    return (results);
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Jpbi9zdWRzL2lucHV0L3NlbGVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7Ozs7Ozs7S0FPSzs7QUFFTCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUM1QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFFdEMsTUFBTSxhQUFhLEdBQUc7SUFDcEIsWUFBWSxFQUFFLFFBQVE7SUFDdEIsV0FBVyxFQUFFO3dEQUN5QztDQUN2RCxDQUFBO0FBRUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsRUFBRSxDQUFBO0FBQ25ELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBRXZELE1BQU0sRUFBRSxHQUFHLEtBQUssV0FBVyxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU07SUFDdkYsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtRQUFFLE9BQU8sQ0FBQyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFBO0tBQUU7SUFDbEYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNwQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFDaEIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFBO0lBQ2pCLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7UUFDN0IsUUFBUSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFBO1FBQ3BDLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFBO0tBQzFEO0lBQ0QsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFBO0lBQ2YsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2xCLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQTtJQUNqQixJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO1FBQzdCLEtBQUssTUFBTSxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzNELElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ2hELFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFBO1lBQ3pELFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQTtZQUN2RCxJQUFJLE1BQU0sSUFBSSxRQUFRLEVBQUU7Z0JBQ3RCLE1BQU0sR0FBRzs7U0FFUixRQUFROztLQUVaLENBQUE7YUFDRTtpQkFBTTtnQkFDTCxRQUFRLElBQUk7Z0JBQ0osTUFBTSxLQUFLLFFBQVEsR0FBRyxDQUFBO2FBQy9CO1NBQ0Y7UUFDRCxJQUFJLFFBQVEsRUFBRTtZQUNaLFFBQVEsSUFBSTswQkFDUSxRQUFRLElBQUksQ0FBQTtTQUNqQztLQUNGO0lBRUYsSUFBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxNQUFNLGVBQWUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDaEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFBO0lBQ3JDLE9BQU8sR0FBRzs7b0JBRVEsU0FBUzs7MEJBRUgsVUFBVSxDQUFDLFlBQVk7a0JBQy9CLFNBQVM7NEJBQ0MsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLO2NBQ3BDLFFBQVE7OzZCQUVPLElBQUksQ0FBQyxNQUFNLFdBQVcsQ0FBQTtJQUNqRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN0QyxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7UUFDakIsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxFQUFFO1lBQUUsUUFBUSxHQUFHLFVBQVUsQ0FBQTtTQUFFO1FBQ3RELE9BQU8sSUFBSTsyQkFDWSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7TUFDeEQsQ0FBQTtLQUNIO0lBQ0QsT0FBTyxJQUFJOztVQUVILE1BQU07d0JBQ1EsU0FBUyx3QkFBd0IsUUFBUTtFQUMvRCxDQUFBO0lBRUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ2xCLENBQUMsQ0FBQTtBQUVELE9BQU8sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO0FBQ3JDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBIn0=