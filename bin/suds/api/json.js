"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* ****************************************************
* uique AJAX response.
*
* *************************************************** */
const suds = require('../../../config/suds');
const trace = require('track-n-trace');
const db = require('../db');
module.exports = async function (req, res) {
    trace.log('#json called ', req.query);
    const table = req.query.table;
    const fieldValue = req.query.value;
    let obj;
    try {
        obj = JSON.parse(fieldValue);
    }
    catch (err) {
        trace.log({ err: err.message, type: Array.isArray(err) });
        let more = '';
        const idx = err.message.match(/(position )([0-9]*)/);
        const pos = Number(idx[2]);
        trace.log(pos);
        more = fieldValue.substring(pos - 8, pos + 8);
        return res.json([
            'validationError',
            `${err.message} - around this (<b>${more}</b>)`
        ]);
    }
    trace.log(obj);
    return res.json(['OK']);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iaW4vc3Vkcy9hcGkvanNvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7d0RBR3dEO0FBQ3hELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQzVDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN0QyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7QUFFM0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLEdBQUc7SUFDdkMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3JDLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFBO0lBQzdCLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFBO0lBQ2xDLElBQUksR0FBRyxDQUFBO0lBQ1AsSUFBSTtRQUNGLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0tBQzdCO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3pELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUNiLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUE7UUFDcEQsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzFCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUM3QyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDZCxpQkFBaUI7WUFDWCxHQUFHLEdBQUcsQ0FBQyxPQUFPLHNCQUFzQixJQUFJLE9BQU87U0FDdEQsQ0FBQyxDQUFBO0tBQ0g7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ2QsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUN6QixDQUFDLENBQUEifQ==