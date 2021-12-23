

   let db = require('../suds/db.js')
   let suds = require('../../config/suds');



/** ************************************************
 * This module is used whenver a user record is listed. 
 * It reads the last sale with that user .
 ***************************************************** */

module.exports=  async function (record) {
 
 /** Read the most recent sale for this user in the contacts file 
  * This will be stored in last[0] = the first (and only row) read 
  * There must be at least one contact or this function would not havebeen called.
  * However we shouldcheck anyway
  * . 
  * 
  * */
    let last = await db.getRows(
     'salesorders',                                 // The table 
     {searches: [['customer', 'eq', record.id]]},    // Which records to select
     0,                                          // Skip (not applicable)
     1,                                          // Number of rows to supply
     'date',                                     // Sorted by
     'DESC'                                      // sort order
   );

    /** Store the beginning of the date of the contact,
     * The next action and the first 40 characters of the next action 
     * if there is one*/
   let date = new Date(last[0].date).toString().substring(0,16);
   formatter = new Intl.NumberFormat(
    suds.currency.locale,
    {
      style: 'currency',
      currency: suds.currency.currency,
      minimumFractionDigits: suds.currency.digits,
    })
  value = formatter.format(last[0].totalValue);

    /** Create the html to show. */
   return (`<br />
   Last sale: <a href="/admin?table=salesorders&id=${last[0].id}&mode=listrow">
     ${date}  ${value}
   </a>
    `);
}