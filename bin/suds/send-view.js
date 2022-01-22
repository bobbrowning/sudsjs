

trace = require('track-n-trace');
const suds = require('../../config/suds');
let db = require('./'+suds.database.driver);



module.exports = async function (res, view, output) {
  trace.log('sending output', typeof output);
  trace.log({ output: output, level: 'verbose' });
  let viewData = {};
  if (typeof output == 'string' && output) {
    viewData.output = output;
    viewData.footnote = '';
    viewData.heading = suds.headerTags;
  }
  
  else {
    viewData = output;
    let headerTags = suds.headerTags;
    if (output.headerTags) { headerTags += output.headerTags; }
    viewData.headerTags = headerTags;
  }

  if (!viewData.headerTags) { viewData.headerTags = '<!-- space for program generated header tags -->' }
  res.render(view, viewData);
  return ('OK');

}




