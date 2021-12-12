
/* inputs: {
  attributes: { type: 'ref' },
  searchSpec: { type: 'ref' },
}, */
let trace = require('track-n-trace');


module.exports = function (attributes, searchSpec) {
   trace.log(arguments);

  let searches = searchSpec.searches;
  for (i = 0; i < searches.length; i++) {
    trace.log(i, searches[i]);
    let searchField = searches[i][0];
    let value = searches[i][2];

    trace.log(searchField);
    if (searchField) {
      let today;
      if (value && typeof value == 'string' && value.substring(0, 6) == '#today') {
        today = new Date();
        searches[i][2] = value = today.toISOString().split("T")[0];
      }

      if (attributes[searchField].type == 'number') {
        if (attributes[searchField].input.type == 'date') {
          searches[i][2] = Date.parse(value);
        }
        else {
          searches[i][2] = Number(value);
        }
      }
      if (attributes[searchField].type == 'boolean') {
        if (searches[i][2] == 'true') { searches[i][2] = true; }
        if (searches[i][2] == 'false') { searches[i][2] = false; }
      }
    }
  }


  return (searches);
}





