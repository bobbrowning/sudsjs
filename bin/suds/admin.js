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
    let csrfToken;
    if (suds.csrf) {
        csrfToken = req.csrfToken();
    }
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
    let output;
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
        let user; // some property names depend on config.
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
        trace.log({
            query: req.query,
            path: req.path,
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
        let auditId;
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
            if (!reportData['columns'] && tableData.list.columns) {
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
                    if (attributes[searchField] && attributes[searchField].process && attributes[searchField].process.JSON) {
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
        output = await listTable(permission, table, reportData, req.query.page, req.query.parent, req.query.limit);
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
        return await (0, check_record_type_1.checkRecordType)(permission, table, req.query, csrfToken);
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
        return await updateForm(permission, table, id, mode, record, req.session.userId, open, openGroup, req.files, subschemas, auditId, csrfToken);
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
        return await updateForm(permission, table, id, mode, req.body, // This contains all the data to be validated / updated.
        req.session.userId, open, openGroup, req.files, subschemas, auditId, csrfToken);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvYWRtaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDMUMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMxQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDeEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzVDLDJEQUFzRDtBQUV0RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDMUMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDaEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQixNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUN0RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDakQsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFNbEQ7OztHQUdHO0FBQ0gsSUFBSSxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBQzlCLElBQUksU0FBaUIsQ0FBQztBQUl0Qjs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxLQUFLLFVBQVUsS0FBSyxDQUFDLEdBQVksRUFBRSxHQUFhO0lBQzlDLElBQUk7UUFDRixNQUFNLFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7S0FDN0I7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNaLE1BQU0sU0FBUyxHQUFXLElBQUksSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUE7UUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQzs7O0VBR2QsU0FBUyxFQUFFLENBQUMsQ0FBQTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQzs7O0tBR1gsQ0FBRSxDQUFBO1FBQ0gsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBQ2IsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDO1FBQ2xCLElBQUksSUFBSSxHQUFHLHdDQUF3QyxDQUFDO1FBQ3BELElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1lBQzNCLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDckIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDNUIsSUFBSSxHQUFHLGtCQUFrQixJQUFJLEdBQUcsQ0FBQTthQUNqQztpQkFDSTtnQkFDSCxHQUFHLEdBQUcsR0FBRyxDQUFDO2FBQ1g7U0FDRjthQUNJO1lBQ0gsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUE7WUFDakIsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN0QixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUM3QixJQUFJLEdBQUcsa0JBQWtCLElBQUksMENBQTBDLENBQUE7YUFDeEU7U0FDRjtRQUNELE1BQU0sUUFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUU7O1VBRXZCLEdBQUc7U0FDSixJQUFJO29DQUN1QixDQUFDLENBQUE7S0FDbEM7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0ErQks7QUFFTCxLQUFLLFVBQVUsWUFBWSxDQUFDLEdBQVksRUFBRSxHQUFhO0lBQ3JELCtCQUErQjtJQUMvQixLQUFLLENBQUMsR0FBRyxDQUFDO1FBQ1IsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFO1FBQ1YsS0FBSyxFQUFFLHVCQUF1QjtRQUM5QixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7UUFDaEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1FBQ2QsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO1FBQ2hCLEtBQUssRUFBRSxHQUFHO1FBQ1YsS0FBSyxFQUFFLEtBQUs7S0FFYixDQUFDLENBQUE7SUFDRixTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNoQyxJQUFJLFNBQVMsQ0FBQTtJQUNiLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtRQUNiLFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUE7S0FDNUI7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDO1FBQ1IsR0FBRztRQUNILFFBQVEsRUFBRSxDQUFDO1FBQ1gsS0FBSyxFQUFFLFNBQVM7S0FDakIsQ0FBQyxDQUFBO0lBRUYsSUFBSSxLQUFhLENBQUM7SUFDbEIsSUFBSSxJQUFVLENBQUM7SUFDZixJQUFJLE1BQWMsQ0FBQztJQUNuQixJQUFJLFVBQW9CLENBQUM7SUFDekIsSUFBSSxJQUFZLENBQUM7SUFDakIsSUFBSSxFQUFtQixDQUFDO0lBQ3hCLElBQUksSUFBWSxDQUFDO0lBQ2pCLElBQUksU0FBaUIsQ0FBQztJQUN0QixJQUFJLFVBQWtCLENBQUM7SUFDdkIsSUFBSSxPQUF3QixDQUFDO0lBQzdCLElBQUksTUFBeUIsQ0FBQztJQUM5QixJQUFJLFVBQVUsR0FBRyxNQUFNLGVBQWUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUE7SUFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7UUFBRSxPQUFPLE1BQU0sUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUE7S0FBRTtJQUMxRixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRTFGLE1BQU0sU0FBUyxHQUFjLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3JELE1BQU0sVUFBVSxHQUFlLGVBQWUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUE7SUFDakUsT0FBTyxHQUFHLE1BQU0sVUFBVSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQSxDQUFHLGlEQUFpRDtJQUV6RixJQUFJLElBQUksS0FBSyxNQUFNLEVBQUU7UUFBRSxNQUFNLEdBQUcsTUFBTSxRQUFRLEVBQUUsQ0FBQTtLQUFFO0lBQ2xELElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtRQUFFLE1BQU0sR0FBRyxNQUFNLFdBQVcsRUFBRSxDQUFBO0tBQUU7SUFDeEQsSUFBSSxJQUFJLEtBQUssS0FBSztRQUNoQixTQUFTLENBQUMsZ0JBQWdCO1FBQzFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUN2QyxNQUFNLEdBQUcsTUFBTSxZQUFZLEVBQUUsQ0FBQTtLQUM5QjtTQUFNLElBQUksSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFO1FBQ2hELE1BQU0sR0FBRyxNQUFNLFVBQVUsRUFBRSxDQUFBO0tBQzVCO1NBQU0sSUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO1FBQzVCLE1BQU0sR0FBRyxNQUFNLFVBQVUsRUFBRSxDQUFBO0tBQzVCO0lBSUQsSUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO1FBQUUsTUFBTSxHQUFHLE1BQU0sVUFBVSxFQUFFLENBQUE7S0FBRTtJQUV0RCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDZixPQUFPLElBQUksQ0FBQTtJQUNYOzs7Ozs7Ozs7Ozs7O01BYUU7SUFFRixLQUFLLFVBQVUsZUFBZSxDQUFDLEdBQUcsRUFBRSxHQUFHO1FBQ3JDOzs0RUFFb0U7UUFFcEUsSUFBSSxJQUFZLENBQUEsQ0FBRSx3Q0FBd0M7UUFDMUQsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFBO1FBRTFCLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDcEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUE7U0FDdEM7UUFFRDs7cUhBRTZHO1FBQzdHLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUM3RCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQ3RCLElBQUksR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3JELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTthQUNsRDtpQkFBTTtnQkFDTCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7b0JBQUUsVUFBVSxHQUFHLGFBQWEsQ0FBQTtpQkFBRTtxQkFBTTtvQkFBRSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtpQkFBRTtnQkFDckcsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUU7b0JBQUUsVUFBVSxHQUFHLGFBQWEsQ0FBQTtpQkFBRTtnQkFDN0U7O3FCQUVLO2dCQUNMLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtnQkFDdEIsTUFBTSxHQUFHLEdBQVcsRUFBRSxDQUFDLENBQWMsaURBQWlEO2dCQUN0RixHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFBO2dCQUN4QyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsR0FBRyxDQUFBO2dCQUN2QixNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQTtnQkFDbEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7YUFDckQ7U0FDRjtRQUVELGlDQUFpQztRQUNqQyxJQUNFLENBQUMsQ0FBQyxVQUFVLEtBQUssYUFBYTtZQUM1QixVQUFVLEtBQUssU0FBUztZQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQ3RELEVBQ0Q7WUFDQSxrQkFBa0I7WUFDbEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBO1lBQzFCLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQztlQUNILElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO29CQUNqQixVQUFVLEdBQUcsQ0FBQyxDQUFBO1lBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMseURBQXlELENBQUMsQ0FBQTtTQUMzRTtRQUVELHlDQUF5QztRQUN6QyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7UUFDbkMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7UUFDbEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNyQix3RUFBd0U7UUFHeEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDakIsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUN4RCxNQUFNLElBQUksS0FBSyxDQUFDLHVEQUF1RCxDQUFDLENBQUE7U0FDekU7UUFFRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDaEQsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRTtnQkFDdkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUE7Z0JBQzNFLE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQTthQUN6RTtTQUNGO1FBR0QsaUVBQWlFO1FBQ2pFLElBQUksVUFBVSxLQUFLLGFBQWEsRUFBRTtZQUNoQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUE7WUFDOUIsYUFBYSxHQUFHLFVBQVUsQ0FBQTtTQUMzQjtRQUNELE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFDRDs7MERBRXNEO0lBRXREOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILEtBQUssVUFBVSxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxVQUFVO1FBQzFDLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDdEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFBO1FBQzNCLGdCQUFnQjtRQUNoQixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUE7UUFDMUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUNuRCxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2pCLE9BQU07SUFDUixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7O1FBY0k7SUFDSixTQUFTLFVBQVUsQ0FBQyxHQUFHO1FBRXJCLGlEQUFpRDtRQUNqRCxNQUFNLFVBQVUsR0FBRztZQUNqQixNQUFNO1lBQ04sU0FBUztZQUNULEtBQUs7WUFDTCxVQUFVO1lBQ1YsUUFBUTtZQUNSLFFBQVE7U0FDVCxDQUFBO1FBQ0QsV0FBVztRQUNYLElBQUksS0FBSyxHQUFXLEVBQUUsQ0FBQTtRQUN0QixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ25CLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQTtZQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLO2tDQUNELENBQUMsQ0FBQTtnQkFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssd0JBQXdCLENBQUMsQ0FBQTthQUN6RDtTQUNGO1FBRUQsV0FBVztRQUNYLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDcEIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFBLENBQUMsZ0NBQWdDO1lBQzFELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLE1BQU0scUNBQXFDLENBQUMsQ0FBQTthQUNsRjtZQUNELEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFBO1NBQzlCO1FBQ0QsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsNERBQTRELE1BQU0sRUFBRSxDQUFDLENBQUE7U0FDdEY7UUFFRCxVQUFVO1FBQ1YsSUFBSSxJQUFJLEdBQVMsRUFBRSxDQUFBO1FBQ25CLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDbEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFBO1lBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM5QixNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxDQUFBO2FBQy9DO1lBQ0QsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxJQUFJLHlCQUF5QixDQUFDLENBQUE7YUFFdkQ7U0FDRjtRQUVELGVBQWU7UUFDZixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUE7UUFDbkIsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtZQUN2QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFBRSxVQUFVLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUE7YUFBRTtpQkFDdkU7Z0JBQUUsVUFBVSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQTthQUFFO1NBQzVDO1FBRUQsaUJBQWlCO1FBQ2pCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQSxDQUFDLHlCQUF5QjtRQUN0QyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQUUsSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQUU7UUFFckQsUUFBUTtRQUNSLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQSxDQUFDLGFBQWE7UUFDeEIsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRTtZQUNoQixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssT0FBTyxFQUFFO2dCQUMzQixFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUE7YUFDbEI7aUJBQU07Z0JBQ0wsRUFBRSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO2FBQzVCO1NBQ0Y7UUFFRCx3QkFBd0I7UUFDeEIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBQ2IsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtZQUFFLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQTtTQUFFO1FBRTdDLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQTtRQUNsQixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQUUsU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFBO1NBQUU7UUFFNUQsK0VBQStFO1FBQy9FLCtFQUErRTtRQUMvRSwrRUFBK0U7UUFHL0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxLQUFLLE1BQU0sRUFBRTtZQUMvRCxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUE7U0FDNUI7UUFDRCxJQUFJLFVBQVUsR0FBZSxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLDhDQUE4QztRQUVuRyxLQUFLLENBQUMsR0FBRyxDQUFDO1lBQ1IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO1lBQ2hCLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtZQUNkLE1BQU07WUFDTixLQUFLO1lBQ0wsSUFBSTtZQUNKLEVBQUU7WUFDRixJQUFJO1lBQ0osU0FBUztTQUNWLENBQUMsQ0FBQTtRQUNGLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFBO0lBQ2pGLENBQUM7SUFJRDs7Ozs7Ozs7OztNQVVFO0lBQ0YsS0FBSyxVQUFVLFVBQVUsQ0FBQyxHQUFZLEVBQUUsSUFBWTtRQUNsRCxJQUFJLE9BQXdCLENBQUM7UUFFN0IsK0NBQStDO1FBRS9DLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDZixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTztZQUNwQixDQUNFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO2dCQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQ3JDLEVBQUU7WUFDSCxNQUFNLFdBQVcsR0FBUyxFQUFFLENBQUEsQ0FBSywyQ0FBMkM7WUFDNUUsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDakMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTthQUM5QjtZQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1lBR3hDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNsQixLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtnQkFDcEIsSUFBSSxHQUFHLEdBQVU7b0JBQ2YsU0FBUyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTTtvQkFDN0IsU0FBUyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ3JCLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUNyQixTQUFTLEVBQUUsS0FBSztvQkFDaEIsSUFBSSxFQUFFLElBQUk7b0JBQ1YsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDO2lCQUNsQyxDQUFBO2dCQUNELEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFBO2dCQUN0QyxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNuQixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ2Y7WUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFO2dCQUMxRSxNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7Z0JBQ3pDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3BDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUM5QixNQUFNLEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFBO29CQUNyRixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7b0JBQzVCLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO2lCQUNwRjthQUNGO1NBQ0Y7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBQ0Q7Ozs7dUVBSW1FO0lBR25FOzs7Ozs7Ozt1REFRbUQ7SUFFbkQ7Ozs7Ozs7O3dEQVFvRDtJQUNwRDs7O09BR0c7SUFDSCxLQUFLLFVBQVUsUUFBUTtRQUNyQixLQUFLLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUE7UUFDN0IsSUFBSSxNQUFNLEVBQUU7WUFDVixLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ25CLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNwQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQTtZQUU5QixVQUFVLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUE7WUFDN0IsSUFBSSxZQUFZLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQTthQUFFO1lBQy9GLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUE7YUFBRTtZQUMxRSxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBO2FBQUU7WUFDdkUsSUFBSSxZQUFZLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQTthQUFFO1lBQ3RGLElBQUksWUFBWSxDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUFFLFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUE7YUFBRTtZQUMvRixJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBO2FBQUU7WUFDdkU7O3FCQUVTO1lBQ1QsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFO2dCQUNyQixVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQTthQUN2QztZQUNEOzs7OztxQkFLUztZQUNULElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtnQkFDdkIsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUE7Z0JBQ3JELFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtnQkFDakMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFBO2lCQUFFO2dCQUNoRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO29CQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUE7aUJBQUU7Z0JBQ3JFLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFBO2dCQUNsQyxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO29CQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUM1RCwyREFBMkQ7d0JBQzNELG1EQUFtRDt3QkFDbkQsTUFBTSxNQUFNLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO3dCQUMzSCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7d0JBQ3ZCLElBQUksS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7NEJBQ3ZFLHVEQUF1RDs0QkFDdkQsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7Z0NBQ3RDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtnQ0FDdEIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFBO2dDQUNaLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO29DQUFFLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2lDQUFFO2dDQUN4RSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtvQ0FBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtpQ0FBRTtnQ0FDN0UsS0FBSyxJQUFJLElBQUksR0FBRyxRQUFRLENBQUE7Z0NBQ3hCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7NkJBQ3hEO2lDQUFNLElBQUksS0FBSyxLQUFLLGVBQWUsRUFBRTtnQ0FDcEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFBOzZCQUMvQjtpQ0FBTTtnQ0FDTCw4Q0FBOEM7Z0NBQzlDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0NBQy9CLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtvQ0FDbkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7aUNBQzVCO3FDQUFNO29DQUNMLFNBQVE7aUNBQ1Q7NkJBQ0Y7eUJBRUY7d0JBQ0QsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7cUJBQ3JFO2lCQUNGO2FBQ0Y7WUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUU5QixJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUU7Z0JBQ3JCLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2FBQ2xFO1lBQ0QsSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFO2dCQUN4QixVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFBO2dCQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3BELFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO2lCQUNuRDthQUNGO1lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtTQUNqQzthQUFNO1lBQ0w7Ozs7Ozs7OztpRUFTcUQ7WUFFckQsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLDhCQUE4QjtnQkFDakUsVUFBVSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFBLENBQUMsMENBQTBDO2dCQUNyRixLQUFLLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQTthQUNyRDtpQkFBTTtnQkFDTCxVQUFVLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUE7Z0JBQzdCLFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxLQUFLLENBQUE7Z0JBQ2xDLElBQUksU0FBUyxDQUFDLFlBQVksRUFBRTtvQkFBRSxVQUFVLENBQUMsY0FBYyxDQUFDLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQTtpQkFBRTtnQkFDbkYsK0hBQStIO2dCQUMvSCxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFBO2dCQUM1QixJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUU7b0JBQ3BCLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFBO2lCQUN4QzthQUNGO1lBRUQsOEVBQThFO1lBQzlFLG9FQUFvRTtZQUNwRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNwRCxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFBO2dCQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN0RCxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7aUJBQ3JEO2FBQ0Y7WUFFRCwwREFBMEQ7WUFDMUQsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtnQkFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUE7YUFBRTtZQUMzRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO2dCQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQTthQUFFO1lBRTFFLDRFQUE0RTtZQUM1RSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN6QixVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUc7b0JBQ3JCLEtBQUssRUFBRSxFQUFFO29CQUNULFFBQVEsRUFBRSxFQUFFO2lCQUNiLENBQUE7YUFDRjtZQUNELDBFQUEwRTtZQUMxRSxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO2dCQUNuQixVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFBO2dCQUM1QyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTthQUNuQztZQUNELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNULEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDakUsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDakMsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFXLENBQUE7b0JBQzNELElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFBO29CQUN2QyxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQTtvQkFDbkMsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTt3QkFDdEcsT0FBTyxHQUFHLFVBQVUsQ0FBQTt3QkFDcEIsS0FBSyxHQUFHLElBQUksS0FBSyxHQUFHLENBQUE7cUJBQ3JCO29CQUVELFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUE7aUJBQ25FO2FBQ0Y7WUFFRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO2dCQUM1QyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFBO2dCQUN2QixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO29CQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQTtpQkFBRTtnQkFDcEUsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtvQkFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUE7aUJBQUU7YUFDekU7U0FDRjtRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBRTFELEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7UUFFckIscUNBQXFDO1FBQ3JDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsQ0FBQTtRQUUxQywrQkFBK0I7UUFDL0IsTUFBTSxHQUFHLE1BQU0sU0FBUyxDQUN0QixVQUFVLEVBQ1YsS0FBSyxFQUNMLFVBQVUsRUFDVixHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFDZCxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFDaEIsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQ2hCLENBQUE7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7Ozs7Ozt1REFTbUQ7SUFDbkQsS0FBSyxVQUFVLFdBQVc7UUFDeEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO1FBQ2pDLElBQUksSUFBSSxHQUFXLEVBQUUsQ0FBQztRQUN0QixJQUFJLFNBQVMsR0FBVyxFQUFFLENBQUM7UUFFM0IsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFO1lBQUUsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUE7U0FBRTtRQUM3QyxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUU7WUFBRSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQTtTQUFFO1FBQzVELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQTtZQUN6QyxTQUFTLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFBO1NBQ3BEO1FBQ0QsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtZQUFFLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQWMsQ0FBQTtTQUFFO1FBQ3ZELElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7WUFBRSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFtQixDQUFBO1NBQUU7UUFDdEUsT0FBTyxNQUFNLE9BQU8sQ0FDbEIsVUFBVSxFQUNWLEtBQUssRUFDTCxFQUFFLEVBQ0YsSUFBSSxFQUNKLFNBQVMsQ0FFVixDQUFBO0lBQ0gsQ0FBQztJQUdEOzs7Ozs7OztnRUFRNEQ7SUFFNUQsS0FBSyxVQUFVLFlBQVk7UUFDekIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO1FBQ2pDLE9BQU8sTUFBTSxJQUFBLG1DQUFlLEVBQzFCLFVBQVUsRUFDVixLQUFLLEVBQ0wsR0FBRyxDQUFDLEtBQUssRUFDVCxTQUFTLENBQ1YsQ0FBQTtJQUNILENBQUM7SUFFRCxLQUFLLFVBQVUsVUFBVTtRQUN2QixLQUFLLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ2hDLE1BQU0sTUFBTSxHQUFXLEVBQUUsQ0FBQSxDQUFlLHNDQUFzQztRQUU5RTs7cUJBRWE7UUFFYixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFO1lBQ3pCLElBQUksVUFBVSxDQUFBO1lBQ2QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ3hDLFVBQVUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQTthQUNuQztpQkFBTTtnQkFDTCxVQUFVLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFBO2FBQ3JDO1lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUM1QyxLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRTtnQkFDbEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtnQkFDcEIsSUFBSSxLQUFLLEdBQW9CLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFXLENBQUE7Z0JBQzNELElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFBRSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtpQkFBRTtnQkFDeEQsSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUU7b0JBQ25FLEtBQUssR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO2lCQUNoQztxQkFBTSxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO29CQUNsRCxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO2lCQUN0QjtnQkFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFBO2FBQzFCO1NBQ0Y7UUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQTtRQUMzQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO1FBQ3RELE9BQU8sTUFBTSxVQUFVLENBQ3JCLFVBQVUsRUFDVixLQUFLLEVBQ0wsRUFBRSxFQUNGLElBQUksRUFDSixNQUFNLEVBQ04sR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQ2xCLElBQUksRUFDSixTQUFTLEVBQ1QsR0FBRyxDQUFDLEtBQUssRUFDVCxVQUFVLEVBQ1YsT0FBTyxFQUNQLFNBQVMsQ0FDVixDQUFBO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7O3VEQU9tRDtJQUVuRCxLQUFLLFVBQVUsVUFBVTtRQUN2QixLQUFLLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUE7UUFDNUIsT0FBTyxNQUFNLFVBQVUsQ0FDckIsVUFBVSxFQUNWLEtBQUssRUFDTCxFQUFFLEVBQ0YsSUFBSSxFQUNKLEdBQUcsQ0FBQyxJQUFJLEVBQUUsd0RBQXdEO1FBQ2xFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUNsQixJQUFJLEVBQ0osU0FBUyxFQUNULEdBQUcsQ0FBQyxLQUFLLEVBQ1QsVUFBVSxFQUNWLE9BQU8sRUFDUCxTQUFTLENBQ1YsQ0FBQTtJQUNILENBQUM7SUFFRDs7Ozs7O3VEQU1tRDtJQUNuRCxLQUFLLFVBQVUsVUFBVTtRQUN2QixPQUFPLE1BQU0sU0FBUyxDQUNwQixVQUFVLEVBQ1YsS0FBSyxFQUNMLEVBQUUsQ0FDSCxDQUFBO0lBQ0gsQ0FBQztJQUlEOzs7Ozs7Ozs7dURBU21EO0lBRW5ELEtBQUssVUFBVSxPQUFPLENBQUMsTUFBeUI7UUFDOUMsSUFBSSxRQUFRLEdBQWE7WUFDdkIsTUFBTSxFQUFFLEVBQUU7WUFDVixRQUFRLEVBQUUsRUFBRTtZQUNaLE9BQU8sRUFBRSxFQUFFO1NBQ1osQ0FBQztRQUNGLElBQUksTUFBTSxFQUFFO1lBQ1YsSUFBSSxPQUFPLE1BQU0sSUFBSSxRQUFRLEVBQUU7Z0JBQzdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUE7Z0JBQzNCLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFBO2FBQ3pDO2lCQUFNO2dCQUNMLFFBQVEsR0FBRyxNQUFNLENBQUE7YUFDbEI7U0FDRjtRQUNELFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFBO1FBQ3RDLE1BQU0sTUFBTSxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDckQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNqQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUE7UUFDckYsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0FBQ0gsQ0FBQztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBIn0=