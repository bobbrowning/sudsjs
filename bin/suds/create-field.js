"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../config/suds');
const generic = require('./input/generic').fn;
const trace = require('track-n-trace');
module.exports = createField;
/**
 *
 * Create one field in an input form.
 * @param {string} key           Field namre
 * @param {*} fieldValue         Value
 * @param {object} attributes    Attributes on this field
 * @param {string} errorMsg
 * @param {string} mode
 * @param {string} record
 * @param {object} tableData
 * @param {array} tabs
 * @returns
 */
async function createField(key, fieldValue, attributes, errorMsg, mode, record, tableData, tabs) {
    trace.log({ inputs: arguments, maxdepth: 4 });
    trace.log({ attributes });
    const inputFieldTypes = suds.inputFieldTypes;
    trace.log({ key, types: inputFieldTypes, level: 'iftbug' });
    /* *******************************************************
       *
       *  Extract field type. (defaults to text)
       *  If it is not a simple 'input' HTML tag, work out the helper name.
       *  The helpers are all input-fieldtype.js e.g field-radio.js
       *  new helpers can be added without changing this program.
       *
       * If there is no helper put out a message to the console and
       * treat as 'text'
       *
       ******************************************************  */
    let formField = '';
    let headerTags = '';
    let fieldType = 'text'; // default
    if (attributes.input.type == 'boolean') {
        fieldType = 'checkbox'; // but defaults to checkbox if this is a boolean
    }
    if (attributes.input.type == 'number') {
        fieldType = 'number';
    }
    if (attributes.input && attributes.input.type) {
        fieldType = attributes.input.type;
    }
    trace.log({ fieldType });
    if (attributes.type == 'number' && attributes.input.type == 'date') { // have to make binary date readable
        if (fieldValue) {
            fieldValue = new Date(Number(fieldValue)).toISOString();
        }
        else {
            fieldValue = new Date().toISOString();
        }
        fieldValue = fieldValue.split('T')[0];
    }
    /** Special processing for process fields */
    if ((attributes.primaryKey ||
        (attributes.process && attributes.process.createdAt) ||
        (attributes.process && attributes.process.updatedAt)) &&
        (mode != 'search')) {
        if (attributes.primaryKey) {
            formField = fieldValue;
        }
        else {
            formField = new Date(fieldValue).toDateString();
        }
    }
    else {
        let helperName = '';
        let helperModule;
        let helper;
        trace.log({ fieldType });
        trace.log(key, inputFieldTypes.length, inputFieldTypes.includes(fieldType), { level: 'iftbug' });
        //  if not a simple input tag or display - look for helper
        if (!inputFieldTypes.includes(fieldType)) {
            helperName = '';
            for (let i = 0; i < fieldType.length; i++) {
                if (fieldType.charAt(i) == fieldType.charAt(i).toUpperCase()) {
                    helperName += '-';
                }
                helperName += fieldType.charAt(i).toLowerCase();
            }
            trace.log(helperName);
            helperModule = require('./input/' + helperName);
            if (helperModule.fn) {
                helper = helperModule.fn;
            }
            else {
                helper = helperModule;
            }
            if (!helper) {
                console.log(`*** invalid field type ${fieldType} in field ${key} ***`);
                fieldType = 'text';
                helperName = '';
            }
        }
        if (attributes.recordType &&
            mode != 'checkRecordType' &&
            attributes.input.recordTypeFix &&
            (mode != 'search')) {
            helperName = 'readonly';
            helperModule = require('./input/' + helperName);
            if (helperModule.fn) {
                helper = helperModule.fn;
            }
            else {
                helper = helperModule;
            }
        }
        trace.log({ helpername: helperName, helper: typeof (helper) });
        const passedValue = fieldValue;
        let passedName = key;
        if (mode == 'search') {
            passedName = '{{fieldname}}';
        }
        if (inputFieldTypes.includes(fieldType)) {
            trace.log('Regular input field', fieldType);
            formField = await generic(fieldType, passedName, passedValue, attributes, errorMsg, record, tableData);
        }
        else {
            if (helperName) {
                trace.log('calling helper', helperName);
                const result = await helper(fieldType, passedName, passedValue, attributes, errorMsg, record, tableData, tabs);
                if (Array.isArray(result)) {
                    formField = result[0];
                    headerTags = result[1];
                }
                else {
                    formField = result;
                }
            }
        }
    }
    let after = '';
    if (attributes.input.after && mode != 'search') {
        after = attributes.input.after.replace('{{fieldValue}}', fieldValue);
    }
    let before = '';
    if (attributes.input.before && mode != 'search') {
        before = attributes.input.before.replace('{{fieldValue}}', fieldValue);
    }
    formField = before + formField + after;
    trace.log({ field: formField });
    return ([formField, headerTags]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWZpZWxkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9zdWRzL2NyZWF0ZS1maWVsZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUM3QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFFdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUE7QUFFNUI7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsS0FBSyxVQUFVLFdBQVcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsSUFBSTtJQUM3RixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUM3QyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQTtJQUN6QixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFBO0lBQzVDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQTtJQUUzRDs7Ozs7Ozs7OztpRUFVNkQ7SUFDN0QsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFBO0lBQ2xCLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQTtJQUNuQixJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUEsQ0FBQyxVQUFVO0lBQ2pDLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksU0FBUyxFQUFFO1FBQ3RDLFNBQVMsR0FBRyxVQUFVLENBQUEsQ0FBQyxnREFBZ0Q7S0FDeEU7SUFDRCxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLFFBQVEsRUFBRTtRQUNyQyxTQUFTLEdBQUcsUUFBUSxDQUFBO0tBQ3JCO0lBRUQsSUFBSSxVQUFVLENBQUMsS0FBSyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQzdDLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQTtLQUNsQztJQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBQ3hCLElBQUksVUFBVSxDQUFDLElBQUksSUFBSSxRQUFRLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksTUFBTSxFQUFFLEVBQUUsb0NBQW9DO1FBQ3hHLElBQUksVUFBVSxFQUFFO1lBQ2QsVUFBVSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO1NBQ3hEO2FBQU07WUFDTCxVQUFVLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtTQUN0QztRQUNELFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3RDO0lBRUQsNENBQTRDO0lBQzVDLElBQ0UsQ0FBQyxVQUFVLENBQUMsVUFBVTtRQUNwQixDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7UUFDcEQsQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQ3JEO1FBQ0QsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLEVBQ2xCO1FBQ0EsSUFBSSxVQUFVLENBQUMsVUFBVSxFQUFFO1lBQ3pCLFNBQVMsR0FBRyxVQUFVLENBQUE7U0FDdkI7YUFBTTtZQUNMLFNBQVMsR0FBRyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtTQUNoRDtLQUNGO1NBQU07UUFDTCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUE7UUFDbkIsSUFBSSxZQUFZLENBQUE7UUFDaEIsSUFBSSxNQUFNLENBQUE7UUFDVixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtRQUN4QixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQTtRQUNoRywwREFBMEQ7UUFDMUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDeEMsVUFBVSxHQUFHLEVBQUUsQ0FBQTtZQUNmLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN6QyxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDNUQsVUFBVSxJQUFJLEdBQUcsQ0FBQTtpQkFDbEI7Z0JBQ0QsVUFBVSxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7YUFDaEQ7WUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBQ3JCLFlBQVksR0FBRyxPQUFPLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxDQUFBO1lBQy9DLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBRTtnQkFDbkIsTUFBTSxHQUFHLFlBQVksQ0FBQyxFQUFFLENBQUE7YUFDekI7aUJBQU07Z0JBQ0wsTUFBTSxHQUFHLFlBQVksQ0FBQTthQUN0QjtZQUNELElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsU0FBUyxhQUFhLEdBQUcsTUFBTSxDQUFDLENBQUE7Z0JBQ3RFLFNBQVMsR0FBRyxNQUFNLENBQUE7Z0JBQ2xCLFVBQVUsR0FBRyxFQUFFLENBQUE7YUFDaEI7U0FDRjtRQUVELElBQ0UsVUFBVSxDQUFDLFVBQVU7WUFDckIsSUFBSSxJQUFJLGlCQUFpQjtZQUN6QixVQUFVLENBQUMsS0FBSyxDQUFDLGFBQWE7WUFDOUIsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLEVBQ2xCO1lBQ0EsVUFBVSxHQUFHLFVBQVUsQ0FBQTtZQUN2QixZQUFZLEdBQUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsQ0FBQTtZQUMvQyxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUU7Z0JBQ25CLE1BQU0sR0FBRyxZQUFZLENBQUMsRUFBRSxDQUFBO2FBQ3pCO2lCQUFNO2dCQUNMLE1BQU0sR0FBRyxZQUFZLENBQUE7YUFDdEI7U0FDRjtRQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBRTlELE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQTtRQUM5QixJQUFJLFVBQVUsR0FBRyxHQUFHLENBQUE7UUFDcEIsSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO1lBQUUsVUFBVSxHQUFHLGVBQWUsQ0FBQTtTQUFFO1FBRXRELElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUN2QyxLQUFLLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFBO1lBQzNDLFNBQVMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFDLE1BQU0sRUFBQyxTQUFTLENBQUMsQ0FBQTtTQUNyRzthQUFNO1lBQ0wsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQTtnQkFDdkMsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFBO2dCQUM5RyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ3pCLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBQ3JCLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7aUJBQ3ZCO3FCQUFNO29CQUNMLFNBQVMsR0FBRyxNQUFNLENBQUE7aUJBQ25CO2FBQ0Y7U0FDRjtLQUNGO0lBQ0QsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFBO0lBQ2QsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO1FBQzlDLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUE7S0FDckU7SUFDRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUE7SUFDZixJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLElBQUksSUFBSSxRQUFRLEVBQUU7UUFDL0MsTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQTtLQUN2RTtJQUNELFNBQVMsR0FBRyxNQUFNLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQTtJQUN0QyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFFL0IsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUE7QUFDbEMsQ0FBQyJ9