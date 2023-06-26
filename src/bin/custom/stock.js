
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

 let suds = require('../../config/suds');
 let db = require('../suds/db');
 let trace = require('track-n-trace');


/** table name and the sales or purchase order data from the input form. 
 * Note that the 'number ordered' column on both tables is called units. */
module.exports=async function(table,record)
 {
     let diff=0;
     let old={};
     let oldProduct={}
    trace.log(record);
    /**  If this is an update, read the current version of the order line 
     * and work out the difference between the old units and the new units. */
    if (record.id)  {
        old=await db.getRow(table,record.id);
        trace.log(old);
        /** Assuming that the user hasn't changed the product */
        if (old.product == record.product) {
        diff=record.units-old.units; 
        }
        else {
            oldProduct= await db.getRow('products',old.product);
            diff=record.units;
        }
    }
    else {
        diff=record.units;
    }
    trace.log(table,diff)

    /** Now update the stock level. */
    let product=await db.getRow('products',record.product);
    if (table == 'purchaseorderlines') {
        trace.log(product.stockLevel,diff);
        product.stockLevel+=diff;
    }
    else {
       product.stockLevel-=diff;
    }
    await db.updateRow('products',product);
    /** changed product - reverse out previous levels.. */
    if (record.id && old.product != record.product) {
        if (table == 'purchaseorderines') {
            oldProduct.stockLevel-=diff;
        }
        else {
            oldProduct.stockLevel+=diff;
        }
        await db.updateRow('products',oldProduct);
    
    }
 }


