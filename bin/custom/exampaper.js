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
        return ([[], []]);
    }
    let examDoc = await db.getRow('subjectsdenorm', exam);
    if (examDoc.err) {
        return ([['error'], ['examDoc.msg']]);
    }
    let labels = [];
    let values = [];
    trace.log(examDoc);
    for (let i = 0; i < examDoc.papers.length; i++) {
        values[i] = examDoc.papers[i].name;
        labels[i] = values[i];
    }
    trace.log(labels, values);
    return ([labels, values]);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhhbXBhcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9jdXN0b20vZXhhbXBhcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUE7Ozt5REFHeUQ7QUFDeEQsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3JDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBRXhDLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNoQyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssV0FBVyxLQUFZO0lBQ3pDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakIsSUFBSSxJQUFJLEdBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztJQUM1QixJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1AsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7S0FDbkI7SUFDRCxJQUFJLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUMsSUFBSSxDQUFDLENBQUE7SUFDcEQsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQ2IsT0FBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUN0QztJQUNELElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQztJQUN4QixJQUFJLE1BQU0sR0FBVyxFQUFFLENBQUM7SUFDeEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQixLQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUM7UUFDeEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDckI7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQyxNQUFNLENBQUMsQ0FBQTtJQUN4QixPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUEifQ==