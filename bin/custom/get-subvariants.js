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
    let variant = query.parentValue1;
    let record = await db.getRow('products', id);
    trace.log(id, record.variants);
    let variants = [];
    for (let i = 0; i < record.variants.length; i++) {
        trace.log(i, record.variants[i].friendlyName, variant);
        if (record.variants[i].friendlyName == variant) {
            for (j = 0; j < record.variants[i].subvariants.length; j++) {
                trace.log(j);
                variants[j] = record.variants[i].subvariants[j].friendlyName;
            }
            break;
        }
    }
    trace.log(variants);
    return ([variants, variants]);
};
/*
module.exports = async function (req, res) {
    trace.log('#get record called ', req.query);
     let id=req.query.id;
     let variant=req.query.variant_id;
    let record=await db.getRow('products',id);
    trace.log(id,record.variants);
    let variants=[];
    for (let i=0;i<record.variants.length; i++) {
        trace.log(i,record.variants[i].friendlyName, variant)
        if (record.variants[i].friendlyName==variant) {
            for (j=0; j<record.variants[i].subvariants.length; j++) {
                trace.log(j);
                variants[j]=record.variants[i].subvariants[j].friendlyName;
              }
             break;
        }
    }
    trace.log(variants);
    return res.json(variants);
}*/ 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LXN1YnZhcmlhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9jdXN0b20vZ2V0LXN1YnZhcmlhbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozt3REFHd0Q7QUFDeEQsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDeEMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3JDLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBRXRDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEtBQUs7SUFDbEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2QyxJQUFJLEVBQUUsR0FBUSxLQUFLLENBQUMsWUFBWSxDQUFDO0lBQ2pDLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7SUFDbEMsSUFBSSxNQUFNLEdBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBQyxFQUFFLENBQUMsQ0FBQztJQUMxQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsSUFBSSxRQUFRLEdBQUMsRUFBRSxDQUFDO0lBQ2hCLEtBQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUNyRCxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxJQUFFLE9BQU8sRUFBRTtZQUMxQyxLQUFLLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDcEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDYixRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO2FBQzVEO1lBQ0YsTUFBTTtTQUNWO0tBQ0o7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLENBQUMsQ0FBQTtBQUlEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CRyJ9