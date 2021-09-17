/* ************************************************
*
* View a page from the webpages table.
*
************************************************ */
let trace = require('track-n-trace');
let classes = require('../../config/classes');
let lang = require('../../config/language')['EN'];
let suds = require('../../config/suds');
let db = require('./db');
let sendView = require('./send-view');
let createNavBar=require('./create-navbar');

const table=suds.pageFile.table;
  const status=suds.pageFile.status;
  const embargo=suds.pageFile.embargo;
  const expires=suds.pageFile.expires;
  const slug=suds.pageFile.slug;


function checkPage(pageData) {
  let toolTip = '';
  if (pageData[status] == 'D') {
    toolTip = 'Sorry that page is not yet available. Please try later';
  }
  if (pageData[status] == 'H') {
    toolTip = 'Sorry that page is not available at this time';
  }
  let iso = new Date().toISOString().substring(0, 10);
  trace.log(iso, pageData[embargo], pageData[expires]);
  if (pageData[embargo] && pageData[embargo] > iso) {
    toolTip = 'Sorry that page is not available yet.';
  }
  if (pageData[expires] && pageData[expires] < iso) {
    toolTip = 'Sorry that page has expired.';
  }
  return toolTip;
}


module.exports = async function (req, res) {

  /* table and Fields used  */
  


  let html = `<p>Page ${req.params[slug]}</p>`;
  let headline='';

  let slugValue = suds.homePage;
  if (req.params[slug]) { slugValue = req.params[slug] }
  trace.log(slugValue);
  pageData = await db.getRow(table, slugValue, slug);
  let navbar=await createNavBar(pageData[suds.pageFile.id]);
  trace.log(navbar);

  let canView = true;
  if (pageData.err) {
    canView = false;
    html = `<p>Sorry that page does not exist,</p>`;
  }
  toolTip = checkPage(pageData);
  if (toolTip) {
    canView = false;
    html = `<p>${toolTip}</p>`;
  }
  
  if (canView) {
    html = pageData.pageContent;
    headline=pageData.headline;
    /* Can be <a href="slug"> <a href="#slug"> <a href="http://slug"> <a href="http://slug" target="_blank">  etc */

    let regex = RegExp('<a href="#([a-zA-Z0-9-_]+)"( target="[a-zA-Z0-9-_]+"){0,1}>(.*?)</a>');
    let array = [];
    while ((array = regex.exec(html)) !== null) {
      trace.log(array);
      let linkOK = true;
      let toolTip = '';
      let linkSlug = array[1];
      let linkTarget = '';
      if (array[2]) { linkTarget = array[2]; }
      let linkText = array[3];
      let linkPage = await db.getRow(table, linkSlug, slug);
      trace.log(linkPage);
      if (linkPage.err) {
        linkOK = false
        html = html.replace(`<a href="#${linkSlug}"${linkTarget}>${linkText}</a>`, `<a class="" href="#${linkSlug}"${linkTarget}>${linkText}</a>`);
      }
      else {
         let toolTip=checkPage(linkPage);
         trace.log(toolTip,linkSlug);
        if (toolTip == '') {
          html = html.replace(`href="#${linkSlug}"`, `href="/page/${linkSlug}"`);
        }
        else {
          html = html.replace(`<a href="#${linkSlug}"${linkTarget}>${linkText}</a>`, `<span title="${toolTip}">${linkText}</span>`);

        }
      }

    }
  }

  


  let result = await sendView(res, 'pages', {navbar: navbar, headline: headline, body: html});
  trace.log(result);
  return;


}
