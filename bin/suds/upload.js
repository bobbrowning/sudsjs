module.exports = {


  friendlyName: 'Field Upload file ',


  description: 'Does not work - do not use',


  inputs: {
    req: { type: 'ref' },
    res: { type: 'ref' },
    field: { type: 'string' }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    trace = require('track-n-trace');
    let req = inputs.req;
    let res = inputs.res;
    let field = inputs.field;
    trace.log(field, req.file(field).upload);

    await req.file(field).upload({
      // don't allow the total upload size to exceed ~100MB
      maxBytes: 100000000,
      // set the directory
      dirname: './',
    }, function (err, files) {
      // if error negotiate
      if (err) {
        return res.negotiate(err);
      }
      else if (files.length == 0) {
        message = "No file uploaded";
        console.log(message);
      }
      else {
        // logging the filename
        trace.log(files.filename);
        // send ok response
      }
      return ('OK');
    });
    return exits.success('OK');

    /*
        let upload= req.file(field)
        upload.upload(function (err, uploadedFiles){
          if (err) return res.serverError(err);
          return res.json({
            message: uploadedFiles.length + ' file(s) uploaded successfully!',
            files: uploadedFiles
          });
        });
        */
  },

}

