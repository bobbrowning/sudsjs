

let trace = require('track-n-trace');
exports.searchLink=searchLink;
exports.getAttribute=getAttribute;

/**
 * Gets attribute of field given qualified name;
 * @param {string} field 
 * @param {object} attr 
 * @returns 
 */
function getAttribute(field, attr) {
  trace.log(field, Object.keys(attr))
  if (field.includes('.')) {
    let top = field.split('.')[0];
    let rest = field.replace(top + '.', '');
    return getAttribute(rest,attr[top].object) 
  }
  else
  {
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
function searchLink(attributes, searchSpec) {
  trace.log(arguments);


  let searches = searchSpec.searches;
  for (i = 0; i < searches.length; i++) {
    trace.log(i, searches[i]);
    let searchField = searches[i][0];
    let attribute=getAttribute(searchField,attributes);
    let value = searches[i][2];
    trace.log(searchField);
    if (searchField) {
      let today;
      if (value && typeof value == 'string' && value.substring(0, 6) == '#today') {
        today = new Date();
        searches[i][2] = value = today.toISOString().split("T")[0];
      }

      if (attribute.type == 'number') {
        if (attribute.input.type == 'date') {
          searches[i][2] = Date.parse(value);
        }
        else {
          searches[i][2] = Number(value);
        }
      }
      if (attribute.type == 'boolean') {
        if (searches[i][2] == 'true') { searches[i][2] = true; }
        if (searches[i][2] == 'false') { searches[i][2] = false; }
      }
    }
  }

  trace.log(searches); 
  return (searches);
}





