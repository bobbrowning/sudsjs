module.exports = {

  friendlyName: 'Format textarea for report',

  description: '',

  inputs: {
    attributes: { type: 'ref' },
    fieldValue: { type: 'ref' }
  },

  exits: {

    success: {
      description: 'All done.'
    }

  },

  fn: async function (inputs, exits) {
    const trace = require('track-n-trace')
    const lang = sails.config.language.EN
    trace.log(inputs)

    let results = inputs.fieldValue
    trace.log(results)
    results = results.replace(/(\n)+/g, '<br />')
    trace.log(results)
    return exits.success(results)
  }
}
