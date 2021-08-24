
let friendlyName = 'Summernote WYSIWYG rich text input field';


let description = `A very simple and light input field which creats HTML. There are many such text editors on the market, but this one is (a) Free an (b) very easy to set up.  
  However if you want to use one of the more sophisticated products available then you
  might ue this as a starting point for writing a helper for it.`;



/*inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

},*/

let lang = require('../../../config/language')['EN'];
let getLabelsValues = require('./get-labels-values');


module.exports = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
  if (arguments[0] == 'documentation') { return ({ friendlyName:friendlyName, description: description }) }
  trace = require('track-n-trace');
  trace.log(arguments);

  let results = '';

  let height = 100;
  let placeholder = '';
  if (attributes.input.height) { height = attributes.input.height }
  if (attributes.input.placeholder) { placeholder = attributes.input.placeholder }
  results = `
          <textarea name="${fieldName}"  
            class="form-control"  
            id="summernote" 
            style="width: ${attributes.input.width};">
            ${fieldValue}
          </textarea>
          <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
          <script>
            $('#summernote').summernote({
              placeholder: '${placeholder}',
              tabsize: 2,
              height: ${height},
           });
          </script>`;
  return (results);

}




