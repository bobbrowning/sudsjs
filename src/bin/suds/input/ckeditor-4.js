
const suds = require('../../../config/suds')

const documentation = {
  friendlyName: 'Summernote WYSIWYG rich text input field',
  description: `A very simple and light input field which creats HTML. There are many such text editors on the market, but this one is (a) Free an (b) very easy to set up.  
  However if you want to use one of the more sophisticated products available then you
  might ue this as a starting point for writing a helper for it.`
}

/* inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

}, */

const lang = require('../../../config/language').EN
const getLabelsValues = require('../get-labels-values')

const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg) {
 const trace = require('track-n-trace')
  trace.log(arguments)

  let results = ''

  const headerTags = suds.inputTypes.ckeditor4.headerTags
  let height = 100
  if (attributes.input.height) { height = attributes.input.height }

  function stringObj (obj) {
    trace.log(obj)
    let result = '{'
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        result += `'${key}': '${obj[key]}',`
      } else result += `'${key}': ${stringObj(obj[key])},`
    }
    result += '}'
    return (result)
  }

  let replaceParms = ''

  if (suds.inputTypes.ckeditor4.formats) {
    /** Create format_tags  */
    const formats = suds.inputTypes.ckeditor4.formats
    for (let i = 0; i < formats.length; i++) {
      let name
      if (typeof formats[i] === 'string') {
        name = formats[i]
      } else {
        name = formats[i].name
      }
      if (!replaceParms) {
        replaceParms += `
          format_tags: '${name}`
      } else {
        replaceParms += `;${name}`
      }
    }
    replaceParms += '\','

    /** style format items */
    for (let i = 0; i < formats.length; i++) {
      if (typeof formats[i] === 'string') { continue }
      trace.log(formats[i], stringObj(formats[i]))
      replaceParms += `
          format_${formats[i].name}: ${stringObj(formats[i])},`
      trace.log(replaceParms)
    };
  }
  /** style items */
  let styles='';
  const stylesconfig = suds.inputTypes.ckeditor4.styles
  if (stylesconfig) {
    styles = 'CKEDITOR.stylesSet.add( \'default\', ['
    for (let i = 0; i < stylesconfig.length; i++) {
      if (typeof stylesconfig[i] === 'string') { continue }
      trace.log(stylesconfig[i], stringObj(stylesconfig[i]))
      styles += `
           ${stringObj(stylesconfig[i])},`
      trace.log(styles)
    };
    styles += '\n          ])'
  };

  if (suds.inputTypes.ckeditor4.editorplaceholder) {
    replaceParms += `
      extraPlugins: 'editorplaceholder', editorplaceholder: '${suds.inputTypes.ckeditor4.editorplaceholder}', `
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
`

  return ([results, headerTags])
}

exports.documentation = documentation
exports.fn = fn
