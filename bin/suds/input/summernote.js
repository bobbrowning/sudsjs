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
    const headerTags = suds.inputTypes.summernote.headerTags;
    let conf = '';
    for (const key of [
        'height',
        'blockquoteBreakingLevel',
        'dialogsInBody',
        'dialogsFade',
        'disableDragAndDrop',
        'shortcuts',
        'tabDisable',
        'codeviewFilter',
        'codeviewIframeFilter',
        'codeviewFilterRegex',
        'spellCheck',
        'disableGrammar'
    ]) {
        if (attributes.input[key]) {
            conf += `
                ${key}: ${attributes.input[key]},`;
        }
        else {
            if (suds.inputTypes.summernote[key]) {
                conf += `
                  ${key}: ${suds.inputTypes.summernote[key]},`;
            }
        }
    }
    ;
    if (suds.inputTypes.summernote.styleTags) {
        conf += `
                styleTags: [`;
        for (const style of suds.inputTypes.summernote.styleTags) {
            conf += `
                   {`;
            for (const item of Object.keys(style)) {
                conf += ` ${item}: '${style[item]}', `;
            }
            conf += '},';
        }
        conf += `
                 ],`;
    }
    for (const arrayConf of ['fontNames', 'fontNamesIgnoreCheck', 'lineHeights', 'codeviewIframeWhitelistSrc']) {
        if (suds.inputTypes.summernote[arrayConf]) {
            conf += `
                ${arrayConf}: [`;
            for (const font of suds.inputTypes.summernote[arrayConf]) {
                conf += `'${font}', `;
            }
            conf += ' ],';
        }
    }
    ;
    if (suds.inputTypes.summernote.toolbar) {
        conf += `
                toolbar: [`;
        for (const group of Object.keys(suds.inputTypes.summernote.toolbar)) {
            conf += `
                 ['${group}', [`;
            for (const tool of suds.inputTypes.summernote.toolbar[group]) {
                conf += `'${tool}', `;
            }
            conf += ']],';
        }
        conf += `
                ],`;
    }
    if (suds.inputTypes.summernote.popover) {
        conf += `
                popover: {`;
        for (const tag of ['image', 'link', 'table', 'air']) {
            conf += `
                 ${tag}: [`;
            for (const group of suds.inputTypes.summernote.popover[tag]) {
                trace.log(group[1]);
                conf += `
                    ['${group[0]}', [`;
                for (const tool of group[1]) {
                    conf += `'${tool}', `;
                }
                conf += ']],';
            }
            conf += `
                 ],`;
        }
        conf += `
              }`;
    }
    let placeholder = '';
    if (attributes.input.placeholder) {
        placeholder = attributes.input.placeholder;
    }
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
                ${conf}
           });
          </script>`;
    return ([results, headerTags]);
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWVybm90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iaW4vc3Vkcy9pbnB1dC9zdW1tZXJub3RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFFNUMsTUFBTSxhQUFhLEdBQUc7SUFDcEIsWUFBWSxFQUFFLDBDQUEwQztJQUN4RCxXQUFXLEVBQUU7O2lFQUVrRDtDQUNoRSxDQUFBO0FBRUQ7Ozs7Ozs7S0FPSztBQUVMLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUNuRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUV2RCxNQUFNLEVBQUUsR0FBRyxLQUFLLFdBQVcsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVE7SUFDakYsTUFBTyxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBQ3JDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFFcEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2hCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQTtJQUN4RCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUE7SUFFYixLQUFLLE1BQU0sR0FBRyxJQUFJO1FBQ2hCLFFBQVE7UUFDUix5QkFBeUI7UUFDekIsZUFBZTtRQUNmLGFBQWE7UUFDYixvQkFBb0I7UUFDcEIsV0FBVztRQUNYLFlBQVk7UUFDWixnQkFBZ0I7UUFDaEIsc0JBQXNCO1FBQ3RCLHFCQUFxQjtRQUNyQixZQUFZO1FBQ1osZ0JBQWdCO0tBRWpCLEVBQUU7UUFDRCxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDekIsSUFBSSxJQUFJ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