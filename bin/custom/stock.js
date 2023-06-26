"use strict";
/**
 *
 *                            STOCK.JS
 *
 * Called by *pre* processing routines to update stock levels of a product.
 * Note that this is not realistic, as it assumes that once a product is ordered
 * it is in stock. It should take into account changes is purchase order status.
 * Not to mention part-delivery, returns and so on.  Intended as illustrative only.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
let suds = require('../../config/suds');
let db = require('../suds/db');
let trace = require('track-n-trace');
/** table name and the sales or purchase order data from the input form.
 * Note that the 'number ordered' column on both tables is called units. */
module.exports = async function (table, record) {
    let diff = 0;
    let old = {};
    let oldProduct = {};
    trace.log(record);
    /**  If this is an update, read the current version of the order line
     * and work out the difference between the old units and the new units. */
    if (record.id) {
        old = await db.getRow(table, record.id);
        trace.log(old);
        /** Assuming that the user hasn't changed the product */
        if (old.product == record.product) {
            diff = record.units - old.units;
        }
        else {
            oldProduct = await db.getRow('products', old.product);
            diff = record.units;
        }
    }
    else {
        diff = record.units;
    }
    trace.log(table, diff);
    /** Now update the stock level. */
    let product = await db.getRow('products', record.product);
    if (table == 'purchaseorderlines') {
        trace.log(product.stockLevel, diff);
        product.stockLevel += diff;
    }
    else {
        product.stockLevel -= diff;
    }
    await db.updateRow('products', product);
    /** changed product - reverse out previous levels.. */
    if (record.id && old.product != record.product) {
        if (table == 'purchaseorderines') {
            oldProduct.stockLevel -= diff;
        }
        else {
            oldProduct.stockLevel += diff;
        }
        await db.updateRow('products', oldProduct);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL2N1c3RvbS9zdG9jay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7Ozs7Ozs7OztHQVNHOztBQUVGLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3hDLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMvQixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFHdEM7MkVBQzJFO0FBQzNFLE1BQU0sQ0FBQyxPQUFPLEdBQUMsS0FBSyxXQUFVLEtBQUssRUFBQyxNQUFNO0lBRXJDLElBQUksSUFBSSxHQUFDLENBQUMsQ0FBQztJQUNYLElBQUksR0FBRyxHQUFDLEVBQUUsQ0FBQztJQUNYLElBQUksVUFBVSxHQUFDLEVBQUUsQ0FBQTtJQUNsQixLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xCOzhFQUMwRTtJQUMxRSxJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUc7UUFDWixHQUFHLEdBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNmLHdEQUF3RDtRQUN4RCxJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNuQyxJQUFJLEdBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1NBQzNCO2FBQ0k7WUFDRCxVQUFVLEdBQUUsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDcEQsSUFBSSxHQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7U0FDckI7S0FDSjtTQUNJO1FBQ0QsSUFBSSxHQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7S0FDckI7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsQ0FBQTtJQUVyQixrQ0FBa0M7SUFDbEMsSUFBSSxPQUFPLEdBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkQsSUFBSSxLQUFLLElBQUksb0JBQW9CLEVBQUU7UUFDL0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxVQUFVLElBQUUsSUFBSSxDQUFDO0tBQzVCO1NBQ0k7UUFDRixPQUFPLENBQUMsVUFBVSxJQUFFLElBQUksQ0FBQztLQUMzQjtJQUNELE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkMsc0RBQXNEO0lBQ3RELElBQUksTUFBTSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7UUFDNUMsSUFBSSxLQUFLLElBQUksbUJBQW1CLEVBQUU7WUFDOUIsVUFBVSxDQUFDLFVBQVUsSUFBRSxJQUFJLENBQUM7U0FDL0I7YUFDSTtZQUNELFVBQVUsQ0FBQyxVQUFVLElBQUUsSUFBSSxDQUFDO1NBQy9CO1FBQ0QsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBQyxVQUFVLENBQUMsQ0FBQztLQUU3QztBQUNKLENBQUMsQ0FBQSJ9