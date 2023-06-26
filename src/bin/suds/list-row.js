
const suds = require('../../config/suds')
const trace = require('track-n-trace')
const mergeAttributes = require('./merge-attributes')
const tableDataFunction = require('./table-data')
const classes = require('../../config/classes')
const lang = require('../../config/language').EN
const db = require('./db')
const evalPermission = require('./eval-permission')

// let countRows = require('./count-rows');
// let totalRows = require('./total-rows');
// let getRow = require('./get-row');
const getSearchLink = require('./search-link')
const displayField = require('./display-field')
const humaniseFieldname = require('./humanise-fieldname')
const hasPermissionFunction = require('./has-permission')
const listTable = require('./list-table')
const addSubschemas = require('./subschemas')

/*
  friendlyName: 'List table row',
  description: 'List table row based on the model for that table.',
  inputs: {
    permission: {
      type: 'string',
      description: 'The permission set of the logged-in user',
    },
    table: {
      type: 'string',
      description: 'The table being listed',
    },
    id: {
      type: 'number',
      description: 'The key of the row being listed',
    },
    open: {
      type: 'string',
      description: `Child data to be opened on entry`,
    },
    openGroup: {
      type: 'string',
      description: `Group to be opened on entry`,
    }
  },

*/
module.exports = async function (permission, table, id, open, openGroup, subschemas) {
  trace.log({ inputs: arguments, break: '#', level: 'min', })
  trace.log({ where: 'list-row start', level: 'mid' }) // timing

  /* ************************************************
  *
  *   set up the data
  *
  ************************************************ */

  let mainPage = suds.mainPage
  if (!mainPage) { mainPage = '/' }
  const tableData = tableDataFunction(table, permission)
  if (!tableData.canView) {
    throw new Error(`list-row.js::Sorry - you don't have permission to view ${tableData.friendlyName} (${table}). Please log in and retry`)
  }
  const message = ''
  let attributes = await mergeAttributes(table, permission, subschemas) // Merve field attributes in model with config.suds tables
  trace.log({ attributes, level: 'verbose' })
  const record = await db.getRow(table, id) // populate record from database
  if (record.err) {
    throw new Error(`list-row.js::Unexpected error reading ${id} from ${table} Error:${record.err} ${record.msg}`)
  }
  if (tableData.subschema) {
    subschemas = record[tableData.subschema.key]
    trace.log({ subschemas })
    if (
      subschemas &&
      attributes[tableData.subschema.key].array &&
      attributes[tableData.subschema.key].array.type == 'single' &&
      attributes[tableData.subschema.key].process == 'JSON'
    ) {
      subschemas = JSON.parse(subschemas)
    }
    trace.log(subschemas)
   let  additionalAttributes = await addSubschemas(subschemas)
   attributes = mergeAttributes(table, permission, subschemas, additionalAttributes)
    trace.log({ subschemas, attributes, maxdepth: 2 })
  }

  let output = ''
  const tableName = tableData.friendlyName
  trace.log(record)

  let stringify = `${lang.rowNumber}: ${id}` //  Row title defailts to Row: x
  if (tableData.stringify) { // This is a function to create the recognisable name from the record, e.g. 'firstname lastname'
    if (typeof (tableData.stringify) === 'string') {
      stringify = record[tableData.stringify]
    } else {
      stringify = await tableData.stringify(record)
    }
  }

  let parent
  let parentKey
  trace.log({
    table,
    tableData,
    stringify,
    tableName,
    parent,
    parentKey,
    stringifyType: typeof (tableData.stringify)
  })

  /** **********************************************
   *
   * The open value is the child list that is open when the page is loaded.
   * It can be passed as a parameter (because it is specified in a report)
   * Or in the table configuration.
   *
   ************************************************ */

  if (!open && tableData.list && tableData.list.open) {
    open = tableData.list.open
  }
  let openLink = ''
  if (open) {
    openLink = `&open=${open}`
  }

  /** ************************************************
    *
    * Find out the number of records for each child table. (childCount).
    * We shouldn't delete records if their are outstanding child
    * records
    *
    ************************************************ */
  let hasRows = ''
  let totalChild = 0
  const children = {}
  for (const key of Object.keys(attributes)) {
    if (attributes[key].collection) {
      trace.log(attributes[key].collection, key)
      const child = attributes[key].collection
      const via = attributes[key].via
      const childCount = await db.countRows(child, { searches: [[via, 'eq', id]] })
      children[key] = childCount
      if (childCount > 0 && child != 'audit') {
        totalChild += childCount
        hasRows += child + ', '
      }
    }
  }
  trace.log({ children, total: totalChild })

  /** ********************************************
   *
   * Creat activity log.  There is a more elegant way of doing this but I just read
   * the 10 (say) most recent child records from each child table and put them in an array,
   * then sort by date and take the first 10.
   *
   ********************************************** */
  let activityLogRequired = false
  let activityDiv = ''
  let activityGroup = {}
  let activityLimit = 10
  for (const group of Object.keys(tableData.groups)) {
    if (tableData.groups[group].activityLog) {
      if (tableData.groups[group].permission &&
        !evalPermission(permission, tableData.groups[group].permission, 'view')) { break }
      activityLogRequired = true
      activityGroup = tableData.groups[group]
      if (activityGroup.limit) { activityLimit = activityGroup.limit }
      break
    }
  }
  trace.log({ activityLogRequired })
  if (activityLogRequired) {
  //  primaryKeys = {}
  //  sortField = {}
    const activityLog = []
    let tableInfo = {}
    tableInfo[table] = tableData
    let i = 0
    for (const key of Object.keys(attributes)) {
      if (attributes[key].collection) {
        const child = attributes[key].collection
        if (child == 'audit') { continue }
        if (activityGroup.activities && !activityGroup.activities.includes(child)) { continue }
        const via = attributes[key].via
        let tableData
        if (tableInfo[child]) { tableData = tableInfo[child] } else {
          tableData = tableInfo[child] = tableDataFunction(child, permission)
        }
        trace.log(child, tableData.canView)
        const primaryKey = tableData.primaryKey
        const sortField = tableData.createdAt
        trace.log(tableData)
        const records = await db.getRows(child, { searches: [[via, 'eq', id], ['updatedAt', 'gt', 0]] }, 0, activityLimit, sortField, 'DESC')
        for (const record of records) {
          trace.log(record)
          let stringify = ''
          if (tableData.stringify) {
            stringify = await tableData.stringify(record)
          }
          activityLog[i++] = [child, tableData.friendlyName, record[primaryKey], record[sortField], stringify, attributes[key].friendlyName]
        }
      }
    }
    trace.log(activityLog)
    const searches = {
      andor: 'and',
      searches: [
        ['updatedAt', 'gt', 0],
        ['tableName', 'eq', table],
        ['row', 'eq', id],
        ['mode', 'ne', 'populate']
      ]
    }
    if (suds.audit.include) {
      const auditRecords = await db.getRows('audit', searches, 0, activityLimit, 'updatedAt', 'DESC')
      trace.log(auditRecords)
      for (const record of auditRecords) {
        const stringify = lang[record.mode]
        const reason = ''

        //   if (record.createdAt==record.updatedAt) {reason=lang.new}
        activityLog[i++] = [table, tableData.friendlyName, id, record.createdAt, stringify, reason]
      }
    }

    /** Now assemble the array into some HTML. */
    if (activityLog.length) {
      activityLog.sort(function (a, b) { return b[3] - a[3] })
      trace.log(activityLog)
      activityDiv = `
  <h2>${lang.activityLog}</h2>
  <table class="${classes.output.table.table}">   
  <thead> 
  <tr >
      <th scope="col" class="${classes.output.table.th}">${lang.table}</th>
      <th scope="col" class="${classes.output.table.th}">${lang.reason}</th>
      <th scope="col" class="${classes.output.table.th} ">${lang.date}</th>
      <th scope="col" class="${classes.output.table.th} ">${lang.description}</th>
    </tr>
    </thead>
    <tbody>
 `
      trace.log(permission)
      for (let i = 0; i < activityLog.length; i++) {
        if (i + 1 > activityLimit) { break };
        let item = activityLog[i]
        trace.log(item)
        const date = new Date(item[3])
        let desc = `${lang.rowNumber} ${item[2]} - ${item[1]}`
        if (item[4]) { desc = item[4] }
        if (permission == '#superuser#' || (item[0] != 'audit' && tableInfo[item[0]].canView)) {
          desc = `<a href="${suds.mainPage}?table=${item[0]}&mode=listrow&id=${item[2]}">${desc}</a>`
        }
        activityDiv += `
      <tr >
        <td>${item[1]}</td>
        <td>${item[5]}</td>
        <td >${date.toDateString()}</td>
        <td>${desc}</td>
    </tr>`
      }
      activityDiv += `
    </tbody>
    </table> 
  `
    }
  }
  trace.log(activityDiv)
  trace.log({ where: 'Activity log created', level: 'mid' }) // timing

  /* *******************************************************
      *
      * Create  group
      * If the fields are split into groups make sure the
      * 'other' group has everything that isn't in a stated group
      * If not, create a single static group called 'other'
      * which contains all of the fields.
      *
      * While we are about it we create the function to make the
      * submenu work that allows users to select the group they
      * want to see.
      *
      * The tabs array includes the groups that are to be listed
      * for the user to switch between grouos.
      *
      ****************************************************** */

  const hideGroup = {}
  let groupList = ['other']
  let staticList = [] // list of groups with static first
  const fieldList = []
  // make a list of all the fields that can be included
  for (const key of Object.keys(attributes)) {
    if (attributes[key].canView) { fieldList.push(key) }
  }
  trace.log({ fieldList })
  const columnGroup = {}
  const incl = []
  const tabs = []
  let openTab = ''

  /** *****************************************************
   *
   * If there are groups
   *
   * ******************************************************   */

  if (tableData.groups) {
    trace.log({ formgroups: tableData.groups })

    /**  loop through the groups    */
    for (const group of Object.keys(tableData.groups)) {
      trace.log({ group, cols: tableData.groups[group].columns })
      if (group == 'other') { continue } // deal with this later - will be the last tab

      /**  Is this group being shown for this record type? */
      if (tableData.groups[group].recordTypes &&
        !tableData.groups[group].recordTypes.includes(record[tableData.recordTypeColumn])
      ) {
        hideGroup[group] = true
      }

      /** Does this user have permission to see it... */
      trace.log(tableData.groups[group].permission)
      if (tableData.groups[group].permission) {
        if (!evalPermission(permission, tableData.groups[group].permission, 'view')) { hideGroup[group] = true }
      }

      /** Make sure that there are any fields to show that this user has permission to see.
       *  but not for the activity log ...
       */
      if (!tableData.groups[group].activityLog) {
        let count = 0 // how many viewable columns?
        for (const key of tableData.groups[group].columns) {
          if (attributes[key] && attributes[key].canView) {
            count++
            incl.push(key)
          };
        }
        if (!count) { continue }
      } // If no viewable fields then the group will not be shown.

      /**
       * Add to the tabs array
       *  make a list of static groups - they will listed first. */
      if (tableData.groups[group].static) {
        staticList.push(group)
      } else {
        tabs.push(group)
      }
    }

    /** Now fill up the 'other' array     */
    if (!tableData.groups.other) { tableData.groups.other = {} }
    if (!tableData.groups.other.columns) { tableData.groups.other.columns = [] }
    const all = fieldList
    /**
     * Start with a list of all the fields that this user has permission to see (fieldList)
     * then remove the items  that are in othe groups (incl) and store result in
     *  tableData.groups.other.columns
     * */
    let count = 0
    for (const key of all) {
      if (tableData.groups.other.columns.includes(key)) { // might already be in Other
        count++
        continue
      }
      if (!incl.includes(key)) {
        tableData.groups.other.columns.push(key)
        count++
      }
    }
    if (count) {
      tabs.push('other') // goes to the end of the list of tabs
    }

    // List of the groups with static groups first
    groupList = staticList.concat(tabs)

    trace.log({
      tabs,
      static: staticList,
      groupList,
      groups: tableData.groups.Date,
      hideGroup
    })
    trace.log(open)

    /**  **********************************************
     *
     * Figure out which group should be open (openGroup) andwhich child list
     * should be open for each group.  Store this in a string that will be
     * included in the client javascript (openList).
     *
     * OpenTab is the link that is in bold and corresponds to the open group.
     *
     *************************************************** */
    let first = true
    let openList = '{'
    for (const group of groupList) {
      if (hideGroup[group]) { continue }
      let thisGroupChildOpen = 'none'
      if (tableData.groups[group].open) {
        thisGroupChildOpen = tableData.groups[group].open
      }
      openList += `${group}: '${thisGroupChildOpen}',`

      trace.log(group, openList)
      if (first && !tableData.groups[group].static) {
        openTab = group // by default the first group is open
        if (!open && thisGroupChildOpen) { open = thisGroupChildOpen }
        first = false
      };
      if (tableData.groups[group].columns) {
        for (const col of tableData.groups[group].columns) {
          columnGroup[col] = group
        }
      }
    }
    openList += '}'

    if (openGroup) {
      openTab = openGroup
    }

    trace.log({ columnGroup, openTab, hideGroup, openlist: openList })

    //   tabs=['activitylog'].concat(tabs);

    /** ***************************************************
     *
     * Create client-side javascript routines.
     *
     * tabclick is called by tabclickgroup below.   It closes al the child listings
     * and then opens the one requoired.
     *
     * ************************************************** */
    output += `
    <script>
       let debug=false;
      let opentab='';   

      function tabclick (tab) { 
        if (debug) {console.log('tabclick: ', tab, ' openbtab: ',opentab);} `
    for (const child of Object.keys(children)) {
      if (children[child]) {
        output += `
        document.getElementById('childdata_${child}').style.display="none";`
      }
    }
    output += `
        if (opentab != tab) { 
          childdata='childdata_' + tab;
          if (document.getElementById(childdata) ){
              if (debug) {console.log('showing ',childdata);}
              document.getElementById(childdata).style.display="block"; 
          }
          opentab=tab;
        }
        else {
          opentab='';
        }
      }

    </script>`

    /** This function is called whenever a tab is clicked It first closes all of the
    * groups.  Then opens the clicked group.  If these is an open child list for this group
    * it calls tabclick above to open this.
    */

    if (tabs) {
      output += `
      <script>
        function tabclickGroup (tab) { 
          if (debug) {  console.log('tabclickgroup:',tab); }
          const openList=${openList};`
      for (const tab of tabs) {
        trace.log(tab, hideGroup[tab])
        if (hideGroup[tab]) { continue }
        output += `
          document.getElementById('group_${tab}').style.display="none";
          document.getElementById('tab_${tab}').style.fontWeight="normal";`
      }
      output += `
          let tabdata='group_' + tab;
          let tabitem='tab_' + tab;
          if (debug) {   console.log('tab:',tab,' opening:',tabdata);}
          document.getElementById(tabdata).style.display="block"; 
          document.getElementById(tabitem).style.fontWeight="bold"; 
          if (openList[tab]) {tabclick(openList[tab])}
        }            
      </script>`
    }
  }

  /** *****************************************************
   *
   * If there are no groups
   *
   * ******************************************************   */

  else {
    tableData.groups = { other: { static: true } }
    staticList = ['other']
    if (!tableData.groups.other.columns) { tableData.groups.other.columns = [] }
    for (const key of fieldList) {
      //    if (key == tableData.primaryKey || key == 'createdAt' || key == 'updatedAt') { continue; }
      tableData.groups.other.columns.push(key)
    }
  }
  const groups = tableData.groups
  trace.log({ groups })

  trace.log({ where: 'Groups created', level: 'mid' }) // timing

  /* ************************************************
  *
  *   Table header
  *
  ************************************************ */

  if (message) { output += `<h2>${message}</h2>` }
  output += `
      <h1>${tableName}<br />${stringify}</h1>`

  /* ************************************************
   *
   *   Loop through groups.
   *   We want one table for all the static groups
   *   and one Table per group for the rest
   *   and a menu after the static groups
   *
   *  To simplify matters we create a set of rows per
   * and envelope them with the tables after
   *
   ************************************************ */

  const groupRows = {}
  for (const group of groupList) {
    /* ************************************************
    *
    * Loop through fields in group creating the HTML for thast group
    * and store in groupRows
    *
    ************************************************ */
    groupRows[group] = ''
    if (tableData.groups[group].columns) {
      for (const key of tableData.groups[group].columns) {
        trace.log(key)
        if (!attributes[key]) {
          // Can happen with subschema
          // throw new Error (`list-row.js::column ${key} in group ${group} - table: ${table} does not exist.`)
          continue
        };
        trace.log(group, key, attributes[key].canView, children[key])
        trace.log(attributes[key].canView)
        if (!attributes[key].canView) { continue };
        let display = await displayField(attributes[key], record[key], children[key], permission)
        trace.log(display)
        const title = attributes[key].friendlyName
        let description = ''
        if (attributes[key].description) {
          description = attributes[key].description.replace(/"/g, '\'')
        }
        let col3 = ''

        /*  Collection              */
        if (attributes[key].collection) {
          const child = attributes[key].collection
          trace.log(attributes[key])
          let tabname = child
          if (children[key]) {
            const childData = tableDataFunction(child)
            if (await hasPermissionFunction(permission, child, 'view')) {
              if (childData.friendlyName) {
                tabname = childData.friendlyName
              }
              display += `
                    &nbsp;<a href="#" id="tab_${key}"  onclick="tabclick('${key}')">${lang.listRowChildLink}</a>`
              if (attributes[key].annotate) {
                trace.log({ children: children[key] })
                for (const code of Object.keys(attributes[key].annotate)) {
                  trace.log(code, attributes[key].annotate[code])
                  let value = ''
                  const annotate = attributes[key].annotate[code]
                  const via = attributes[key].via
                  let title = code
                  if (annotate.friendlyName) { title = annotate.friendlyName }
                  if (annotate.type == 'count') {
                    value = children[key]
                  }
                  if (annotate.type == 'sum') {
                    value = await db.totalRows(child, { searches: [[via, 'eq', id]] }, annotate.col)
                  }
                  if (annotate.currency) {
                    formatter = new Intl.NumberFormat(
                      suds.currency.locale,
                      {
                        style: 'currency',
                        currency: suds.currency.currency,
                        minimumFractionDigits: suds.currency.digits
                      })
                    value = formatter.format(value)
                  }
                  trace.log(value)
                  display += ` ${title}: ${value}`
                }
              }
            }
          }
          const via = attributes[key].via

          let tip = lang.addRowTip + tabname
          if (attributes[key].collectionList && attributes[key].collectionList.addChildTip) {
            tip = attributes[key].collectionList.addChildTip
          };
          let canAddRow = await hasPermissionFunction(permission, child, 'edit')
          trace.log(child, canAddRow)
          if (attributes[key].addRow === false) { canAddRow = false }

          if (canAddRow) {
            const link = `${suds.mainPage}?table=${child}&mode=new&prepopulate=${via}&${via}=${id}`
            col3 = `<button onclick="document.location='${link}'" type="button" class="btn btn-primary btn-sm  sudsAddChild" title="${tip}" >
             ${lang.addIcon} ${lang.addRow}
             </button>`
          }
        }

        groupRows[group] += `
            <tr class="${classes.output.table.tr}">
              <th scope="row" class="${classes.output.listRow.col1}" >
                <span title="${description}">
                  ${title}
                </span>
              </th>
              <td  class="${classes.output.listRow.col2}">
                ${display}${col3}
              </td>
                 </tr>`
      }
    }
    trace.log({ group, rows: groupRows[group], level: 'verbose' })
  }

  /** ************************************************
   *
   * Now put it all together
   *
   * ************************************************** */
  output += `
      <div class="${classes.output.table.envelope}">  <!--  Static Data -->
        <table class="${classes.output.table.table}">   
          <thead>
            <tr class="${classes.output.table.tr}">
              <th scope="col" class="${classes.output.table.th} ${classes.output.listRow.col1}">${lang.field}</th>
              <th scope="col" class="${classes.output.table.th} ${classes.output.listRow.col2}">${lang.value}</th>
            </tr>
          </thead>
          <tbody>`
  for (const group of staticList) {
    trace.log({ group, rows: groupRows[group], level: 'verbose' })
    output += groupRows[group]
  }
  output += `
          </tbody> 
        </table>
      </div>  <!-- Static Data  -->`
  trace.log({ tabs, length: tabs.length })

  if (tabs && tabs.length > 1) {
    trace.log({ tabs })
    output += `
    <!-- this section controlled by tabs -->
      <div class="${classes.output.groupLinks.row}">  <!-- Tabs -->
        <div class="${classes.output.groupLinks.envelope}"> <!-- Envelope -->
          <span class="${classes.output.groupLinks.spacing}">${lang.formGroup}</span>`
    for (const group of tabs) { // run through the tabs
      if (hideGroup[group]) { continue }

      trace.log(openTab, group)
      let friendlyName = group
      if (groups[group].friendlyName) { friendlyName = groups[group].friendlyName }
      let style;
      if (openTab == group) { style = 'font-weight:bold' } else { style = '' } // the first will be shown the rest hidden
      output += `
            <a class="${classes.output.groupLinks.spacing}"  style="${style}" id="tab_${group}" href="#" onclick="tabclickGroup('${group}')">
               ${friendlyName}
            </a>` // outputting a list of links
    }
    output += `
        </div>  <!-- Envelope -->
      </div> <!-- Tabs -->`
  }

  let disp
  for (const group of tabs) { // then go through the non-statiuc groups
    if (hideGroup[group]) { continue }
    if (openTab == group) { disp = 'block' } else { disp = 'none' } // the first will be shown the rest hidden
    output += `
       <!--  --------------------------- ${group} ---------------------- -->
      <div id="group_${group}" style="display: ${disp}">  <!-- Group ${group} -->`

    if (tableData.groups[group].activityLog) {
      output += activityDiv
    } else {
      if (groupRows[group]) {
        output += `
        <div class="${classes.output.table.envelope}">  <!-- envelope -->
          <table class="${classes.output.table.table} ${classes.output.listRow.spacing}" >
            <tbody>`
        output += groupRows[group]
        output += `
           </tbody> 
          </table>
        </div>   <!-- envelope -->`
      }
    }
    output += `
      </div>   <!--  group ${group}  -->`
  }

  trace.log({ where: 'Header created', level: 'mid' }) // timing

  // ******************************************

  trace.log(open)

  /** ************************************************
  *
  * Child listings
  *
  * List first few child records
  * The child tables to list, the order, and the
  * number to be listed are specified in the suds tables
  * config file.
  *
  * Pass over children that this user doesn't have permission to see
  * and any that are markled in suds tables.js is not to be listed.
  *
  ************************************************ */

  /** Dummy for none */
  output += '<div class="sudschilddata" id="childdata_none"></div>'
  let childnames = Object.keys(children)
  // delete any names that the user can't see
  for (let i = 0; i < childnames.length; i++) {
    const child = childnames[i]
    trace.log({ where: `Child ${child} starting`, level: 'mid' }) // timing

    let style = 'display: none'
    if (open) {
      if (child == open) {
        style = ''
      }
    }
    trace.log({ i, childname: child, style, open })

    if (!attributes[child].canView) {
      output += `
    <div class="sudschilddata" id="childdata_${child}"  style="${style}"> <!--  childData / ${child} --> 
    </div> <!--  childData / ${child} -->   
        `
      continue
    }
    if (!children[child]) { continue }

    const limit = -1 // ist all children
    let heading // Listing program wil generate a sensible heading
    trace.log(child, attributes[child], attributes[child].collection)

    const columns = Object.keys(await mergeAttributes(attributes[child].collection, permission))
    trace.log(columns)

    const reportData = {
      table: attributes[child].collection,
      sort: ['updatedAt', 'DESC'],
      search: {
        andor: 'and',
        searches: [[
          attributes[child].via, // searchfield
          'eq', // compare
          id // search value
        ]]
      },
      columns,
      hideEdit: false,
      hideDetails: false
    }

    if (attributes[child].collectionList) {
      if (attributes[child].collectionList.limit) { reportData.limit = attributes[child].collectionList.limit }
      if (attributes[child].collectionList.direction) { reportData.sort[0] = attributes[child].collectionList.direction }
      if (attributes[child].collectionList.order) { reportData.sort[0] = attributes[child].collectionList.order }
      if (attributes[child].collectionList.heading) { reportData.title = attributes[child].collectionList.heading }
      if (attributes[child].collectionList.sort) { reportData.sort = attributes[child].collectionList.sort }
      if (attributes[child].collectionList.columns) { reportData.columns = attributes[child].collectionList.columns }
      if (attributes[child].collectionList.hideEdit) { reportData.hideEdit = true }
      if (attributes[child].collectionList.hideDetails) { reportData.hideDetails = true }

      if (attributes[child].collectionList.derive) {
        reportData.headingText = ''
        const total = {}
        for (const key of Object.keys(attributes[child].collectionList.derive)) {
          const spec = attributes[child].collectionList.derive[key]
          if (spec.type == 'function') {
            const display = await spec.fn(record)
            reportData.headingText += display
            continue
          }
          if (spec.type == 'count') { total[key] = children[child] }
          if (spec.type == 'total') { total[key] = await db.totalRows(attributes[child].collection, { searches: [[attributes[child].via, 'eq', id]] }, spec.column) }
          if (spec.type == 'average') {
            total[key] = await db.totalRows(attributes[child].collection, { searches: [[attributes[child].via, 'eq', id]] }, spec.column)
            total[key] /= children[child]
          }
          if (spec.type == 'composite') {
            if (spec.divide) { total[key] = total[spec.divide[0]] / total[spec.divide[1]] }
            if (spec.add) { total[key] = total[spec.divide[0]] + total[spec.divide[1]] }
            if (spec.subtract) { total[key] = total[spec.divide[0]] - total[spec.divide[1]] }
          }
          let display = total[key]
          if (spec.display) { display = await displayField(spec, display) }
          reportData.headingText += `<br />${spec.friendlyName}: ${display}`
        }
      }
    }

    trace.log(reportData)

    output += `
    <div class="sudschilddata" id="childdata_${child}"  style="${style};"> <!--  childData / ${child} --> `
    trace.log({ where: '', level: 'mid' }) // timing

    output += await listTable(
      permission, // permission
      attributes[child].collection, // table
      reportData,
      1, // page
      table, // Parent
      limit //
    )

    output += `
      </div> <!--  childData / ${child} -->    
     `
    trace.log({ where: `Child ${child} created`, level: 'mid' }) // timing
  }
  trace.log({ where: 'Child listings created', level: 'mid' }) // timing

  /* ************************************************
  *
  *   Links
  *
  ************************************************ */
  output += `<div class="${classes.output.buttons}">`
  /* ************************************************
  *
  *   Edit
  *
  ************************************************ */

  let hasPermission = await hasPermissionFunction(permission, table, 'edit')
  trace.log({ hasPermission })
  if (hasPermission) {
    const link = `${suds.mainPage}?table=${table}&id=${id}&mode=populate`
    output += `
  
      <button onclick="window.location='${link}'"  class="${classes.output.links.button}">
        ${lang.edit}
      </button>`
  }

  /* ************************************************
  *
  *   Delete button
  *
  ************************************************ */

  hasPermission = await hasPermissionFunction(permission, table, 'delete')
  trace.log({ hasPermission })
  if (hasPermission) {
    if (totalChild && permission != '#superuser#') {
      output += `
        <button type="button" class="${classes.output.links.danger}" title="Need to delete related data first: : ${hasRows} ">${lang.deleteRow}</button>`
    } else {
      let parentLink = ''
      if (parent) {
        parentLink = `&parent=${parent}&parentkey=${parentKey}`
      }
      let link = `${suds.mainPage}?table=${table}&id=${id}&mode=delete${parentLink}`
      //     <script>
      //     </script>
      output += `
      <button class="${classes.output.links.button}" onclick="var result=confirm('are you sure'); if (result) {window.location='${link}'}">
          ${lang.deleteRow}  
      </button>
 
 `
    }
  }

  trace.log({ where: 'Links created', level: 'mid' }) // timing

  /* ************************************************
  *
  *   List table / Back to home page
  *
  ************************************************ */

  output += `
      <button class="${classes.output.links.button}" onclick="window.location='${mainPage}?table=${table}&mode=list${openLink}'">${lang.tableList}</button>
      <button class="${classes.output.links.button}" onclick="window.location='${mainPage}'">${lang.backToTables}</button>
   </div> <!-- buttons -->
`

  trace.log({ output, level: 'silly' })
  const created = new Date(record.createdAt).toDateString()
  const updated = new Date(record.updatedAt).toDateString()

  let updatedBy = { fullName: 'Nobody' }
  if (record.updatedBy) {
    updatedBy = await db.getRow('user', record.updatedBy)
    trace.log({ user: record.updatedBy, record: updatedBy.fullName, level: 'user' })
  }
  trace.log(updatedBy)
  const footnote = `${lang.rowNumber}: ${id} ${lang.createdAt}: ${created} ${lang.updatedAt}: ${updated}  ${lang.updatedBy} ${updatedBy.fullName}`
  trace.log({ footnote, level: 'user' })
  return ({ output, footnote })
}
