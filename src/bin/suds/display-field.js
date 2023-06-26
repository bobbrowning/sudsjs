
const suds = require('../../config/suds')
const lookup = require('./lookup')
const tableDataFunction = require('./table-data')
const lang = require('../../config/language').EN
const trace = require('track-n-trace')
const db = require('./db')

const friendlyName = 'Format field data'
const description = `For many types of field, this routine simply returns the 
value of the field. Dates, currency etc fields are formatted. If it is a 
foreign key it looks up the linked record and uses the rowTitle function 
for that table. If there is none, then just returns the value 
of the field. File upload fields have a link to the uploaded file.`

module.exports = displayField

async function displayField (attributes, value, children, permission, parent) {
  if (arguments[0] == suds.documentation) { return ({ friendlyName, description }) }
  trace.log({ arguments, break: '*' })
  let display = ''

  /** If the item is an object we navigate through the structure  by
   * calling the funtion recurively.
   */
  if (attributes.type == 'object') {
    /** If a top-level object is also an array (i.e. an array of objects).
     *  If a stringify function/field is given for the object, then
     * then list one line for each item which is obtained by the stringify
     * function/item for the object with 'more...to expand
     */
    if (attributes.array && Array.isArray(value)) {
      trace.log(value)
      display += '<ol>'
      for (let i = 0; i < value.length; i++) {
        display += '<li>'
        let disp = 'inline'
        const unique = Math.random()
        if (attributes.stringify) {
          disp = 'none'
          display += `
          <span onclick="document.getElementById('${unique}_${attributes.key}_${i}').style.display='inline'">`
          if (typeof attributes.stringify === 'function') {
            display += await attributes.stringify(value[i])
          } else {
            display += value[i][attributes.stringify]
          }
          display += ` <span class="text-primary" style="cursor: pointer; "> more...</span>
          </span>`
        }
        display += `
        <div id="${unique}_${attributes.key}_${i}"  style="display:${disp}">`
        display += await displayField(attributes, value[i], children, permission, parent)
        display += `
        </div>
        </li>`
      }
      display += '</ol>'
      trace.log(display)
      return display
    }
    /** Otherwise work your way through the object */
    else {
      trace.log('descending one level', Object.keys(attributes.object), value)
      if (!value) { return '' }
      display = '<ul>'
      for (const key of Object.keys(attributes.object)) {
        trace.log('next at level', key, value)
        let item = 'No value'
        if (value[key]) {
          item = await displayField(attributes.object[key], value[key], children, permission, parent)
        }
        display += `<li>${attributes.object[key].friendlyName}: ${item}</li>`
        trace.log(display)
      }
      display += '</ul>'
      trace.log(display)
      return (display)
    }
  } else {
    display = await displayItem(attributes, value, children, permission)
    trace.log(display)
    return display
  }

  async function displayItem (attributes, value, children, permission) {
    trace.log({ item: attributes.qualifiedName, value })
    let display = value // default do nothing

    /** Boolean  */
    if (attributes.type == 'boolean') {
      if (value) { return (lang.true) } else { return (lang.false) }
    }

    /** Null value */
    if (attributes.model && !value) { return (lang.notSpecified) }

    /** Otherwise empty return blank */
    if (!value && !attributes.collection) return ('')

    /** This is not a real field on the database, but identifies a child column */
    trace.log(attributes.collection, children, value)
    if (attributes.collection) {
      let num = children

      if (num == 0) { num = lang.no }
      if (num > suds.pageLength) { num = `${lang.moreThan} ${suds.pageLength}` }
      if (children == 1) {
        display = `${lang.thereIs} ${num} ${attributes.friendlyName} ${lang.row}`
      } else {
        display = `${lang.thereAre} ${num} ${attributes.friendlyName} ${lang.rows}`
      }
      return (display)
    }

    /** Some display types have a special routine to display it.
     * The helper routine is stores in bin/suds/display   */
    let helper
    trace.log({ value, type: attributes.type, displaytype: attributes.display.type })

    /** Date  */
    trace.log({ value, type: attributes.type, displaytype: attributes.display.type })
    if (attributes.display.type == 'date') {
      const date = new Date(value)
      display = date.toDateString()
      return (display)
    }
    if (attributes.display.type == 'html') {
      return (encodeURI(value))
    }

    /** Date / time  */
    if (attributes.display.type == 'color' && value) {
      display = `<span style="background-color: ${value}">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>`
      return (display)
    }

    /** Date / time  */
    if (attributes.display.type == 'datetime') {
      const date = new Date(value)
      display = date.toString()
      return (display)
    }

    if (attributes.display.type) {
      trace.log('./display/' + attributes.display.type)
      try {
        helper = require('./display/' + attributes.display.type)
      } catch (err) {
        throw new Error (`display-field.js::Cannot load display helper for type: ${attributes.display.type}, field ${attributes.friendlyName}`)
      }
      if (helper) {
        trace.log('using helper', attributes.display.type, value)
        return (await helper(attributes, value))
      }
    }

    trace.log({ name: attributes.friendlyName, value, process: attributes.process })
    if ((attributes.process && attributes.process.JSON) || (attributes.array && attributes.array.type != 'object')) {
      let data
      if (attributes.process && attributes.process.JSON) {
        data = JSON.parse(value)
      } else {
        data = value
      }
      trace.log({ value, data })
      let display = value
      if (Array.isArray(data)) {
        display = '<ol>'
        for (let i = 0; i < data.length; i++) {
          let key = data[i]
          trace.log(key)
          const lookedup = await lookup(attributes, key)
          trace.log(lookedup)
          display += `
          <li>
          ${lookedup}
          </li>`
        }
        display += '</ol>'
      } else {
        display = ''
        for (const key of Object.keys(data)) {
          display += `${key}:  ${JSON.stringify(data[key])}<br />`
        }
      }
      return (display)
    }

    /** File upload */
    trace.log({ attributes, maxdepth: 2 })
    trace.log({ value, type: attributes.type })
    if (attributes.input && attributes.input.type == 'uploadFile') {
      display = ''
      if (attributes.display.type == 'image') {
        let width = '100px'
        if (attributes.display.width) { width = attributes.display.width }
        display = `<a href="/uploads/${value}" target="_blank"><img src="/uploads/${value}" style="width: ${width};"></a>&nbsp;`
      }
      display += `<a href="/uploads/${value}" target="_blank">${value}</a>`
      return (display)
    }

    /** Currency */
    trace.log({ value, type: attributes.type, displaytype: attributes.display.type })
    if (attributes.display && attributes.display.currency) {
      const formatter = new Intl.NumberFormat(
        suds.currency.locale,
        {
          style: 'currency',
          currency: suds.currency.currency,
          minimumFractionDigits: suds.currency.digits
        })
      display = formatter.format(value)
      return (display)
    }

    /** Show asterisks */
    if (attributes.display.type == 'asterisks') {
      return ('*********************')
    }

    /** The field is a key to another table.  */
    trace.log({ value, model: attributes.model })
    if (attributes.model) {
      const look = await lookup(attributes, value)
      trace.log(look)
      return look
    };

    /** There are values in the table definition to look up. */
    if (attributes.values) {
      const item = await lookup(attributes, value)
      trace.log(attributes.qualifiedName, value)
      return item
    };

    return (display)
  }
}
