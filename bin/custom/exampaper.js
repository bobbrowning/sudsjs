"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** ************************************************
 * Given an exam subject key, the program returns the
 * list of papers as labels/values array array.
 ***************************************************** */
let trace = require('track-n-trace');
let suds = require('../../config/suds');
let db = require('../suds/db');
module.exports = async function (query) {
    trace.log(query);
    let exam = query.parentValue0;
    if (!exam) {
        return ([], []);
    }
    let examDoc = await db.getRow('subjectsdenorm', exam);
    if (examDoc.err) {
        return (['error'], ['examDoc.msg']);
    }
    let labels = [];
    let values = [];
    trace.log(examDoc);
    for (let i = 0; i < examDoc.papers.length; i++) {
        labels[i] = values[i] = examDoc.papers[i].name;
    }
    trace.log(labels, values);
    return ([labels, values]);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhhbXBhcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9jdXN0b20vZXhhbXBhcGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0E7Ozt5REFHeUQ7QUFDeEQsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3JDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3hDLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNoQyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssV0FBVyxLQUFLO0lBQ2pDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbEIsSUFBSSxJQUFJLEdBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztJQUM1QixJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1AsT0FBTyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQTtLQUNqQjtJQUNELElBQUksT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBQyxJQUFJLENBQUMsQ0FBQTtJQUNwRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUU7UUFDYixPQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUE7S0FDcEM7SUFDRCxJQUFJLE1BQU0sR0FBQyxFQUFFLENBQUM7SUFDZCxJQUFJLE1BQU0sR0FBQyxFQUFFLENBQUM7SUFDZCxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBQztRQUN4QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0tBQzdDO0lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUMsTUFBTSxDQUFDLENBQUE7SUFDeEIsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFBIn0=