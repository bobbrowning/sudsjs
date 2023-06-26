"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suds = require('../../config/suds');
const trace = require('track-n-trace');
const mergeAttributes = require('./merge-attributes');
const tableDataFunction = require('./table-data');
const classes = require('../../config/classes');
const lang = require('../../config/language').EN;
const db = require('./db');
const evalPermission = require('./eval-permission');
// let countRows = require('./count-rows');
// let totalRows = require('./total-rows');
// let getRow = require('./get-row');
const getSearchLink = require('./search-link');
const displayField = require('./display-field');
const humaniseFieldname = require('./humanise-fieldname');
const hasPermissionFunction = require('./has-permission');
const listTable = require('./list-table');
const addSubschemas = require('./subschemas');
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
    trace.log({ inputs: arguments, break: '#', level: 'min', });
    trace.log({ where: 'list-row start', level: 'mid' }); // timing
    /* ************************************************
    *
    *   set up the data
    *
    ************************************************ */
    let mainPage = suds.mainPage;
    if (!mainPage) {
        mainPage = '/';
    }
    const tableData = tableDataFunction(table, permission);
    if (!tableData.canView) {
        throw new Error(`list-row.js::Sorry - you don't have permission to view ${tableData.friendlyName} (${table}). Please log in and retry`);
    }
    const message = '';
    let attributes = await mergeAttributes(table, permission, subschemas); // Merve field attributes in model with config.suds tables
    trace.log({ attributes, level: 'verbose' });
    const record = await db.getRow(table, id); // populate record from database
    if (record.err) {
        throw new Error(`list-row.js::Unexpected error reading ${id} from ${table} Error:${record.err} ${record.msg}`);
    }
    if (tableData.subschema) {
        subschemas = record[tableData.subschema.key];
        trace.log({ subschemas });
        if (subschemas &&
            attributes[tableData.subschema.key].array &&
            attributes[tableData.subschema.key].array.type == 'single' &&
            attributes[tableData.subschema.key].process == 'JSON') {
            subschemas = JSON.parse(subschemas);
        }
        trace.log(subschemas);
        let additionalAttributes = await addSubschemas(subschemas);
        attributes = mergeAttributes(table, permission, subschemas, additionalAttributes);
        trace.log({ subschemas, attributes, maxdepth: 2 });
    }
    let output = '';
    const tableName = tableData.friendlyName;
    trace.log(record);
    let stringify = `${lang.rowNumber}: ${id}`; //  Row title defailts to Row: x
    if (tableData.stringify) { // This is a function to create the recognisable name from the record, e.g. 'firstname lastname'
        if (typeof (tableData.stringify) === 'string') {
            stringify = record[tableData.stringify];
        }
        else {
            stringify = await tableData.stringify(record);
        }
    }
    let parent;
    let parentKey;
    trace.log({
        table,
        tableData,
        stringify,
        tableName,
        parent,
        parentKey,
        stringifyType: typeof (tableData.stringify)
    });
    /** **********************************************
     *
     * The open value is the child list that is open when the page is loaded.
     * It can be passed as a parameter (because it is specified in a report)
     * Or in the table configuration.
     *
     ************************************************ */
    if (!open && tableData.list && tableData.list.open) {
        open = tableData.list.open;
    }
    let openLink = '';
    if (open) {
        openLink = `&open=${open}`;
    }
    /** ************************************************
      *
      * Find out the number of records for each child table. (childCount).
      * We shouldn't delete records if their are outstanding child
      * records
      *
      ************************************************ */
    let hasRows = '';
    let totalChild = 0;
    const children = {};
    for (const key of Object.keys(attributes)) {
        if (attributes[key].collection) {
            trace.log(attributes[key].collection, key);
            const child = attributes[key].collection;
            const via = attributes[key].via;
            const childCount = await db.countRows(child, { searches: [[via, 'eq', id]] });
            children[key] = childCount;
            if (childCount > 0 && child != 'audit') {
                totalChild += childCount;
                hasRows += child + ', ';
            }
        }
    }
    trace.log({ children, total: totalChild });
    /** ********************************************
     *
     * Creat activity log.  There is a more elegant way of doing this but I just read
     * the 10 (say) most recent child records from each child table and put them in an array,
     * then sort by date and take the first 10.
     *
     ********************************************** */
    let activityLogRequired = false;
    let activityDiv = '';
    let activityGroup = {};
    let activityLimit = 10;
    for (const group of Object.keys(tableData.groups)) {
        if (tableData.groups[group].activityLog) {
            if (tableData.groups[group].permission &&
                !evalPermission(permission, tableData.groups[group].permission, 'view')) {
                break;
            }
            activityLogRequired = true;
            activityGroup = tableData.groups[group];
            if (activityGroup.limit) {
                activityLimit = activityGroup.limit;
            }
            break;
        }
    }
    trace.log({ activityLogRequired });
    if (activityLogRequired) {
        //  primaryKeys = {}
        //  sortField = {}
        const activityLog = [];
        let tableInfo = {};
        tableInfo[table] = tableData;
        let i = 0;
        for (const key of Object.keys(attributes)) {
            if (attributes[key].collection) {
                const child = attributes[key].collection;
                if (child == 'audit') {
                    continue;
                }
                if (activityGroup.activities && !activityGroup.activities.includes(child)) {
                    continue;
                }
                const via = attributes[key].via;
                let tableData;
                if (tableInfo[child]) {
                    tableData = tableInfo[child];
                }
                else {
                    tableData = tableInfo[child] = tableDataFunction(child, permission);
                }
                trace.log(child, tableData.canView);
                const primaryKey = tableData.primaryKey;
                const sortField = tableData.createdAt;
                trace.log(tableData);
                const records = await db.getRows(child, { searches: [[via, 'eq', id], ['updatedAt', 'gt', 0]] }, 0, activityLimit, sortField, 'DESC');
                for (const record of records) {
                    trace.log(record);
                    let stringify = '';
                    if (tableData.stringify) {
                        stringify = await tableData.stringify(record);
                    }
                    activityLog[i++] = [child, tableData.friendlyName, record[primaryKey], record[sortField], stringify, attributes[key].friendlyName];
                }
            }
        }
        trace.log(activityLog);
        const searches = {
            andor: 'and',
            searches: [
                ['updatedAt', 'gt', 0],
                ['tableName', 'eq', table],
                ['row', 'eq', id],
                ['mode', 'ne', 'populate']
            ]
        };
        if (suds.audit.include) {
            const auditRecords = await db.getRows('audit', searches, 0, activityLimit, 'updatedAt', 'DESC');
            trace.log(auditRecords);
            for (const record of auditRecords) {
                const stringify = lang[record.mode];
                const reason = '';
                //   if (record.createdAt==record.updatedAt) {reason=lang.new}
                activityLog[i++] = [table, tableData.friendlyName, id, record.createdAt, stringify, reason];
            }
        }
        /** Now assemble the array into some HTML. */
        if (activityLog.length) {
            activityLog.sort(function (a, b) { return b[3] - a[3]; });
            trace.log(activityLog);
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
 `;
            trace.log(permission);
            for (let i = 0; i < activityLog.length; i++) {
                if (i + 1 > activityLimit) {
                    break;
                }
                ;
                let item = activityLog[i];
                trace.log(item);
                const date = new Date(item[3]);
                let desc = `${lang.rowNumber} ${item[2]} - ${item[1]}`;
                if (item[4]) {
                    desc = item[4];
                }
                if (permission == '#superuser#' || (item[0] != 'audit' && tableInfo[item[0]].canView)) {
                    desc = `<a href="${suds.mainPage}?table=${item[0]}&mode=listrow&id=${item[2]}">${desc}</a>`;
                }
                activityDiv += `
      <tr >
        <td>${item[1]}</td>
        <td>${item[5]}</td>
        <td >${date.toDateString()}</td>
        <td>${desc}</td>
    </tr>`;
            }
            activityDiv += `
    </tbody>
    </table> 
  `;
        }
    }
    trace.log(activityDiv);
    trace.log({ where: 'Activity log created', level: 'mid' }); // timing
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
    const hideGroup = {};
    let groupList = ['other'];
    let staticList = []; // list of groups with static first
    const fieldList = [];
    // make a list of all the fields that can be included
    for (const key of Object.keys(attributes)) {
        if (attributes[key].canView) {
            fieldList.push(key);
        }
    }
    trace.log({ fieldList });
    const columnGroup = {};
    const incl = [];
    const tabs = [];
    let openTab = '';
    /** *****************************************************
     *
     * If there are groups
     *
     * ******************************************************   */
    if (tableData.groups) {
        trace.log({ formgroups: tableData.groups });
        /**  loop through the groups    */
        for (const group of Object.keys(tableData.groups)) {
            trace.log({ group, cols: tableData.groups[group].columns });
            if (group == 'other') {
                continue;
            } // deal with this later - will be the last tab
            /**  Is this group being shown for this record type? */
            if (tableData.groups[group].recordTypes &&
                !tableData.groups[group].recordTypes.includes(record[tableData.recordTypeColumn])) {
                hideGroup[group] = true;
            }
            /** Does this user have permission to see it... */
            trace.log(tableData.groups[group].permission);
            if (tableData.groups[group].permission) {
                if (!evalPermission(permission, tableData.groups[group].permission, 'view')) {
                    hideGroup[group] = true;
                }
            }
            /** Make sure that there are any fields to show that this user has permission to see.
             *  but not for the activity log ...
             */
            if (!tableData.groups[group].activityLog) {
                let count = 0; // how many viewable columns?
                for (const key of tableData.groups[group].columns) {
                    if (attributes[key] && attributes[key].canView) {
                        count++;
                        incl.push(key);
                    }
                    ;
                }
                if (!count) {
                    continue;
                }
            } // If no viewable fields then the group will not be shown.
            /**
             * Add to the tabs array
             *  make a list of static groups - they will listed first. */
            if (tableData.groups[group].static) {
                staticList.push(group);
            }
            else {
                tabs.push(group);
            }
        }
        /** Now fill up the 'other' array     */
        if (!tableData.groups.other) {
            tableData.groups.other = {};
        }
        if (!tableData.groups.other.columns) {
            tableData.groups.other.columns = [];
        }
        const all = fieldList;
        /**
         * Start with a list of all the fields that this user has permission to see (fieldList)
         * then remove the items  that are in othe groups (incl) and store result in
         *  tableData.groups.other.columns
         * */
        let count = 0;
        for (const key of all) {
            if (tableData.groups.other.columns.includes(key)) { // might already be in Other
                count++;
                continue;
            }
            if (!incl.includes(key)) {
                tableData.groups.other.columns.push(key);
                count++;
            }
        }
        if (count) {
            tabs.push('other'); // goes to the end of the list of tabs
        }
        // List of the groups with static groups first
        groupList = staticList.concat(tabs);
        trace.log({
            tabs,
            static: staticList,
            groupList,
            groups: tableData.groups.Date,
            hideGroup
        });
        trace.log(open);
        /**  **********************************************
         *
         * Figure out which group should be open (openGroup) andwhich child list
         * should be open for each group.  Store this in a string that will be
         * included in the client javascript (openList).
         *
         * OpenTab is the link that is in bold and corresponds to the open group.
         *
         *************************************************** */
        let first = true;
        let openList = '{';
        for (const group of groupList) {
            if (hideGroup[group]) {
                continue;
            }
            let thisGroupChildOpen = 'none';
            if (tableData.groups[group].open) {
                thisGroupChildOpen = tableData.groups[group].open;
            }
            openList += `${group}: '${thisGroupChildOpen}',`;
            trace.log(group, openList);
            if (first && !tableData.groups[group].static) {
                openTab = group; // by default the first group is open
                if (!open && thisGroupChildOpen) {
                    open = thisGroupChildOpen;
                }
                first = false;
            }
            ;
            if (tableData.groups[group].columns) {
                for (const col of tableData.groups[group].columns) {
                    columnGroup[col] = group;
                }
            }
        }
        openList += '}';
        if (openGroup) {
            openTab = openGroup;
        }
        trace.log({ columnGroup, openTab, hideGroup, openlist: openList });
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
        if (debug) {console.log('tabclick: ', tab, ' openbtab: ',opentab);} `;
        for (const child of Object.keys(children)) {
            if (children[child]) {
                output += `
        document.getElementById('childdata_${child}').style.display="none";`;
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

    </script>`;
        /** This function is called whenever a tab is clicked It first closes all of the
        * groups.  Then opens the clicked group.  If these is an open child list for this group
        * it calls tabclick above to open this.
        */
        if (tabs) {
            output += `
      <script>
        function tabclickGroup (tab) { 
          if (debug) {  console.log('tabclickgroup:',tab); }
          const openList=${openList};`;
            for (const tab of tabs) {
                trace.log(tab, hideGroup[tab]);
                if (hideGroup[tab]) {
                    continue;
                }
                output += `
          document.getElementById('group_${tab}').style.display="none";
          document.getElementById('tab_${tab}').style.fontWeight="normal";`;
            }
            output += `
          let tabdata='group_' + tab;
          let tabitem='tab_' + tab;
          if (debug) {   console.log('tab:',tab,' opening:',tabdata);}
          document.getElementById(tabdata).style.display="block"; 
          document.getElementById(tabitem).style.fontWeight="bold"; 
          if (openList[tab]) {tabclick(openList[tab])}
        }            
      </script>`;
        }
    }
    /** *****************************************************
     *
     * If there are no groups
     *
     * ******************************************************   */
    else {
        tableData.groups = { other: { static: true } };
        staticList = ['other'];
        if (!tableData.groups.other.columns) {
            tableData.groups.other.columns = [];
        }
        for (const key of fieldList) {
            //    if (key == tableData.primaryKey || key == 'createdAt' || key == 'updatedAt') { continue; }
            tableData.groups.other.columns.push(key);
        }
    }
    const groups = tableData.groups;
    trace.log({ groups });
    trace.log({ where: 'Groups created', level: 'mid' }); // timing
    /* ************************************************
    *
    *   Table header
    *
    ************************************************ */
    if (message) {
        output += `<h2>${message}</h2>`;
    }
    output += `
      <h1>${tableName}<br />${stringify}</h1>`;
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
    const groupRows = {};
    for (const group of groupList) {
        /* ************************************************
        *
        * Loop through fields in group creating the HTML for thast group
        * and store in groupRows
        *
        ************************************************ */
        groupRows[group] = '';
        if (tableData.groups[group].columns) {
            for (const key of tableData.groups[group].columns) {
                trace.log(key);
                if (!attributes[key]) {
                    // Can happen with subschema
                    // throw new Error (`list-row.js::column ${key} in group ${group} - table: ${table} does not exist.`)
                    continue;
                }
                ;
                trace.log(group, key, attributes[key].canView, children[key]);
                trace.log(attributes[key].canView);
                if (!attributes[key].canView) {
                    continue;
                }
                ;
                let display = await displayField(attributes[key], record[key], children[key], permission);
                trace.log(display);
                const title = attributes[key].friendlyName;
                let description = '';
                if (attributes[key].description) {
                    description = attributes[key].description.replace(/"/g, '\'');
                }
                let col3 = '';
                /*  Collection              */
                if (attributes[key].collection) {
                    const child = attributes[key].collection;
                    trace.log(attributes[key]);
                    let tabname = child;
                    if (children[key]) {
                        const childData = tableDataFunction(child);
                        if (await hasPermissionFunction(permission, child, 'view')) {
                            if (childData.friendlyName) {
                                tabname = childData.friendlyName;
                            }
                            display += `
                    &nbsp;<a href="#" id="tab_${key}"  onclick="tabclick('${key}')">${lang.listRowChildLink}</a>`;
                            if (attributes[key].annotate) {
                                trace.log({ children: children[key] });
                                for (const code of Object.keys(attributes[key].annotate)) {
                                    trace.log(code, attributes[key].annotate[code]);
                                    let value = '';
                                    const annotate = attributes[key].annotate[code];
                                    const via = attributes[key].via;
                                    let title = code;
                                    if (annotate.friendlyName) {
                                        title = annotate.friendlyName;
                                    }
                                    if (annotate.type == 'count') {
                                        value = children[key];
                                    }
                                    if (annotate.type == 'sum') {
                                        value = await db.totalRows(child, { searches: [[via, 'eq', id]] }, annotate.col);
                                    }
                                    if (annotate.currency) {
                                        formatter = new Intl.NumberFormat(suds.currency.locale, {
                                            style: 'currency',
                                            currency: suds.currency.currency,
                                            minimumFractionDigits: suds.currency.digits
                                        });
                                        value = formatter.format(value);
                                    }
                                    trace.log(value);
                                    display += ` ${title}: ${value}`;
                                }
                            }
                        }
                    }
                    const via = attributes[key].via;
                    let tip = lang.addRowTip + tabname;
                    if (attributes[key].collectionList && attributes[key].collectionList.addChildTip) {
                        tip = attributes[key].collectionList.addChildTip;
                    }
                    ;
                    let canAddRow = await hasPermissionFunction(permission, child, 'edit');
                    trace.log(child, canAddRow);
                    if (attributes[key].addRow === false) {
                        canAddRow = false;
                    }
                    if (canAddRow) {
                        const link = `${suds.mainPage}?table=${child}&mode=new&prepopulate=${via}&${via}=${id}`;
                        col3 = `<button onclick="document.location='${link}'" type="button" class="btn btn-primary btn-sm  sudsAddChild" title="${tip}" >
             ${lang.addIcon} ${lang.addRow}
             </button>`;
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
                 </tr>`;
            }
        }
        trace.log({ group, rows: groupRows[group], level: 'verbose' });
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
          <tbody>`;
    for (const group of staticList) {
        trace.log({ group, rows: groupRows[group], level: 'verbose' });
        output += groupRows[group];
    }
    output += `
          </tbody> 
        </table>
      </div>  <!-- Static Data  -->`;
    trace.log({ tabs, length: tabs.length });
    if (tabs && tabs.length > 1) {
        trace.log({ tabs });
        output += `
    <!-- this section controlled by tabs -->
      <div class="${classes.output.groupLinks.row}">  <!-- Tabs -->
        <div class="${classes.output.groupLinks.envelope}"> <!-- Envelope -->
          <span class="${classes.output.groupLinks.spacing}">${lang.formGroup}</span>`;
        for (const group of tabs) { // run through the tabs
            if (hideGroup[group]) {
                continue;
            }
            trace.log(openTab, group);
            let friendlyName = group;
            if (groups[group].friendlyName) {
                friendlyName = groups[group].friendlyName;
            }
            let style;
            if (openTab == group) {
                style = 'font-weight:bold';
            }
            else {
                style = '';
            } // the first will be shown the rest hidden
            output += `
            <a class="${classes.output.groupLinks.spacing}"  style="${style}" id="tab_${group}" href="#" onclick="tabclickGroup('${group}')">
               ${friendlyName}
            </a>`; // outputting a list of links
        }
        output += `
        </div>  <!-- Envelope -->
      </div> <!-- Tabs -->`;
    }
    let disp;
    for (const group of tabs) { // then go through the non-statiuc groups
        if (hideGroup[group]) {
            continue;
        }
        if (openTab == group) {
            disp = 'block';
        }
        else {
            disp = 'none';
        } // the first will be shown the rest hidden
        output += `
       <!--  --------------------------- ${group} ---------------------- -->
      <div id="group_${group}" style="display: ${disp}">  <!-- Group ${group} -->`;
        if (tableData.groups[group].activityLog) {
            output += activityDiv;
        }
        else {
            if (groupRows[group]) {
                output += `
        <div class="${classes.output.table.envelope}">  <!-- envelope -->
          <table class="${classes.output.table.table} ${classes.output.listRow.spacing}" >
            <tbody>`;
                output += groupRows[group];
                output += `
           </tbody> 
          </table>
        </div>   <!-- envelope -->`;
            }
        }
        output += `
      </div>   <!--  group ${group}  -->`;
    }
    trace.log({ where: 'Header created', level: 'mid' }); // timing
    // ******************************************
    trace.log(open);
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
    output += '<div class="sudschilddata" id="childdata_none"></div>';
    let childnames = Object.keys(children);
    // delete any names that the user can't see
    for (let i = 0; i < childnames.length; i++) {
        const child = childnames[i];
        trace.log({ where: `Child ${child} starting`, level: 'mid' }); // timing
        let style = 'display: none';
        if (open) {
            if (child == open) {
                style = '';
            }
        }
        trace.log({ i, childname: child, style, open });
        if (!attributes[child].canView) {
            output += `
    <div class="sudschilddata" id="childdata_${child}"  style="${style}"> <!--  childData / ${child} --> 
    </div> <!--  childData / ${child} -->   
        `;
            continue;
        }
        if (!children[child]) {
            continue;
        }
        const limit = -1; // ist all children
        let heading; // Listing program wil generate a sensible heading
        trace.log(child, attributes[child], attributes[child].collection);
        const columns = Object.keys(await mergeAttributes(attributes[child].collection, permission));
        trace.log(columns);
        const reportData = {
            table: attributes[child].collection,
            sort: ['updatedAt', 'DESC'],
            search: {
                andor: 'and',
                searches: [[
                        attributes[child].via,
                        'eq',
                        id // search value
                    ]]
            },
            columns,
            hideEdit: false,
            hideDetails: false
        };
        if (attributes[child].collectionList) {
            if (attributes[child].collectionList.limit) {
                reportData.limit = attributes[child].collectionList.limit;
            }
            if (attributes[child].collectionList.direction) {
                reportData.sort[0] = attributes[child].collectionList.direction;
            }
            if (attributes[child].collectionList.order) {
                reportData.sort[0] = attributes[child].collectionList.order;
            }
            if (attributes[child].collectionList.heading) {
                reportData.title = attributes[child].collectionList.heading;
            }
            if (attributes[child].collectionList.sort) {
                reportData.sort = attributes[child].collectionList.sort;
            }
            if (attributes[child].collectionList.columns) {
                reportData.columns = attributes[child].collectionList.columns;
            }
            if (attributes[child].collectionList.hideEdit) {
                reportData.hideEdit = true;
            }
            if (attributes[child].collectionList.hideDetails) {
                reportData.hideDetails = true;
            }
            if (attributes[child].collectionList.derive) {
                reportData.headingText = '';
                const total = {};
                for (const key of Object.keys(attributes[child].collectionList.derive)) {
                    const spec = attributes[child].collectionList.derive[key];
                    if (spec.type == 'function') {
                        const display = await spec.fn(record);
                        reportData.headingText += display;
                        continue;
                    }
                    if (spec.type == 'count') {
                        total[key] = children[child];
                    }
                    if (spec.type == 'total') {
                        total[key] = await db.totalRows(attributes[child].collection, { searches: [[attributes[child].via, 'eq', id]] }, spec.column);
                    }
                    if (spec.type == 'average') {
                        total[key] = await db.totalRows(attributes[child].collection, { searches: [[attributes[child].via, 'eq', id]] }, spec.column);
                        total[key] /= children[child];
                    }
                    if (spec.type == 'composite') {
                        if (spec.divide) {
                            total[key] = total[spec.divide[0]] / total[spec.divide[1]];
                        }
                        if (spec.add) {
                            total[key] = total[spec.divide[0]] + total[spec.divide[1]];
                        }
                        if (spec.subtract) {
                            total[key] = total[spec.divide[0]] - total[spec.divide[1]];
                        }
                    }
                    let display = total[key];
                    if (spec.display) {
                        display = await displayField(spec, display);
                    }
                    reportData.headingText += `<br />${spec.friendlyName}: ${display}`;
                }
            }
        }
        trace.log(reportData);
        output += `
    <div class="sudschilddata" id="childdata_${child}"  style="${style};"> <!--  childData / ${child} --> `;
        trace.log({ where: '', level: 'mid' }); // timing
        output += await listTable(permission, // permission
        attributes[child].collection, // table
        reportData, 1, // page
        table, // Parent
        limit //
        );
        output += `
      </div> <!--  childData / ${child} -->    
     `;
        trace.log({ where: `Child ${child} created`, level: 'mid' }); // timing
    }
    trace.log({ where: 'Child listings created', level: 'mid' }); // timing
    /* ************************************************
    *
    *   Links
    *
    ************************************************ */
    output += `<div class="${classes.output.buttons}">`;
    /* ************************************************
    *
    *   Edit
    *
    ************************************************ */
    let hasPermission = await hasPermissionFunction(permission, table, 'edit');
    trace.log({ hasPermission });
    if (hasPermission) {
        const link = `${suds.mainPage}?table=${table}&id=${id}&mode=populate`;
        output += `
  
      <button onclick="window.location='${link}'"  class="${classes.output.links.button}">
        ${lang.edit}
      </button>`;
    }
    /* ************************************************
    *
    *   Delete button
    *
    ************************************************ */
    hasPermission = await hasPermissionFunction(permission, table, 'delete');
    trace.log({ hasPermission });
    if (hasPermission) {
        if (totalChild && permission != '#superuser#') {
            output += `
        <button type="button" class="${classes.output.links.danger}" title="Need to delete related data first: : ${hasRows} ">${lang.deleteRow}</button>`;
        }
        else {
            let parentLink = '';
            if (parent) {
                parentLink = `&parent=${parent}&parentkey=${parentKey}`;
            }
            let link = `${suds.mainPage}?table=${table}&id=${id}&mode=delete${parentLink}`;
            //     <script>
            //     </script>
            output += `
      <button class="${classes.output.links.button}" onclick="var result=confirm('are you sure'); if (result) {window.location='${link}'}">
          ${lang.deleteRow}  
      </button>
 
 `;
        }
    }
    trace.log({ where: 'Links created', level: 'mid' }); // timing
    /* ************************************************
    *
    *   List table / Back to home page
    *
    ************************************************ */
    output += `
      <button class="${classes.output.links.button}" onclick="window.location='${mainPage}?table=${table}&mode=list${openLink}'">${lang.tableList}</button>
      <button class="${classes.output.links.button}" onclick="window.location='${mainPage}'">${lang.backToTables}</button>
   </div> <!-- buttons -->
`;
    trace.log({ output, level: 'silly' });
    const created = new Date(record.createdAt).toDateString();
    const updated = new Date(record.updatedAt).toDateString();
    let updatedBy = { fullName: 'Nobody' };
    if (record.updatedBy) {
        updatedBy = await db.getRow('user', record.updatedBy);
        trace.log({ user: record.updatedBy, record: updatedBy.fullName, level: 'user' });
    }
    trace.log(updatedBy);
    const footnote = `${lang.rowNumber}: ${id} ${lang.createdAt}: ${created} ${lang.updatedAt}: ${updated}  ${lang.updatedBy} ${updatedBy.fullName}`;
    trace.log({ footnote, level: 'user' });
    return ({ output, footnote });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1yb3cuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvbGlzdC1yb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUN6QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFDckQsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDakQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFDL0MsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxDQUFBO0FBQ2hELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUMxQixNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUVuRCwyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBQzNDLHFDQUFxQztBQUNyQyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDOUMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7QUFDL0MsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUN6RCxNQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0FBQ3pELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUN6QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUE7QUFFN0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBMEJFO0FBQ0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFL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QUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7cUJBQUU7b0JBQzNKLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxTQUFTLEVBQUU7d0JBQzFCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTt3QkFDN0gsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtxQkFDOUI7b0JBQ0QsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLFdBQVcsRUFBRTt3QkFDNUIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFOzRCQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7eUJBQUU7d0JBQy9FLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTs0QkFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO3lCQUFFO3dCQUM1RSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7NEJBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxD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