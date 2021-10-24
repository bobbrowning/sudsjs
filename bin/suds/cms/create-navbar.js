
let trace = require('track-n-trace');
let classes = require('../../../config/classes')['navbar'];
let lang = require('../../../config/language')['EN'];
let suds = require('../../../config/suds');
let db = require('../db');
let tableDataFunction = require('../table-data');

let loopcount = 0;

function classtag(code) {
  let result='';
  if (classes[code]) {result=` class="${classes[code]}"`}
  return result;
}
/** Not used */
async function nextMultiLevel(table, tableData, id, thisId, slug, title) {
  /*  experimental */
  trace.log('nextLevel', id);
  if (loopcount++ > 5) { return '' }
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
    let title = next[i][suds.pageFile.title];
    let id = next[i][tableData.primaryKey];
    let slug = next[i][suds.pageFile.slug];
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
  trace.log('nextLevel', id,thisId);
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
    let title = next[i][suds.pageFile.title];
    let id = next[i][tableData.primaryKey];
    let slug = next[i][suds.pageFile.slug];
    let active = '';
    let current = '';
    if (id == thisId) {
      active = ' active';
      current = 'aria=current="page"';
    }
    result+=`
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
  let table = suds.pageFile.table;
  tableData = tableDataFunction(table, '#superuser#');
  trace.log(table, suds.homePage)
  let home = await db.getRow(table, suds.homePage, 'slug');
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
    let title = top[i][suds.pageFile.title];
    let id = top[i][tableData.primaryKey];
    let slug = top[i][suds.pageFile.slug];
    trace.log(title,id,slug);
    let active = '';
    let current = '';
    if (id == thisId) {
      active = ' active'
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

}