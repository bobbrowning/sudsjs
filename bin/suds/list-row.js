
let suds = require('../../config/suds');
let trace = require('track-n-trace');
let mergeAttributes = require('./merge-attributes');
let tableDataFunction = require('./table-data');
let classes = require('../../config/classes');
let lang = require('../../config/language')['EN'];
let db = require('./db');

let createField = require('./create-field');
//let countRows = require('./count-rows');
//let totalRows = require('./total-rows');
//let getRow = require('./get-row');
let getSearchLink = require('./search-link');
let displayField = require('./display-field');
let humaniseFieldname = require('./humanise-fieldname');
let hasPermissionFunction = require('./has-permission');
let listTable = require('./list-table');

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
module.exports = async function (permission, table, id, open, openGroup) {
  trace.log({ inputs: arguments, break: '#', level: 'min' });


  /* ************************************************
  *
  *   set up the data
  *
  ************************************************ */

  let mainPage = suds.mainPage;
  if (!mainPage) { mainPage = '/'; }
  let tableData = tableDataFunction(table, permission);
  let message = '';
  let attributes = await mergeAttributes(table, permission);  // Merve field attributes in model with config.suds tables
  trace.log({ attributes: attributes, level: 'verbose' })
  let record = await db.getRow(table, id);     // populate record from database
  if (record.err) {
    return (`<h1>Unexpected error ${record.errmsg}/h1>`);
  }
  let output = '';
  tableName = tableData.friendlyName;
  let rowTitle = `Row: ${id}`;              //  Row title defailts to Row: x  
  if (tableData.rowTitle) {    // This is a function to create the recognisable name from the record, e.g. 'firstname lastname' 
    rowTitle = tableData.rowTitle(record);
  }
  let parent;
  let parentKey;
  trace.log({
    table: table,
    tableData: tableData,
    rowTitle: rowTitle,
    tableName: tableName,
    parent: parent,
    parentKey: parentKey,
  });



  if (!open && tableData.list && tableData.list.open) {
    open = tableData.list.open;
  }
  let openLink = '';
  if (open) {
    openLink = `&open=${open}`;
  }

  /* ************************************************
    *
    *   Find out the number of child records. We
    *   shouldn't delete records if their are outstanding child
    *   records
    * 
    ************************************************ */
  let hasRows = '';
  let totalChild = 0;
  let children = {};
  for (let key of Object.keys(attributes)) {
    if (attributes[key].collection) {
      let child = attributes[key].collection;
      let via = attributes[key].via;
      let childCount = await db.countRows(child, { searches: [[via, 'eq', id]] });
      children[key] = childCount;
      if (childCount > 0) {
        totalChild += childCount;
        hasRows += child + ', ';
      }
    }
  }
  trace.log({ children: children, total: totalChild });

  output += `
      <script>
        let opentab='';
        function tabclick (tab) { 
          console.log(tab); `;
  for (let child of Object.keys(children)) {
    if (children[child]) {
      output += `
          document.getElementById('childdata_${child}').style.display="none";`;
    }

  }
  output += `
          if (opentab != tab) { 
            childdata='childdata_' + tab;
            console.log(childdata);
            document.getElementById(childdata).style.display="block"; 
            console.log(childdata,document.getElementById(childdata).style.display); 
            opentab=tab;
          }
          else {
            opentab='';
          }
        }
  
      </script>`;




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
      ****************************************************** */

  let omit = [];
  if (tableData.recordTypeColumn) {
    trace.log({
      recordTypeColumn: tableData.recordTypes,
      recordType: record[tableData.recordTypeColumn],
      recordtypedata: tableData.recordTypes[record[tableData.recordTypeColumn]],
      omit: tableData.recordTypes[record[tableData.recordTypeColumn]].omit,
    });
    if (tableData.recordTypes[record[tableData.recordTypeColumn]].omit) {
      omit = tableData.recordTypes[record[tableData.recordTypeColumn]].omit;
    }
  }
  trace.log(omit);
  let groupList = ['other'];
  let openTab = '';
  let staticList = [];  // list of groups with static first
  let fieldList = [];
  // make a list of all the fields that can be included
  for (let key of Object.keys(attributes)) {
    if (attributes[key].canView) { fieldList.push(key) }
  }
  trace.log({ fieldList: fieldList });
  let columnGroup = {};
  let incl = [];
  let tabs = [];
  if (tableData.groups) {
    trace.log({ formgroups: tableData.groups });

    // loop through the groups
    for (let group of Object.keys(tableData.groups)) {
      trace.log({ group: group, cols: tableData.groups[group].columns })
      if (group == 'other') { continue }                          // deal with this later - will be the last tab
      if (!tableData.groups[group].columns) { continue; }    // If there are no columns then will not be shown
      if (omit.includes(group)) { continue }
      let count = 0;                                         // how many viewable columns?
      for (const key of tableData.groups[group].columns) {
        if (attributes[key] && attributes[key].canView) {
          count++
          incl.push(key);
        };
      }
      if (!count) { continue }                                // If no viewable fields then the group will not be shown. 

      /* make a list of static groups - they will listed first. */
      if (tableData.groups[group].static) {
        staticList.push(group);
      }
      else {
        tabs.push(group);
      }
    }

    /* Now fill up the 'other' array     */
    if (!tableData.groups.other) { tableData.groups.other = {} }
    if (!tableData.groups.other.columns) { tableData.groups.other.columns = [] }
    let all = fieldList;
    /* need to remove the items in 'all' that are also in 'incl' and store result in  */
    /*     tableData.groups.other.columns                                             */
    /*     tableData.groups.other.columns = all.filter(item => !incl.includes(item)); */
    let count = 0;
    for (let key of all) {
      if (tableData.groups.other.columns.includes(key)) {
        count++;
        continue;
      }
      if (!incl.includes(key)) {
        tableData.groups.other.columns.push(key);
        count++;
      }
    }
    if (count) {
      tabs.push('other');
    }

    // List of the groups with static groups first
    groupList = staticList.concat(tabs);



    trace.log({ tabs: tabs, static: staticList, groups: tableData.groups })

    /*  Figure out which child list should be open for each group */
    let first = true;
    let openList = '{';
    for (let group of groupList) {
      let open = '';
      if (tableData.groups[group].open) {
        open = tableData.groups[group].open;
        openList += `${group}: '${open}',`;
      }
      if (first && !tableData.groups[group].static) {
        openTab = group
        first = false;
      };
      if (tableData.groups[group].columns) {
        for (let col of tableData.groups[group].columns) {
          columnGroup[col] = group;
        }
      }
    }
    if (openGroup) { openTab = openGroup }


    openList += '}';
    trace.log({ columnGroup: columnGroup, openTab: openTab });
    if (tabs) {
      output += `
      <script>
        function tabclickGroup (tab) { 
          console.log('tabclickgroup:',tab); 
          const openList=${openList};`;
      for (let tab of tabs) {
        output += `
          document.getElementById('group_${tab}').style.display="none";
          document.getElementById('tab_${tab}').style.fontWeight="normal";`;
      }
      output += `
          let tabdata='group_' + tab;
          let tabitem='tab_' + tab;
          console.log('tab:',tab,' opening:',tabdata);
          document.getElementById(tabdata).style.display="block"; 
          document.getElementById(tabitem).style.fontWeight="bold"; 
          if (openList[tab]) {tabclick(openList[tab])}
        }            
      </script>`;
    }

  }
  else {
    tableData.groups = { other: { static: true, } };
    staticList = ['other'];
    if (!tableData.groups.other.columns) { tableData.groups.other.columns = [] }
    for (let key of fieldList) {
      //    if (key == tableData.primaryKey || key == 'createdAt' || key == 'updatedAt') { continue; }
      tableData.groups.other.columns.push(key);
    }

  }
  let groups = tableData.groups;
  trace.log({ groups: groups });



  /* ************************************************
  *
  *   Table header
  *
  ************************************************ */


  if (message) { output += `<h2>${message}</h2>` }
  output += `
      <h1>${tableName}<br />${rowTitle}</h1>`;

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

  let groupRows = {};
  for (let group of groupList) {

    /* ************************************************
    *
    *   Loop through fields in group
    *
    ************************************************ */
    groupRows[group] = '';
    if (tableData.groups[group].columns) {
      for (const key of tableData.groups[group].columns) {
        trace.log(group, key, attributes[key].canView, children[key]);
        if (!attributes[key]) {
          console.log(`column ${key} in group ${group} does not exist.`);
          continue
        };
        if (!attributes[key].canView) { continue };
        let display = await displayField(attributes[key], record[key], children[key], permission);
        let title = attributes[key].friendlyName;
        let description = '';
        if (attributes[key].description) {
          description = attributes[key].description.replace(/"/g, `'`);
        }
        let col3 = '';

        /*  Collection              */
        if (attributes[key].collection) {
          let child = attributes[key].collection;
          trace.log(attributes[key]);
          let tabname = child;
          if (children[key]) {
            let childData = tableDataFunction(child);
            if (await hasPermissionFunction(permission, child, 'view')) {
              if (childData.friendlyName) {
                tabname = childData.friendlyName;
              }
              display += `
                    &nbsp;<a href="#" id="tab_${key}"  onclick="tabclick('${key}')">${lang.listRowChildLink}</a>`;
              if (attributes[key].annotate) {
                trace.log({ children: children[key] });
                for (let code of Object.keys(attributes[key].annotate)) {
                  trace.log(code, attributes[key].annotate[code]);
                  let value = '';
                  let annotate = attributes[key].annotate[code];
                  let via = attributes[key].via;
                  let title = code;
                  if (annotate.friendlyName) { title = annotate.friendlyName }
                  if (annotate.type == 'count') {
                    value = children[key];
                  }
                  if (annotate.type == 'sum') {
                    value = await db.totalRows(child, { searches: [[via, 'eq', id]] }, annotate.col);
                  }
                  if (annotate.currency) {
                    formatter = new Intl.NumberFormat(
                      suds.currency.locale,
                      {
                        style: 'currency',
                        currency: suds.currency.currency,
                        minimumFractionDigits: suds.currency.digits,
                      })
                    value = formatter.format(value);
                  }
                  trace.log(value);
                  display += ` ${title}: ${value}`;
                }

              }
            }
          }
          let via = attributes[key].via;

          let tip = lang.addRowTip + tabname;
          if (attributes[key].collectionList && attributes[key].collectionList.addChildTip) {
            tip = attributes[key].collectionList.addChildTip
          };

          if (await hasPermissionFunction(permission, child, 'edit')) {
            let link = `${suds.mainPage}?table=${child}&mode=new&prepopulate=${via}&${via}=${id}`;
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
                ${display}
              </td>
              <td class="${classes.output.listRow.col3}">
                ${col3}
              </td>
            </tr>`;
      }
    }
    trace.log({ group: group, rows: groupRows[group], level: 'verbose' })
  }

  // Now put it all together
  output += `
      <div class="${classes.output.table.envelope}">  <!--  Static Data -->
        <table class="${classes.output.table.table}">   
          <thead>
            <tr class="${classes.output.table.tr}">
              <th scope="col" class="${classes.output.table.th} ${classes.output.listRow.col1}">${lang.field}</th>
              <th scope="col" class="${classes.output.table.th} ${classes.output.listRow.col2}">${lang.value}</th>
              <th scope="col" class="${classes.output.table.th} ${classes.output.listRow.col3}"></th>
            </tr>
          </thead>
          <tbody>`;
  for (let group of staticList) {
    trace.log({ group: group, rows: groupRows[group], level: 'verbose' })
    output += groupRows[group];
  }
  output += `
          </tbody> 
        </table>
      </div>  <!-- Static Data  -->`;
  trace.log({ tabs: tabs, length: tabs.length });

  if (tabs && tabs.length > 1) {
    trace.log({ tabs: tabs });
    output += `
    <!-- this section controlled by tabs -->
      <div class="${classes.output.groupLinks.row}">  <!-- Tabs -->
        <div class="${classes.output.groupLinks.envelope}"> <!-- Envelope -->
          <span class="${classes.output.groupLinks.spacing}">${lang.formGroup}</span>`;
    for (let group of tabs) {                              // run through the tabs
      trace.log(openTab, group);
      let friendlyName = group;
      if (groups[group].friendlyName) { friendlyName = groups[group].friendlyName; }
      if (openTab == group) { style = 'font-weight:bold'; } else { style = '' }   // the first will be shown the rest hidden
      output += `
            <a class="${classes.output.groupLinks.spacing}"  style="${style}" id="tab_${group}" href="#" onclick="tabclickGroup('${group}')">
               ${friendlyName}
            </a>`;        // outputting a list of links
    }
    output += `
        </div>  <!-- Envelope -->
      </div> <!-- Tabs -->`;
  }

  let disp;
  for (let group of tabs) {                               // then go through the non-statiuc groups
    if (openTab == group) { disp = 'block'; } else { disp = 'none' }   // the first will be shown the rest hidden
    output += `
       <!--  --------------------------- ${group} ---------------------- -->
      <div id="group_${group}" style="display: ${disp}">  <!-- Group ${group} -->`;
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
    output += `
      </div>   <!--  group ${group}  -->`;

  }



  // ******************************************




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
  trace.log({ hasPermission: hasPermission });
  if (hasPermission) {
    let link = `${suds.mainPage}?table=${table}&id=${id}&mode=populate`;
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
  trace.log({ hasPermission: hasPermission });
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
      link = `${suds.mainPage}?table=${table}&id=${id}&mode=delete${parentLink}`;
      //     <script>
      //     </script>
      output += `
      <button class="${classes.output.links.button}" onclick="var result=confirm('are you sure'); if (result) {window.location='${link}'}">
          ${lang.deleteRow}  
      </button>
 
 `;
    }
  }



  /* 
   for (let key of Object.keys(attributes)) {
     if (attributes[key].model) {
       let linkTable = attributes[key].model;
       let linkData = sails.helpers.sudsTableData(linkTable);
       // If the linked tables lists this as a child in the config file?
       // some tables may be linked but not necessarily intersting links
       if (linkData.associations
         && linkData.associations[table]
         && record[key]) {
         trace.log(key, attributes[key]);
         output += `
       <span style="margin-right: 10px; margin-left: 10px;"><a class="btn btn-primary btn-sm" href="${mainPage}?table=${linkTable}&mode=listrow&id=${record[key]}&open=${table}">${lang.linkTo} ${attributes[key].friendlyName}</a>
         `;
       }
     }
   }
*/
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




  /* ************************************************
  *
  *  List first few child records
  *  The child tables to list, the order, and the 
  *  number to be listed are specified in the suds tables 
  *  config file. 
  *
  * Pass over children that this user doesn't have permission to see
  * and any that are markled in suds tables.js is not to be listed.
  * 
  ************************************************ */
  childnames = Object.keys(children);
  // delete any names that the user can't see
  for (let i = 0; i < childnames.length; i++) {
    trace.log({ i: i, childname: childnames[i], });
    let child = childnames[i];
    if (!attributes[child].canView) {
      output += `
    <div class="sudschilddata" id="childdata_${child}"  style="display: none"> <!--  childData / ${child} --> 
    </div> <!--  childData / ${child} -->   
        `;
      continue
    }
    if (!children[child]) { continue }

    let style = 'display: none';
    if (open) {
      if (child == open) {
        style = ''

      }
    }
    let limit = 10;
    let heading;   // Listing program wil generate a sensible heading
    trace.log(child, attributes[child], attributes[child].collection,);

    let columns = Object.keys(await mergeAttributes(attributes[child].collection, permission));
    trace.log(columns);

    let reportData = {
      table: attributes[child].collection,
      sort: ['updatedAt', 'DESC'],
      search: {
        andor: 'and',
        searches: [[
          attributes[child].via,   // searchfield
          'eq',                           // compare
          id,                                 // search value
        ]]
      },
      columns: columns,
      hideEdit: false,
      hideDetails: false,
    };

    if (attributes[child].collectionList) {

      if (attributes[child].collectionList.limit) { reportData.limit = attributes[child].collectionList.limit; }
      if (attributes[child].collectionList.direction) { reportData.sort[0] = attributes[child].collectionList.direction; }
      if (attributes[child].collectionList.order) { reportData.sort[0] = attributes[child].collectionList.order; }
      if (attributes[child].collectionList.heading) { reportData.title = attributes[child].collectionList.heading }
      if (attributes[child].collectionList.columns) { reportData.columns = attributes[child].collectionList.columns }
      if (attributes[child].collectionList.hideEdit) { reportData.hideEdit = true; }
      if (attributes[child].collectionList.hideDetails) { reportData.hideDetails = true; }


      if (attributes[child].collectionList.derive) {
        reportData.headingText = '';
        let total = {};
        for (let key of Object.keys(attributes[child].collectionList.derive)) {
          let spec = attributes[child].collectionList.derive[key];
          if (spec.type == 'count') { total[key] = children[child]; }
          if (spec.type == 'total') { total[key] = await db.totalRows(attributes[child].collection, { searches: [[attributes[child].via, 'eq', id]] }, spec.column); }
          if (spec.type == 'average') {
            total[key] = await db.totalRows(attributes[child].collection, { searches: [[attributes[child].via, 'eq', id]] }, spec.column);
            total[key] /= children[child];
          }
          if (spec.type == 'composite') {
            if (spec.divide) { total[key] = total[spec.divide[0]] / total[spec.divide[1]] }
            if (spec.add) { total[key] = total[spec.divide[0]] + total[spec.divide[1]] }
            if (spec.subtract) { total[key] = total[spec.divide[0]] - total[spec.divide[1]] }
          }
          let display = total[key];
          if (spec.display) { display = await displayField(spec, display) }
          reportData.headingText += ` ${spec.friendlyName}: ${display}`;

        }
      }
    }


    trace.log(reportData);

    output += `
    <div class="sudschilddata" id="childdata_${child}"  style="${style};"> <!--  childData / ${child} --> `;

    output += await listTable(
      permission,             // permission
      attributes[child].collection,                  // table
      reportData,
      1,                      // page
      table,                  // Parent
      limit,                  //
    )

    output += `
      </div> <!--  childData / ${child} -->    
     `;

  }

  trace.log({ output: output, level: 'silly' });
  let created = new Date(record['createdAt']).toDateString();
  let updated = new Date(record['updatedAt']).toDateString();
  let footnote = `${lang.rowNumber}: ${id} ${lang.createdAt}: ${created} ${lang.updatedAt}: ${updated}`;
  return ({ output: output, footnote: footnote });

}

