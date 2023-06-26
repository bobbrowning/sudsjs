"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** ****************************************************
 *
 * automplete  response.
 * returns set of table rows depending on what has been typed in.
 * Input data
 *    - object: object to be searched
 *    - display: feld to display if no display function.
 *    - term
 *    - limit
 *    - andor
 *    - searchfield_1   (_2, _3 etc)
 *    - compare_1   (_2, _3 etc)
 *    - value_1   (_2, _3 etc)
 *
 *  If the term is numeric also looks for an exact match with
 *  the record key
 *
 * returns [labels, values] where labels and values
 * are matching arrays
 *
 * *************************************************** */
const suds = require('../../../config/suds');
const trace = require('track-n-trace');
module.exports = async function (req, res) {
    trace.log('#lookup called ', req.query);
    const allParms = req.query;
    const source = allParms.linkedtable;
    /**
       * Sort out the field to be displayed, or the function that returns the
       * displayed text.
       */
    const display = allParms.display;
    const displayFunction = false;
    const term = allParms.term;
    const limit = Number(allParms.limit);
    trace.log({ source, term, limit });
    /**
       * Created the sort specification from the supplied data.
       */
    const labels = [];
    const values = [];
    const records = require(`../../../config/${source}`);
    const len = term.length;
    let i = 0;
    for (const key of Object.keys(records)) {
        trace.log(records[key], term, len);
        if (records[key].includes(term)) {
            trace.log('match');
            labels.push(records[key]);
            values.push(key);
            if (i++ > limit) {
                break;
            }
        }
    }
    const names = [labels, values];
    trace.log('#58 ', names);
    //  return array
    return res.json(names);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9va3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Jpbi9zdWRzL2FwaS9sb29rdXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7eURBb0J5RDtBQUN6RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUM1QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFFdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLEdBQUc7SUFDdkMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDdkMsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQTtJQUMxQixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFBO0lBRW5DOzs7U0FHSztJQUNMLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUE7SUFDaEMsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFBO0lBQzdCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUE7SUFDMUIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNwQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBQ2xDOztTQUVLO0lBRUwsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFBO0lBQ2pCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTtJQUNqQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsbUJBQW1CLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFFcEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDVCxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDdEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ2xDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQixLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNoQixJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRTtnQkFBRSxNQUFLO2FBQUU7U0FDM0I7S0FDRjtJQUVELE1BQU0sS0FBSyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQzlCLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBRXhCLGdCQUFnQjtJQUNoQixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDeEIsQ0FBQyxDQUFBIn0=