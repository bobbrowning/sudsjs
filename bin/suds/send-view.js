

trace = require('track-n-trace');
const suds = require('../../config/suds');
let db = require('./db');
let globalTags=require('../../local/global-header-tags');
let format=require('date-format');

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
  viewData.footnote+='&nbsp;'+ format(format.ISO8601_FORMAT, new Date())
  viewData.footnote=viewData.footnote.replace('{{version}}',suds.versionHistory[suds.versionHistory.length-1].version)
  if (!viewData.headerTags) { viewData.headerTags = '<!-- space for program generated header tags -->' }
  if (!viewData.pageHeaderTags) { viewData.pageHeaderTags = '<!-- space for program generated header tags -->' }
  res.render(view, viewData);
  return ('OK'); 

}




