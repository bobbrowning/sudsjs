/**  ****************************************************
* Routes an api call to required module
*
* Allows api modules to be set up in bin/custom without
* having to list them in the routing system.
*
* *************************************************** */
const suds = require('../../../config/suds')
const trace = require('track-n-trace')

module.exports = async function (req, res) {
  trace.log('#api-custom-router called ', req.query)
  let result = await require('../../custom/' + req.query.app)(req.query)
  trace.log(result)
  return res.json(result)
}
