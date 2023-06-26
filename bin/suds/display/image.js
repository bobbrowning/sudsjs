"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lang = require('../../../config/language').EN;
const tableDataFunction = require('../table-data');
module.exports = async function (attributes, fieldValue) {
    const trace = require('track-n-trace');
    trace.log(arguments);
    let style = '';
    if (attributes.display.width) {
        style += ` width: ${attributes.display.width}`;
    }
    return `<a href="/uploads/${fieldValue}" target="_blank"><img src="/uploads/${fieldValue}" style="${style}"></a>`;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmluL3N1ZHMvZGlzcGxheS9pbWFnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUNuRCxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUVsRCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssV0FBVyxVQUFVLEVBQUUsVUFBVTtJQUNyRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDdEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNwQixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUE7SUFDZCxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQUUsS0FBSyxJQUFJLFdBQVcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtLQUFFO0lBQ2hGLE9BQU8scUJBQXFCLFVBQVUsd0NBQXdDLFVBQVUsWUFBWSxLQUFLLFFBQVEsQ0FBQTtBQUNuSCxDQUFDLENBQUEifQ==