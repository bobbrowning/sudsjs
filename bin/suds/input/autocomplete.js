
const suds = require('../../../config/suds')

const documentation = {

  friendlyName: 'Autocomplete input.',
  description: `Generates autocomplete field. This can be based in a fixed set of items which are in the model (isIn), 
  or more normally based on a linked table. In this case the field must be a key to some other table. 
  The user either enters the key of the linked file, or starts typing the 
  value in the linked table that is specified (e.g.someone's name). 
  A list of candidates is shown and one can be selected or more characters typed to narrow it down. 
  The selected name is shown on screen and the record key ('id' always) is stored in a hidden field. 
  `
}

const trace = require('track-n-trace')
const lang = require('../../../config/language').EN
const tableDataFunction = require('../table-data')
const db = require('../db')
const classes = require('../../../config/classes').input // Links class codes to actual classes

const fn = async function (fieldType, fieldName, fieldValue, attributes, errorMsg, thisrecord) {
  trace.log(arguments)

  let results = ''
  const display = ''
  let title = '' // starting value to put in filter

  let source
  let values
  if (typeof attributes.values === 'string') {
    source = attributes.values
    if (fieldValue) {
      values = require(`../../../config/${attributes.values}`)
      title = values[fieldValue]
    }
  }

  let route = 'lookup'
  if (attributes.model) { route = 'auto' }
  if (attributes.input.route) { route = attributes.input.route };

  trace.log(source)

  if (attributes.model) {
    source = attributes.model
    trace.log({ model: source, id: fieldValue })
    // searching linked tble (the normal case)
    const tableData = tableDataFunction(source)

    let record = []
    if (fieldValue) {
      fieldValue = db.standardiseId(fieldValue) // Must be a valid key
      record = await db.getRow(source, fieldValue) // populate record from database
      trace.log(record)
      if (record.err) {
        errorMsg = `<span class="text-danger">${record.errmsg}</span>`
      } else {
        if (display) {
          title = record[display]
        } else {
          if (typeof (tableData.stringify) === 'string') {
            title = record[tableData.stringify]
          } else {
            title = await tableData.stringify(record)
          }
        }
      }
    }
  }

  //  minLength = 2;
  //  if (attributes.input.minLength) { minLength = attributes.input.minLength };
  if (attributes.input.limit) { limit = attributes.input.limit }
  let placeholder = ''
  if (lang.type) { placeholder = lang.type }
  if (attributes.input.placeholder) { placeholder = attributes.input.placeholder }

  limit = 5
  if (attributes.input.limit) { limit = attributes.input.limit }
  const size = 50
  let width = suds.defaultInputFieldWidth
  if (attributes.input.width) {
    width = attributes.input.width
  }

  let searchparm = ''

  if (attributes.model) {
    idPrefix = 'ID: '
    if (attributes.input.idPrefix) { idPrefix = attributes.input.idPrefix }
    if (!attributes.input.search) {
      console.log(`Field ${fieldName} in table being edited requires search  in config file`)
      return `Field ${fieldName} in table being edited requires search  in config file`
    }

    if (typeof attributes.input.search === 'string') {
      searchparm = `&andor=and&searchfield_1=${attributes.input.search}&compare_1=contains&value_1=%23input`
    } else {
      if (attributes.input.search && attributes.input.search.searches) {
        andor = 'and'
        if (attributes.input.search.andor) { andor = attributes.input.search.andor }
        searchparm = `&andor=${andor}`
        for (let i = 0; i < attributes.input.search.searches.length; i++) {
          j = i + 1
          let value = attributes.input.search.searches[i][2]
          if (value == '#input') { value = '%23input' }
          if (value.substr(0, 1) == '$') { value = thisrecord[value.substr(1)] }
          if (!value) { break }
          searchparm += `&searchfield_${j}=${attributes.input.search.searches[i][0]}`
          searchparm += `&compare_${j}=${attributes.input.search.searches[i][1]}`
          searchparm += `&value_${j}=${value}`
        }
      }
    }
  }
  let sortparm = ''
  if (attributes.input.search && attributes.input.search.sort) {
    sortparm = `&sortfield=${attributes.input.search.sort[0]}&sortdirection=${attributes.input.search.sort[1]}`
  }

  let onblur = ''
  if (attributes.input.onblur) {
    onblur = attributes.input.onblur
  }
  let onchange = ''
  if (attributes.input.onchange) {
    onchange = attributes.input.onchange
    onchange = onchange.replace('{{fieldValue}}', fieldValue)
  }

  results = `
    <div class="${classes.autocompleteContainer}"> <!--  autcomplete container --> 
    <input 
      id="autoid_${fieldName}" 
      name="${fieldName}"  
      value="${fieldValue}"
      type="hidden">
        <input 
          class="form-control" 
          style="width: ${attributes.input.width}; float: left;" 
          id="${fieldName}" 
          name="${fieldName}disp"
          value="${title}"
          placeholder="${placeholder}" 
          aria-describedby="${attributes.description}"
          oninput="auto('${route}','${fieldName}','${source}','${display}','${limit}','${searchparm}','${sortparm}','${onchange}')"
          onblur="${onblur}"
          >
          <span id="msg_${fieldName}"></span>
          <span id="err_${fieldName}" class="sudserror">
            ${errorMsg}
          </span>
          <span 
          class="${classes.autoRemove}"
          onclick="document.getElementById('autoid_${fieldName}').value=''; document.getElementById('${fieldName}').value=''"
          >
            ${lang.deleteIcon} ${lang.clear}
          </span>
    </div>  <!--  autcomplete container end -->
  `

  return results
}

exports.documentation = documentation
exports.fn = fn
