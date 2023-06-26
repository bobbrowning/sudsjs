"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** ************************************************
 * This module is used whenver a user record is listed.
 * It reads the last contact with that user and the next action required
 * for display on the screen.
 ***************************************************** */
let trace = require('track-n-trace');
let suds = require('../../config/suds');
let db = require('../suds/db');
module.exports = async function (record) {
    /** Read the most recent contact for this user in the contacts file
     * This will be stored in last[0] = the first (and only row) read
     * There must be at least one contact or this function would not havebeen called.
     * However we shouldcheck anyway
     * .
     *
     * */
    let last = await db.getRows('contacts', // The table 
    { searches: [['user', 'eq', record.id]] }, // Which records to select
    0, // Skip (not applicable)
    1, // Number of rows to supply
    'date', // Sorted by
    'DESC' // sort order
    );
    trace.log({ last: last });
    if (!last.length) {
        return '';
    }
    /** Store the beginning of the date of the contact,
     * The next action and the first 40 characters of the next action
     * if there is one*/
    let date = new Date(last[0].date).toString().substring(0, 16);
    let next = 'No action due';
    let nextdate = '';
    if (last[0].nextActionDate != '') {
        nextdate = new Date(last[0].nextActionDate).toString().substring(0, 16);
        next = last[0].nextAction.substring(0, 40) + ' ...';
    }
    /** Create the html to show. */
    return (`<br />
   Last contact: <a href="/admin?table=contacts&id=${last[0].id}&mode=listrow">
     ${date}
   </a>
   <br />
   Next action due: ${nextdate} ${next}
   `);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFzdC1jb250YWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9jdXN0b20vbGFzdC1jb250YWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0E7Ozs7eURBSXlEO0FBQ3hELElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNyQyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUN4QyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDaEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLFdBQVcsTUFBTTtJQUV0Qzs7Ozs7O1NBTUs7SUFDRixJQUFJLElBQUksR0FBRyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQzFCLFVBQVUsRUFBa0MsYUFBYTtJQUN6RCxFQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBQyxFQUFLLDBCQUEwQjtJQUN0RSxDQUFDLEVBQTJDLHdCQUF3QjtJQUNwRSxDQUFDLEVBQTJDLDJCQUEyQjtJQUN2RSxNQUFNLEVBQXNDLFlBQVk7SUFDeEQsTUFBTSxDQUFzQyxhQUFhO0tBQzFELENBQUM7SUFFRixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7SUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFBQyxPQUFPLEVBQUUsQ0FBQTtLQUFDO0lBQzVCOzt3QkFFb0I7SUFDckIsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0QsSUFBSSxJQUFJLEdBQUcsZUFBZSxDQUFDO0lBQzNCLElBQUksUUFBUSxHQUFDLEVBQUUsQ0FBQztJQUNoQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLElBQUksRUFBRSxFQUFFO1FBQ2hDLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsQ0FBQztRQUN2RSxJQUFJLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQztLQUNuRDtJQUVELCtCQUErQjtJQUMvQixPQUFPLENBQUM7cURBQzBDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO09BQ3hELElBQUk7OztzQkFHVyxRQUFRLElBQUksSUFBSTtJQUNsQyxDQUFDLENBQUM7QUFFTixDQUFDLENBQUEifQ==