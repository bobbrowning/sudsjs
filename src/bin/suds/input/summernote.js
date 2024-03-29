
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
const  trace = require('track-n-trace')
  trace.log(arguments)

  let results = ''
  const headerTags = suds.inputTypes.summernote.headerTags
  let conf = ''

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
                ${key}: ${attributes.input[key]},`
    } else {
      if (suds.inputTypes.summernote[key]) {
        conf += `
                  ${key}: ${suds.inputTypes.summernote[key]},`
      }
    }
  };

  if (suds.inputTypes.summernote.styleTags) {
    conf += `
                styleTags: [`
    for (const style of suds.inputTypes.summernote.styleTags) {
      conf += `
                   {`
      for (const item of Object.keys(style)) {
        conf += ` ${item}: '${style[item]}', `
      }
      conf += '},'
    }
    conf += `
                 ],`
  }

  for (const arrayConf of ['fontNames', 'fontNamesIgnoreCheck', 'lineHeights', 'codeviewIframeWhitelistSrc']) {
    if (suds.inputTypes.summernote[arrayConf]) {
      conf += `
                ${arrayConf}: [`
      for (const font of suds.inputTypes.summernote[arrayConf]) {
        conf += `'${font}', `
      }

      conf += ' ],'
    }
  };

  if (suds.inputTypes.summernote.toolbar) {
    conf += `
                toolbar: [`
    for (const group of Object.keys(suds.inputTypes.summernote.toolbar)) {
      conf += `
                 ['${group}', [`
      for (const tool of suds.inputTypes.summernote.toolbar[group]) {
        conf += `'${tool}', `
      }
      conf += ']],'
    }
    conf += `
                ],`
  }
  if (suds.inputTypes.summernote.popover) {
    conf += `
                popover: {`
    for (const tag of ['image', 'link', 'table', 'air']) {
      conf += `
                 ${tag}: [`
      for (const group of suds.inputTypes.summernote.popover[tag]) {
        trace.log(group[1])
        conf += `
                    ['${group[0]}', [`
        for (const tool of group[1]) {
          conf += `'${tool}', `
        }
        conf += ']],'
      }
      conf += `
                 ],`
    }
    conf += `
              }`
  }

  let placeholder = ''
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
                ${conf}
           });
          </script>`
  return ([results, headerTags])
}

exports.documentation = documentation
exports.fn = fn
