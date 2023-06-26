"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (tableData, attributes) {
    // merge extra attributes with attributes
    const trace = require('track-n-trace');
    trace.log({ inputs: arguments, level: 'verbose' });
    const fieldList = Object.keys(attributes);
    const assigned = {};
    const groupLookup = {};
    if (!tableData.groups) {
        tableData.groups = { other: { columns: fieldList } };
    }
    if (!tableData.groups.other) {
        tableData.groups.other = { columns: [] };
    }
    if (!tableData.groups.other.columns) {
        tableData.groups.other.columns = [];
    }
    trace.log(tableData.groups, { level: 'verbose' });
    for (const group of Object.keys(tableData.groups)) {
        trace.log(group, { level: 'verbose' });
        if (tableData.groups[group].columns) {
            for (const key of tableData.groups[group].columns) {
                groupLookup[key] = group;
                assigned[key] = true;
            }
        }
    }
    for (const key of fieldList) {
        if (!assigned[key]) {
            tableData.groups.other.columns.push(key);
            groupLookup[key] = 'other';
        }
    }
    trace.log(groupLookup, { level: 'verbose' });
    return (groupLookup);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52ZXJ0LWdyb3Vwcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9pbnZlcnQtZ3JvdXBzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLFNBQVMsRUFBRSxVQUFVO0lBQzlDLHlDQUF5QztJQUMxQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDckMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFDbEQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUN6QyxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUE7SUFDbkIsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFBO0lBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO1FBQ3JCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQTtLQUNyRDtJQUNELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtRQUMzQixTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQTtLQUN6QztJQUNELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7UUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFBO0tBQUU7SUFDNUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFDakQsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNqRCxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO1FBQ3RDLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUU7WUFDbkMsS0FBSyxNQUFNLEdBQUcsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRTtnQkFDakQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQTtnQkFDeEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQTthQUNyQjtTQUNGO0tBQ0Y7SUFDRCxLQUFLLE1BQU0sR0FBRyxJQUFJLFNBQVMsRUFBRTtRQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2xCLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDeEMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQTtTQUMzQjtLQUNGO0lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUM1QyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDdEIsQ0FBQyxDQUFBIn0=