/**  ****************************************************
* Routes an api call to required module
*
* Allows api modules to be set up in bin/custom without
* having to list them in the routing system.
*
* *************************************************** */
const suds = require('../../../config/suds')
const trace = require('track-n-trace')
const csrf=require('../../../bin/suds/csrf')
import {  Request, Response } from "../../types";

module.exports = async function (req: Request, res: Response) {
/** Check the csrf token. It should be the toekn that we last sent to a form
 * (in this thread).  This is stored as a session variable. 
 * Note that the session may have a time limit.
 */
  try {csrf.checkToken(req)}
  catch (err) {
    console.log(`
    ***********************************************
    csrf mis-match in api 
    ${req.query.app}
    ${err}
    ***********************************************
        ` )
    return res.json({err:`csrf error: ${err}`})
  }

  trace.log('#api-custom-router called: ', req.query)
  let result: any = await require('../../custom/' + req.query.app)(req.query)
  trace.log(result)
  return res.json(result)
}
