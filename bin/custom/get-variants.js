"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* ****************************************************
* uique AJAX response.
*
* *************************************************** */
let suds = require('../../config/suds');
let trace = require('track-n-trace');
let db = require('../../bin/suds/db');
module.exports = async function (query) {
    trace.log('#get record called ', query);
    let id = query.parentValue0;
    let record = await db.getRow('products', id);
    trace.log(id, record.variants);
    let labels = [];
    let values = [];
    for (let i = 0; i < record.variants.length; i++) {
        labels[i] = values[i] = record.variants[i].friendlyName;
    }
    trace.log(labels, values);
    return ([labels, values]);
};
/*
module.exports = async function (req, res) {
    trace.log('#get record called ', req.query);
     let id=req.query.id;
    let record=await db.getRow('products',id);
    trace.log(id,record.variants);
    let variants=[];
    for (let i=0;i<record.variants.length;i++) {
        variants[i]=record.variants[i].friendlyName
    }
    trace.log(variants);
    return res.json(variants);
}
*/ 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LXZhcmlhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9jdXN0b20vZ2V0LXZhcmlhbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozt3REFHd0Q7QUFDeEQsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDeEMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3JDLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBRXRDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEtBQUs7SUFDbEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2QyxJQUFJLEVBQUUsR0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDO0lBQzNCLElBQUksTUFBTSxHQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlCLElBQUksTUFBTSxHQUFDLEVBQUUsQ0FBQztJQUNkLElBQUksTUFBTSxHQUFDLEVBQUUsQ0FBQztJQUNkLEtBQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFBRTtRQUN2QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFBO0tBQ3REO0lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDekIsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7RUFhRSJ9