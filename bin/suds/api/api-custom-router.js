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
module.exports = async function (req, res) {
    trace.log('#api-custom-router called ', req.query);
    let result = await require('../../custom/' + req.query.app)(req.query);
    trace.log(result);
    return res.json(result);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLWN1c3RvbS1yb3V0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmluL3N1ZHMvYXBpL2FwaS1jdXN0b20tcm91dGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozt3REFNd0Q7QUFDeEQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFDNUMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBRXRDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHO0lBQ3ZDLEtBQUssQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2xELElBQUksTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLGVBQWUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN0RSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN6QixDQUFDLENBQUEifQ==