"use strict";
/**
 *
 *       Create Navbar
 *
 * This module creates the navigation in the starter content
 * management system. It is only single-level but some draft code
 * is there for multi-level.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
let trace = require('track-n-trace');
let classes = require('../../config/classes')['navbar'];
let lang = require('../../config/language')['EN'];
let cms = require('../../config/cms');
let suds = require('../../config/suds');
let db = require('../suds/db');
let tableDataFunction = require('../suds/table-data');
let loopcount = 0;
/** Create class tag */
function classtag(code) {
    let result = '';
    if (classes[code]) {
        result = ` class="${classes[code]}"`;
    }
    return result;
}
/** Not used */
async function nextMultiLevel(table, tableData, id, thisId, slug, title) {
    /*  experimental */
    trace.log('nextLevel', id);
    if (loopcount++ > 5) {
        return '';
    }
    let result = `
        <ul ${classtag(sub)} aria-labelledby="navbarDrop${id}">`;
    let next = await db.getRows(table, {
        andor: 'and',
        searches: [
            ['parent', 'eq', id],
            ['onMenu', 'gt', 0],
        ],
        sort: ['onMenu', 'ASC'],
    });
    trace.log(next);
    for (let i = 0; i < next.length; i++) {
        let title = next[i][cms.pageFile.title];
        let id = next[i][tableData.primaryKey];
        let slug = next[i][cms.pageFile.slug];
        let active = '';
        let current = '';
        if (id == thisId) {
            active = 'active';
            current = 'aria=current="page"';
        }
        let count = await db.countRows(table, {
            andor: 'and',
            searches: [
                ['parent', 'eq', id],
                ['onMenu', 'gt', 0],
            ]
        });
        trace.log(count);
        if (count) {
            result += `
          <li ${classes.subitemdrop}>
            <a href="/page/${slug}" ${classtag(sublink)}" ${current}>${title}</a>`;
            result += await nextLevel(table, tableData, id, thisId, slug, title);
        }
        else {
            result += `
          <li ${classes.subitem}>
            <a href="/page/${slug}" ${classtag(sublink, active)} >${title}</a>`;
        }
        result += `
          </li>`;
    }
    result += `
        </ul>`;
    return result;
}
async function nextLevel(table, tableData, id, thisId, slug, title) {
    trace.log('nextLevel', id, thisId);
    /* aria-labelledby="navbarDrop${id}" */
    let result = `
        <div${classtag('sub')}>`;
    let next = await db.getRows(table, {
        andor: 'and',
        searches: [
            ['parent', 'eq', id],
            ['onMenu', 'gt', 0],
        ],
        sort: ['onMenu', 'ASC'],
    });
    trace.log(next);
    for (let i = 0; i < next.length; i++) {
        let title = next[i][cms.pageFile.title];
        let id = next[i][tableData.primaryKey];
        let slug = next[i][cms.pageFile.slug];
        let active = '';
        let current = '';
        if (id == thisId) {
            active = ' active';
            current = 'aria=current="page"';
        }
        result += `
       <a href="/page/${slug}"${classtag('sublink', 'active')} >${title}</a>`;
    }
    result += `
        </div>`;
    return result;
}
/**
 * thisId is the page that we are currently on
 */
module.exports = async function (thisId) {
    let navbar = `
    <ul${classtag('top')}>`;
    let table = suds[suds.dbDriver].pageFile;
    let tableData = tableDataFunction(table, '#superuser#');
    trace.log(table, cms.homePage);
    let home = await db.getRow(table, cms.homePage, 'slug');
    let homeId = home[tableData.primaryKey];
    trace.log(homeId);
    /** Find the top level pages */
    let top = await db.getRows(table, {
        andor: 'and',
        searches: [
            ['parent', 'eq', homeId],
            ['onMenu', 'gt', 0],
        ],
        sort: ['onMenu', 'ASC'],
    });
    trace.log(top);
    /**  Loop though top level pages */
    for (let i = 0; i < top.length; i++) {
        let title = top[i][cms.pageFile.title];
        let id = top[i][tableData.primaryKey];
        let slug = top[i][cms.pageFile.slug];
        trace.log(title, id, slug);
        let active = '';
        let current = '';
        if (id == thisId) {
            active = ' active';
            current = 'aria-current="page"';
        }
        /** how ,any pages below this page */
        let count = await db.countRows(table, {
            andor: 'and',
            searches: [
                ['parent', 'eq', id],
                ['onMenu', 'gt', 0],
            ]
        });
        trace.log(count);
        if (count) {
            navbar += `
      <li${classtag('topitemdrop')}>
        <a href="/page/${slug}"${classtag('droplink')}>${title}</a>`;
            navbar += await nextLevel(table, tableData, id, thisId, slug, title);
        }
        else {
            navbar += `
      <li${classtag('topitem')}>
        <a href='/page/${slug}' ${classtag('link', 'active')} ${current}>${title}</a>`;
        }
        navbar += `
      </li>`;
    }
    navbar += `
    </ul>`;
    trace.log(navbar);
    return (navbar);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLW5hdmJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vY21zL2NyZWF0ZS1uYXZiYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7Ozs7OztHQVFHOztBQUlILElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNyQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4RCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRCxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUN0QyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUN4QyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDL0IsSUFBSSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUV0RCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsdUJBQXVCO0FBQ3ZCLFNBQVMsUUFBUSxDQUFDLElBQUk7SUFDcEIsSUFBSSxNQUFNLEdBQUMsRUFBRSxDQUFDO0lBQ2QsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFBQyxNQUFNLEdBQUMsV0FBVyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQTtLQUFDO0lBQ3ZELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFDRCxlQUFlO0FBQ2YsS0FBSyxVQUFVLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUs7SUFDckUsbUJBQW1CO0lBQ25CLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzNCLElBQUksU0FB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