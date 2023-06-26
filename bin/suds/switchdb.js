"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const sendView = require('./send-view');
const suds = require('../../config/suds');
const mergeAttributes = require('./merge-attributes'); // Standardises attributes for a table, filling in any missing values with defaults
const db = require('./db'); // Database routines
module.exports = async function (req, res) {
    const newdb = req.query.newdb;
    mergeAttributes('clear-cache');
    try {
        suds.dbDriver = newdb;
    }
    catch (err) {
        console.log(err);
        res.send(`Failed to connect to new database - 
    ${err}`);
    }
    await db.connect();
    res.send(`<p>Database switched to ${suds[newdb].friendlyName}. 
    <br />
    <a href="${suds.mainPage}">Administration page</a>
    <br />
    <a href="/">Home page</a>
    <br />
    <a href="/page/switchdb">Switch Database again</a>
    </p>`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvc3dpdGNoZGIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ3ZDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBLENBQUMsbUZBQW1GO0FBQ3pJLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQSxDQUFDLG9CQUFvQjtBQUUvQyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssV0FBVyxHQUFHLEVBQUUsR0FBRztJQUN2QyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQTtJQUM3QixlQUFlLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDOUIsSUFBSTtRQUNKLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFBO0tBQ3BCO0lBQ0QsT0FBTyxHQUFHLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2hCLEdBQUcsQ0FBQyxJQUFJLENBQUU7TUFDUixHQUFHLEVBQUUsQ0FBQyxDQUFBO0tBQ1Q7SUFDRCxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLDJCQUEyQixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsWUFBWTs7ZUFFL0MsSUFBSSxDQUFDLFFBQVE7Ozs7O1NBS25CLENBQUMsQ0FBQTtBQUNWLENBQUMsQ0FBQSJ9