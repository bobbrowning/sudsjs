
const trace = require('track-n-trace')
exports.searchLink = searchLink
exports.getAttribute = getAttribute

/**
 * Gets attribute of field given qualified name;
 * @param {string} field
 * @param {object} attr
 * @returns
 */
function getAttribute (field, attr) {
  trace.log(field, Object.keys(attr))
  if (field.includes('.')) {
    const top = field.split('.')[0]
    const rest = field.replace(top + '.', '')
    return getAttribute(rest, attr[top].object)
  } else {
    trace.log(attr[field])
    return attr[field]
  }
}

/**
 * Creates search link
 * @param {object} attributes
 * @param {array} searchSpec
 * @returns
 */
function searchLink (attributes, searchSpec) {
  trace.log(arguments)

  const searches = searchSpec.searches
  for (let i = 0; i < searches.length; i++) {
    trace.log(i, searches[i])
    const searchField = searches[i][0]
    if (!searchField) { throw new Error(`No search field `) }
    const attribute = getAttribute(searchField, attributes)
    if (!attribute) { throw new Error(`Unknown search field ${searchField}`) }
    let value = searches[i][2]
    trace.log(searchField)
    let today
    if (value && typeof value === 'string' && value.substring(0, 6) == '#today') {
      today = new Date()
      searches[i][2] = value = today.toISOString().split('T')[0]
    }

    if (attribute.type == 'number') {
      if (attribute.input.type == 'date') {
        searches[i][2] = Date.parse(value)
      } else {
        searches[i][2] = Number(value)
      }
    }
    if (attribute.type == 'boolean') {
      if (searches[i][2] == 'true') { searches[i][2] = true }
      if (searches[i][2] == 'false') { searches[i][2] = false }
    }
  }

  trace.log(searches)
  return (searches)
}
