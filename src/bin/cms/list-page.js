


/* ************************************************
*
* View a page from the webpages table.
*
************************************************ */
let trace = require('track-n-trace');
let classes = require('../../config/classes');
let lang = require('../../config/language')['EN'];
let cms = require('../../config/cms');
let suds = require('../../config/suds');
let db = require('../suds/db');
let sendView = require('../suds/send-view');
let createNavBar = require('./create-navbar');


const status = cms.pageFile.status;
const embargo = cms.pageFile.embargo;
const expires = cms.pageFile.expires;
const slug = cms.pageFile.slug;


function checkPage (pageData) {
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

  if (!suds || !suds[suds.dbDriver]) {
    console.log(`***************** System failure - cannot identify database *******`)
    await sendView(res, 'admin', `
      <H1>There has been a problem</h1>
      <h2>Serios error - restarting. Please try again in a few minutes</h2>
       <a href='/'>Home page</a>`)
   process.exit()
  }

  try {
    await pageprocess(req, res)
  } catch (err) {
    let dateStamp = new Date().toLocaleString()
    console.log(`
      
  ********************** Error ***************************
  ${dateStamp}`)
    console.log(err)
    console.log(`
  ********************************************************
      
      ` )
    let msg = 'Error';
    let prog = 'The console log may have more details.';
    if (typeof err === 'string') {
      if (err.includes(':')) {
        [file, msg] = err.split(':')
        prog = `In source file ${file}.`
      }
      else {
        msg = err;
      }
    }
    else {
      msg = err.message
      if (msg.includes('::')) {
        [file, msg] = msg.split('::')
        prog = `In source file ${file}. The console log may have more details.`
      }
    }
    await sendView(res, 'admin', `
      <H1>There has been a problem</h1>
      <h2>${msg}</h2>
      <p>${prog}</p>
      <a href='/'>Home page</a>`)

  }
}

async function pageprocess (req, res) {
  /* table and Fields used  */
  let table = suds[suds.dbDriver].pageFile;
  let headerTags = '';
  if (cms.headerTags) { headerTags = cms.headerTags }


  let html = `<p>Page ${req.params[slug]}</p>`;
  let headline = '';
  let titleTag = '';
  let metaDescription = '';
  let slugValue = cms.homePage;
  if (req.params[slug]) { slugValue = req.params[slug] }
  trace.log(slugValue);
  let pageData = await db.getRow(table, slugValue, slug);
  if (pageData.pagetype == 'R') {
    pageData = await db.getRow(table, pageData.targetPage);
  }
  let navbar = await createNavBar(pageData[cms.pageFile.id]);
  trace.log(navbar);

  let canView = true;
  if (pageData.err) {
    canView = false;
    html = `<p>Sorry that page does not exist,</p>`;
  }
  let toolTip = checkPage(pageData);
  if (toolTip) {
    canView = false;
    html = `<p>${toolTip}</p>`;
  }

  if (canView) {
    html = pageData.pageContent;
    headline = pageData.headline;
    /* Can be <a href="slug"> <a href="#slug"> <a href="http://slug"> <a href="http://slug" target="_blank">  etc */

    titleTag = pageData.title;
    if (pageData.titleTag) { titleTag = pageData.titleTag }

    metaDescription = '';
    if (pageData.metaDescription) { metaDescription = `<meta name="description" content="${pageData.metaDescription}">` }

    if (pageData.headerTags) {
      headerTags += `
    <!-- ------- Other tags for this page only ----- -->
    ${pageData.headerTags}
    <!-- ------------------------------------------- -->`;
    }
    let regex = RegExp('<a href="([a-zA-Z0-9-_]+)"( target="[a-zA-Z0-9-_]+"){0,1}>(.*?)</a>');
    let array = [];
    while ((array = regex.exec(html)) !== null) {
      trace.log(array);
      let linkOK = true;
      let linkSlug = array[1];
      let linkTarget = '';
      if (array[2]) { linkTarget = array[2]; }
      let linkText = array[3];
      let linkPage = await db.getRow(table, linkSlug, slug);
      trace.log({ linkSlug: linkSlug, linkPage: linkPage });
      if (linkPage.err) {
        linkOK = false
        let toolTip = 'Link to non-existant page';
        html = html.replace(`<a href="${linkSlug}"${linkTarget}>${linkText}</a>`, `<span title="${toolTip}">${linkText}</span>`);
      }
      else {
        let toolTip = checkPage(linkPage);
        trace.log(toolTip, linkSlug);
        if (toolTip == '') {
          html = html.replace(`href="${linkSlug}"`, `href="/page/${linkSlug}"`);
        }
        else {
          html = html.replace(`<a href="${linkSlug}"${linkTarget}>${linkText}</a>`, `<span title="${toolTip}">${linkText}</span>`);

        }
      }

    }
  }




  let result = await sendView(res, 'pages', {
    navbar: navbar,
    headline: headline,
    titletag: titleTag,
    metadescription: metaDescription,
    body: html,
    headertags: headerTags
  });
  trace.log(result);
  return;


}
