
let suds = require('../../config/suds');
let db=require('../suds/db');
let trace = require('track-n-trace');

module.exports=async function(table,record)
 {
     let diff=0;
     let old={};
     let oldProduct={}
    trace.log(record);
    /**  If this is an update */
    if (record.id)  {
        old=await db.getRow(table,record.id);
        trace.log(old);
        /** same product */
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


