"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../../config/suds');
const documentation = {
    friendlyName: 'Summernote WYSIWYG rich text input field',
    description: `A very simple and light input field which creats HTML. There are many such text editors on the market, but this one is (a) Free an (b) very easy to set up.  
  However if you want to use one of the more sophisticated products available then you
  might ue this as a starting point for writing a helper for it.`
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
const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
    const trace = require('track-n-trace');
    trace.log(arguments);
    let results = '';
    const headerTags = suds.inputTypes.ckeditor5.headerTags;
    let height = 100;
    let placeholder = '';
    if (attributes.input.height) {
        height = attributes.input.height;
    }
    if (attributes.input.placeholder) {
        placeholder = attributes.input.placeholder;
    }
    let toolbar = '';
    if (attributes.input.toolbar) {
        toolbar = 'toolbar: [';
        for (const item of attributes.input.toolbar) {
            toolbar += `'${item}', `;
        }
        toolbar += ']';
    }
    results = `
  <textarea name="${fieldName}" id="${fieldName}"  placeholder="${placeholder}">
  ${fieldValue}
  </textarea>

<script>
   ClassicEditor
    .create( document.querySelector( '#${fieldName}' ), { ${toolbar} })
    .catch( error => {
        console.error( error );
    } );

    console.log( ClassicEditor.builtinPlugins.map( plugin => plugin.pluginName ))
  </script>

          <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
                   
          `;
    return ([results, headerTags]);
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2tlZGl0b3ItNS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iaW4vc3Vkcy9pbnB1dC9ja2VkaXRvci01LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFFNUMsTUFBTSxhQUFhLEdBQUc7SUFDcEIsWUFBWSxFQUFFLDBDQUEwQztJQUN4RCxXQUFXLEVBQUU7O2lFQUVrRDtDQUNoRSxDQUFBO0FBRUQ7Ozs7Ozs7S0FPSztBQUVMLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUNuRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUV2RCxNQUFNLEVBQUUsR0FBRyxLQUFLLFdBQVcsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVE7SUFDakYsTUFBTyxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBQ3JDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFFcEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2hCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQTtJQUV2RCxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUE7SUFDaEIsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFBO0lBQ3BCLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7UUFBRSxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUE7S0FBRTtJQUNqRSxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFO1FBQUUsV0FBVyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFBO0tBQUU7SUFDaEYsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2hCLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7UUFDNUIsT0FBTyxHQUFHLFlBQVksQ0FBQTtRQUN0QixLQUFLLE1BQU0sSUFBSSxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUE7U0FBRTtRQUN6RSxPQUFPLElBQUksR0FBRyxDQUFBO0tBQ2Y7SUFDRCxPQUFPLEdBQUc7b0JBQ1EsU0FBUyxTQUFTLFNBQVMsbUJBQW1CLFdBQVc7SUFDekUsVUFBVTs7Ozs7eUNBSzJCLFNBQVMsVUFBVSxPQUFPOzs7Ozs7OzswQkFRekMsU0FBUyx3QkFBd0IsUUFBUTs7V0FFeEQsQ0FBQTtJQUVULE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFBO0FBQ2hDLENBQUMsQ0FBQTtBQUVELE9BQU8sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO0FBQ3JDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBIn0=