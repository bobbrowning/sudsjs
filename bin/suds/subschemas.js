"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../config/suds'); // Primary configuration file
const trace = require('track-n-trace'); // Debug tool
const db = require('./db'); // Database routines
/**
 *
  * @param {object} tableData
 * @returns {array} array of subschema keys,
 */
module.exports = async function (subschemas) {
    ``;
    let additionalAttributes = {};
    trace.log(subschemas);
    if (subschemas) {
        if (!Array.isArray(subschemas)) {
            subschemas = [subschemas];
        }
        for (let i = 0; i < subschemas.length; i++) {
            const subschemaRecord = await db.getRow('subschema', subschemas[i]);
            const attr = {};
            trace.log(subschemaRecord);
            for (let j = 0; j < subschemaRecord.item.length; j++) {
                trace.log(j, subschemaRecord.item[j].name, subschemaRecord.item[j].spec);
                attr[subschemaRecord.item[j].name] = JSON.parse(subschemaRecord.item[j].spec);
            }
            trace.log(attr);
            additionalAttributes = { ...additionalAttributes, ...attr };
        }
    }
    trace.log(additionalAttributes);
    return additionalAttributes;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vic2NoZW1hcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9zdWJzY2hlbWFzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUEsQ0FBQyw2QkFBNkI7QUFDdkUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBLENBQUMsYUFBYTtBQUNwRCxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUEsQ0FBQyxvQkFBb0I7QUFFL0M7Ozs7R0FJRztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLFVBQVU7SUFDMUMsRUFBRSxDQUFBO0lBQ0YsSUFBSSxvQkFBb0IsR0FBRyxFQUFFLENBQUE7SUFDN0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNyQixJQUFJLFVBQVUsRUFBRTtRQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQUUsVUFBVSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7U0FBRTtRQUM3RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMxQyxNQUFNLGVBQWUsR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ25FLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQTtZQUNmLEtBQUssQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUE7WUFDMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwRCxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUN4RSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDOUU7WUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ2Ysb0JBQW9CLEdBQUcsRUFBRSxHQUFHLG9CQUFvQixFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUE7U0FDNUQ7S0FDRjtJQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUMvQixPQUFPLG9CQUFvQixDQUFBO0FBQzVCLENBQUMsQ0FBQSJ9