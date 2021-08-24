
/*
inputs: {
  res: { type: 'ref' },
  output: { type: 'ref' },
},
*/
module.exports = async function (res,output) {
    trace = require('track-n-trace');
    trace.log('sending output', typeof output);
    let html;
    if (typeof output == 'string') {
      html=output;
      footnote='';
    }
    else
    {
      html=output.html;
      footnote=output.footnote;
    }

   // res.send(output);
    res.render('index',{output:html, footnote: footnote});
    return ('OK');

  }




