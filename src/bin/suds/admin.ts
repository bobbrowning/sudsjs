const listTable = require('./list-table');
const listRow = require('./list-row');
const deleteRow = require('./delete-row');
const sendView = require('./send-view');
const updateForm = require('./update-form');
import { checkRecordType } from './check-record-type';

const home = require('./home');
const suds = require('../../config/suds');
const reports = require('../../config/reports');
const trace = require('track-n-trace');
const db = require('./db');
const mergeAttributes = require('./merge-attributes');
const lang = require('../../config/language').EN;
const tableDataFunction = require('./table-data');
import { ReportData, Audit, ViewData, Request, Response, Mode, Record } from "../types";
import { Properties, TableData } from "../types-schema";
const csrf=require('./csrf')


/** The system caches the compiled schema. It is recompiled when the permission changes
 * because is inludes flages whowing whether the current user can do different things.
 * It is initiated to 'guest' to ensure it is recompilted the first time through.
 */
let oldPermission = '#guest#';
let startTime: number;



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
async function admin(req: Request, res: Response) {
  try {
    await adminprocess(req, res)
  } catch (err) {
    const dateStamp: string = new Date().toLocaleString()
    console.log(`
    
********************** Error ***************************
${dateStamp}`)
    console.log(err)
    console.log(`
********************************************************
    
    ` )
    let file = ''
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
    <a href='/admin'>Admin page</a>`)
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

async function adminprocess(req: Request, res: Response) {
  //   trace.log(req.connection);
  trace.log({
    ip: req.ip,
    start: 'admin (ts version...)',
    query: req.query,
    body: req.body,
    files: req.files,
    break: '#',
    level: 'min'

  })
  startTime = new Date().getTime()
  /** CSRF
   * Set session csrf.
   */
  trace.log(req.session.csrf)
  csrf.setToken(req)
  trace.log(req.session.csrf)

  trace.log({
    req,
    maxdepth: 3,
    level: 'verbose'
  })
   
  let table: string;
  let mode: Mode;
  let report: string;
  let subschemas: string[];
  let page: number;
  let id: string | number;
  let open: string;
  let openGroup: string;
  let reportData: object;
  let auditId: string | number;
  let output: string | ViewData = '';
  let permission = await checkPermission(req, res);
  trace.log({ table: req.query.table })
  if (!req.query.table && !req.query.report) { return await mainMenu(req, res, permission) }
  [table, mode, report, subschemas, page, id, open, openGroup, reportData] = parseQuery(req)

  const tableData: TableData = tableDataFunction(table)
  const attributes: Properties = mergeAttributes(table, permission)
  auditId = await auditTrail(req, mode)   // create audit trail record if mode is auditable

  if (mode === 'list') { output = await listMode() }
  if (mode === 'listrow') { output = await listRowMode() }
  if (mode === 'new' &&
    tableData.recordTypeColumn &&
    !req.body[tableData.recordTypeColumn]) {
    output = await checkRecType()
  } else if (mode === 'new' || mode === 'populate') {
    output = await newPopMode()
  } else if (mode === 'update') {
    output = await updateMode()
  }



  if (mode === 'delete') { output = await deleteMode() }

  sendOut(output)
  return 'OK'
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

    let user: Record = { createdAt: 0, updatedAt: 0 }
    let permission: any = '#guest#'

    if (req.cookies.user) {
      req.session.userId = req.cookies.user
    }

    /* 
     The user file may have any format. So the authorisation object (aut) lists the columns used in the user file
    *  for authorisation. There are two standard objects in the config file- one for sql and another for nosql */
    const aut = suds.authorisation[suds[suds.dbDriver].authtable]
    if (req.session.userId) {
      user = await db.getRow(aut.table, req.session.userId)
      if (user['err']) {
        console.log(`Unknown user ${req.session.userId}`)
      } else {
        if (user[aut.superuser]) { permission = '#superuser#' } else { permission = user[aut.permissionSet] }
        if (suds.superuser === user[aut.emailAddress]) { permission = '#superuser#' }
        /** 
         * Last seen at date is updated in the user record 
         * */
        const now = Date.now()
        const rec: object = {};              // Properties may be changed by the configuration
        rec[aut.primaryKey] = req.session.userId
        rec['lastSeenAt'] = now
        await db.updateRow(aut.table, rec)
        trace.log({ 'User record': user, level: 'verbose' })
      }
    }

    /* validate permission set.    */
    if (
      !(permission === '#superuser#' ||
        permission === '#guest#' ||
        Object.keys(suds.permissionSets).includes(permission)
      )
    ) {
      /* log user out */
      req.session.userId = false
      res.clearCookie('user');
      console.log(`User has non-standard permission.
      Email: ${user[aut.emailAddress]} 
      Permission: ${permission} `)
      throw new Error(`Sorry - there has been a problem. Please log in again. `)
    }

    /* store the permision in session data.*/
    req.session.permission = permission
    trace.log({ user: req.session.userId, permission, level: 'user' })
    trace.log(permission)
    //   global.suds = { user: req.session.userId, permission: permission };


    trace.log(req.ip)
    if (suds.blockIp && suds.blockIp.includes(req.ip)) {
      console.log(`Attenpt to access by blocked ip ${req.ip}`)
      throw new Error(`Sorry, you do not have permission to access this site`)
    }

    if (req.session.userId && user[aut.emailAddress]) {
      if (suds.blockEmail && suds.blockEmail.includes(user[aut.emailAddress])) {
        console.log(`Attenpt to access by blocked email ${user[aut.emailAddress]}`)
        throw new Error(`Sorry, you do not have permission to access this site`)
      }
    }


    /* If this is a new permission set - re-compile the attributes */
    if (permission !== oldPermission) {
      mergeAttributes('clear-cache')
      oldPermission = permission
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
    trace.log('home page')
    req.session.reportData = {}
    // trace.stop();
    const output = await home(req, permission)
    const result = await sendView(res, 'admin', output)
    trace.log(result)
    return
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
  function parseQuery(req): [string, Mode, string, string[], number, string | number, string, string, object] {

    /* These processes are  handles by the program */
    const validModes = [
      'list',
      'listrow',
      'new',
      'populate',
      'update',
      'delete'
    ]
    /* Table */
    let table: string = ''
    if (req.query.table) {
      table = req.query.table
      if (!suds.tables.includes(table)) {
        console.log(`Table: ${table} is not a valid table. It must be listed
      in the suds.js config file.`)
        throw new Error(`Table: ${table} is not a valid table.`)
      }
    }

    /* Report*/
    let report = ''
    if (req.query.report) {
      report = req.query.report // If listing a table the report
      if (!reports[report]) {
        throw new Error(`admin.js::Report: ${report} is not in the reports config file.`)
      }
      table = reports[report].table
    }
    if (!table) {
      throw new Error(`admin.js::No table given. - may be an issue with report: ${report}`)
    }

    /* Mode */
    let mode: Mode = ''
    if (req.query.mode) {
      mode = req.query.mode
      if (!validModes.includes(mode)) {
        throw new Error(`${mode} is not a valid mode`)
      }
      if (mode && !table && !report) {
        throw new Error(`Mode ${mode} but no table or report`)

      }
    }

    /* subschemas*/
    let subschemas: string[] = []
    if (req.query.subschema) {
      if (Array.isArray(req.query.subschema)) { subschemas = req.query.subschema }
      else { subschemas = [req.query.subschema] }
    }

    /* page number */
    let page = 0 // page number in listing
    if (req.query.page) { page = Number(req.query.page) }
    trace.log(page, typeof page)
    /* id */
    let id = 0 // record key
    if (req.query.id) {
      if (suds.dbType === 'nosql') {
        id = req.query.id
      } else {
        id = parseInt(req.query.id)
      }
    }

    /* open and openGroup */
    let open = ''
    if (req.query.open) { open = req.query.open }

    let openGroup = ''
    if (req.query.opengroup) { openGroup = req.query.opengroup }

    /* Session data includes the 'current' report specification so users can go  */
    /* into details page and back without losing the report layout.              */
    /* Make sure there is an object to modify.                                   */


    if (!req.session.reportData || req.query.clearreport === 'true') {
      req.session.reportData = {}
    }
    let reportData: ReportData = req.session.reportData; // this will contain a copy of the report spec

    trace.log(page, typeof page)

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
    })
    return [table, mode, report, subschemas, page, id, open, openGroup, reportData]
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
  async function auditTrail(req: Request, mode: string) {
    let auditId: any;  // Not really any, but don't know how to tell typescript that I *know* the record key is a string or number

    /* Consolidate all parameters in one object. */

    trace.log(mode)
    if (suds.audit.include &&
      (
        !suds.audit.operations ||
        suds.audit.operations.includes(mode)
      )) {
      const requestData: object = {}     // Clones req - properties depend on config
      for (const item of suds.audit.log) {
        requestData[item] = req[item]
      }
      trace.log({ auditing: table, id, page })


      if (table && !page) {
        trace.log(table, id)
        let rec: Audit = {
          updatedBy: req.session.userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tableName: table,
          mode: mode,
          row: id,
          data: JSON.stringify(requestData)
        }
        rec = await db.createRow('audit', rec)
        auditId = rec['id']
        trace.log(rec)
      }

      if (suds.audit.include && suds.audit.trim && suds[suds.dbDriver].countable) {
        const count = await db.countRows('audit')
        trace.log(count, suds.audit.trim[1])
        if (count > suds.audit.trim[1]) {
          const old = await db.getRows('audit', {}, suds.audit.trim[0], 1, 'createdAt', 'DESC')
          trace.log({ trimfrom: old })
          await db.deleteRows('audit', { searches: [['createdAt', 'lt', old[0].createdAt]] })
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
    trace.log('***** list *****')
    if (report) {
      trace.log('report')
      const reportObject = reports[report]
      trace.log(table, reportObject)

      reportData = { table: table }
      if (reportObject['friendlyName']) { reportData['friendlyName'] = reportObject['friendlyName'] }
      if (reportObject['title']) { reportData['title'] = reportObject['title'] }
      if (reportObject['open']) { reportData['open'] = reportObject['open'] }
      if (reportObject['openGroup']) { reportData['openGroup'] = reportObject['openGroup'] }
      if (reportObject['searchFields']) { reportData['searchFields'] = reportObject['searchFields'] }
      if (reportObject['view']) { reportData['view'] = reportObject['view'] }
      /***
             * Only applies to CouchDB
             */
      if (reportObject.view) {
        reportData['view'] = reportObject.view
      }
      /***
             *
             * Search object.
             * If a search refers to #today or #today+n or #loggedinuser then
             * substitute the appropriate values
             */
      if (reportObject.search) {
        reportData['search'] = { andor: 'and', searches: [] }
        reportObject.search.andor = 'and'
        if (reportData['search']['andor']) { reportData['search']['andor'] = reportObject.search.andor }
        if (req.query.andor) { reportData['search'].andor = req.query.andor }
        reportData['search'].searches = []
        if (reportObject.search.searches) {
          for (let i = 0; i < reportObject.search.searches.length; i++) {
            /* search is an array contains search criteria  number i */
            /* will move it into the reportData object later */
            const search = [reportObject.search.searches[i][0], reportObject.search.searches[i][1], reportObject.search.searches[i][2]]
            const value = search[2]
            if (value && typeof value === 'string' && value.substring(0, 1) === '#') {
              /* #today or #today+5 or #today-3  No spaces allowed */
              if (value.substring(0, 6) === '#today') {
                let today = Date.now()
                let diff = 0
                if (value.substring(6, 7) === '+') { diff = Number(value.substring(7)) }
                if (value.substring(6, 7) === '-') { diff = -1 * Number(value.substring(7)) }
                today += diff * 86400000
                search[2] = new Date(today).toISOString().split('T')[0]
              } else if (value === '#loggedInUser') {
                search[2] = req.session.userId
              } else {
                /*  Should be an input field with this name */
                const term = value.substring(1)
                if (req.query[term]) {
                  search[2] = req.query[term]
                } else {
                  continue
                }
              }

            }
            reportData['search'].searches[i] = [search[0], search[1], search[2]]
          }
        }
      }
      trace.log(reportObject.search)

      if (reportObject.sort) {
        reportData['sort'] = [reportObject.sort[0], reportObject.sort[1]]
      }
      if (reportObject.columns) {
        reportData['columns'] = []
        for (let i = 0; i < reportObject.columns.length; i++) {
          reportData['columns'][i] = reportObject.columns[i]
        }
      }
      trace.log(reportData['columns'])
    } else {
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
        reportData = req.session.reportData[table] // go with that.  But may be changed below
        trace.log('loading from session', table, reportData)
      } else {
        reportData = { table: table }
        reportData['friendlyName'] = table
        if (tableData.friendlyName) { reportData['friendlyName'] = tableData.friendlyName }
        /* AddRow is the wording on the 'new' button. Defaults to 'New'. Not really used in the test data and probably not required. */
        reportData['addRow'] = 'New'
        if (tableData.addRow) {
          reportData['addRow'] = tableData.addRow
        }
      }

      /* If we don't have the columns already then clone them from the table data */
      /* if there are none there, then the program will list all fields */
      if (!reportData['columns'] && tableData.list?.columns) {
        reportData['columns'] = []
        for (let i = 0; i < tableData.list.columns.length; i++) {
          reportData['columns'][i] = tableData.list.columns[i]
        }
      }

      /* Over-write from URL if sort/search/open are there... */
      if (req.query.open) { reportData['open'] = req.query.open }
      if (req.query.openGroup) { reportData['openGroup'] = req.query.opengroup }

      /* If there is no search structure make sure there is one to be modified. */
      if (!reportData['search']) {
        reportData['search'] = {
          andor: '',
          searches: []
        }
      }
      // if there is a search in the URL, this should replace the current search
      if (req.query.andor) {
        reportData['search'].andor = req.query.andor
        reportData['search'].searches = []
      }
      let i = 0
      for (let j = 1; j < req.app.locals.suds.search.maxConditions; j++) {
        if (req.query['searchfield_' + j]) {
          const searchField = req.query['searchfield_' + j] as string
          let compare = req.query['compare_' + j]
          let value = req.query['value_' + j]
          if (attributes[searchField] && attributes[searchField].process && attributes[searchField].process?.JSON) {
            compare = 'contains'
            value = `"${value}"`
          }

          reportData['search'].searches[i++] = [searchField, compare, value]
        }
      }

      if (req.query.sortkey || req.query.direction) {
        reportData['sort'] = []
        if (req.query.sortkey) { reportData['sort'][0] = req.query.sortkey }
        if (req.query.direction) { reportData['sort'][1] = req.query.direction }
      }
    }

    trace.log({ report: report, reportInfo: reports[report] })

    trace.log(reportData)

    /* Load into the session variable  */
    req.session.reportData[table] = reportData

    /* Run list table controller */
    output = await listTable(
      permission,
      table,
      reportData,
      page,
      req.query.parent,
      req.query.limit
    )
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
    trace.log('***** List Row *****')
    let open: string = '';
    let openGroup: string = '';

    if (tableData.open) { open = tableData.open }
    if (tableData.opengroup) { openGroup = tableData.opengroup }
    if (req.session.reportData[table]) {
      open = req.session.reportData[table].open
      openGroup = req.session.reportData[table].openGroup
    }
    if (req.query.open) { open = req.query.open as string }
    if (req.query.opengroup) { openGroup = req.query.opengroup as string }
    return await listRow(
      permission,
      table,
      id,
      open,
      openGroup,

    )
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
    trace.log('new with record type')
    return await checkRecordType(
      permission,
      table,
      req.query,
      req.session.csrf
    )
  }

  async function newPopMode() {
    trace.log('new or populate', id)
    const record: object = {}               // record properties depends on config

    /*       if (req.query.parent) {
             record[req.query.searchfield] = req.query[req.query.searchfield];
             } */

    if (req.query.prepopulate) {
      let fieldNames
      if (Array.isArray(req.query.prepopulate)) {
        fieldNames = req.query.prepopulate
      } else {
        fieldNames = [req.query.prepopulate]
      }
      trace.log(req.query.prepopulate, fieldNames)
      for (const fieldName of fieldNames) {
        trace.log(fieldName)
        let value: string | number = req.query[fieldName] as string
        if (req.body[fieldName]) { value = req.body[fieldName] }
        if (attributes[fieldName].primaryKey || attributes[fieldName].model) {
          value = db.standardiseId(value)
        } else if (attributes[fieldName].type === 'number') {
          value = Number(value)
        }

        record[fieldName] = value
      }
    }
    trace.log({ mode, id, record, subschemas })
    trace.log({ user: req.session.userId, level: 'user' })
    return await updateForm(
      permission,
      table,
      id,
      mode,
      record,
      req.session.userId,
      open,
      openGroup,
      req.files,
      subschemas,
      auditId,
      req.session.csrf
    )
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
    trace.log('**** update ***')
    csrf.checkToken(req);
  

    return await updateForm(
      permission,
      table,
      id,
      mode,
      req.body, // This contains all the data to be validated / updated.
      req.session.userId,
      open,
      openGroup,
      req.files,
      subschemas,
      auditId,
      req.session.csrf
    )
  }

  /** * *********************************************
    *
    *             D E L E T E
    *             -----------
    *
    *
    * ******************************************** */
  async function deleteMode() {
    return await deleteRow(
      permission,
      table,
      id
    )
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

  async function sendOut(output: string | ViewData) {
    let viewData: ViewData = {
      output: '',
      footnote: '',
      heading: '',
    };
    if (output) {
      if (typeof output == 'string') {
        viewData['output'] = output
        viewData['footnote'] = lang.footnoteText
      } else {
        viewData = output
      }
    }
    viewData['heading'] = lang.homeHeading
    const result = await sendView(res, 'admin', viewData)
    trace.log(result)
    trace.log({ 'Elapsed time (ms)': new Date().getTime() - startTime, level: 'timer', })
    return result
  }
}

module.exports = admin
