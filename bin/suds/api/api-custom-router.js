"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**  ****************************************************
* Routes an api call to required module
*
* Allows api modules to be set up in bin/custom without
* having to list them in the routing system.
*
* *************************************************** */
const suds = require('../../../config/suds');
const trace = require('track-n-trace');
const csrf = require('../../../bin/suds/csrf');
module.exports = async function (req, res) {
    /** Check the csrf token. It should be the toekn that we last sent to a form
     * (in this thread).  This is stored as a session variable.
     * Note that the session may have a time limit.
     */
    try {
        csrf.checkToken(req);
    }
    catch (err) {
        console.log(`
    ***********************************************
    csrf mis-match in api 
    ${req.query.app}
    ${err}
    ***********************************************
        `);
        return res.json({ err: `csrf error: ${err}` });
    }
    trace.log('#api-custom-router called: ', req.query);
    let result = await require('../../custom/' + req.query.app)(req.query);
    trace.log(result);
    return res.json(result);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLWN1c3RvbS1yb3V0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmluL3N1ZHMvYXBpL2FwaS1jdXN0b20tcm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozt3REFNd0Q7QUFDeEQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFDNUMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sSUFBSSxHQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO0FBRzVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQVksRUFBRSxHQUFhO0lBQzVEOzs7T0FHRztJQUNELElBQUk7UUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQUM7SUFDMUIsT0FBTyxHQUFHLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDOzs7TUFHVixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUc7TUFDYixHQUFHOztTQUVBLENBQUUsQ0FBQTtRQUNQLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBQyxlQUFlLEdBQUcsRUFBRSxFQUFDLENBQUMsQ0FBQTtLQUM1QztJQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ25ELElBQUksTUFBTSxHQUFRLE1BQU0sT0FBTyxDQUFDLGVBQWUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUMzRSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN6QixDQUFDLENBQUEifQ==