"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
exports.searchLink = searchLink;
exports.getAttribute = getAttribute;
/**
 * Gets attribute of field given qualified name;
 * @param {string} field
 * @param {object} attr
 * @returns
 */
function getAttribute(field, attr) {
    trace.log(field, Object.keys(attr));
    if (field.includes('.')) {
        const top = field.split('.')[0];
        const rest = field.replace(top + '.', '');
        return getAttribute(rest, attr[top].object);
    }
    else {
        trace.log(attr[field]);
        return attr[field];
    }
}
/**
 * Creates search link
 * @param {object} attributes
 * @param {array} searchSpec
 * @returns
 */
function searchLink(attributes, searchSpec) {
    trace.log(arguments);
    const searches = searchSpec.searches;
    for (let i = 0; i < searches.length; i++) {
        trace.log(i, searches[i]);
        const searchField = searches[i][0];
        if (!searchField) {
            throw new Error(`No search field `);
        }
        const attribute = getAttribute(searchField, attributes);
        if (!attribute) {
            throw new Error(`Unknown search field ${searchField}`);
        }
        let value = searches[i][2];
        trace.log(searchField);
        let today;
        if (value && typeof value === 'string' && value.substring(0, 6) == '#today') {
            today = new Date();
            searches[i][2] = value = today.toISOString().split('T')[0];
        }
        if (attribute.type == 'number') {
            if (attribute.input.type == 'date') {
                searches[i][2] = Date.parse(value);
            }
            else {
                searches[i][2] = Number(value);
            }
        }
        if (attribute.type == 'boolean') {
            if (searches[i][2] == 'true') {
                searches[i][2] = true;
            }
            if (searches[i][2] == 'false') {
                searches[i][2] = false;
            }
        }
    }
    trace.log(searches);
    return (searches);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLWxpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvc2VhcmNoLWxpbmsuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDL0IsT0FBTyxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUE7QUFFbkM7Ozs7O0dBS0c7QUFDSCxTQUFTLFlBQVksQ0FBRSxLQUFLLEVBQUUsSUFBSTtJQUNoQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDbkMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ3ZCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDL0IsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ3pDLE9BQU8sWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDNUM7U0FBTTtRQUNMLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7UUFDdEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDbkI7QUFDSCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLFVBQVUsQ0FBRSxVQUFVLEVBQUUsVUFBVTtJQUN6QyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBRXBCLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUE7SUFDcEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDeEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUE7U0FBRTtRQUN6RCxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQ3ZELElBQUksQ0FBQyxTQUFTLEVBQUU7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixXQUFXLEVBQUUsQ0FBQyxDQUFBO1NBQUU7UUFDMUUsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzFCLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDdEIsSUFBSSxLQUFLLENBQUE7UUFDVCxJQUFJLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFO1lBQzNFLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFBO1lBQ2xCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUMzRDtRQUVELElBQUksU0FBUyxDQUFDLElBQUksSUFBSSxRQUFRLEVBQUU7WUFDOUIsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxNQUFNLEVBQUU7Z0JBQ2xDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO2FBQ25DO2lCQUFNO2dCQUNMLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDL0I7U0FDRjtRQUNELElBQUksU0FBUyxDQUFDLElBQUksSUFBSSxTQUFTLEVBQUU7WUFDL0IsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxFQUFFO2dCQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7YUFBRTtZQUN2RCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEVBQUU7Z0JBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTthQUFFO1NBQzFEO0tBQ0Y7SUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ25CLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNuQixDQUFDIn0=