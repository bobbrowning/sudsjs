"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (fieldName) {
    const trace = require('track-n-trace');
    let chars = fieldName.replace(/_/g, ' ');
    chars = chars.split('');
    let humanisedName = chars[0].toUpperCase();
    for (let i = 1; i < chars.length; i++) {
        if (chars[i] == chars[i].toUpperCase()) {
            humanisedName += ' ' + chars[i].toLowerCase();
        }
        else {
            humanisedName += chars[i];
        }
    }
    trace.log(humanisedName, { level: 'verbose' });
    return (humanisedName);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHVtYW5pc2UtZmllbGRuYW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9zdWRzL2h1bWFuaXNlLWZpZWxkbmFtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxTQUFTO0lBQ2xDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUN0QyxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN4QyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUN2QixJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDMUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDckMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ3RDLGFBQWEsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO1NBQzlDO2FBQU07WUFDTCxhQUFhLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQzFCO0tBQ0Y7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBQzlDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUN4QixDQUFDLENBQUEifQ==