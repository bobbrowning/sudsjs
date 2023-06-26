"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *   list.js
 *
 * Userd to display ists of values, e.g. from checkboxes.
 * Also used when there is an array object in the data
 *
 *
 */
const getLabelsValues = require('../get-labels-values');
module.exports = async function (attributes, fieldValue) {
    const trace = require('track-n-trace');
    trace.log(arguments);
    let values;
    let labels;
    let results = '';
    const linkedTable = attributes.input.model;
    if (attributes.input.linkedTable)
        linkedTable = attributes.input.linkedTable; /* Historical */
    let fieldValues = [];
    if (fieldValue && attributes.process == 'JSON') {
        fieldValues = JSON.parse(fieldValue);
    }
    else {
        fieldValues = fieldValue;
    }
    if (!Array.isArray(fieldValues)) {
        fieldValues = [fieldValues];
    }
    ;
    trace.log(fieldValues);
    if (attributes.values || attributes.model) {
        [values, labels] = await getLabelsValues(attributes, {});
        trace.log({ values, labels });
        for (let i = 0; i < fieldValues.length; i++) {
            if (i) {
                results += `<br />
      `;
            }
            for (let j = 0; j < values.length; j++) {
                if (fieldValues[i] == values[j]) {
                    results += labels[j];
                    break;
                }
            }
        }
    }
    else {
        for (let i = 0; i < fieldValues.length; i++) {
            if (i) {
                results += `<br />
      `;
            }
            results += fieldValues[i];
        }
    }
    trace.log(results);
    return results;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iaW4vc3Vkcy9kaXNwbGF5L2xpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFFdkQsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLFdBQVcsVUFBVSxFQUFFLFVBQVU7SUFDckQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBQ3RDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDcEIsSUFBSSxNQUFNLENBQUE7SUFDVixJQUFJLE1BQU0sQ0FBQTtJQUNWLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQTtJQUNoQixNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQTtJQUMxQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVztRQUFFLFdBQVcsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQSxDQUFDLGdCQUFnQjtJQUM3RixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUE7SUFDcEIsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLE9BQU8sSUFBSSxNQUFNLEVBQUU7UUFDOUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7S0FDckM7U0FBTTtRQUNMLFdBQVcsR0FBRyxVQUFVLENBQUE7S0FDekI7SUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUFFLFdBQVcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0tBQUU7SUFBQSxDQUFDO0lBQ2pFLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDdEIsSUFBSSxVQUFVLENBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxLQUFLLEVBQUU7UUFDekMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsTUFBTSxlQUFlLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ3hELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTtRQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQyxJQUFJLENBQUMsRUFBRTtnQkFDTCxPQUFPLElBQUk7T0FDWixDQUFBO2FBQ0E7WUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdEMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUMvQixPQUFPLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO29CQUNwQixNQUFLO2lCQUNOO2FBQ0Y7U0FDRjtLQUNGO1NBQU07UUFDTCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQyxJQUFJLENBQUMsRUFBRTtnQkFDTCxPQUFPLElBQUk7T0FDWixDQUFBO2FBQ0E7WUFDRCxPQUFPLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQzFCO0tBQ0Y7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ2xCLE9BQU8sT0FBTyxDQUFBO0FBQ2hCLENBQUMsQ0FBQSJ9