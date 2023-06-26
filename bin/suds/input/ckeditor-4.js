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
    const headerTags = suds.inputTypes.ckeditor4.headerTags;
    let height = 100;
    if (attributes.input.height) {
        height = attributes.input.height;
    }
    function stringObj(obj) {
        trace.log(obj);
        let result = '{';
        for (const key of Object.keys(obj)) {
            if (typeof obj[key] === 'string') {
                result += `'${key}': '${obj[key]}',`;
            }
            else
                result += `'${key}': ${stringObj(obj[key])},`;
        }
        result += '}';
        return (result);
    }
    let replaceParms = '';
    if (suds.inputTypes.ckeditor4.formats) {
        /** Create format_tags  */
        const formats = suds.inputTypes.ckeditor4.formats;
        for (let i = 0; i < formats.length; i++) {
            let name;
            if (typeof formats[i] === 'string') {
                name = formats[i];
            }
            else {
                name = formats[i].name;
            }
            if (!replaceParms) {
                replaceParms += `
          format_tags: '${name}`;
            }
            else {
                replaceParms += `;${name}`;
            }
        }
        replaceParms += '\',';
        /** style format items */
        for (let i = 0; i < formats.length; i++) {
            if (typeof formats[i] === 'string') {
                continue;
            }
            trace.log(formats[i], stringObj(formats[i]));
            replaceParms += `
          format_${formats[i].name}: ${stringObj(formats[i])},`;
            trace.log(replaceParms);
        }
        ;
    }
    /** style items */
    let styles = '';
    const stylesconfig = suds.inputTypes.ckeditor4.styles;
    if (stylesconfig) {
        styles = 'CKEDITOR.stylesSet.add( \'default\', [';
        for (let i = 0; i < stylesconfig.length; i++) {
            if (typeof stylesconfig[i] === 'string') {
                continue;
            }
            trace.log(stylesconfig[i], stringObj(stylesconfig[i]));
            styles += `
           ${stringObj(stylesconfig[i])},`;
            trace.log(styles);
        }
        ;
        styles += '\n          ])';
    }
    ;
    if (suds.inputTypes.ckeditor4.editorplaceholder) {
        replaceParms += `
      extraPlugins: 'editorplaceholder', editorplaceholder: '${suds.inputTypes.ckeditor4.editorplaceholder}', `;
    }
    results = `
        <textarea name = "${fieldName}" id = "${fieldName}" >
        ${fieldValue}
</textarea >
<script>
CKEDITOR.replace( '${fieldName}', {${replaceParms} 
});
${styles}
</script>

          <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
`;
    return ([results, headerTags]);
};
exports.documentation = documentation;
exports.fn = fn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2tlZGl0b3ItNC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iaW4vc3Vkcy9pbnB1dC9ja2VkaXRvci00LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFFNUMsTUFBTSxhQUFhLEdBQUc7SUFDcEIsWUFBWSxFQUFFLDBDQUEwQztJQUN4RCxXQUFXLEVBQUU7O2lFQUVrRDtDQUNoRSxDQUFBO0FBRUQ7Ozs7Ozs7S0FPSztBQUVMLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUNuRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUV2RCxNQUFNLEVBQUUsR0FBRyxLQUFLLFdBQVcsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVE7SUFDaEYsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBQ3JDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFFcEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBRWhCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQTtJQUN2RCxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUE7SUFDaEIsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUFFLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQTtLQUFFO0lBRWpFLFNBQVMsU0FBUyxDQUFFLEdBQUc7UUFDckIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQTtRQUNoQixLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMs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