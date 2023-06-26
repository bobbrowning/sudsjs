"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../../config/suds');
const documentation = {
    friendlyName: 'File upload',
    description: ''
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
    let trace = require('track-n-trace');
    trace.log(arguments);
    let message = '';
    if (fieldValue) {
        message = `${lang.uploaded}  <a href="/uploads/${fieldValue}" target="_blank">${fieldValue}</a>`;
    }
    const results = `
      <div class="col-sm-10">
        <input 
          type="file" 
          class="form-control-file" 
          id="${fieldName}" 
          name="${fieldName}"
        >
        <br /><span id="msg_${fieldName}" class="sudsmessage">${message}</span>
  </div>`;
    return (results);
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBsb2FkLWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmluL3N1ZHMvaW5wdXQvdXBsb2FkLWZpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUM1QyxNQUFNLGFBQWEsR0FBRztJQUNwQixZQUFZLEVBQUUsYUFBYTtJQUMzQixXQUFXLEVBQUUsRUFBRTtDQUNoQixDQUFBO0FBRUQ7Ozs7Ozs7S0FPSztBQUVMLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUVuRCxNQUFNLEVBQUUsR0FBRyxLQUFLLFdBQVcsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVE7SUFDaEYsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBQ25DLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDcEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2hCLElBQUksVUFBVSxFQUFFO1FBQ2QsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsdUJBQXVCLFVBQVUscUJBQXFCLFVBQVUsTUFBTSxDQUFBO0tBQ2pHO0lBQ0QsTUFBTSxPQUFPLEdBQUc7Ozs7O2dCQUtGLFNBQVM7a0JBQ1AsU0FBUzs7OEJBRUcsU0FBUyx5QkFBeUIsT0FBTztTQUM5RCxDQUFBO0lBQ1AsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ2xCLENBQUMsQ0FBQTtBQUVELE9BQU8sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO0FBQ3JDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBIn0=