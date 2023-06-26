"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../config/suds');
const lookup = require('./lookup');
const tableDataFunction = require('./table-data');
const lang = require('../../config/language').EN;
const trace = require('track-n-trace');
const db = require('./db');
const friendlyName = 'Format field data';
const description = `For many types of field, this routine simply returns the 
value of the field. Dates, currency etc fields are formatted. If it is a 
foreign key it looks up the linked record and uses the rowTitle function 
for that table. If there is none, then just returns the value 
of the field. File upload fields have a link to the uploaded file.`;
module.exports = displayField;
async function displayField(attributes, value, children, permission, parent) {
    if (arguments[0] == suds.documentation) {
        return ({ friendlyName, description });
    }
    trace.log({ arguments, break: '*' });
    let display = '';
    /** If the item is an object we navigate through the structure  by
     * calling the funtion recurively.
     */
    if (attributes.type == 'object') {
        /** If a top-level object is also an array (i.e. an array of objects).
         *  If a stringify function/field is given for the object, then
         * then list one line for each item which is obtained by the stringify
         * function/item for the object with 'more...to expand
         */
        if (attributes.array && Array.isArray(value)) {
            trace.log(value);
            display += '<ol>';
            for (let i = 0; i < value.length; i++) {
                display += '<li>';
                let disp = 'inline';
                const unique = Math.random();
                if (attributes.stringify) {
                    disp = 'none';
                    display += `
          <span onclick="document.getElementById('${unique}_${attributes.key}_${i}').style.display='inline'">`;
                    if (typeof attributes.stringify === 'function') {
                        display += await attributes.stringify(value[i]);
                    }
                    else {
                        display += value[i][attributes.stringify];
                    }
                    display += ` <span class="text-primary" style="cursor: pointer; "> more...</span>
          </span>`;
                }
                display += `
        <div id="${unique}_${attributes.key}_${i}"  style="display:${disp}">`;
                display += await displayField(attributes, value[i], children, permission, parent);
                display += `
        </div>
        </li>`;
            }
            display += '</ol>';
            trace.log(display);
            return display;
        }
        /** Otherwise work your way through the object */
        else {
            trace.log('descending one level', Object.keys(attributes.object), value);
            if (!value) {
                return '';
            }
            display = '<ul>';
            for (const key of Object.keys(attributes.object)) {
                trace.log('next at level', key, value);
                let item = 'No value';
                if (value[key]) {
                    item = await displayField(attributes.object[key], value[key], children, permission, parent);
                }
                display += `<li>${attributes.object[key].friendlyName}: ${item}</li>`;
                trace.log(display);
            }
            display += '</ul>';
            trace.log(display);
            return (display);
        }
    }
    else {
        display = await displayItem(attributes, value, children, permission);
        trace.log(display);
        return display;
    }
    async function displayItem(attributes, value, children, permission) {
        trace.log({ item: attributes.qualifiedName, value });
        let display = value; // default do nothing
        /** Boolean  */
        if (attributes.type == 'boolean') {
            if (value) {
                return (lang.true);
            }
            else {
                return (lang.false);
            }
        }
        /** Null value */
        if (attributes.model && !value) {
            return (lang.notSpecified);
        }
        /** Otherwise empty return blank */
        if (!value && !attributes.collection)
            return ('');
        /** This is not a real field on the database, but identifies a child column */
        trace.log(attributes.collection, children, value);
        if (attributes.collection) {
            let num = children;
            if (num == 0) {
                num = lang.no;
            }
            if (num > suds.pageLength) {
                num = `${lang.moreThan} ${suds.pageLength}`;
            }
            if (children == 1) {
                display = `${lang.thereIs} ${num} ${attributes.friendlyName} ${lang.row}`;
            }
            else {
                display = `${lang.thereAre} ${num} ${attributes.friendlyName} ${lang.rows}`;
            }
            return (display);
        }
        /** Some display types have a special routine to display it.
         * The helper routine is stores in bin/suds/display   */
        let helper;
        trace.log({ value, type: attributes.type, displaytype: attributes.display.type });
        /** Date  */
        trace.log({ value, type: attributes.type, displaytype: attributes.display.type });
        if (attributes.display.type == 'date') {
            const date = new Date(value);
            display = date.toDateString();
            return (display);
        }
        if (attributes.display.type == 'html') {
            return (encodeURI(value));
        }
        /** Date / time  */
        if (attributes.display.type == 'color' && value) {
            display = `<span style="background-color: ${value}">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>`;
            return (display);
        }
        /** Date / time  */
        if (attributes.display.type == 'datetime') {
            const date = new Date(value);
            display = date.toString();
            return (display);
        }
        if (attributes.display.type) {
            trace.log('./display/' + attributes.display.type);
            try {
                helper = require('./display/' + attributes.display.type);
            }
            catch (err) {
                throw new Error(`display-field.js::Cannot load display helper for type: ${attributes.display.type}, field ${attributes.friendlyName}`);
            }
            if (helper) {
                trace.log('using helper', attributes.display.type, value);
                return (await helper(attributes, value));
            }
        }
        trace.log({ name: attributes.friendlyName, value, process: attributes.process });
        if ((attributes.process && attributes.process.JSON) || (attributes.array && attributes.array.type != 'object')) {
            let data;
            if (attributes.process && attributes.process.JSON) {
                data = JSON.parse(value);
            }
            else {
                data = value;
            }
            trace.log({ value, data });
            let display = value;
            if (Array.isArray(data)) {
                display = '<ol>';
                for (let i = 0; i < data.length; i++) {
                    let key = data[i];
                    trace.log(key);
                    const lookedup = await lookup(attributes, key);
                    trace.log(lookedup);
                    display += `
          <li>
          ${lookedup}
          </li>`;
                }
                display += '</ol>';
            }
            else {
                display = '';
                for (const key of Object.keys(data)) {
                    display += `${key}:  ${JSON.stringify(data[key])}<br />`;
                }
            }
            return (display);
        }
        /** File upload */
        trace.log({ attributes, maxdepth: 2 });
        trace.log({ value, type: attributes.type });
        if (attributes.input && attributes.input.type == 'uploadFile') {
            display = '';
            if (attributes.display.type == 'image') {
                let width = '100px';
                if (attributes.display.width) {
                    width = attributes.display.width;
                }
                display = `<a href="/uploads/${value}" target="_blank"><img src="/uploads/${value}" style="width: ${width};"></a>&nbsp;`;
            }
            display += `<a href="/uploads/${value}" target="_blank">${value}</a>`;
            return (display);
        }
        /** Currency */
        trace.log({ value, type: attributes.type, displaytype: attributes.display.type });
        if (attributes.display && attributes.display.currency) {
            const formatter = new Intl.NumberFormat(suds.currency.locale, {
                style: 'currency',
                currency: suds.currency.currency,
                minimumFractionDigits: suds.currency.digits
            });
            display = formatter.format(value);
            return (display);
        }
        /** Show asterisks */
        if (attributes.display.type == 'asterisks') {
            return ('*********************');
        }
        /** The field is a key to another table.  */
        trace.log({ value, model: attributes.model });
        if (attributes.model) {
            const look = await lookup(attributes, value);
            trace.log(look);
            return look;
        }
        ;
        /** There are values in the table definition to look up. */
        if (attributes.values) {
            const item = await lookup(attributes, value);
            trace.log(attributes.qualifiedName, value);
            return item;
        }
        ;
        return (display);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcGxheS1maWVsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9kaXNwbGF5LWZpZWxkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ2xDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2pELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUNoRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBRTFCLE1BQU0sWUFBWSxHQUFHLG1CQUFtQixDQUFBO0FBQ3hDLE1BQU0sV0FBVyxHQUFHOzs7O21FQUkrQyxDQUFBO0FBRW5FLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFBO0FBRTdCLEtBQUssVUFBVSxZQUFZLENBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU07SUFDMUUsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtRQUFFLE9BQU8sQ0FBQyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFBO0tBQUU7SUFDbEYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUNwQyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFFaEI7O09BRUc7SUFDSCxJQUFJLFVBQVUsQ0FBQyxJQUFJLElBQUksUUFBUSxFQUFFO1FBQy9COzs7O1dBSUc7UUFDSCxJQUFJLFVBQVUsQ0FBQyxLQUFL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