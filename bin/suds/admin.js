"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const listTable = require('./list-table');
const listRow = require('./list-row');
const deleteRow = require('./delete-row');
const sendView = require('./send-view');
const updateForm = require('./update-form');
const check_record_type_1 = require("./check-record-type");
const home = require('./home');
const suds = require('../../config/suds');
const reports = require('../../config/reports');
const trace = require('track-n-trace');
const db = require('./db');
const mergeAttributes = require('./merge-attributes');
const lang = require('../../config/language').EN;
const tableDataFunction = require('./table-data');
const csrf = require('./csrf');
/** The system caches the compiled schema. It is recompiled when the permission changes
 * because is inludes flages whowing whether the current user can do different things.
 * It is initiated to 'guest' to ensure it is recompilted the first time through.
 */
let oldPermission = '#guest#';
let startTime;
/** ************************************************************************************
 *  This is catches any errors in the code and puts a message on screem.
 *
 * The program will normally crash out with
 *    throw new Error ('program:message')
 * The program name may be omitted, but should help diagnose the problem.
 * The program puts a message onscreen and the user may continue with a new
 * transaction. A trace is left on the console with full details.
 *
 *   Other than this the function just calls the main program.
 * @param {Object} req
 * @param {Object} res
 */
async function admin(req, res) {
    try {
        await adminprocess(req, res);
    }
    catch (err) {
        const dateStamp = new Date().toLocaleString();
        console.log(`
    
********************** Error ***************************
${dateStamp}`);
        console.log(err);
        console.log(`
********************************************************
    
    `);
        let file = '';
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
    <a href='/admin'>Admin page</a>`);
    }
}
/** **************************************************************************************
 * The program checks whether the user is logged in. If not it links to
 * the login screen. The login URL must be routed from '/login'.
 *
 * Transfers control to a controller depending on mode (see example).  If there is no
 * mode, the main menu is presented.
 *
 * The controller creates and returns the page content.   This program
 * is then responsible for sending it to the user.
 *
 * All operations and parameters are logged to the audit trail unless this feature
 * has been switched off.
 * @example
 *
 * Typical call
 * http://localhost:3000/admin?table=user&mode=populate&id=1
 *
 * Mode can be as follows
 *   Mode        Description                                              Controller
 *   list        list rows in the table                                   list-table.js
 *   listrow     list one row in the table                                list-row.js
 *   new         Blank for for a new record                               update-form.js
 *   populate    Read record for given ID and populate form for update.   update-form.js
 *   update      validate data and update if valid                         update-form.js
 *   delete      Delete a row                                             db.js (deleteRow function)
 *
 * @param {Object} req - The reqest object
 * @param {Object} res - The response object
 * @returns {string} OK
 * @module
 * @name About
 * */
async function adminprocess(req, res) {
    //   trace.log(req.connection);
    trace.log({
        ip: req.ip,
        start: 'admin (ts version...)',
        query: req.query,
        body: req.body,
        files: req.files,
        break: '#',
        level: 'min'
    });
    startTime = new Date().getTime();
    /** CSRF
     * Set session csrf.
     */
    trace.log(req.session.csrf);
    csrf.setToken(req);
    trace.log(req.session.csrf);
    trace.log({
        req,
        maxdepth: 3,
        level: 'verbose'
    });
    let table;
    let mode;
    let report;
    let subschemas;
    let page;
    let id;
    let open;
    let openGroup;
    let reportData;
    let auditId;
    let output = '';
    let permission = await checkPermission(req, res);
    trace.log({ table: req.query.table });
    if (!req.query.table && !req.query.report) {
        return await mainMenu(req, res, permission);
    }
    [table, mode, report, subschemas, page, id, open, openGroup, reportData] = parseQuery(req);
    const tableData = tableDataFunction(table);
    const attributes = mergeAttributes(table, permission);
    auditId = await auditTrail(req, mode); // create audit trail record if mode is auditable
    if (mode === 'list') {
        output = await listMode();
    }
    if (mode === 'listrow') {
        output = await listRowMode();
    }
    if (mode === 'new' &&
        tableData.recordTypeColumn &&
        !req.body[tableData.recordTypeColumn]) {
        output = await checkRecType();
    }
    else if (mode === 'new' || mode === 'populate') {
        output = await newPopMode();
    }
    else if (mode === 'update') {
        output = await updateMode();
    }
    if (mode === 'delete') {
        output = await deleteMode();
    }
    sendOut(output);
    return 'OK';
    /**
     * Check permission
     *
     * The session variable userId contains the key of the user table
     * of the currently logged-in user.
     * If a cookie with the user number has been set then that is the user
     * revisiting
     * read the user record and set the permission set for thsi user.
    * If there is no user logged in then the permission set is 'guest'.
    *
    * @param {object} req
    * @param {object} res
    * @returns  {string} permission
    */
    async function checkPermission(req, res) {
        /** *************************************************************
           *
           ************************************************************** */
        let user = { createdAt: 0, updatedAt: 0 };
        let permission = '#guest#';
        if (req.cookies.user) {
            req.session.userId = req.cookies.user;
        }
        /*
         The user file may have any format. So the authorisation object (aut) lists the columns used in the user file
        *  for authorisation. There are two standard objects in the config file- one for sql and another for nosql */
        const aut = suds.authorisation[suds[suds.dbDriver].authtable];
        if (req.session.userId) {
            user = await db.getRow(aut.table, req.session.userId);
            if (user['err']) {
                console.log(`Unknown user ${req.session.userId}`);
            }
            else {
                if (user[aut.superuser]) {
                    permission = '#superuser#';
                }
                else {
                    permission = user[aut.permissionSet];
                }
                if (suds.superuser === user[aut.emailAddress]) {
                    permission = '#superuser#';
                }
                /**
                 * Last seen at date is updated in the user record
                 * */
                const now = Date.now();
                const rec = {}; // Properties may be changed by the configuration
                rec[aut.primaryKey] = req.session.userId;
                rec['lastSeenAt'] = now;
                await db.updateRow(aut.table, rec);
                trace.log({ 'User record': user, level: 'verbose' });
            }
        }
        /* validate permission set.    */
        if (!(permission === '#superuser#' ||
            permission === '#guest#' ||
            Object.keys(suds.permissionSets).includes(permission))) {
            /* log user out */
            req.session.userId = false;
            res.clearCookie('user');
            console.log(`User has non-standard permission.
      Email: ${user[aut.emailAddress]} 
      Permission: ${permission} `);
            throw new Error(`Sorry - there has been a problem. Please log in again. `);
        }
        /* store the permision in session data.*/
        req.session.permission = permission;
        trace.log({ user: req.session.userId, permission, level: 'user' });
        trace.log(permission);
        //   global.suds = { user: req.session.userId, permission: permission };
        trace.log(req.ip);
        if (suds.blockIp && suds.blockIp.includes(req.ip)) {
            console.log(`Attenpt to access by blocked ip ${req.ip}`);
            throw new Error(`Sorry, you do not have permission to access this site`);
        }
        if (req.session.userId && user[aut.emailAddress]) {
            if (suds.blockEmail && suds.blockEmail.includes(user[aut.emailAddress])) {
                console.log(`Attenpt to access by blocked email ${user[aut.emailAddress]}`);
                throw new Error(`Sorry, you do not have permission to access this site`);
            }
        }
        /* If this is a new permission set - re-compile the attributes */
        if (permission !== oldPermission) {
            mergeAttributes('clear-cache');
            oldPermission = permission;
        }
        return permission;
    }
    /** *********************************************
      *
         * ******************************************** */
    /**
     *
     *  If there is no reference to a table or report then output the main menu.
     *
     * A session variable contains an object defining the 'current'
     * report with search and sort settings. This is retained from page to page
     * in a session variable. This session variable is cleared down on return to the menu.
     *
     * @param req
     * @param res
     * @param permission
     * @returns
     */
    async function mainMenu(req, res, permission) {
        trace.log('home page');
        req.session.reportData = {};
        // trace.stop();
        const output = await home(req, permission);
        const result = await sendView(res, 'admin', output);
        trace.log(result);
        return;
    }
    /** * *********************************************
      *  Parse and validate query parameters
      *
      * Assign parameters in the query string to variables
      * Note that when a form is submitted for update
      * the fields are *always* in the body. So there is
      * no confusion if query string parameter names are the same as
      * column names.
      *
      * Some of these won't be present dependin on the mode.
      *
      *
      * @param {Object} req
      * @returns {Array} table, mode, report, subschemas, page, id, open, openGroup
      */
    function parseQuery(req) {
        /* These processes are  handles by the program */
        const validModes = [
            'list',
            'listrow',
            'new',
            'populate',
            'update',
            'delete'
        ];
        /* Table */
        let table = '';
        if (req.query.table) {
            table = req.query.table;
            if (!suds.tables.includes(table)) {
                console.log(`Table: ${table} is not a valid table. It must be listed
      in the suds.js config file.`);
                throw new Error(`Table: ${table} is not a valid table.`);
            }
        }
        /* Report*/
        let report = '';
        if (req.query.report) {
            report = req.query.report; // If listing a table the report
            if (!reports[report]) {
                throw new Error(`admin.js::Report: ${report} is not in the reports config file.`);
            }
            table = reports[report].table;
        }
        if (!table) {
            throw new Error(`admin.js::No table given. - may be an issue with report: ${report}`);
        }
        /* Mode */
        let mode = '';
        if (req.query.mode) {
            mode = req.query.mode;
            if (!validModes.includes(mode)) {
                throw new Error(`${mode} is not a valid mode`);
            }
            if (mode && !table && !report) {
                throw new Error(`Mode ${mode} but no table or report`);
            }
        }
        /* subschemas*/
        let subschemas = [];
        if (req.query.subschema) {
            if (Array.isArray(req.query.subschema)) {
                subschemas = req.query.subschema;
            }
            else {
                subschemas = [req.query.subschema];
            }
        }
        /* page number */
        let page = 0; // page number in listing
        if (req.query.page) {
            page = Number(req.query.page);
        }
        trace.log(page, typeof page);
        /* id */
        let id = 0; // record key
        if (req.query.id) {
            if (suds.dbType === 'nosql') {
                id = req.query.id;
            }
            else {
                id = parseInt(req.query.id);
            }
        }
        /* open and openGroup */
        let open = '';
        if (req.query.open) {
            open = req.query.open;
        }
        let openGroup = '';
        if (req.query.opengroup) {
            openGroup = req.query.opengroup;
        }
        /* Session data includes the 'current' report specification so users can go  */
        /* into details page and back without losing the report layout.              */
        /* Make sure there is an object to modify.                                   */
        if (!req.session.reportData || req.query.clearreport === 'true') {
            req.session.reportData = {};
        }
        let reportData = req.session.reportData; // this will contain a copy of the report spec
        trace.log(page, typeof page);
        trace.log({
            query: req.query,
            path: req.path,
            page,
            report,
            table,
            mode,
            id,
            open,
            openGroup
        });
        return [table, mode, report, subschemas, page, id, open, openGroup, reportData];
    }
    /** *********************************************
      *  Audit trail
      *
      * Add a reord to the audit trail assuming that the
      * mode is one of those specified for auditing in
      * config/suds.js.
      *
      * @param {Object} req
      * @param {Object} mode
      * @returns {Any} id of audit record
    */
    async function auditTrail(req, mode) {
        let auditId; // Not really any, but don't know how to tell typescript that I *know* the record key is a string or number
        /* Consolidate all parameters in one object. */
        trace.log(mode);
        if (suds.audit.include &&
            (!suds.audit.operations ||
                suds.audit.operations.includes(mode))) {
            const requestData = {}; // Clones req - properties depend on config
            for (const item of suds.audit.log) {
                requestData[item] = req[item];
            }
            trace.log({ auditing: table, id, page });
            if (table && !page) {
                trace.log(table, id);
                let rec = {
                    updatedBy: req.session.userId,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    tableName: table,
                    mode: mode,
                    row: id,
                    data: JSON.stringify(requestData)
                };
                rec = await db.createRow('audit', rec);
                auditId = rec['id'];
                trace.log(rec);
            }
            if (suds.audit.include && suds.audit.trim && suds[suds.dbDriver].countable) {
                const count = await db.countRows('audit');
                trace.log(count, suds.audit.trim[1]);
                if (count > suds.audit.trim[1]) {
                    const old = await db.getRows('audit', {}, suds.audit.trim[0], 1, 'createdAt', 'DESC');
                    trace.log({ trimfrom: old });
                    await db.deleteRows('audit', { searches: [['createdAt', 'lt', old[0].createdAt]] });
                }
            }
        }
        return auditId;
    }
    /** ***********************************************************
       *
       * Now check the mode and process.  Initialise the variable that
       * will recieve the output.  Then call the appropriate controller.
        ************************************************************ */
    /** * *********************************************
      *
      *            L I S T
      *            -------
      *
      * Mode = list so create report specification and call helper
      * to list the table.
      *
      * ******************************************** */
    /** * *********************************************
       *
       * If a report is specified the this has come from the home page,
       * set up the report specification in reportData.
       *
       * ***** clone ***** reportData so we don't have changes
       * to the search or sort ending back in the report object
       *
       * ******************************************** */
    /**
     *
     * @returns {any} output
     */
    async function listMode() {
        trace.log('***** list *****');
        if (report) {
            trace.log('report');
            const reportObject = reports[report];
            trace.log(table, reportObject);
            reportData = { table: table };
            if (reportObject['friendlyName']) {
                reportData['friendlyName'] = reportObject['friendlyName'];
            }
            if (reportObject['title']) {
                reportData['title'] = reportObject['title'];
            }
            if (reportObject['open']) {
                reportData['open'] = reportObject['open'];
            }
            if (reportObject['openGroup']) {
                reportData['openGroup'] = reportObject['openGroup'];
            }
            if (reportObject['searchFields']) {
                reportData['searchFields'] = reportObject['searchFields'];
            }
            if (reportObject['view']) {
                reportData['view'] = reportObject['view'];
            }
            /***
                   * Only applies to CouchDB
                   */
            if (reportObject.view) {
                reportData['view'] = reportObject.view;
            }
            /***
                   *
                   * Search object.
                   * If a search refers to #today or #today+n or #loggedinuser then
                   * substitute the appropriate values
                   */
            if (reportObject.search) {
                reportData['search'] = { andor: 'and', searches: [] };
                reportObject.search.andor = 'and';
                if (reportData['search']['andor']) {
                    reportData['search']['andor'] = reportObject.search.andor;
                }
                if (req.query.andor) {
                    reportData['search'].andor = req.query.andor;
                }
                reportData['search'].searches = [];
                if (reportObject.search.searches) {
                    for (let i = 0; i < reportObject.search.searches.length; i++) {
                        /* search is an array contains search criteria  number i */
                        /* will move it into the reportData object later */
                        const search = [reportObject.search.searches[i][0], reportObject.search.searches[i][1], reportObject.search.searches[i][2]];
                        const value = search[2];
                        if (value && typeof value === 'string' && value.substring(0, 1) === '#') {
                            /* #today or #today+5 or #today-3  No spaces allowed */
                            if (value.substring(0, 6) === '#today') {
                                let today = Date.now();
                                let diff = 0;
                                if (value.substring(6, 7) === '+') {
                                    diff = Number(value.substring(7));
                                }
                                if (value.substring(6, 7) === '-') {
                                    diff = -1 * Number(value.substring(7));
                                }
                                today += diff * 86400000;
                                search[2] = new Date(today).toISOString().split('T')[0];
                            }
                            else if (value === '#loggedInUser') {
                                search[2] = req.session.userId;
                            }
                            else {
                                /*  Should be an input field with this name */
                                const term = value.substring(1);
                                if (req.query[term]) {
                                    search[2] = req.query[term];
                                }
                                else {
                                    continue;
                                }
                            }
                        }
                        reportData['search'].searches[i] = [search[0], search[1], search[2]];
                    }
                }
            }
            trace.log(reportObject.search);
            if (reportObject.sort) {
                reportData['sort'] = [reportObject.sort[0], reportObject.sort[1]];
            }
            if (reportObject.columns) {
                reportData['columns'] = [];
                for (let i = 0; i < reportObject.columns.length; i++) {
                    reportData['columns'][i] = reportObject.columns[i];
                }
            }
            trace.log(reportData['columns']);
        }
        else {
            /** *  *********************************************
                *
                * Report object is not specified, so create one from
                * any stored report in the session variable plus
                * parameters in the query string.
                *
                * This happens for example in paginated reports where new
                * filtering and sorting have to be passed in the query string.
                *
                * ******************************************** */
            if (req.session.reportData[table]) { // If there is a report stored
                reportData = req.session.reportData[table]; // go with that.  But may be changed below
                trace.log('loading from session', table, reportData);
            }
            else {
                reportData = { table: table };
                reportData['friendlyName'] = table;
                if (tableData.friendlyName) {
                    reportData['friendlyName'] = tableData.friendlyName;
                }
                /* AddRow is the wording on the 'new' button. Defaults to 'New'. Not really used in the test data and probably not required. */
                reportData['addRow'] = 'New';
                if (tableData.addRow) {
                    reportData['addRow'] = tableData.addRow;
                }
            }
            /* If we don't have the columns already then clone them from the table data */
            /* if there are none there, then the program will list all fields */
            if (!reportData['columns'] && tableData.list?.columns) {
                reportData['columns'] = [];
                for (let i = 0; i < tableData.list.columns.length; i++) {
                    reportData['columns'][i] = tableData.list.columns[i];
                }
            }
            /* Over-write from URL if sort/search/open are there... */
            if (req.query.open) {
                reportData['open'] = req.query.open;
            }
            if (req.query.openGroup) {
                reportData['openGroup'] = req.query.opengroup;
            }
            /* If there is no search structure make sure there is one to be modified. */
            if (!reportData['search']) {
                reportData['search'] = {
                    andor: '',
                    searches: []
                };
            }
            // if there is a search in the URL, this should replace the current search
            if (req.query.andor) {
                reportData['search'].andor = req.query.andor;
                reportData['search'].searches = [];
            }
            let i = 0;
            for (let j = 1; j < req.app.locals.suds.search.maxConditions; j++) {
                if (req.query['searchfield_' + j]) {
                    const searchField = req.query['searchfield_' + j];
                    let compare = req.query['compare_' + j];
                    let value = req.query['value_' + j];
                    if (attributes[searchField] && attributes[searchField].process && attributes[searchField].process?.JSON) {
                        compare = 'contains';
                        value = `"${value}"`;
                    }
                    reportData['search'].searches[i++] = [searchField, compare, value];
                }
            }
            if (req.query.sortkey || req.query.direction) {
                reportData['sort'] = [];
                if (req.query.sortkey) {
                    reportData['sort'][0] = req.query.sortkey;
                }
                if (req.query.direction) {
                    reportData['sort'][1] = req.query.direction;
                }
            }
        }
        trace.log({ report: report, reportInfo: reports[report] });
        trace.log(reportData);
        /* Load into the session variable  */
        req.session.reportData[table] = reportData;
        /* Run list table controller */
        output = await listTable(permission, table, reportData, page, req.query.parent, req.query.limit);
        return output;
    }
    /** * *********************************************
      *
      *        L I S T  R O W
      *        --------------
      *
      *  Individual row row be listed.
      * open and opengroup specify whih child collection
      * and which group are to be open.
      *
      * ******************************************** */
    async function listRowMode() {
        trace.log('***** List Row *****');
        let open = '';
        let openGroup = '';
        if (tableData.open) {
            open = tableData.open;
        }
        if (tableData.opengroup) {
            openGroup = tableData.opengroup;
        }
        if (req.session.reportData[table]) {
            open = req.session.reportData[table].open;
            openGroup = req.session.reportData[table].openGroup;
        }
        if (req.query.open) {
            open = req.query.open;
        }
        if (req.query.opengroup) {
            openGroup = req.query.opengroup;
        }
        return await listRow(permission, table, id, open, openGroup);
    }
    /** * ***************************************************
      *
      *  A D D,  P O P U L A T E  OR   U P D A T E   R O W
      *  -------------------------------------------------
      *
      *
      * Record to be added or populated with data for update
      *
      * ***************************************************** */
    async function checkRecType() {
        trace.log('new with record type');
        return await (0, check_record_type_1.checkRecordType)(permission, table, req.query, req.session.csrf);
    }
    async function newPopMode() {
        trace.log('new or populate', id);
        const record = {}; // record properties depends on config
        /*       if (req.query.parent) {
                 record[req.query.searchfield] = req.query[req.query.searchfield];
                 } */
        if (req.query.prepopulate) {
            let fieldNames;
            if (Array.isArray(req.query.prepopulate)) {
                fieldNames = req.query.prepopulate;
            }
            else {
                fieldNames = [req.query.prepopulate];
            }
            trace.log(req.query.prepopulate, fieldNames);
            for (const fieldName of fieldNames) {
                trace.log(fieldName);
                let value = req.query[fieldName];
                if (req.body[fieldName]) {
                    value = req.body[fieldName];
                }
                if (attributes[fieldName].primaryKey || attributes[fieldName].model) {
                    value = db.standardiseId(value);
                }
                else if (attributes[fieldName].type === 'number') {
                    value = Number(value);
                }
                record[fieldName] = value;
            }
        }
        trace.log({ mode, id, record, subschemas });
        trace.log({ user: req.session.userId, level: 'user' });
        return await updateForm(permission, table, id, mode, record, req.session.userId, open, openGroup, req.files, subschemas, auditId, req.session.csrf);
    }
    /** * *********************************************
      *
      *           U P D A T E
      *           -----------
      *
      * Record to be updated from data passed in the body.
      *
      * ******************************************** */
    async function updateMode() {
        trace.log('**** update ***');
        csrf.checkToken(req);
        return await updateForm(permission, table, id, mode, req.body, // This contains all the data to be validated / updated.
        req.session.userId, open, openGroup, req.files, subschemas, auditId, req.session.csrf);
    }
    /** * *********************************************
      *
      *             D E L E T E
      *             -----------
      *
      *
      * ******************************************** */
    async function deleteMode() {
        return await deleteRow(permission, table, id);
    }
    /** *********************************************
      *
      * Send the output to the screen.
      *
      * Output either contains text or is an object with
      * the body of html and footnote and oyher values to
      * be sent to the view engine.
      * @param {Object} output - can be a string or more normally an object
      * @returns {string} Value returned by send-view.js
      * ******************************************** */
    async function sendOut(output) {
        let viewData = {
            output: '',
            footnote: '',
            heading: '',
        };
        if (output) {
            if (typeof output == 'string') {
                viewData['output'] = output;
                viewData['footnote'] = lang.footnoteText;
            }
            else {
                viewData = output;
            }
        }
        viewData['heading'] = lang.homeHeading;
        const result = await sendView(res, 'admin', viewData);
        trace.log(result);
        trace.log({ 'Elapsed time (ms)': new Date().getTime() - startTime, level: 'timer', });
        return result;
    }
}
module.exports = admin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvYWRtaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDMUMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMxQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDeEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzVDLDJEQUFzRDtBQUV0RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDMUMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDaEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQixNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUN0RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDakQsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFHbEQsTUFBTSxJQUFJLEdBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBRzVCOzs7R0FHRztBQUNILElBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQztBQUM5QixJQUFJLFNBQWlCLENBQUM7QUFJdEI7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsS0FBSyxVQUFVLEtBQUssQ0FB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