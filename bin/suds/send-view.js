

trace = require('track-n-trace');
let db = require('./db');



module.exports = async function (res, view, output) {
  trace.log('sending output', typeof output);
  trace.log({ output: output, level: 'verbose' });
  let viewData = {};
  if (typeof output == 'string' && output) {
    viewData.output = output;
    viewData.footnote='';
  }
  else {
    viewData = output;
  }
   res.render(view, viewData);
  return ('OK');

}




