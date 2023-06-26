"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../config/suds');
const trace = require('track-n-trace');
const mergeAttributes = require('./merge-attributes');
const tableDataFunction = require('./table-data');
const db = require('./db');
const fs = require('fs');
module.exports = async function (permission, table, id) {
    trace.log({ inputs: arguments, break: '#', level: 'min' });
    /* ************************************************
      *
      *   set up the data
      *
      ************************************************ */
    const tableData = tableDataFunction(table, permission);
    const attributes = await mergeAttributes(table, permission); // Merge field attributes in model with config.suds tables
    trace.log({ attributes, level: 'verbose' });
    const record = await db.getRow(table, id); // populate record from database
    if (record.err) {
        return (`<h1>Unexpected error ${record.errmsg}/h1>`);
    }
    for (const key of Object.keys(record)) {
        if (attributes[key] && attributes[key].process && attributes[key].process.uploadFile && record[key]) {
            let rootdir = __dirname;
            rootdir = rootdir.replace('/bin/suds', '');
            try {
                fs.unlinkSync(`${rootdir}/public/uploads/${record[key]}`);
                console.log(`successfully deleted ${rootdir}/public/uploads/${record[key]}`);
            }
            catch (err) {
                console.log(`Can't delete ${rootdir}/public/uploads/${record[key]}`);
            }
        }
    }
    trace.log(permission, table, id);
    let output = await db.deleteRow(permission, table, id);
    if (tableData.edit.postProcess) {
        await tableData.edit.postProcess(record, 'delete');
    }
    const footnote = 'Row deleted';
    return ({ output, footnote });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLXJvdy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9kZWxldGUtcm93LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDekMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3JELE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2pELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUMxQixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFFeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLFdBQVcsVUFBVSxFQUFFLEtBQUssRUFBRSxFQUFFO0lBQ3BELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7SUFFMUQ7Ozs7eURBSXFEO0lBRXJELE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUN0RCxNQUFNLFVBQVUsR0FBRyxNQUFNLGVBQWUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUEsQ0FBQywwREFBMEQ7SUFDdEgsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUMzQyxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFBLENBQUMsZ0NBQWdDO0lBQzFFLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRTtRQUNkLE9BQU8sQ0FBQyx3QkFBd0IsTUFBTSxDQUFDLE1BQU0sTUFBTSxDQUFDLENBQUE7S0FDckQ7SUFDRCxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDckMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUssVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDcEcsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFBO1lBQ3ZCLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUMxQyxJQUFJO2dCQUNGLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxPQUFPLG1CQUFtQixNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUN6RCxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixPQUFPLG1CQUFtQixNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO2FBQzdFO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsT0FBTyxtQkFBbUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTthQUNyRTtTQUNGO0tBQ0Y7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFDbEIsS0FBSyxFQUNMLEVBQUUsQ0FDSCxDQUFBO0lBQ0QsSUFBSSxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUM3QixVQUFVLEVBQ1YsS0FBSyxFQUNMLEVBQUUsQ0FDSCxDQUFBO0lBRUQsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUFFLE1BQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQUU7SUFFdEYsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFBO0lBQzlCLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO0FBQy9CLENBQUMsQ0FBQSJ9