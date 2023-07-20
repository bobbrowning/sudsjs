"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../config/suds');
const trace = require('track-n-trace');
exports.setToken = setToken;
exports.checkToken = checkToken;
/**
 * If a csrf toek has not been created for the session, then it is set.
 * second parameter allows the token to be recreated always.
 * @param {object} req
 * @param {boolean} force -  If true, forces recreation of token.
 */
function setToken(req, force) {
    if (suds.csrf) {
        if (force || req.session.csrf === undefined) {
            let { randomBytes } = require('crypto');
            req.session.csrf = randomBytes(100).toString('base64'); // convert random data to a string
        }
    }
    trace.log(force, req.session);
}
/**
 * Throw an error if the input csrf toen is not present or doesn't match.
 * @param {object} req
 */
function checkToken(req) {
    let input = { ...req.body, ...req.query };
    trace.log({ input: input, session: req.session });
    if (suds.csrf) {
        if (!input._csrf) {
            console.log('csrf token missing from form');
            throw new Error('Sorry there is something wrong. Please try later. ');
        }
        input._csrf = input._csrf.replaceAll(' ', '+');
        if (input._csrf !== req.session.csrf) {
            console.log(`csrf token mismatch
          Input: ${input._csrf}
          Expec: ${req.session.csrf}
                `);
            throw new Error(`Sorry there is something wrong.  
 Your session may have expired, please try reloading the form.`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NyZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9jc3JmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDMUMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBR3RDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQzVCLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBR2hDOzs7OztHQUtHO0FBQ0gsU0FBUyxRQUFRLENBQUMsR0FBWSxFQUFDLEtBQWE7SUFDcEMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1AsSUFBSSxLQUFLLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQ3JDLElBQUksRUFBRSxXQUFXLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGtDQUFrQztTQUVqRztLQUNSO0lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBRXBDLENBQUM7QUFHRDs7O0dBR0c7QUFDSCxTQUFTLFVBQVUsQ0FBQyxHQUFHO0lBQ2YsSUFBSSxLQUFLLEdBQUUsRUFBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFDLENBQUE7SUFDckMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFBO0lBQzlDLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtRQUNQLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO1lBQzNDLE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQTtTQUM1RTtRQUNELEtBQUssQ0FBQyxLQUFLLEdBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzNDLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtZQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDO21CQUNqQixLQUFLLENBQUMsS0FBSzttQkFDWCxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUk7aUJBQ2xCLENBQUMsQ0FBQTtZQUNNLE1BQU0sSUFBSSxLQUFLLENBQUM7K0RBQ3VCLENBQUMsQ0FBQTtTQUMvQztLQUNSO0FBQ1QsQ0FBQyJ9