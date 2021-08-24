var express = require('express');
var router = express.Router();
let mergeAttributes = require('./merge-attributes');
let tableDataFunction = require('./table-data');
let listTable = require('./list-table');
//let getRow = require('./get-row');
//let createRow = require('./create-row');
let listRow = require('./list-row');
let sendView = require('./send-view');
let updateForm = require('./update-form');
//let deleteRow = require('./delete-row');
//let deleteRows = require('./delete-rows');
//let countRows = require('./count-rows');
let home = require('./home');
let suds = require('../../config/suds');
let reports = require('../../config/reports');
let trace = require('track-n-trace');
let db=require('./db');


/**
 *  file-maint for sails  
 *  http://localhost/admin/
 * `
 * See readme for details
 * 
 * @description :: generic update / listing program.
 * * 
 * Central switching program. Transfers control to a helper depending on mode.
 * 
 * Mode can be
 *     # blank  = present a input blank form 
 *     # 'update' = validate data and update if valid
 *     # 'new' = Blank for for a new record
 *     # 'list' =  list rows in the table
 *     #  'populate' = red record for given ID and populkate form for update.
 * 
 * The helper creates and returns the page content and returns this.  This controller
 * is then responsible for sending it to the user.
 * 
 * All operations and parameters are logged to the audit trail unless this feature
 * has been switched off.
 * 
 * This controller also checks whether the user is logged in. If not it links to 
 * the login screen and sets a session variable to indicate where control is to 
 * be returned to. The starter program login program has a very small change to 
 * check the session variable and load this controller once the user is logged in.
 * The login URL must be routed from '/login'. 
 *  
 */
module.exports = async function (req, res) {
    console.log(__dirname);
    trace.log({ query: req.query, body: req.body });
    let allParms = {};

    allParms = { ...req.query, ...req.body };
    trace.log({ break: '#', start: 'admin', allParms: allParms, level: 'min' })
    let user = {};
    permission = '#guest#';

    if (req.cookies.user) {
        req.session.userId = req.cookies.user;
    }

    if (req.session.userId) {
        user = await db.getRow('user', req.session.userId);
        if (user.isSuperAdmin) { permission = '#superuser#' } else { permission = user.permission; }
        if (suds.superuser == user.emailAddress) { permission = '#superuser#' }
        trace.log({ 'User record': user, level: 'verbose' });
    }

    /* *********************************************
    *  If not logged in Store the page name in the 
    *  session data and transfer control to the login screen
    * ******************************************** */
    /*
     if (!req.session.userId) {
       trace.log(
         'Not logged in so redirecting to login',
         req.session.userId,
         req.app.locals.suds.mainPage,
         { level: 'min' }
       );
       req.session.next = req.app.locals.suds.mainPage;   // This has the url of this program
       throw { login: `/login` };
     }
     // now user is logged in, we can revert to the login screen normal operation
     req.session.next = undefined;
   
     /* *********************************************
     * Logged in - so get permission and transfer control 
     * according to the mode
     * ******************************************** */
    /*
     let user = await sails.helpers.sudsGetRecord('user', req.session.userId);
     trace.log({ 'User record': user, level: 'verbose' });
   */



    // validate permission set
    if (permission != '#superuser#'
        && permission != '#guest#'
        && !Object.keys(suds.permissionSets).includes(permission)) {
        console.log(`User has non-standard permission: ${user.emailAddress} ${permission}`);
        console.log(`Unknown permission set ${permission}`);
        permission = '#guest#';
    }
    // store the permision in session data.
    req.session.permission = permission;
    trace.log(permission);
    global.suds = { user: req.session.userId, permission: permission };

    /** *********************************************
    *  Organise data
    *  
    *  A   form might have fields called table etc. 
    *  so we put them in the query string. 
    * ******************************************** */

    let table = req.query.table;
    let mode = req.query.mode;
    let report = req.query.report;
    if (report) {
        if (!reports[report]) {
            trace.log(reports);
            console.log(`No report ${report}`);
            res.send(`No report ${report}`);
            return;
        }
        table = reports[report].table;
    }


    let id = 0;
    if (req.query.id) { id = parseInt(req.query.id) }
    let output = '';

    let open='';
    let openGroup='';
    if (req.query.open) { open = req.query.open }
    if (req.query.opengroup) { openGroup = req.query.opengroup }

    trace.log({
        query: req.query,
        path: req.path,
        report: report,
        table: table,
        mode: mode,
        id: id,
        open: open,
        openGroup: openGroup,
    });

    /* Session data includes the 'current' report specification so users can go  */
    /* into details page and back without losing the report layout.              */
    /* Make sure there is an object to modify.                                   */
    if (!req.session.reportData) {
        req.session.reportData = {};
    }


    /* mergeAttributes merges the attributes object from the mode with the attributes in the project file */
    let attributes = {};
    if (table) {
        attributes = mergeAttributes(table, permission);  // attributes and extraattributes merged0
    }


    /* *********************************************
    *  Validate data
    * ******************************************** */
    let errortext = '';
    let errors = 0;
    if (mode) {
        let modes = [
            'new',                     // New row - create blank form
            'populate',                // Update stage 1 - populate for with current record
            'update',                  // Form has been submitted so validate and update
            'delete',                  // Delete record 
            'list',                    // List a table
            'listrow',                 // list one row of a table
        ];
        if (!modes.includes(mode)) {
            errortext += 'Wrong mode: ' + allParms.mode;
            errors++;
        }
    }
    if (mode && !table && !report) {
        errortext += `Mode ${mode} but no table or report`;
        errors++;
    }

    trace.log({
        text: 'after validate URL',
        errors: errors,
        errortext: errortext,
    });
    if (errors) {
        suds = {};   // clear down globals
        let result = await sendView(res, `<h1>${errortext}</h1>`);
        return (result);

    }

    /* *********************************************
    *  Audit trail
    * ******************************************** */



    if (suds.audit.include) {
        if (allParms.table) {
            let rec = {
                updatedBy: req.session.userId,
                table: table,
                mode: mode,
                row: id,
                data: JSON.stringify(allParms),
            }
            await db.createRow('audit', rec);
        }

        if (suds.audit.include && suds.audit.trim) {
            let count = await db.countRows('audit');
            if (count > suds.audit.trim[1]) {
                let old = await db.getRows('audit', {}, suds.audit.trim[0], 1, 'createdAt', 'DESC');
                trace.log({ trimfrom: old });
                await db.deleteRows('audit', { searches: ['createdAt', 'lt', old[0].createdAt] });
            }
        }
    }

    /* *********************************************
    *
    *  A helper is used for each mode. The helper returns
    *  the HTML and this program sends it out
    * 
    * ******************************************** */


    /* *********************************************
    *
    *  A session variable contains an object defining the 'current'
    *  report with search and sort settings. 
    * 
    *  Home page if there is no table given.  Clear down the session variable.
    * 
    * If a report is requested in the URl this will replace the session variable.
    *  
    *
    * ******************************************** */

    if (!table  || req.query.report) {
        req.session.reportData = {};
        output = await home(req, permission);
    }


    if (table) {
        tableData = tableDataFunction(table, permission);
    }


    /* *********************************************
    *
    * Mode = list so create report specification and call helper 
    * to list the table.
    * 
    * ******************************************** */


    if (mode == 'list') {

        /* clone the report data */
        let reportData = {};

        /* *********************************************
        *
        * If a report is specified the this has come from the home page, 
        * set up the report specification from scratch.  
        * 
        * ******************************************** */
        if (report) {
            if (reports[report]) {
                trace.log('report');
                reportObject = reports[report];
                table = reportData.table = reportObject.table;
                trace.log(table, reportObject);
                mode = 'list';
                /* *********************************************
                *
                * ***** clone ***** reportData so we don't have changes 
                * to the search or sort ending back in the report object
                *  
                * ******************************************** */
                let copyfields = ['friendlyName', 'title', 'open', 'openGroup'];
                for (let i = 0; i < copyfields.length; i++) {
                    fieldName = copyfields[i];
                    if (reportObject[fieldName]) { reportData[fieldName] = reportObject[fieldName]; }
                }
                trace.log(reportObject.search);
                if (reportObject.search) {
                    reportData.search = {};
                    reportData.search.andor = reportObject.search.andor;
                    reportData.search.searches = [];
                    for (let i = 0; i < reportObject.search.searches.length; i++) {
                        /* search is an array contains search criteria  number i*/
                        /* will move it into the reportData object later */
                        let search = [reportObject.search.searches[i][0],reportObject.search.searches[i][1],reportObject.search.searches[i][2]];
                        let value = search[2];
                        if (value && typeof value == 'string' && value.substring(0, 1) == '#') {
                            /* #today or #today+5 or #today-3  No spaces allowed */
                            if (value.substring(0, 6) == '#today') {
                                let today = Date.now();
                                let diff = 0;
                                if (value.substring(6, 7) == '+') { diff = Number(value.substring(7)) }
                                if (value.substring(6, 7) == '-') { diff = -1 * Number(value.substring(7)) }
                                today += diff * 86400000;
                                search[2] = new Date(today).toISOString().split("T")[0];
                            }
                            else {
                                if (value == '#loggedInUser') {
                                    search[2] = req.session.userId;
                                }
                                else {
                                    /*  Should be an input field with this name */
                                    term = value.substring(1);
                                    if (allParms[term]) {
                                        search[2] = allParms[term];
                                    }

                                }
                            }
                        }
                        reportData.search.searches[i] = [search[0], search[1], search[2]]
                    }
                }
                trace.log(reportObject.search);
               if (reportObject.sort) {
                    reportData.sort = [reportObject.sort[0], reportObject.sort[1]];
                }
                if (reportObject.columns) {
                    reportData.columns = [];
                    for (let i = 0; i < reportObject.columns.length; i++) {
                        reportData.columns[i] = reportObject.columns[i];
                    }
                }
                trace.log(reportData.columns);

            }
            else {
                let result = await sendView(res, `<h1>Sorry - ${allParms.report} doesn't exist.</h1>`);
                suds = {};     // clear down globals
                return (result);
            }
        }   /* if allParms.report */

        /* *********************************************
        *
        *  Create / modify the report spec from the data in the URL.
        * There is an object per table in the session variable
        *  
        * ******************************************** */

        else {
            if (req.session.reportData[table]) {
                reportData = req.session.reportData[table];
                trace.log('loading from session', table, reportData);
            }
            /*  Merges the table data other than attributes in the model with the data */
            /*  in the project file                                                    */

            reportData.table = table;
            reportData.friendlyName = tableData.friendlyName;

            /* If we don't have the columns already then clone them from the table data */
            if (!reportData.columns && tableData.columns) {
                reportData.columns = [];
                for (let i = 0; i < tableData.columns.length; i++) {
                    reportData.columns[i] = tableData.columns[i];
                }
            }

            /* AddRow is the wording on the 'new' button. Defaults to 'New'. Not really used in the test data and probably not required. */
            if (!reportData.addRow && tableData.addRow) {
                reportData.addRow = tableData.addRow;
            }

            /* Over-write from URL if sort/search/open are there... */
            if (allParms.open) { reportData.open = allParms.open; }
            if (allParms.openGroup) { reportData.openGroup = allParms.opengroup; }
            if (!reportData.search) {
                reportData.search = {
                    andor: '',
                    searches: [],
                }
            }

            // if there is a search in the URL, this should replace the search 
            if (allParms.andor) {
                reportData.search.andor = allParms.andor;
                reportData.search.searches = [];
            }

            let i = 0;
            for (let j = 1; j < req.app.locals.suds.search.maxConditions; j++) {
                if (allParms['searchfield_' + j]) {
                    reportData.search.searches[i++] = [allParms['searchfield_' + j], allParms['compare_' + j], allParms['value_' + j]]
                }
            }

            if (allParms.sortkey || allParms.direction) {
                reportData.sort = [];
                if (allParms.sortkey) { reportData.sort[0] = allParms.sortkey }
                if (allParms.direction) { reportData.sort[1] = allParms.direction }
            }
        }


        trace.log(reports[report]);

        trace.log(reportData);

        /* Load into the session variable  */
        req.session.reportData[table] = reportData

        /* Run list table helper */
        output = await listTable(
            permission,
            table,
            reportData,
            allParms.page,
            allParms.parent,
            allParms.limit,
        );

    }


    /* *********************************************
    *
    *  Individual row ro be listed.
    * open and opengroup specify whih child collection
    * and which group are to be open.
    *  
    * ******************************************** */
    if (mode == 'listrow') {

        if (tableData.open) { open = tableData.open }
        if (tableData.opengroup) { openGroup = tableData.opengroup }
        if (req.session.reportData[table]) {
            open = req.session.reportData[table].open;
            openGroup = req.session.reportData[table].openGroup;
        }
        if (allParms.open) { open = allParms.open }
        if (allParms.opengroup) { openGroup = allParms.opengroup }


        output = await listRow(
            permission,
            allParms.table,
            id,
            open,
            openGroup,
        );
    }






    /* *********************************************
    *
    * Record to be added or populated with data for update
    *  
    * ******************************************** */

    if (mode == 'new' || mode == 'populate') {
        let record = {};
        if (allParms.parent) {
            record[allParms.searchfield] = allParms[allParms.searchfield];
        }
        if (allParms.prepopulate) {
            let fieldName = allParms.prepopulate;
            let value = allParms[fieldName];
            if (attributes[fieldName].type == 'number') {
                value = Number(value);
            }
            record[fieldName] = value;
        }
        trace.log(mode);
        output = await updateForm(
            permission,
            table,
            id,
            mode,
            record,
            req.session.userId,
            open,
            openGroup,
        );
    }
    // *****************************  untested code ********************

    /* *********************************************
    *
    * Record to be updated from data passed in the parameters.
    *  
    * ******************************************** */

    if (mode == 'update') {

        id = req.body[tableData.primaryKey];
        output = await updateForm(
            permission,
            table,
            id,
            mode,
            req.body,                  // This contains all the data to be validated / updated.
            req.session.userId,
            open,
            openGroup,
        );
    }

    /* *********************************************
    *
    * Record to be deleted.
    *  
    * ******************************************** */
    if (mode == 'delete') {
        output = await db.deleteRow(
            permission,
            table,
            id,
        );
    }

    /* *********************************************
    *
    * Send the output to the screen.
    *  
    * ******************************************** */

    let result = await sendView(res, output);
    trace.log(result);
    return;




    /*
    let trace=require('track-n-trace');
    trace.log(req.session.user);
    const knex = require('knex')({
      client: 'sqlite3',
      connection: {
        filename: "./suds.db"
      },
      useNullAsDefault: true,
    });
    let userrec= await knex.select('*').from('user');
    trace.log(userrec);
    trace.log(req.session);
   res.render('index', { title: 'Admin' });
   // res.send('respond with a resource');
  */
    //});
    //module.exports = router;



}