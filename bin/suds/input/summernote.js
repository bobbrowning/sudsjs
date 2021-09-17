
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
          <!-- include libraries(jQuery, bootstrap) -->
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" rel="stylesheet">
            <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
            <script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
            <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote.min.css" rel="stylesheet">
            <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote.min.js"></script>
  
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




