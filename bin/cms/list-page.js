"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    if (!suds || !suds[suds.dbDriver]) {
        console.log(`***************** System failure - cannot identify database *******`);
        await sendView(res, 'admin', `
      <H1>There has been a problem</h1>
      <h2>Serios error - restarting. Please try again in a few minutes</h2>
       <a href='/'>Home page</a>`);
        process.exit();
    }
    try {
        await pageprocess(req, res);
    }
    catch (err) {
        let dateStamp = new Date().toLocaleString();
        console.log(`
      
  ********************** Error ***************************
  ${dateStamp}`);
        console.log(err);
        console.log(`
  ********************************************************
      
      `);
        let msg = 'Error';
        let prog = 'The console log may have more details.';
        if (typeof err === 'string') {
            if (err.includes(':')) {
                [file, msg] = err.split(':');
                prog = `In source file ${file}.`;
            }
            else {
                msg = err;
            }
        }
        else {
            msg = err.message;
            if (msg.includes('::')) {
                [file, msg] = msg.split('::');
                prog = `In source file ${file}. The console log may have more details.`;
            }
        }
        await sendView(res, 'admin', `
      <H1>There has been a problem</h1>
      <h2>${msg}</h2>
      <p>${prog}</p>
      <a href='/'>Home page</a>`);
    }
};
async function pageprocess(req, res) {
    /* table and Fields used  */
    let table = suds[suds.dbDriver].pageFile;
    let headerTags = '';
    if (cms.headerTags) {
        headerTags = cms.headerTags;
    }
    let html = `<p>Page ${req.params[slug]}</p>`;
    let headline = '';
    let titleTag = '';
    let metaDescription = '';
    let slugValue = cms.homePage;
    if (req.params[slug]) {
        slugValue = req.params[slug];
    }
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
        if (pageData.titleTag) {
            titleTag = pageData.titleTag;
        }
        metaDescription = '';
        if (pageData.metaDescription) {
            metaDescription = `<meta name="description" content="${pageData.metaDescription}">`;
        }
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
            if (array[2]) {
                linkTarget = array[2];
            }
            let linkText = array[3];
            let linkPage = await db.getRow(table, linkSlug, slug);
            trace.log({ linkSlug: linkSlug, linkPage: linkPage });
            if (linkPage.err) {
                linkOK = false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9jbXMvbGlzdC1wYWdlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0E7Ozs7bURBSW1EO0FBQ25ELElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNyQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUM5QyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRCxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUN0QyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUN4QyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDL0IsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDNUMsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFHOUMsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7QUFDbkMsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7QUFDckMsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7QUFDckMsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFHL0IsU0FBUyxTQUFTLENBQUUsUUFBUTtJQUMxQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDakIsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxFQUFFO1FBQzNCLE9BQU8sR0FBRyx3REFBd0QsQ0FBQztLQUNwRTtJQUNELElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRTtRQUMzQixPQUFPLEdBQUcsK0NBQStDLENBQUM7S0FDM0Q7SUFDRCxJQUFJLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDcEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3JELElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLEVBQUU7UUFDaEQsT0FBTyxHQUFHLHVDQUF1QyxDQUFDO0tBQ25EO0lBQ0QsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsRUFBRTtRQUNoRCxPQUFPLEdBQUcsOEJBQThCLENBQUM7S0FDMUM7SUFDRCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBR0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLEdBQUc7SUFFdkMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxRUFBcUUsQ0FBQyxDQUFBO1FBQ2xGLE1BQU0sUUFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUU7OztpQ0FHQSxDQUFDLENBQUE7UUFDL0IsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFBO0tBQ2Q7SUFFRCxJQUFJO1FBQ0YsTUFBTSxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0tBQzVCO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixJQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQzNDLE9BQU8sQ0FBQyxHQUFHLENBQUM7OztJQUdaLFNBQVMsRUFBRSxDQUFDLENBQUE7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUM7OztPQUdULENBQUUsQ0FBQTtRQUNMLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQztRQUNsQixJQUFJLElBQUksR0FBRyx3Q0FBd0MsQ0FBQztRQUNwRCxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtZQUMzQixJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3JCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQzVCLElBQUksR0FBRyxrQkFBa0IsSUFBSSxHQUFHLENBQUE7YUFDakM7aUJBQ0k7Z0JBQ0gsR0FBRyxHQUFHLEdBQUcsQ0FBQzthQUNYO1NBQ0Y7YUFDSTtZQUNILEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFBO1lBQ2pCLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdEIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDN0IsSUFBSSxHQUFHLGtCQUFrQixJQUFJLDBDQUEwQyxDQUFBO2FBQ3hFO1NBQ0Y7UUFDRCxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFOztZQUVyQixHQUFHO1dBQ0osSUFBSTtnQ0FDaUIsQ0FBQyxDQUFBO0tBRTlCO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsS0FBSyxVQUFVLFdBQVcsQ0FBRSxHQUFHLEVBQUUsR0FBRztJQUNsQyw0QkFBNEI7SUFDNUIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUM7SUFDekMsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRTtRQUFFLFVBQVUsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFBO0tBQUU7SUFHbkQsSUFBSSxJQUFJLEdBQUcsV0FBVyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDN0MsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNsQixJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUM7SUFDekIsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztJQUM3QixJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFBRSxTQUFTLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUFFO0lBQ3RELEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckIsSUFBSSxRQUFRLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkQsSUFBSSxRQUFRLENBQUMsUUFBUSxJQUFJLEdBQUcsRUFBRTtRQUM1QixRQUFRLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDeEQ7SUFDRCxJQUFJLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNELEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFbEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ25CLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRTtRQUNoQixPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ2hCLElBQUksR0FBRyx3Q0FBd0MsQ0FBQztLQUNqRDtJQUNELElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsQyxJQUFJLE9BQU8sRUFBRTtRQUNYLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDaEIsSUFBSSxHQUFHLE1BQU0sT0FBTyxNQUFNLENBQUM7S0FDNUI7SUFFRCxJQUFJLE9BQU8sRUFBRTtRQUNYLElBQUksR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDO1FBQzVCLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDO1FBQzdCLGdIQUFnSDtRQUVoSCxRQUFRLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUMxQixJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUU7WUFBRSxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQTtTQUFFO1FBRXZELGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxRQUFRLENBQUMsZUFBZSxFQUFFO1lBQUUsZUFBZSxHQUFHLHFDQUFxQyxRQUFRLENBQUMsZUFBZSxJQUFJLENBQUE7U0FBRTtRQUVySCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUU7WUFDdkIsVUFBVSxJQUFJOztNQUVkLFFBQVEsQ0FBQyxVQUFVO3lEQUNnQyxDQUFDO1NBQ3JEO1FBQ0QsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLHFFQUFxRSxDQUFDLENBQUM7UUFDMUYsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQzFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQUUsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUFFO1lBQ3hDLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLFFBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN0RCxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hCLE1BQU0sR0FBRyxLQUFLLENBQUE7Z0JBQ2QsSUFBSSxPQUFPLEdBQUcsMkJBQTJCLENBQUM7Z0JBQzFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksUUFBUSxJQUFJLFVBQVUsSUFBSSxRQUFRLE1BQU0sRUFBRSxnQkFBZ0IsT0FBTyxLQUFLLFFBQVEsU0FBUyxDQUFDLENBQUM7YUFDMUg7aUJBQ0k7Z0JBQ0gsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNsQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxPQUFPLElBQUksRUFBRSxFQUFFO29CQUNqQixJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLFFBQVEsR0FBRyxFQUFFLGVBQWUsUUFBUSxHQUFHLENBQUMsQ0FBQztpQkFDdkU7cUJBQ0k7b0JBQ0gsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxRQUFRLElBQUksVUFBVSxJQUFJLFFBQVEsTUFBTSxFQUFFLGdCQUFnQixPQUFPLEtBQUssUUFBUSxTQUFTLENBQUMsQ0FBQztpQkFFMUg7YUFDRjtTQUVGO0tBQ0Y7SUFLRCxJQUFJLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFO1FBQ3hDLE1BQU0sRUFBRSxNQUFNO1FBQ2QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsUUFBUSxFQUFFLFFBQVE7UUFDbEIsZUFBZSxFQUFFLGVBQWU7UUFDaEMsSUFBSSxFQUFFLElBQUk7UUFDVixVQUFVLEVBQUUsVUFBVTtLQUN2QixDQUFDLENBQUM7SUFDSCxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xCLE9BQU87QUFHVCxDQUFDIn0=