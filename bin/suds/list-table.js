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