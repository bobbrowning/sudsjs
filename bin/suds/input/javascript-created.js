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
    friendlyName: 'js',
    description: 'Create container for javascript-created field field.'
};
const lang = require('../../../config/language').EN;
const getLabelsValues = require('../get-labels-values');
const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, record) {
    if (arguments[0] == suds.documentation) {
        return ({ friendlyName, description });
    }
    const trace = require('track-n-trace');
    trace.log(arguments);
    const content = '';
    let onclick = '';
    if (attributes.input.oncick) {
        onclick = `onblur="${attributes.input.onclick}"`;
        onclick = onclick.replace('{{fieldName}}', fieldName);
    }
    const results = `
    <div id="${fieldName}_html">
    </div>
   <div id="${fieldName}_switch"      ${onclick}>
    click here
    </div>
      `;
    return (results);
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamF2YXNjcmlwdC1jcmVhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Jpbi9zdWRzL2lucHV0L2phdmFzY3JpcHQtY3JlYXRlZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBOzs7Ozs7O0tBT0s7QUFDTCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUU1QyxNQUFNLGFBQWEsR0FBRztJQUNwQixZQUFZLEVBQUUsSUFBSTtJQUNsQixXQUFXLEVBQUUsc0RBQXNEO0NBQ3BFLENBQUE7QUFFRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxFQUFFLENBQUE7QUFDbkQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFFdkQsTUFBTSxFQUFFLEdBQUcsS0FBSyxXQUFXLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTTtJQUN2RixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1FBQUUsT0FBTyxDQUFDLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUE7S0FBRTtJQUNuRixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDckMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNwQixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFDbEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2hCLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7UUFDM0IsT0FBTyxHQUFHLFdBQVcsVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQTtRQUNoRCxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUE7S0FDdEQ7SUFDRCxNQUFNLE9BQU8sR0FBRztlQUNILFNBQVM7O2NBRVYsU0FBUyxpQkFBaUIsT0FBTzs7O09BR3hDLENBQUE7SUFFTCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDbEIsQ0FBQyxDQUFBO0FBRUQsT0FBTyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7QUFDckMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUEifQ==