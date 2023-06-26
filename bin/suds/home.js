"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* ***********************************************
*
*  Home page for the SUDS system. The conent is controlled
*  by config.suds
*
*  Output is in sections. Each section has
*   - optionally an image
*   - a heading
*   - optionally some explanitory text
*   - a list of links to file maintenance pages
*     or any url.
*
*  Appearance will be determined by styles set in the
*  layout.
*
************************************************  */
const trace = require('track-n-trace');
const suds = require('../../config/suds');
const mergeAttributes = require('./merge-attributes');
const hasPermission = require('./has-permission');
const db = require('./db');
const fs = require('fs');
const { databases } = require('../../config/suds');
module.exports = async function (req, permission) {
    trace.log('SUDS Home page', { break: '#', level: 'min' }); // Distinctive break on trace
    //  Get data
    const lang = req.app.locals.language.EN; // Contains text used in headings etc.
    const home = require(`../../config/${suds[suds.dbDriver].homepage}`);
    // const home = req.app.locals.home;
    const mainPage = req.app.locals.suds.mainPage; // suds.js - home object
    let output = ''; // page content assembled here
    trace.log({
        permission
    });
    // Validate that suds.js basics have been set up
    if (!home) {
        console.log('home object needed in suds.js');
        return ('<h1>Unexpected error 1/h1>');
    }
    // Main Heading
    output = `
              <H1></H1>`;
    // loop through sections
    for (const section of Object.keys(home)) {
        let canSee = false;
        if (permission == '#superuser#') {
            canSee = true;
        }
        if (home[section].permission.includes(permission)) {
            canSee = true;
        }
        if (home[section].permission.includes('all') && permission != '#guest#') {
            canSee = true;
        }
        trace.log({ section, permission, canSee });
        if (!canSee) {
            continue;
        }
        //  Section heading
        let title = section;
        if (home[section].title) {
            title = home[section].title;
        }
        output += `
              <div class="sudsHomeSection" id="${section}">`;
        if (home[section].img) {
            output += `
              <img src="${home[section].img}"  class="homeSectionImg" id="${section}Img">`;
        }
        output += `
              <p><span class="sudsHomeSectionHead">${title}</span>`;
        let description = '&nbsp;';
        if (home[section].description) {
            if (home[section].description == '#username#' && permission != '#guest#') {
                const record = await db.getRow('user', req.session.userId);
                trace.log(record);
                description = record.fullName;
            }
            else {
                description = home[section].description;
            }
        }
        if (permission == '#guest#') {
            description = lang.guest;
        }
        output += `
                <br />
                <span class="breaktext">${description}</span>`;
        // start list as unordered list UL
        output += `
              </p>
              <ul class="homeSectionList">`;
        // Check that this section  has a links object. Log warning but don't crash.
        if (!home[section].links) {
            console.log(`home.${section} in suds.js does not have a links object`);
        }
        trace.log({ section, links: home[section].links, level: 'verbose' });
        // Loop through the links object
        for (let i = 0; i < home[section].links.length; i++) {
            const linkData = home[section].links[i];
            trace.log({ link: i, details: linkData });
            let type = '';
            for (const key of Object.keys(linkData)) {
                if (key == 'report') {
                    type = 'report';
                }
                if (key == 'table') {
                    type = 'table';
                }
                if (key == 'www') {
                    type = 'www';
                }
                if (key == 'user') {
                    type = 'user';
                }
            }
            if (!type) {
                console.log('unknown type: ', linkData);
                continue;
            }
            /* e.g. if the type were ;'table' then link will contain the table name, if 'www' then the URL */
            const link = linkData[type];
            /* default the title to the link name - first char upercase */
            let title = link;
            if (type == 'table' || type == 'report') {
                title = link.charAt(0).toUpperCase() + link.slice(1);
            }
            if (linkData.title) {
                title = linkData.title;
            }
            if (linkData.title == 'none') {
                title = '';
            }
            /**
             *
             * Link to a table
             *
             */
            if (type == 'table') {
                let table = link;
                const attributes = mergeAttributes(table, permission);
                trace.log({ table, tables: suds.tables });
                if (!suds.tables.includes(table)) { // Check that table exists in model.
                    trace.error(`${table} is referenced but does not exist in suds.js`);
                    res.send(`<h1>Unexpected error </h1><p>Table: ${table} does not exist.</p>`);
                    return;
                }
                if (hasPermission(permission, table, 'any')) {
                    let linkParms = '';
                    if (linkData.open) {
                        linkParms = `&open=${linkData.open}`;
                    }
                    if (linkData.mode) {
                        linkParms += `&mode=${linkData.mode}`;
                    }
                    else {
                        linkParms += '&mode=list';
                    }
                    if (linkData.prePopulate) {
                        linkParms += `&prepopulate=${linkData.prePopulate[0][0]}&${linkData.prePopulate[0][0]}=${linkData.prePopulate[0][1]}`;
                    }
                    if (linkData.openGroup) {
                        linkParms += `&opengroup=${linkData.openGroup}`;
                    }
                    linkParms += '&source=home';
                    trace.log(linkParms);
                    let sortLink = '';
                    if (linkData.sort) {
                        sortLink = `&sortkey=${linkData.sort[0]}`;
                        if (linkData.sort[1]) {
                            sortLink += `&direction=${linkData.sort[1]}`;
                        }
                    }
                    let searchLink = '';
                    let searches = [];
                    if (linkData.search) {
                        [searchLink, searches] = sails.helpers.sudsSearchLink(attributes, linkData.search);
                    }
                    const href = `${mainPage}?table=${table}${linkParms}${sortLink}${searchLink}`;
                    trace.log(href);
                    const li = `
                <li>
                  <a href="${href}">${title}</a>
                 </li>`;
                    trace.log(li);
                    output += li;
                }
            }
            /**
             *
             * URL link - link to url
             *
             */
            let target = '';
            if (linkData.target) {
                target = ` target="${linkData.target}"`;
            }
            if (type == 'www') {
                output += `
                <li>
                  <A HREF="${linkData.www}"${target}>${title}</a>
                </li>`;
            }
            /**
            *
            * Report
            *
            */
            if (type == 'report') {
                let report = link;
                if (linkData.report) {
                    report = linkData.report;
                }
                if (linkData.input) {
                    output += `
                <form action="${mainPage}">
                   <input type="hidden" name="report" value="${report}">
                   <input type="hidden" name="mode" value="list">
                    <input type="hidden" name="source" value="home">`;
                    let icount = -1;
                    for (const key of Object.keys(linkData.input)) {
                        if (key == 'button') {
                            continue;
                        }
                        output += `
                    <input 
                      type="text" 
                      class="form-control sudsHomeSearch" 
                      name="${key}"
                      placeholder="${linkData.input[key].placeholder}"
                      >
                      `;
                        icount++;
                    }
                    if (icount) {
                        let button = `Filter ${link}`;
                        if (linkData.input.button) {
                            button = linkData.input.button;
                        }
                        ;
                        output += `
            <input type="radio" name="andor" value="and" checked>&nbsp;and&nbsp;   <input type="radio" name="andor" value="or">&nbsp;or<br /> 
            <button type="submit" class="btn btn-secondary btn-sm">${button}</button>`;
                    }
                    else {
                        if (linkData.input.button) {
                            output += `
              <button type="submit" class="btn btn-secondary btn-sm">${linkData.input.button}</button>`;
                        }
                    }
                    output += '</form>';
                }
                else {
                    output += `
            <li>
              <a href="${mainPage}?report=${linkData.report}&mode=list&source=home">${title}</a>
            </li>`;
                }
            }
            /**
             *
             * Report
             *
             */
            if (type == 'user') {
                trace.log({ user: req.session.userId, link });
                if (link == 'switchdb') {
                    output += `
          Current database is ${suds[suds.dbDriver].friendlyName}
          <form action="/switchdb">
          <select name="newdb">`;
                    for (const db of suds.databases) {
                        if (db == suds.dbDriver) {
                            continue;
                        }
                        output += `<option value="${db}">${suds[db].friendlyName}</option>`;
                    }
                    output += `
          </select>
           <button type="submit" class="btn btn-secondary btn-sm">Switch</button>   
          </form>`;
                }
                if (link == 'lastValidate') {
                    trace.log('lastValidation');
                    try {
                        const data = fs.readFileSync('lastvalidate.txt', 'utf8');
                        const lines = data.split('\n');
                        output += `
            <li>
              <a href="/validateconfig">Last validate</a>
            </li>
            ${lines[0]}<br />
            ${lines[1]}<br />
            ${lines[2]}<br />
            `;
                    }
                    catch (err) {
                        console.error(err);
                        output += `
            <li>
              <a href="/validateconfig">Needs validation</a>
            </li>`;
                    }
                }
                if (link == 'docs') {
                    output += `
          <form action="/docs">
          <input 
          type="text" 
          class="form-control sudsHomeSearch" 
          name="file"
          placeholder="Module"
          value="suds/db.js"
          >
          </form>`;
                }
                if (link == 'login') {
                    if (req.session.userId) {
                        continue;
                    }
                    output += `
          <li>
            <a href="${suds.login.page}">${title}</a>
          </li>`;
                }
                if (link == 'register') {
                    if (req.session.userId) {
                        continue;
                    }
                    output += `
        <li>
          <a href="${suds.register.page}">${title}</a>
        </li>`;
                }
                if (link == 'forgotten') {
                    if (req.session.userId) {
                        continue;
                    }
                    output += `
      <li>
        ${lang.forgottenPassword} 
        <form action="${suds.forgotten.page}">
          <input name="emailAddress" 
            type="text"  
            class="form-control sudsHomeSearch"
            placeholder="Enter email">
        </form> 
      </li>`;
                }
                if (link == 'changepw') {
                    if (!req.session.userId) {
                        continue;
                    }
                    output += `
    <li>
      <a href="${suds.changepw.page}">${title}</a>
    </li>`;
                }
                if (link == 'logout') {
                    if (!req.session.userId) {
                        continue;
                    }
                    output += `
          <li>
            <a href="${suds.logout.page}">${title}</a>
          </li>`;
                }
            }
        } // end of loop through links
        // Finish off this section
        output += `
              </ul>
            </div>  <!-- sudsHomeSection / ${section} -->
  `;
    } // end of section
    trace.log({ output });
    return ({ output, footnote: lang.footnoteText, heading: lang.homeHeading });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9ob21lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7OztvREFlb0Q7QUFDcEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBRXRDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3JELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0FBQ2pELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUMxQixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDeEIsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ2xELE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxVQUFVO0lBQzlDLEtBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBLENBQUMsNkJBQTZCO0lBRXZGLFlBQVk7SUFDWixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFBLENBQUMsc0NBQXNDO0lBRTlFLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBQ3BFLG9DQUFvQztJQUVwQyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxD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