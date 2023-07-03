"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const mergeAttributes = require('./merge-attributes');
const createField = require('./create-field');
const tableDataFunction = require('./table-data');
// let countRows = require('./count-rows');
// let getRows = require('./get-rows');
const getSearchLink = require('./search-link').searchLink;
const getAttribute = require('./search-link').getAttribute;
const displayField = require('./display-field');
const humaniseFieldname = require('./humanise-fieldname');
const suds = require('../../config/suds');
const classes = require('../../config/classes');
const lang = require('../../config/language').EN;
const db = require('./db');
const sanitizeHtml = require('sanitize-html');
/** ********************************************************************
 *
 * list-table.js
 *
 * List the rows in a table.
 * This may be called from the home page (via admin.js), or to list child rows
 * at the bottom of a row detail page.
 *
 * @param {string}  permission -  The permission set of the logged-in user ,
 * @param {string}  table - The table being listed
 * @param {object}  reportData - Report specification - sorting/selection etc
 * @param {number}  page - The current page number
 * @param {string}  parent - Only applies when the routine is called from
 *                           the row listing as a child. This is the
 * @returns {Object} Table listing data for

 ******************************************************************************** */
module.exports = async function listTable(permission, table, reportData, page, parent) {
    trace.log({ break: '#', inputs: arguments, level: 'min' });
    trace.log({ where: 'list table start', level: 'mid' }); // timing
    trace.log(reportData);
    const attributes = mergeAttributes(table, permission);
    /**
    * If this is listing a View (Couch only),
    * = Fill out any blanks in the report specification
    * = Add view fields to the attributes list
    * */
    let extendedAttributes = fixReportData(reportData);
    /**
    * Set up the table (collection) data
    */
    const tableData = tableDataFunction(table, permission);
    trace.log({ tabledata: tableData, permission, maxdepth: 4 });
    let id = tableData.primaryKey;
    if (!id) {
        throw new Error(`No primary key specified for ${tableData.friendlyName}`);
    }
    if (!tableData.canView) {
        throw new Error(`Sorry - you don't have permission to view ${tableData.friendlyName} (${table})`);
    }
    let sortKey = tableData.primaryKey; // default sort direction
    trace.log(sortKey);
    let direction = 'ASC'; //                    ^   ^
    /*          ***** Set up the report data *********** */
    /** Extract the search specification */
    let searchSpec = extractSeachSpec(reportData);
    let searches = searchSpec.searches;
    let andor = searchSpec.andor;
    /** Extract basic report information */
    let [heading, headingTip, parentSearch] = getReportData(reportData, tableData, andor, searches);
    let limit;
    let offset;
    [limit, offset, page] = getPageData(reportData, parent, page);
    const count = await db.countRows(table, searchSpec, offset);
    /* Find out what columns are listed. */
    let columns = findColumns(extendedAttributes, tableData, reportData);
    /** Get field names and extendedAttributes */
    /* virtuals - not recently tested...*/
    let virtuals = {};
    if (tableData.virtuals) {
        virtuals = tableData.virtuals;
    }
    let fieldList = getFieldList(columns, extendedAttributes, virtuals);
    /* number of rows in the table */
    /** ************** Create output ******************** */
    let output = `
        <h1 title="${headingTip}">${heading}</h1>`;
    /* If a search is in progress, produce a line confirming the search */
    let searchText = await getSearchText(andor, searches, extendedAttributes, parent, count);
    output += searchText;
    let isSearch = false;
    if (searchText)
        isSearch = true;
    if (reportData.headingText) {
        output += `<br />
          ${reportData.headingText}`;
    }
    /** * ************************************************
    *
    *              SEARCH BOX
    *
    * *********************************************** */
    output += await getSearchBox(reportData, extendedAttributes, parent, isSearch);
    /* ************************************************
    *
    *  Sort direction ??? not used it seems
    *
    ************************************************ */
    let sortable = true;
    if (parent) {
        sortable = false;
    }
    if (reportData.view && !reportData.view.sortable) {
        sortable = false;
    }
    // let sortdirection = getSortDirection(reportData, tableData, parent,)
    /*  output += `
      </p>  <!--  listTablePre -->`*/
    /* ************************************************
     *
     *  Create output
     *  Table header
     *
     ************************************************ */
    output += `
  <div class="${classes.output.table.envelope}">  <!-- table envelope -->
  <table class="${classes.output.table.table}" >
      <thead>  `;
    output += getTableHeader(count, fieldList, virtuals, extendedAttributes);
    output += `
         <tbody>`;
    /* ************************************************
    *            MAIN LOOP
    *  loop through file creating lines
    *
    ************************************************ */
    let startTime = new Date().getTime();
    trace.log({ where: 'Start of main loop', level: 'timer' }); // timing
    const records = await db.getRows(table, searchSpec, offset, limit, sortKey, direction);
    trace.log({ records: records.length, 'Elapsed time (ms)': new Date().getTime() - startTime, level: 'timer', });
    trace.log({ offset, page, records, length: records.length });
    /*
    if (page == 1 && records.length==1) {
      let output=`<script>window.location="${suds.mainPage}?table=${table}&id=${records[0][tableData.primaryKey]}&mode=listrow"</script>`;
      trace.log(output);
      return output;
    }
    */
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        trace.log(record);
        output += `
          <tr>`;
        for (let j = 0; j < fieldList.length; j++) {
            output += await getRowItem(record, i, j, fieldList, extendedAttributes, virtuals);
        }
        trace.log(i, tableData.canEdit);
        if (i === 1)
            trace.log({ where: 'Fields done', level: 'mid' }); // timing
        output += lastColumn(record, i, tableData, reportData);
        output += `
      </tr>`;
        trace.log({ where: `Record ${i} processed`, level: 'mid' }); // timing
    }
    /* ************************************************
    *
    *  Finish off
    *
    *  prev and next slots
    *  if called as a child on record detail listing the 'prev'
    *  contains more... and routes you off to the full listing
    *  with a search for the parent..
    *
    ************************************************ */
    output += lastLine(parent, sortKey, direction, parentSearch, limit, page, count);
    output += `
        </tbody> 
      </table>
    </div> <!-- table envelope -->`;
    /* ************************************************
         *
         *  Links
         *
         ************************************************ */
    output += linksRow(tableData, reportData, parent);
    trace.log(global.suds);
    trace.log('returning');
    trace.log({ output, level: 'verbose' });
    trace.log({ where: 'Finished', level: 'mid' }); // timing
    return (output);
    /* ************************  SUBROUTINES ********************** */
    function fixReportData(reportData) {
        let extendedAttributes;
        if (reportData.view && suds.dbDriver != 'couch') {
            throw new Error(`Sorry - views only works with CouchDB - trying to report on ${reportData.view}`);
        }
        if (reportData.view && reportData.view.fields) {
            for (const key of Object.keys(reportData.view.fields)) {
                reportData.view.fields[key].canView = true;
                reportData.view.fields[key].noSchema = true;
                if (!reportData.view.fields[key].input) {
                    reportData.view.fields[key].input = { type: 'text' };
                }
                if (!reportData.view.fields[key].process) {
                    reportData.view.fields[key].process = {};
                }
                if (!reportData.view.fields[key].display) {
                    reportData.view.fields[key].display = {};
                }
                if (!reportData.view.fields[key].type) {
                    reportData.view.fields[key].type = 'string';
                }
            }
            extendedAttributes = { ...attributes, ...reportData.view.fields };
        }
        else {
            extendedAttributes = attributes;
        }
        return extendedAttributes;
    }
    /***
     *  extract search spec
     *  embed the view data if there is any...
     *  */
    function extractSeachSpec(reportData) {
        let searchSpec = { andor: 'and', searches: [] };
        if (reportData.search) {
            trace.log(reportData.search);
            searchSpec.andor = reportData.search.andor;
            searchSpec.searches = [];
            for (let i = 0; i < reportData.search.searches.length; i++) {
                trace.log(reportData.search.searches[i]);
                searchSpec.searches[i] = reportData.search.searches[i]; // normal case
                /*
                      if (typeof reportData.search.searches[i][2] == 'string'
                        && reportData.search.searches[i][2].substring(0, 1) == '#') {
                        term = reportData.search.searches[i][2].substring(1);
                        if (term == 'loggedInUser' || term.substring(0, 5) == 'today') { continue }
                        trace.log(term);
                        searchSpec.searches[i][2] = reportData.search[term];
                      }
                */
            }
            trace.log(searchSpec);
        }
        if (reportData.view) {
            searchSpec.view = reportData.view;
        }
        if (reportData.sort) {
            trace.log(reportData.sort);
            sortKey = reportData.sort[0];
            direction = reportData.sort[1];
        }
        trace.log(searchSpec);
        /**
        *  inputs search, sort, and open take priority over report...
        * */
        trace.log(searchSpec);
        /* this rationalises the search criteria e.g. turns 'true' into true */
        if (searchSpec.searches && searchSpec.searches.length) {
            if (!searchSpec.andor) {
                searchSpec.andor = 'and';
            }
            //   andor = searchSpec.andor
            searchSpec.searches = getSearchLink(extendedAttributes, searchSpec);
        }
        trace.log(searchSpec);
        return searchSpec;
    }
    /**
      * Figure out which columns (fields) are being listed
      */
    function findColumns(extendedAttributes, tableData, reportData) {
        let columns = Object.keys(extendedAttributes);
        trace.log(columns);
        if (tableData.list.columns) {
            columns = tableData.list.columns;
        }
        trace.log(columns);
        if (reportData.columns) {
            columns = reportData.columns;
        }
        trace.log(columns);
        return columns;
    }
    /**
     * Extrct the report data
     *
     * @param reportData
     * @param tableData
     * @returns [
     *    heading,
     *    headingTip,
     *    openLink,
     *    parentSearch
     * ]
     */
    function getReportData(reportData, tableData, andor, searches) {
        //    let openLink = ''
        let open = '';
        let openGroup = '';
        let headingTip = '';
        let heading = '';
        if (reportData.friendlyName) {
            heading = reportData.friendlyName;
            if (reportData.description) {
                headingTip = reportData.description;
            }
        }
        else {
            heading = `${lang.listTable} ${tableData.friendlyName}`;
            headingTip = tableData.description;
        }
        if (reportData.open) {
            open = reportData.open;
        }
        if (reportData.openGroup) {
            openGroup = reportData.openGroup;
        }
        /*
          if (open) {
            openLink = `&open=${open}`
          }
          if (openGroup) {
            openLink += `&opengroup=${openGroup}`
          }
          */
        let parentSearch = ''; // link added if this is a child listing and we go over the limit
        if (parent) {
            parentSearch = `&searchfield_1=${searches[0][0]}&compare_1=eq&value_1=${searches[0][2]}&andor=and`;
        }
        trace.log({ open, openGroup, heading });
        return [heading, headingTip, parentSearch];
    }
    /** * pagination -note thst if there is a parent parameter
     * there is no pagination, but limit wll be provided.
     * Limit of -1 = no limit
     * */
    function getPageData(reportData, parent, page) {
        const pageLength = suds.pageLength;
        let limit = -1; // default all data.
        let offset = 0; // starting at beginning
        if (reportData && reportData.limit) {
            limit = reportData.limit;
        }
        if (!parent) {
            if (!page) {
                page = 1;
            } // current page number
            limit = pageLength; // number of records to print
            offset = (page - 1) * limit; // number of records to offset
        }
        trace.log({ table, page, limit, offset });
        return [limit, offset, page];
    }
    function getFieldList(columns, extendedAttributes, virtuals) {
        let fieldList = [];
        let i = 0;
        for (const key of columns) {
            if (!extendedAttributes[key]) {
                throw new Error(`Unrecognised field ${key} in column list, Listing table: ${table}, Parent: ${parent}, Report: ${reportData.friendlyName}`);
            }
            if (extendedAttributes[key].canView) {
                fieldList[i++] = key;
            }
        }
        if (virtuals) {
            for (const key of Object.keys(virtuals)) {
                fieldList[i++] = key;
            }
        }
        trace.log(fieldList);
        return fieldList;
    }
    async function getSearchText(andor, searches, extendedAttributes, parent, count) {
        let searchText = '';
        const andtest = [];
        for (let i = 0; i < searches.length; i++) {
            const searchField = searches[i][0];
            const attribute = getAttribute(searchField, extendedAttributes);
            const compare = searches[i][1];
            const value = searches[i][2];
            let displayValue = value;
            let displayCompare = compare;
            let friendlyName = await humaniseFieldname(searchField);
            if (attribute.friendlyName) {
                friendlyName = attribute.friendlyName;
            }
            displayValue = await displayField(attribute, value, 0, permission);
            /*
            if (attribute.input.type == 'date' && attribute.type == 'number') {
              let date = new Date(value);
              value = date.getTime();
              displayValue = date.toDateString();
            }
            */
            displayCompare = lang[compare];
            if (attribute.input.type === 'date') {
                if (compare == 'lt') {
                    displayCompare = 'earlier than';
                }
                if (compare == 'gt') {
                    displayCompare = 'later than';
                }
            }
            if (attribute.type == 'string') {
                if (compare == 'lt') {
                    displayCompare = 'sorts lower than';
                }
                if (compare == 'gt') {
                    displayCompare = 'sorts greater than';
                }
                displayValue = `'${displayValue}'`;
            }
            if (i == 0) {
                searchText += `
             ${lang.filterBy}:&nbsp;`;
            }
            else {
                searchText += `&nbsp;${andor}&nbsp;`;
            }
            searchText += `${friendlyName} ${displayCompare} ${displayValue}`;
            if (andor == 'and' && compare == 'eq') {
                /* can't have a=2 AND a=3  but we will treat as OR just for that varable                   */
                /* so a=2 and a=3 and b=6 is trated as (a=2 or a=3) AND b=6 which is probably              */
                /* what they wanted - but print a warning message. Might evn be useful for advanced users  */
                if (andtest.includes(searchField)) {
                    searchText += ' <span style="color: red">(You can\'t have the same field twice in an AND test. So treated as \'OR\')</span>';
                }
                else {
                    andtest.push(searchField);
                }
            }
        }
        if (searchText) {
            searchText += '.<br />';
        }
        if (reportData.sort) {
            let dir = lang.asc;
            if (direction == 'DESC') {
                dir = lang.desc;
            }
            searchText += `
            ${lang.sortedBy} ${extendedAttributes[sortKey].friendlyName} - ${dir}.`;
        }
        if (parent && limit && limit != -1) {
            searchText += ` ${lang.limit} ${limit} ${lang.rows}`;
        }
        if (parent && limit != -1 && count > limit) {
            searchText += ` <a href="${suds.mainPage}?table=${table}&mode=list&sortkey=${sortKey}&direction=${direction}&${parentSearch}">${lang.fullList}</a>`;
        }
        if (extendedAttributes[sortKey].model) {
            searchText += `<br /><span style="color:red">(Note: Order is by ${extendedAttributes[sortKey].friendlyName} code not name)</span>`;
        }
        trace.log({ search: searchSpec, searchText });
        return searchText;
    }
    async function getSearchBox(reportData, extendedAttributes, parent, isSearch) {
        let box = '';
        let needSearch = true;
        if (parent) {
            needSearch = false;
        }
        if (reportData.view && !reportData.searchFields) {
            needSearch = false;
        }
        trace.log({ needSearch, sf: reportData.searchFields });
        // ------------------------
        if (needSearch) { // never provide search for child listing
            /**
             *
             *  Create a list of fields and then remove those that this user
             *  doesn't have permission to see
             *
             * The report may specify which fields to allow searching.
             * If the report is a CouchDB type view, the list must be one item long with the key field.
             *
             */
            let keys;
            if (reportData.searchFields) {
                keys = reportData.searchFields;
            }
            else {
                keys = Object.keys(extendedAttributes);
                for (let k = 0; k < keys.length; k++) {
                    if (!extendedAttributes[keys[k]].canView) {
                        delete keys[k];
                        continue;
                    }
                    if (extendedAttributes[keys[k]].type == 'object') {
                        delete keys[k];
                        continue;
                    }
                    if (extendedAttributes[keys[k]].array) {
                        delete keys[k];
                    }
                }
                keys = keys.filter(Boolean); // compress array after removing elements...
            }
            trace.log(keys);
            /**
             *
             * Create an appropriate search for each field.
             *
             *  The keys array is just an array of field names.
             * The fields array is an array of the html for each field
             * which will demend on the input type.  Uses the same routine
             * used to generate that field in the update form.
             *
             */
            /* This generates a JS array in the web page, one element for each fieldname. */
            box += `
        <script>
          let num=0; 
          let keys=[`;
            for (const key of keys) {
                box += `'${key}',`;
            }
            box += ']';
            /**
             *
             * The next section generates a JS object in the web page.  One element for
             * each field. The format of each element is:
             * fieldname: function() {
             *        let field=`<input .... ><span id=err_fieldname></span>`;
             *        let comp=`<select> LT, GT etc.... </select>`;
             *        =return[comp,field]
             *          },
             *
             * The field value may be <input> tags, or select, radio etc depemding on the
             * field input type in the data model. Its the same as the input form (mainly).
             * The compare options depend on the field type.
             *
             */
            box += `
          var filter= {
  `;
            for (let k = 0; k < keys.length; k++) {
                const key = keys[k];
                trace.log(key, extendedAttributes[key]);
                const saved_placeholder = extendedAttributes[key].input.placeholder;
                const saved_type = extendedAttributes[key].input.type;
                const saved_width = extendedAttributes[key].input.width;
                const saved_class = extendedAttributes[key].input.class;
                const saved_hidden = extendedAttributes[key].input.hidden;
                delete extendedAttributes[key].input.hidden;
                extendedAttributes[key].input.class = classes.output.search.condition.valueClass;
                // remove placeholder. The one for the input form may not be appropriate
                if (suds.search.allwaysText.includes(extendedAttributes[key].input.type)) {
                    extendedAttributes[key].input.type = 'text';
                    extendedAttributes[key].input.width = suds.search.fieldWidth;
                    if (extendedAttributes[key].type == 'number') {
                        extendedAttributes[key].input.placeholder = lang.enterNumber;
                    }
                    else {
                        delete extendedAttributes[key].input.placeholder;
                    }
                }
                trace.log(key, extendedAttributes[key].type, extendedAttributes[key].input.type);
                // compare select depends on field type. defaults to text
                let comp = `
          <select name="{{compare}}" class="${classes.output.search.select}" >
            <option value="contains">Contains</option>
            <option value="lt">Lower Alphabetically</option>
             <option value="eq">Equals</option>
           <option value="gt">Higher</option>
          </select>`;
                if (extendedAttributes[key].type == 'number' || extendedAttributes[key].input.type == 'number') {
                    comp = `
            <select name="{{compare}}" class="${classes.output.search.select}" >
              <option value="lt">Less than</option>
              <option value="le">Less than or equals</option>
              <option value="eq" selected>Equals</option>
              <option value="ge">Greater than or equals</option>
              <option value="gt">Greater than</option>
            </select>`;
                }
                if (extendedAttributes[key].process && extendedAttributes[key].process.JSON) {
                    comp = `
            <select name="{{compare}}" class="${classes.output.search.select}" >
              <option value="includes">Includes</option>
             </select>`;
                }
                if (extendedAttributes[key].input.type == 'date') {
                    comp = `
            <select name="{{compare}}" class="${classes.output.search.select}" >
            <option value="lt">Before</option>
            <option value="le">On or Before</option>
            <option value="eq">On</option>
            <option value="ge">On or After</option>
            <option value="gt">After</option>
            </select>`;
                }
                // can't have equals because this is to the millisecond...
                if (extendedAttributes[key].type == 'number' &&
                    (extendedAttributes[key].input.type == 'date' ||
                        extendedAttributes[key].process.createdAt ||
                        extendedAttributes[key].process.updatedAt)) {
                    comp = `
            <select name="{{compare}}" class="${classes.output.search.select}" >
              <option value="lt">Before</option>
              <option value="gt">After</option>
            </select>`;
                    extendedAttributes[key].input.type = 'date';
                }
                if (saved_type == 'uploadFile') {
                    extendedAttributes[key].input.placeholder = 'Please enter a file name ';
                }
                // Better than a checkbox...
                if (extendedAttributes[key].type == 'boolean') {
                    extendedAttributes[key].input.type = 'yesnoRadio';
                }
                if (extendedAttributes[key].type == 'number' && extendedAttributes[key].input.type !== 'date') {
                    extendedAttributes[key].input.type = 'number';
                    extendedAttributes[key].input.width = suds.search.fieldWidth;
                }
                if (extendedAttributes[key].process.updatedBy) {
                    extendedAttributes[key].input.type = 'autocomplete';
                    extendedAttributes[key].input.width = '80%';
                    extendedAttributes[key].input.search = 'fullName';
                    extendedAttributes[key].input.placeholder = 'Number or type name';
                }
                // some types do not require a compare option
                if (suds.search.allwaysEquals.includes(extendedAttributes[key].input.type)) {
                    comp = '<input type="hidden" name="{{compare}}" value="eq">is';
                }
                if (extendedAttributes[key].process && extendedAttributes[key].process.JSON) {
                    comp = '<input type="hidden" name="{{compare}}" value="includes">includes';
                    extendedAttributes[key].input.type = 'select';
                }
                trace.log(extendedAttributes[key]);
                const [field, headerTags] = await createField(key, '', extendedAttributes[key], '', 'search', {}, tableData);
                trace.log({ key: key, changed: extendedAttributes[key].input, header: headerTags, level: 'verbose' });
                /* restore the extendedAttributes we have changed */
                extendedAttributes[key].input.class = saved_class;
                if (saved_placeholder) {
                    extendedAttributes[key].input.placeholder = saved_placeholder;
                }
                delete extendedAttributes[key].input.width;
                if (saved_width) {
                    extendedAttributes[key].input.width = saved_width;
                }
                if (saved_hidden) {
                    extendedAttributes[key].input.hidden = saved_hidden;
                }
                extendedAttributes[key].input.type = saved_type;
                trace.log({ restored: extendedAttributes[key].input, level: 'verbose' });
                trace.log({ key, field, level: 'norm' });
                if (field.includes('</script>')) {
                    continue;
                }
                box += `
          // ------------------- ${key} function---------------------     
          ${key}: function () {  
                 let field=\`${field}\`;  
                 let comp=\`${comp}\`;  
                 return [comp,field];
               },`;
                trace.log(key, extendedAttributes[key].type, extendedAttributes[key].input.type);
            }
            box += `
      }`;
            /** *
             * This function uses the generated fields to create the comparison select
             * plus input field depending on which field has been selected..
             *
             */
            //
            box += `
  
      function createField(select) {
        let debug=false;
        document.getElementById("filterbutton2").style.display='block';
        document.getElementById("backupbutton").style.display='block';
        document.getElementById("filterbutton").style.display='none';
        document.getElementById("filtergo").style.display="block";
        let i=select.selectedIndex-1; 
        let key=keys[i]; 
        if (debug) {console.log(key);}
        if (i== -1) {
            document.getElementById("search"+"_"+num).innerHTML=""; 
        } 
        else {
          let filterspec=filter[key](num);
          let compare='compare_'+num;
          let comp=filterspec[0];
          let re=/{{compare}}/gi;
          comp=comp.replace(re,compare);
          document.getElementById("compare"+"_"+num).innerHTML=\`
            \${comp}\`;          
          let fieldname='value_'+num;
          let field=filterspec[1];
          if (debug) {console.log(fieldname);}
          re=/{{fieldname}}/gi;
          field=field.replace(re,fieldname);
          if (debug) {console.log(field);}
          document.getElementById("search"+"_"+num).innerHTML=\`          
          \${field}\`;
        } 
        if (debug) { console.log(document.getElementById("search"+"_"+num).innerHTML);}
      } `;
            /**
             *
             * backup removes the last filter and goes back up to the previous
             *
             */
            box += `
  
      function  backup () {
        document.getElementById('select_'+num).innerHTML='';
        document.getElementById('compare_'+num).innerHTML='';
        document.getElementById('search_'+num).innerHTML='';
        if (num==1) {
          document.getElementById('andor').style.display='none';       
          document.getElementById('backupbutton').style.display='none';       
          document.getElementById('filterbutton2').style.display='none';       
          document.getElementById('filtergo').style.display='none';       
          document.getElementById('filterbutton').style.display='block';       
        }
        num--;
      }`;
            /** *
             * anyDataCheck checks that a comparison field has been entered.
            */
            box += `
  
      function anyDataCheck () {
        let debug=false;
        let errmsg;
        if (debug) {console.log("value_"+num,);}
        let currentIndex=document.getElementById("searchfield_"+num).selectedIndex;
        let currentValue='';
        if(document.getElementById("value_"+num)) {
           currentValue=document.getElementById("value_"+num).value;
        }
        if (debug) {console.log('current value: ',currentValue,'  current index: ',currentIndex, );}
       
        let anyData=true;
        if (currentIndex == 0) {
          errmsg='You need to select a field';
          anyData=false;
        }
        else {
          errmsg='You need to enter a value';     
          if (document.getElementById("search_"+num).innerHTML.includes('type="radio"')) {
            const matches=document.getElementById("search_"+num).innerHTML.matchAll(/type="radio".*? id=".*?"/g);
            anyData=false;
            for (const match of matches) {
              let ids=match[0].match(/id=".*?"/g);
              let id=ids[0].replace('id="','');
              id=id.replace('"','');
              if (document.getElementById(id).checked) {
                anyData=true;
                break;
              }
            }
          } 
          else { 
            if (debug) {console.log('curreent value: ',currentValue);}
            if (!currentValue) {anyData=false;}
          }
        }
        if (debug) { console.log("anydata: ",anyData);}
        if (!anyData) {document.getElementById('msg').innerHTML=errmsg;}
        return (anyData);
      }`;
            /**
             *
             * This function creates the select for the user to choose the field to filter with.
             */
            box += `
  
      function createFieldSelect() {
        debug=true;
        if (debug) {console.log('createFieldSelect',num);}
        if (num >0) {
          let anyData=anyDataCheck();  // check that the last condition has been entered
         if (!anyData) {return }
        }
        num++;
          if (num>1) {
          document.getElementById("andor").style.display="block";
       }
       if (num > ${suds.search.maxConditions}) {return false}
       let select=\`
          <select name="searchfield_\${num}" id="searchfield_\${num}" class="${classes.output.search.select}" onChange="createField(this,num)" style="margin-bottom: 15px;">
            <option value="">${lang.filterSelect}</option>`;
            for (const key of keys) {
                box += `
            <option value="${key}">
              ${extendedAttributes[key].friendlyName}
            </option>`;
            }
            box += `
          </select>
         \`;
          let selectdiv='select_'+num;
          if (debug) console.log(select);
         document.getElementById(selectdiv).innerHTML=select;
         return ;
      }`;
            // end of generated Javascript
            box += `    
        </script>`;
            /**
             *
             * The Javascript is now generated.
             * Now create the filter button. Which doubles as the start over button.
             *
             */
            let filterButton = lang.filterList;
            if (isSearch) {
                filterButton = lang.startOver;
            }
            /**
             *
             * Start the filter form.
             *
             */
            box += `
  
          <form action="${suds.mainPage}" id="mainform" name="mainform"  onsubmit="return anyDataCheck()">         
            <input type="hidden" name="table" value="${table}">
            <input type="hidden" name="mode" value="list">
            <input type="hidden" name="sortkey" value="${sortKey}">
            <input type="hidden" name="direction" value="${direction}">      
   
            <div class="${classes.output.search.button.row}">
              <div class="${classes.output.search.button.col}">  
                <button class="${classes.output.search.button.button}" id="filterbutton" type="button" onclick="createFieldSelect()">
                ${lang.filterButtonIcon}  ${filterButton}
                </button>
              </div>
            </div>  
  
   
  `;
            /**
             *
             * The number of search fields is set in the config file. It is arbitrary.
             * This code creates a framework of divs into which the selects are added.
             *
             */
            for (let num = 1; num <= suds.search.maxConditions; num++) {
                if (num == 2) {
                    box += `
  
          <div class="${classes.output.search.andor.row}">
            <div class="${classes.output.search.andor.col}">
              <select name="andor" class="${classes.output.search.select}" id="andor" style="display: none; width: 80px">
                <option value="and">${lang.and}</option>
                <option value="or">${lang.or}</option>
              </select>
            </div>
          </div>`;
                }
                box += `
   
          <div class="${classes.output.search.condition.row}" >
            <div id="select_${num}"  class="${classes.output.search.condition.field}"></div>  
            <div id="compare_${num}" class="${classes.output.search.condition.comp}"></div>   
            <div id="search_${num}"  class="${classes.output.search.condition.value}"></div>
          </div> `;
            }
            box += `
          <div class="${classes.output.search.button.row}">
            <div class="${classes.output.search.button.col}">  
              <button class="${classes.output.search.button.button}" id="filterbutton2" style="display:none" type="button" onclick="createFieldSelect()">
                ${lang.addCondition}
              </button>
            </div>
  
            <div class="${classes.output.search.button.col}">  
              <button class="${classes.output.search.button.button}" id="backupbutton" style="display:none" type="button" onclick="backup()">
                ${lang.backUp}
              </button>
            </div>
  
            <div class="${classes.output.search.button.col}">  
              <button class="${classes.output.search.button.button}" type="submit" style="display: none;" id="filtergo">
                ${lang.filterStart}
              </button>
            </div>
            <div class="${classes.output.search.message}" id="msg"></div>
           </div>
        </form>`;
        } // end of search box
        return box;
    }
    /*
     function getSortDirection(reportData, tableData, parent,) {
     
     
     
     
       let sortdirection
       if (sortKey == tableData.primaryKey) {
         sortdirection = `${sortKey} ${direction}`
       } else {
         sortdirection = []
         sortdirection[0] = {}
         sortdirection[0][sortKey] = direction
         sortdirection[1] = {}
         sortdirection[1][tableData.primaryKey] = 'ASC' //    tie-breaker in case multiple values of sort
       }
       return sortdirection;
     }
    */
    function getTableHeader(count, fieldList, virtuals, extendedAttributes) {
        let header = '';
        if (count > 0) {
            let clearReport = false;
            if (reportData.view) {
                clearReport = true;
            }
            header += `
              <tr>`;
            for (let i = 0; i < fieldList.length; i++) {
                let key = fieldList[i];
                header += `
          <th class="${classes.output.table.th}">`;
                let description = '';
                // virtual field
                if (Object.keys(virtuals).includes(key)) {
                    let friendlyName = description = key;
                    if (virtuals[key].description) {
                        description = virtuals[key].description;
                    }
                    if (virtuals[key].friendlyName) {
                        description = virtuals[key].friendlyName;
                    }
                    header += `
            <span title="${description}">${friendlyName}</span>`;
                }
                //   database field
                else {
                    if (extendedAttributes[key].description)
                        description = extendedAttributes[key].description;
                    let thisdirection = 'ASC';
                    if (key == sortKey && direction == 'ASC') {
                        thisdirection = 'DESC';
                    }
                    header += `
              <span title="${description}">`;
                    if (sortable) {
                        let clearreport = '';
                        if (clearReport) {
                            clearreport = '&clearreport=true';
                        }
                        header += `        
                  <a href="${suds.mainPage}?table=${table}&mode=list&sortkey=${key}&direction=${thisdirection}${clearreport}">`;
                    }
                    let tableHeading = extendedAttributes[key].friendlyName;
                    if (key == sortKey && reportData.sort) {
                        if (direction == 'ASC') {
                            tableHeading += '&nbsp;' + lang.arrowUp;
                        }
                        else {
                            tableHeading += '&nbsp;' + lang.arrowDown;
                        }
                    }
                    if (extendedAttributes[key].display.tableHeading) {
                        tableHeading = extendedAttributes[key].display.tableHeading;
                    }
                    header += `
                   ${tableHeading}`;
                    if (sortable) {
                        header += `
                 </a>`;
                    }
                }
                header += `
                  </span>
              </th>`;
            }
            if (!reportData.hideEdit || !reportData.hideDetails) {
                header += `
              <th class="${classes.output.table.th}"></th>`;
            }
            header += `
              </tr>
            </thead>`;
        }
        return header;
    }
    async function getRowItem(record, row, col, fieldList, extendedAttributes, virtuals) {
        let content = '';
        const key = fieldList[col];
        let maxWidth = 0;
        if (extendedAttributes[key].display.maxWidth) {
            maxWidth = extendedAttributes[key].display.maxWidth;
        }
        let display;
        // virtual field
        if (Object.keys(virtuals).includes(key)) {
            display = await displayField(virtuals[key], virtuals[key].value(record));
            content += `
               <td style="max-width: ${maxWidth}">${display}</TD> `;
        }
        else {
            trace.log({ key, extendedAttributes: extendedAttributes[key], level: 'verbose' });
            const attr = extendedAttributes[key];
            const val = record[key];
            if (row === 1)
                trace.log({ where: `${col} before displayfield`, level: 'mid' }); // timing
            display = await displayField(attr, val);
            trace.log({ key, extendedAttributes: extendedAttributes[key], level: 'silly' });
            if (display == null) {
                display = '';
            }
            let width;
            if (extendedAttributes[key].display && extendedAttributes[key].display.width) {
                width = extendedAttributes[key].display.width;
            }
            else {
                width = '';
            }
            trace.log(key, extendedAttributes[key].display.type, extendedAttributes[key].display.truncateForTableList);
            if (extendedAttributes[key].display.truncateForTableList &&
                display.length > extendedAttributes[key].display.truncateForTableList) {
                // remove embedded images
                display = sanitizeHtml(display, {
                    allowedTags: [], allowedextendedAttributes: {}
                });
                display = display.substring(0, extendedAttributes[key].display.truncateForTableList) + ' ...';
            }
            trace.log('id:', record.id, ' field width: ', width, { level: 'verbose' });
            content += `
          <TD style="max-width: ${maxWidth}">${display}</TD>`;
            if (row === 1)
                trace.log({ where: `${col} done`, level: 'mid' }); // timing
        }
        return content;
    }
    function lastColumn(record, row, tableData, reportData) {
        //  link to detail line
        let content = '';
        if ((tableData.canEdit && !reportData.hideEdit) || !reportData.hideDetails) {
            content += `
         <td>`;
        }
        trace.log(tableData.primaryKey, record[tableData.primaryKey]);
        let target;
        /*     if (suds.dbtype == 'nosql') {
               target = db.stringifyId(record[tableData.primaryKey])
             } else {
               target = record[tableData.primaryKey]
             }*/
        target = record[tableData.primaryKey];
        if (!reportData.hideDetails) {
            content += `
        <span id="spinnerv${row}" style="display: none">${lang.spinner}</span>
         <a href="${suds.mainPage}?table=${table}&mode=listrow&id=${target}" 
         title="${lang.listRowHelpView}"
         id="view${row}"
         onclick="document.getElementById('spinnerv${row}').style.display='inline'; document.getElementById('view${row}').style.display='none'"
         >
            ${lang.TableListRow}
         </a>
&nbsp;`;
        }
        if (tableData.canEdit && !reportData.hideEdit) {
            content += `
                    <span id="spinnere${row}" style="display: none">${lang.spinner}</span>
                    <a href="${suds.mainPage}?table=${table}&mode=populate&id=${target}" 
                    title="${lang.listRowHelpEdit}"
                    id="edit${row}"
                    onclick="document.getElementById('spinnere${row}').style.display='inline'; document.getElementById('edit${row}').style.display='none'"
                              >
                    ${lang.TableEditRow}
                    </a>`;
        }
        if ((tableData.canEdit && !reportData.hideEdit) || !reportData.hideDetails) {
            content += `
       </td>`;
        }
        return content;
    }
    function lastLine(parent, sortKey, direction, parentSearch, limit, page, count) {
        let content = '';
        let prev = '';
        let next = '';
        trace.log({ page, type: typeof page, count, limit });
        /** * No pagination for child lists */
        if (parent) {
            if (limit != -1 && count > limit) {
                next = `<a href="${suds.mainPage}?table=${table}&mode=list&sortkey=${sortKey}&direction=${direction}&${parentSearch}">${lang.more}</a>`;
            }
        }
        else {
            if (page > 1) { // Not the first page, can't be a child listing
                prev = `<a href="${suds.mainPage}?table=${table}&mode=list&page=${page - 1}&sortkey=${sortKey}&direction=${direction}">${lang.prev}</a>`;
            }
            let anotherPage = false;
            if (suds[suds.dbDriver].countable) {
                if (limit * page <= count) {
                    anotherPage = true;
                }
            }
            else {
                if (limit <= count) {
                    anotherPage = true;
                }
            }
            trace.log({ countable: suds[suds.dbDriver].countable, limit, page, count, another: anotherPage });
            if (anotherPage) {
                next = `<a href="${suds.mainPage}?table=${table}&mode=list&page=${page + 1}&sortkey=${sortKey}&direction=${direction}">${lang.next}</a>`;
            }
        }
        if (prev || next) {
            content += `
        <tr>
          <td colspan="${fieldList.length + 1}">
            <span style="float:left">${prev}</span><span style="float:right">${next}</span>
          </td?>
        </tr>`;
        }
        return content;
    }
    function linksRow(tableData, reportData, parent) {
        let content = '';
        trace.log('creating links row');
        content += `
         <div class="sudsListTableLinks"> 
   `;
        let addRow = lang.addRow;
        if (tableData.addRow) {
            addRow = tableData.addRow;
        }
        if (reportData.addRow) {
            addRow = reportData.addRow;
        }
        addRow = `${lang.addIcon} ${addRow}`;
        // system is allowing for a single field to be pre-opulated in a new record
        // in this case its the parent...
        //    let cls = classes.links.button;
        //    let parentLink1 = '';
        //   if (parent) {
        //     cls = 'btn btn-outline-dark';
        //    if (sails.config.sud stables[parent].associations[table].link) {
        //       parentLink1 = `&prepopulate=${suds tables[parent].associations[table].link}&prepopvalue=${parentKey}`;
        //     }
        //   }
        const link = `${suds.mainPage}?table=${table}&mode=new`;
        content += `
            <p>`;
        if (!parent && tableData.canEdit) {
            content += `
             <button onclick="document.location='${link}'" type="button" class="${classes.output.links.button}">
             ${addRow} 
             </button>`;
        }
        /*
        if (searches && !parent) {
          let link = `${suds.mainPage}?table=${table}&mode=list`;
         
          output += `
                  <button onclick="document.location='${link}'" type="button" class="${classes.links.button}"
        ${lang.listTable} ${table}
        </button>`;
         
        }
        */
        if (!parent) {
            content += `
    <button onclick="document.location='${suds.mainPage}'" type="button" class="${classes.output.links.button}">
   
   ${lang.backToTables} 
   </button>`;
        }
        content += `
          </p>
       </DIV>     <!--  sudsListTableLinks -->`;
        return content;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC10YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9saXN0LXRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3JELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQzdDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2pELDJDQUEyQztBQUMzQyx1Q0FBdUM7QUFDdkMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFVBQVUsQ0FBQTtBQUN6RCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsWUFBWSxDQUFBO0FBQzFELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQy9DLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFDekQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDekMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFDL0MsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxDQUFBO0FBQ2hELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUcxQixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFFN0M7Ozs7Ozs7Ozs7Ozs7Ozs7b0ZBZ0JvRjtBQUNwRixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssVUFBVSxTQUFTLENBQ3ZDLFVBQWtCLEVBQ2xCLEtBQWEsRUFDYixVQUFzQixF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