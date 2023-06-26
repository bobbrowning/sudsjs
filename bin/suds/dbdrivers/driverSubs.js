"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const suds = require('../../../config/suds');
exports.rawAttributes = rawAttributes;
/**
 *
 * Quick attributes object without any processing
 * @param {string} table
 * @returns
 */
function rawAttributes(table) {
    const tableData = require('../../../tables/' + table);
    let standardHeader = {};
    if (tableData.standardHeader) {
        standardHeader = require('../../../config/standard-header')[suds[suds.dbDriver].standardHeader];
    }
    if (!tableData.attributes && tableData.properties) {
        tableData.attributes = tableData.properties;
    } // for compatibility with the JSON schema standard=
    const combined = { ...standardHeader, ...tableData.attributes };
    return (combined);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJpdmVyU3Vicy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iaW4vc3Vkcy9kYmRyaXZlcnMvZHJpdmVyU3Vicy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUV0QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUc1QyxPQUFPLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtBQUVyQzs7Ozs7R0FLRztBQUNILFNBQVMsYUFBYSxDQUFFLEtBQUs7SUFDM0IsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxDQUFBO0lBQ3JELElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQTtJQUN2QixJQUFJLFNBQVMsQ0FBQyxjQUFjLEVBQUU7UUFDNUIsY0FBYyxHQUFHLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUE7S0FDaEc7SUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsSUFBSSxTQUFTLENBQUMsVUFBVSxFQUFFO1FBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxTQUFTLENBQUMsVUFBVSxDQUFBO0tBQUMsQ0FBRSxtREFBbUQ7SUFDbkosTUFBTSxRQUFRLEdBQUcsRUFBRSxHQUFHLGNBQWMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtJQUMvRCxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDbkIsQ0FBQyJ9