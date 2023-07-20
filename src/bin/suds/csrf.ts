
const suds = require('../../config/suds');
const trace = require('track-n-trace')
 
 
exports.setToken = setToken;
exports.checkToken = checkToken;
import { Request } from "../types";

/**
 * If a csrf toek has not been created for the session, then it is set.
 * second parameter allows the token to be recreated always.
 * @param {object} req 
 * @param {boolean} force -  If true, forces recreation of token.
 */
function setToken(req: Request,force:boolean) {
        if (suds.csrf) {
                if (force || req.session.csrf === undefined) {
                        let { randomBytes } = require('crypto');
                        req.session.csrf = randomBytes(100).toString('base64'); // convert random data to a string

                }
        }
        trace.log(force,req.session)

}


/**
 * Throw an error if the input csrf toen is not present or doesn't match.
 * @param {object} req
 */
function checkToken(req) {
        let input ={...req.body,...req.query}
        trace.log({input:input, session: req.session})
        if (suds.csrf) {
                if (!input._csrf) {
                        console.log('csrf token missing from form')
                        throw new Error('Sorry there is something wrong. Please try later. ')
                }
                input._csrf=input._csrf.replaceAll(' ','+')
                if (input._csrf !== req.session.csrf) {
                        console.log(`csrf token mismatch
          Input: ${input._csrf}
          Expec: ${req.session.csrf}
                `)
                        throw new Error(`Sorry there is something wrong.  
 Your session may have expired, please try reloading the form.`)
                }
        }
}

