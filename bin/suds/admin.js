const listTable = require('./list-table')
const listRow = require('./list-row')
const deleteRow = require('./delete-row')
const sendView = require('./send-view')
const updateForm = require('./update-form')
const checkRecordType = require('./check-record-type').fn
const home = require('./home')
let suds = require('../../config/suds')
const reports = require('../../config/reports')
const trace = require('track-n-trace')
const db = require('./db')
const lang = require('../../config/language').EN

const validModes = [
  'list',
  'listrow',
  'new',
  'populate',
  'update',
  'delete'
]

const friendlyName = 'Central switching program.'
/** **********************************************************************
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
 * ************************************************************************** */

let startTime;

async function admin (req, res) {
  if (arguments[0] === suds.documentation) { return (friendlyName, '') }
  //   trace.log(req.connection);
  trace.log({
    ip: req.ip,
    start: 'admin',
    query: req.query,
    body: req.body,
    files: req.files,
    break: '#',
    level: 'min'

  })
  startTime=new Date().getTime()
  let csrfToken
  if (suds.csrf) {
    csrfToken = req.csrfToken()
  }
  trace.log({
    req,
    maxdepth: 3,
    level: 'verbose'
  })

  /** *************************************************************
     *
     * The session variable userId contains the key of the user table
     * of the currently logged-in user.
     * If a cookie with the user number has been set then that is the user
     * revisiting
     * read the user record and set the permission set for thsi user.
     * If there is no user logged in then the permission set is 'guest'.
     ************************************************************** */

  let user = {}
  let permission = '#guest#'

  if (req.cookies.user) {
    req.session.userId = req.cookies.user
  }
  const aut = suds.authorisation[suds[suds.dbDriver].authtable]
  if (req.session.userId) {
    user = await db.getRow(aut.table, req.session.userId)
    if (user.err) {
      console.log(`Unknown user ${req.session.userId}`)
    } else {
      if (user[aut.superuser]) { permission = '#superuser#' } else { permission = user[aut.permissionSet] }
      if (suds.superuser === user[aut.emailAddress]) { permission = '#superuser#' }
      /** * Last seen at */
      const now = Date.now()
      const rec = {}
      rec[aut.primaryKey] = req.session.userId
      rec.lastSeenAt = now
      await db.updateRow(aut.table, rec)

      trace.log({ 'User record': user, level: 'verbose' })
    }
  }

  /* validate permission set   */
  if (
    !(permission === '#superuser#' ||
      permission === '#guest#' ||
      Object.keys(suds.permissionSets).includes(permission)
    )
  ) {
    const note = `
User has non-standard permission: ${user[aut.emailAddress]} ${permission}
The user is being treated as a guest.
        `
    console.log(note)
    permission = '#guest#'
  }
  // store the permision in session data.
  req.session.permission = permission
  trace.log({ user: req.session.userId, permission, level: 'user' })
  trace.log(permission)
  //   global.suds = { user: req.session.userId, permission: permission };

  trace.log(req.ip)
  if (suds.blockIp && suds.blockIp.includes(req.ip)) {
    const notes = `
User ${req.ip} is blocked and being treated as a guest.
`
    console.log(notes)
    permission = '#guest#'
  }

  if (req.session.userId && user[aut.emailAddress]) {
    if (suds.blockEmail && suds.blockEmail.includes(user[aut.emailAddress])) {
      const notes = `
User ${user[aut.emailAddress]} is blocked and being treated as a guest.
`
      console.log(notes)
      permission = '#guest#'
    }
  }

  /** *********************************************
    *
      *  If there is no reference to a table or report then output the main menu.
      *
      * A session variable contains an object defining the 'current'
      * report with search and sort settings. This is retained from page to page
      * in a session variable. This session variable is cleared down on return to the menu.
      * ******************************************** */

  trace.log({ table: req.query.table })

  if (!req.query.table && !req.query.report) {
    trace.log('home page')
    req.session.reportData = {}
    // trace.stop();
    const output = await home(req, permission)
    const result = await sendView(res, 'admin', output)
    trace.log(result)
    return
  }

  /** * *********************************************
    *  Organise query parameters
    *
    * Assign parameters in the query string to variables
    * Note that when a form is submitted for update
    * the fields are *always* in the body. So there is
    * no confusion if query string parameter names are the same as
    * column names.
    *
    * Some of these won't be present dependin on the mode.
    *
    * ******************************************** */
  let table = ''
  if (req.query.table) {
    table = req.query.table
    if (!suds.tables.includes(table)) {
      console.error(`
        ********************** Fatal Error **********************
        ${Date()}
        Table: ${table} 
        This table is not a valid table. It must be listed
        in the suds.js config file.
         *******************************************************`)
      sendOut('Fatal error - see console log')
      return
    }
  }

  let mode = ''
  if (req.query.mode) {
    mode = req.query.mode
    if (!validModes.includes(mode)) {
      console.error(`
        ********************** Fatal Error **********************
        ${Date()}
        Table: ${table} 
        Mode: ${mode}
        This mode is not valid.
         *******************************************************`)
      sendOut('Fatal error - see console log')
      return
    }
  }

  let report = ''
  if (req.query.report) {
    report = req.query.report // If listing a table the report
    if (!reports[report]) {
      console.error(`
        ********************** Fatal Error **********************
        ${Date()}
        Report: ${report}
        This report is not in the reports config file.
         *******************************************************`)
      sendOut('Fatal error - see console log')
      return
    }
  }

  let subschemas = []
  if (req.query.subschema) {
    subschemas = req.query.subschema
    if (!Array.isArray(subschemas)) { subschemas = [subschemas] }
  }

  let page = 0 // page number in listing
  if (req.query.page) { page = Number(req.query.page) }

  if (report) {
    if (!reports[report]) {
      trace.log(reports)
      console.log(`No report ${report}`)
      res.send(`No report ${report}`)
      return
    }
    table = reports[report].table
  }
  if (!table) {
    console.log(`No table given. - may be an issue with report: ${report}`)
    res.send(`No table - may be an issue with report: ${report}`)
    return
  }

  const tableData = require('../../tables/' + table)
  const attributes = tableData.attributes

  let id = 0 // record key
  if (req.query.id) {
    if (suds.dbType === 'nosql') {
      id = req.query.id
    } else {
      id = parseInt(req.query.id)
    }
  }

  let open = ''
  if (req.query.open) { open = req.query.open }

  let openGroup = ''
  if (req.query.opengroup) { openGroup = req.query.opengroup }

  /* Session data includes the 'current' report specification so users can go  */
  /* into details page and back without losing the report layout.              */
  /* Make sure there is an object to modify.                                   */
  let reportData = {} // this will contain a copy of the report spec
  if (!req.session.reportData || req.query.clearreport === 'true') {
    req.session.reportData = {}
  }

  trace.log({
    query: req.query,
    path: req.path,
    report,
    table,
    mode,
    id,
    open,
    openGroup
  })

  /** * *********************************************
    *  Validate data
    * ******************************************** */
  let errortext = ''
  let errors = 0
  if (mode) {
    const modes = [
      'new', // New row - create blank form
      'populate', // Update stage 1 - populate for with current record
      'update', // Form has been submitted so validate and update
      'delete', // Delete record
      'list', // List a table
      'listrow' // list one row of a table
    ]
    if (!modes.includes(mode)) {
      errortext += 'Wrong mode: ' + req.query.mode
      errors++
    }
  }
  if (mode && !table && !report) {
    errortext += `Mode ${mode} but no table or report`
    errors++
  }

  trace.log({
    text: 'after validate URL',
    errors,
    errortext
  })
  if (errors) {
    suds = {} // clear down globals
    const result = await sendView(res, 'admin', `<h1>${errortext}</h1>`)
    return (result)
  }

  /** *********************************************
    *  Audit trail
    *
    * Add a reord to the audit trail assuming that the
    * mode is one of those specified for auditing in
    * config/suds.js.
    *
    * ******************************************** */
  let auditId = 0

  /* Consolidate all parameters in one object. */

  trace.log(mode)
  if (suds.audit.include &&
    (
      !suds.audit.operations ||
      suds.audit.operations.includes(mode)
    )) {
    const requestData = {}
    for (const item of suds.audit.log) {
      requestData[item] = req[item]
    }
    trace.log({ auditing: table, id, page })

    if (table && !page) {
      trace.log(table, id)
      let rec = {
        updatedBy: req.session.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tableName: table,
        mode,
        row: id,
        data: JSON.stringify(requestData)
      }
      rec = await db.createRow('audit', rec)
      auditId = rec.id
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

  /** ***********************************************************
     *
     * Now check the mode and process.  Initialise the variable that
     * will recieve the output.  Then call the appropriate controller.
      ************************************************************ */

  let output = ''

  /** * *********************************************
    *
    *            L I S T
    *            -------
    *
    * Mode = list so create report specification and call helper
    * to list the table.
    *
    * ******************************************** */

  if (mode === 'list') {
    /** * *********************************************
        *
        * If a report is specified the this has come from the home page,
        * set up the report specification in reportData.
        *
        * ***** clone ***** reportData so we don't have changes
        * to the search or sort ending back in the report object
        *
        * ******************************************** */

    trace.log('***** list *****')
    if (report) {
      trace.log('report')
      const reportObject = reports[report]
      trace.log(table, reportObject)

      reportData.table = table
      const copyfields = ['friendlyName', 'title', 'open', 'openGroup', 'searchFields', 'view']
      for (let i = 0; i < copyfields.length; i++) {
        const fieldName = copyfields[i]
        if (reportObject[fieldName]) { reportData[fieldName] = reportObject[fieldName] }
      }
      /***
             * Only applies to CouchDB
             */
      if (reportObject.view) {
        reportData.view = reportObject.view
      }
      /***
             *
             * Search object.
             * If a search refers to #today or #today+n or #loggedinuser then
             * substitute the appropriate values
             */
      if (reportObject.search) {
        reportData.search = {}
        reportObject.search.andor = 'and'
        if (reportData.search.andor) { reportData.search.andor = reportObject.search.andor };
        if (req.query.andor) { reportData.search.andor = req.query.andor }
        reportData.search.searches = []
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
              } else {
                if (value === '#loggedInUser') {
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
            }
            reportData.search.searches[i] = [search[0], search[1], search[2]]
          }
        }
      }
      trace.log(reportObject.search)

      if (reportObject.sort) {
        reportData.sort = [reportObject.sort[0], reportObject.sort[1]]
      }
      if (reportObject.columns) {
        reportData.columns = []
        for (let i = 0; i < reportObject.columns.length; i++) {
          reportData.columns[i] = reportObject.columns[i]
        }
      }
      trace.log(reportData.columns)
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
        reportData.table = table
        reportData.friendlyName = table
        if (tableData.friendlyName) { reportData.friendlyName = tableData.friendlyName }
        /* AddRow is the wording on the 'new' button. Defaults to 'New'. Not really used in the test data and probably not required. */
        reportData.addRow = 'New'
        if (tableData.addRow) {
          reportData.addRow = tableData.addRow
        }
      }

      /* If we don't have the columns already then clone them from the table data */
      /* if there are none there, then the program will list all fields */
      if (!reportData.columns && tableData.columns) {
        reportData.columns = []
        for (let i = 0; i < tableData.columns.length; i++) {
          reportData.columns[i] = tableData.columns[i]
        }
      }

      /* Over-write from URL if sort/search/open are there... */
      if (req.query.open) { reportData.open = req.query.open }
      if (req.query.openGroup) { reportData.openGroup = req.query.opengroup }

      /* If there is no search structure make sure there is one to be modified. */
      if (!reportData.search) {
        reportData.search = {
          andor: '',
          searches: []
        }
      }
      // if there is a search in the URL, this should replace the current search
      if (req.query.andor) {
        reportData.search.andor = req.query.andor
        reportData.search.searches = []
      }
      let i = 0
      for (let j = 1; j < req.app.locals.suds.search.maxConditions; j++) {
        if (req.query['searchfield_' + j]) {
          const searchField = req.query['searchfield_' + j]
          let compare = req.query['compare_' + j]
          let value = req.query['value_' + j]
          if (attributes[searchField] && attributes[searchField].process && attributes[searchField].process.JSON) {
            compare = 'contains'
            value = `"${value}"`
          }

          reportData.search.searches[i++] = [searchField, compare, value]
        }
      }

      if (req.query.sortkey || req.query.direction) {
        reportData.sort = []
        if (req.query.sortkey) { reportData.sort[0] = req.query.sortkey }
        if (req.query.direction) { reportData.sort[1] = req.query.direction }
      }
    }

    trace.log(reports[report])

    trace.log(reportData)

    /* Load into the session variable  */
    req.session.reportData[table] = reportData

    /* Run list table controller */
    output = await listTable(
      permission,
      table,
      reportData,
      req.query.page,
      req.query.parent,
      req.query.limit
    )
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
  if (mode === 'listrow') {
    trace.log('***** List Row *****')

    if (tableData.open) { open = tableData.open }
    if (tableData.opengroup) { openGroup = tableData.opengroup }
    if (req.session.reportData[table]) {
      open = req.session.reportData[table].open
      openGroup = req.session.reportData[table].openGroup
    }
    if (req.query.open) { open = req.query.open }
    if (req.query.opengroup) { openGroup = req.query.opengroup }

    output = await listRow(
      permission,
      req.query.table,
      id,
      open,
      openGroup
    )
  }

  /** * *********************************************
    *
    *          A D D   OR   P O P U L A T E   R O W
    *          ------------------------------------
    *
    *
    * Record to be added or populated with data for update
    *
    * ******************************************** */

  if (mode === 'new' &&
    tableData.recordTypeColumn &&
    !req.body[tableData.recordTypeColumn]) {
    trace.log('new with record type')
    output = await checkRecordType(
      permission,
      table,
      req.query,
      csrfToken

    )
  } else {
    if (mode === 'new' || mode === 'populate') {
      trace.log('new or populate', id)
      const record = {}

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
          let value = req.query[fieldName]
          if (req.body[fieldName]) { value = req.body[fieldName] }
          if (attributes[fieldName].primaryKey || attributes[fieldName].model) {
            value = db.standardiseId(value)
          } else {
            if (attributes[fieldName].type === 'number') {
              value = Number(value)
            }
          }
          record[fieldName] = value
        }
      }
      trace.log({ mode, id, record, subschemas })
      trace.log({ user: req.session.userId, level: 'user' })
      output = await updateForm(
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
        csrfToken
      )
    }
  }
  /** * *********************************************
    *
    *           U P D A T E
    *           -----------
    *
    * Record to be updated from data passed in the body.
    *
    * ******************************************** */

  if (mode === 'update') {
    trace.log('**** update ***')
    output = await updateForm(
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
      csrfToken
    )
  }

  /** * *********************************************
    *
    *             D E L E T E
    *             -----------
    *
    *
    * ******************************************** */
  if (mode === 'delete') {
    output = await deleteRow(
      permission,
      table,
      id
    )
  }

  sendOut(output)
  return 'OK'

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

  async function sendOut (output) {
    let viewData = {}
    if (typeof output === 'string' && output) {
      viewData.output = output
      viewData.footnote = lang.footnoteText
    } else {
      viewData = output
    }
    viewData.heading = lang.homeHeading
    const result = await sendView(res, 'admin', viewData)
    trace.log(result)
    trace.log({'Elapsed time (ms)': new Date().getTime()-startTime,level: 'timer',  })
    return result
  }
}
module.exports = admin
