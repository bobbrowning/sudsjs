

trace = require('track-n-trace');
const suds = require('../../config/suds');
let db = require('./'+suds.dbDriver);
let globalTags=require('../../local/global-header-tags');


module.exports = async function (res, view, output) {
  trace.log('sending output', typeof output);
  trace.log({ output: output, level: 'verbose' });
  let viewData = {};
  if (typeof output == 'string' && output) {
    viewData.output = output;
    viewData.footnote = '';
    viewData.headerTags = suds.headerTags+globalTags;
    viewData.pageHeaderTags = suds.pageHeaderTags+globalTags;
    viewData.heading='';
  }
  
  else {
    viewData = output;
    let headerTags = suds.headerTags;
    if (output.headerTags) { headerTags += output.headerTags; }
    viewData.headerTags = headerTags+globalTags;
    viewData.pageHeaderTags = suds.pageHeaderTags+globalTags; 
  }

  if (!viewData.headerTags) { viewData.headerTags = '<!-- space for program generated header tags -->' }
  if (!viewData.pageHeaderTags) { viewData.pageHeaderTags = '<!-- space for program generated header tags -->' }
  res.render(view, viewData);
  return ('OK'); 

}




