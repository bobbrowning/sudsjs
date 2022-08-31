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
trace = require('track-n-trace');

const suds = require('../../config/suds');
var mergeAttributes = require('./merge-attributes');
var hasPermission = require('./has-permission');
let db = require('./'+suds.dbDriver);
const fs = require('fs');
module.exports = async function (req, permission) {
  trace.log('SUDS Home page', { break: '#', level: 'min' });  // Distinctive break on trace

  //  Get data 
  const lang = req.app.locals.language.EN;  // Contains text used in headings etc.
  const home = req.app.locals.home;
  let mainPage = req.app.locals.suds.mainPage;                // suds.js - home object
  let output = '';                                      // page content assembled here

  trace.log({
    permission: permission,
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
  for (let section of Object.keys(home)) {
    let canSee = false;
    if (permission == '#superuser#') { canSee = true; }
    if (home[section].permission.includes(permission)) { canSee = true; }
    if (home[section].permission.includes('all') && permission != '#guest#') { canSee = true; }
    trace.log({ section: section, permission: permission, canSee: canSee });

    if (!canSee) { continue }


    //  Section heading
    let title = section;
    if (home[section].title) { title = home[section].title }
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
        let record = await db.getRow('user', req.session.userId);
        trace.log(record);
        description = record.fullName

      } else {
        description = home[section].description;
      }
    }
    if (permission == '#guest#') { description = lang.guest }
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
    trace.log({ section: section, links: home[section].links, level: 'verbose' })
    // Loop through the links object
    for (let i = 0; i < home[section].links.length; i++) {
      let linkData = home[section].links[i];
      trace.log({ link: i, details: linkData });
      let type = '';
      for (let key of Object.keys(linkData)) {
        if (key == 'report') { type = 'report' }
        if (key == 'table') { type = 'table' }
        if (key == 'www') { type = 'www' }
        if (key == 'user') { type = 'user' }
      }
      if (!type) {
        console.log('unknown type: ', linkData);
        continue;
      }
      /* e.g. if the type were ;'table' then link will contain the table name, if 'www' then the URL */
      let link = linkData[type];
      /* default the title to the link name - first char upercase */
      let title = link;
      if (type == 'table' || type == 'report') {
        title = link.charAt(0).toUpperCase() + link.slice(1);
      }
      if (linkData.title) { title = linkData.title; }
      if (linkData.title == 'none') { title = ''; }
      /** 
       * 
       * Link to a table
       * 
       */
      if (type == 'table') {
        table = link;
        let attributes = mergeAttributes(table, permission);
        trace.log({ table: table, tables: suds.tables });
        if (!suds.tables.includes(table)) {    // Check that table exists in model.
          trace.error(`${table} is referenced but does not exist in suds.js` );
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
            linkParms += `&mode=list`;
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

          let href = `${mainPage}?table=${table}${linkParms}${sortLink}${searchLink}`;
          trace.log(href);
          let li = `
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
      if (linkData.target) { target = ` target="${linkData.target}"` }
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
        if (linkData.report) { report = linkData.report; }
        if (linkData.input) {
          output += `
                <form action="${mainPage}">
                   <input type="hidden" name="report" value="${report}">
                   <input type="hidden" name="mode" value="list">
                    <input type="hidden" name="source" value="home">`;
          let icount = -1;
          for (key of Object.keys(linkData.input)) {
            if (key == 'button') { continue }
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
            if (linkData.input.button) { button = linkData.input.button };
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
          output += `</form>`;
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
        trace.log({ user: req.session.userId, link: link });
        if (link == 'lastValidate') {
          trace.log('lastValidation');
          try {
            const data = fs.readFileSync('lastvalidate.txt', 'utf8')
            let lines=data.split('\n');
            output += `
            <li>
              <a href="/validateconfig">Last validate</a>
            </li>
            ${lines[0]}<br />
            ${lines[1]}<br />
            ${lines[2]}<br />
            `;
          } catch (err) {
            console.error(err)
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
          if (req.session.userId) { continue }
          output += `
          <li>
            <a href="${suds.login.page}">${title}</a>
          </li>`;
        }
        if (link == 'register') {
          if (req.session.userId) { continue }
          output += `
        <li>
          <a href="${suds.register.page}">${title}</a>
        </li>`;
        }
        if (link == 'forgotten') {
          if (req.session.userId) { continue }
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
          if (!req.session.userId) { continue }
          output += `
    <li>
      <a href="${suds.changepw.page}">${title}</a>
    </li>`;

        }

        if (link == 'logout') {
          if (!req.session.userId) { continue }
          output += `
          <li>
            <a href="${suds.logout.page}">${title}</a>
          </li>`;

        }


      }


    }  // end of loop through links
    // Finish off this section
    output += `
              </ul>
            </div>  <!-- sudsHomeSection / ${section} -->
  `;
  } // end of section
  trace.log({ output: output });
  return ({ output: output, footnote: lang.footnoteText, heading: lang.homeHeading });
}


