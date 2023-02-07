
let trace = require('track-n-trace');
let mergeAttributes = require('./merge-attributes');
let createField = require('./create-field');
let tableDataFunction = require('./table-data');
// let countRows = require('./count-rows');
// let getRows = require('./get-rows');
let getSearchLink = require('./search-link').searchLink;
let getAttribute = require('./search-link').getAttribute;
let displayField = require('./display-field');
let humaniseFieldname = require('./humanise-fieldname');
let suds = require('../../config/suds');
let classes = require('../../config/classes');
let lang = require('../../config/language')['EN'];
let db = require('./db');

module.exports = listTable;

/** ************************************************
 * 
 * list-table.js
 * 
 * List the rows in a table.
 * This may be called from the home page (via admin.js), or to list child rows
 * at the bottom of a row detail page. 
 *
 ************************************************ */
async function listTable(
  permission /*
      type: 'string',
      description: 'The permission set of the logged-in user',
    */,
  table /*
      type: 'string',
      description: 'The table being listed',
    */,

  /* **************************************************
    *   Searching  && sorting
    *
    *  *********************************************** */
  reportData  /*
      type: 'ref',
      description: 'Report specification',
    */,

  /* **************************************************
    *   Pagination
    *
    *  *********************************************** */
  page  /*
      type: 'number',
      description: 'The current page number',
    */,

  /* **************************************************
  *   The following only apply to the situation where 
  *   child records are listed under the deta of a 
  *   parent row
  *
  *  *********************************************** */
  parent /*
      type: 'string',
      description: `Only applies when the routine is called from  the row listing as a child. This is the 
                     table that is being listed that this is a child of.`,
    */,
) {

  const sanitizeHtml = require('sanitize-html');
  trace.log({ break: '#', inputs: arguments, level: 'min' });
  trace.log(reportData);
  let extendedAttributes;
  let attributes = mergeAttributes(table, permission);
  if (reportData.view && reportData.view.fields) {
    for (let key of Object.keys(reportData.view.fields)) {
      reportData.view.fields[key].canView = true;
      if (!reportData.view.fields[key].input)   {reportData.view.fields[key].input = {};}
      if (!reportData.view.fields[key].process)  {reportData.view.fields[key].process = {};}
      if (!reportData.view.fields[key].display) {reportData.view.fields[key].display = {};}
      if (!reportData.view.fields[key].type)    {reportData.view.fields[key].type = 'string';}
    }
    extendedAttributes = { ...attributes, ...reportData.view.fields };
  }
  else {

    extendedAttributes = attributes;
  }
  let tableData = tableDataFunction(table, permission);
  trace.log({ tabledata: tableData, permission: permission, maxdepth: 4 });
  let id = tableData.primaryKey;
  if (!id) { id = 'id'; }
  if (!tableData.canView) {
    return `<p>Sorry - you don't have permission to view ${tableData.friendlyName} (${table})`;
  }
  let defaultSort = true;
  let sortKey = tableData.primaryKey;     // default sort direction
  let direction = 'ASC';      //     ^   ^
  let open;
  let openGroup;
  let searchSpec = {};
  let heading;
  let headingTip = '';

  let hideEdit = reportData.hideEdit;
  let hideDetails = reportData.hideDetails;

  if (reportData.open) { open = reportData.open }
  if (reportData.openGroup) { openGroup = reportData.openGroup }
  if (reportData.friendlyName) {
    heading = reportData.friendlyName;
    if (reportData.description) { headingTip = reportData.description }
  }
  else {
    heading = `${lang.listTable} ${tableData.friendlyName}`;
    headingTip = tableData.description;
  }
  let headingText = '';
  if (reportData.headingText) {
    headingText = reportData.headingText;
  }
  trace.log({ open: open, openGroup: openGroup, heading: heading, headingText: headingText });




  /***
   *  clone search spec
   *  embed the view data if their is any...
   *  */
  if (reportData.search) {
    trace.log(reportData.search)
    searchSpec.andor = reportData.search.andor;
    searchSpec.searches = [];
    for (let i = 0; i < reportData.search.searches.length; i++) {
      trace.log(reportData.search.searches[i]);
      searchSpec.searches[i] = reportData.search.searches[i];  // normal case
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
    trace.log(searchSpec)
  }
  if (reportData.view) { searchSpec.view = reportData.view }

  trace.log(searchSpec);

  //    if (reportData.open) { open = reportData.open }
  //    if (reportData.openGroup) { openGroup = reportData.openGroup }
  let columns = Object.keys(extendedAttributes);
  trace.log(columns)
  if (tableData.list.columns) { columns = tableData.list.columns }
  trace.log(columns)
  if (reportData.columns) { columns = reportData.columns }
  trace.log(columns)
  if (reportData.sort) {
    sortKey = reportData.sort[0];
    direction = reportData.sort[1];
    defaultSort = false;
  }

  trace.log({
    table: table,
    heading: heading,
    tableData: tableData,
    extendedAttributes: extendedAttributes,
    columns: columns,
    level: 'verbose', maxdepth: 3
  });

  // inputs search, sort, and open take priority over report... 





  let searches = [];
  let searchLink = '';
  let andor = '';
  trace.log(searchSpec);
  /* this rationalises the search criteria e.g. turns 'true' into true */
  if (searchSpec.searches && searchSpec.searches.length) {
    if (!searchSpec.andor) { searchSpec.andor = 'and'; }
    andor = searchSpec.andor;
    searches = getSearchLink(extendedAttributes, searchSpec);
  }
  trace.log(searchSpec);

  let parentSearch = '';                    // link added if this is a child listing and we go over the limit
  if (parent) {
    parentSearch = `&searchfield_1=${searches[0][0]}&compare_1=eq&value_1=${searches[0][2]}&andor=and`;
  }

  //   sortLink=
  //   if (!defaultSort) {
  //     searchLink+=`&sortkey=${sortKey}&direction=${direction}`;
  //   }

  //  If this is listing child records  
  // there is only one search    
  let searchDisplay = true;               // display the search criteria
  if (parent) {
    searchDisplay = false;                // don't show the search criteria
  }

  let openLink = '';
  if (open) {
    openLink = `&open=${open}`;
  }
  if (openGroup) {
    openLink += `&opengroup=${openGroup}`;
  }


  trace.log({
    search: searchSpec,
    andor: andor,
    searchDisplay: searchDisplay,
    sortkey: sortKey,
    direction: direction,
    table: table,
    openLink: openLink,
  });


  // virtuals
  let virtuals = {};
  if (tableData.virtuals) { virtuals = tableData.virtuals; }

  /*** pagination -note thst if there is a parent parameter 
   * there is no pagination, but limit wll be provided.
   * Limit of -1 = no limit
   * */


  const pageLength = suds.pageLength;
  page = parseInt(page);
  let limit = -1;   //default all data.
  let offset = 0;   // starting at beginning
  if (reportData && reportData.limit) { limit = reportData.limit; }
  if (!parent) {
    if (!page) { page = 1 }                         // current page number
    limit = pageLength;                          // number of records to print
    offset = (page - 1) * limit;               // number of records to offset
  }
  trace.log({ table: table, page: page, limit: limit, offset: offset , columns:columns})

  //  Get field names and extendedAttributes
  let fieldList = [];
  let i = 0;
  for (let key of columns) {
    if (!extendedAttributes[key]) {
      console.log(`
      Unrecognised field ${key} in column list
      Listing table: ${table}
      Parent: ${parent}
      Report: ${reportData.friendlyName}`,
      trace.line('s'));
      process.exit();
    }
    if (extendedAttributes[key].canView && !extendedAttributes[key].collection) {
      fieldList[i++] = key;
    }
  }
  if (virtuals) {
    for (let key of Object.keys(virtuals))
      fieldList[i++] = key;
  }


  trace.log(fieldList);




  /* ************************************************
  *
  *  If a search is in progress, produce a line
  *  confirming the search
  *
  ************************************************ */

  let searchText = '';
  let andtest = [];
  for (i = 0; i < searches.length; i++) {
    let searchField = searches[i][0];
    let attribute = getAttribute(searchField, extendedAttributes);
    let compare = searches[i][1];
    let value = searches[i][2];
    let displayValue = value;
    let displayCompare = compare;
    let friendlyName = await humaniseFieldname(searchField);
    if (attribute.friendlyName) { friendlyName = attribute.friendlyName }
    displayValue = await displayField(attribute, value, 0, permission);
    /*
    if (attribute.input.type == 'date' && attribute.type == 'number') {
      let date = new Date(value);
      value = date.getTime();
      displayValue = date.toDateString();
    }
    */


    displayCompare = lang[compare];
    if (attribute.input.type == 'date') {
      if (compare == 'lt') { displayCompare = 'earlier than' }
      if (compare == 'gt') { displayCompare = 'later than' }
    }
    if (attribute.type == 'string') {
      if (compare == 'lt') { displayCompare = 'sorts lower than' }
      if (compare == 'gt') { displayCompare = 'sorts greater than' }
      displayValue = `'${displayValue}'`;
    }

    if (i == 0) {

      searchText += `
           ${lang.filterBy}:&nbsp;`;
    }
    else {
      searchText += `${andor}&nbsp;`;
    }
    searchText += `${friendlyName} ${displayCompare} ${displayValue}`;

    if (andor == 'and' && compare == 'eq') {
      /* can't have a=2 AND a=3  but we will treat as OR just for that varable                   */
      /* so a=2 and a=3 and b=6 is trated as (a=2 or a=3) AND b=6 which is probably              */
      /* what they wanted - but print a warning message. Might evn be useful for advanced users  */
      if (andtest.includes(searchField)) {
        searchText += ` <span style="color: red">(You can't have the same field twice in an AND test. So treated as 'OR')</span>`;
      }
      else {
        andtest.push(searchField);
      }
    }


  }
  if (searchText) { searchText += '.<br />' };

  // number of rows in the table
  let count = await db.countRows(table, searchSpec, offset);
  trace.log({ count: count, heading: heading });

  if (!defaultSort) {
    let dir = lang.asc;
    if (direction == 'DESC') { dir = lang.desc }
    trace.log(sortKey, extendedAttributes[sortKey]);
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
    searchText+=`<br /><span style="color:red">(Note: Order is by ${extendedAttributes[sortKey].friendlyName} code not name)</span>`;
}


  if (headingText) {
    searchText += `<br />
           ${headingText}`
  }

  trace.log({ search: searchSpec, searchText: searchText });



  // Create output
  let output = '';





  output = `
        <h1 title="${headingTip}">${heading}</h1>`;
  if (searchText) {
    output += `
    <!-- search text -->
    <p>${searchText}</p>`;
  }



  /*** ************************************************
  *
  *              SEARCH BOX
  *
  * *********************************************** */

  let needSearch = true;
  if (parent) { needSearch = false; }
  if (reportData.view && !reportData.searchFields) { needSearch = false; }
  trace.log({ needSearch: needSearch, sf: reportData.searchFields })
  // ------------------------
  if (needSearch) {                                // never provide search for child listing 
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
        if (extendedAttributes[keys[k]].collection) { delete keys[k]; continue; }
        if (!extendedAttributes[keys[k]].canView) { delete keys[k]; continue; }
        if (extendedAttributes[keys[k]].type == 'object') { delete keys[k]; continue }
        if (extendedAttributes[keys[k]].array) { delete keys[k] }
      }
      keys = keys.filter(Boolean);   // compress array after removing elements...
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

    /* This generates a JS array in the web page, one element for each fieldname.*/

    output += `
      <script>
            let num=0; 
            let keys=[`;
    for (let key of keys) {
      output += `'${key}',`
    }

    output += `]`;

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

    output += `
    var filter= {
`;

    for (let k = 0; k < keys.length; k++) {
      let key = keys[k];
      trace.log(key,extendedAttributes[key]);
      let saved_placeholder = extendedAttributes[key].input.placeholder;
      let saved_type = extendedAttributes[key].input.type;
      let saved_width = extendedAttributes[key].input.width;
      let saved_class = extendedAttributes[key].input.class;
      let saved_hidden = extendedAttributes[key].input.hidden;

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
      if (extendedAttributes[key].type == 'number'
        && (
          extendedAttributes[key].input.type == 'date'
          || extendedAttributes[key].process.createdAt
          || extendedAttributes[key].process.updatedAt
        )
      ) {
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
      if (extendedAttributes[key].type == 'number' && !extendedAttributes[key].type == 'date') {
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
        comp = `<input type="hidden" name="{{compare}}" value="eq">is`;
      }

      if (extendedAttributes[key].process && extendedAttributes[key].process.JSON) {
        comp = `<input type="hidden" name="{{compare}}" value="includes">includes`;
        extendedAttributes[key].input.type = 'select';

      }
      trace.log(extendedAttributes[key]);
      let [field, headerTags] = await createField(key, '', extendedAttributes[key], '', 'search', {}, tableData);
      trace.log({ key: key, changed: extendedAttributes[key].input, level: 'verbose' });

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
      trace.log({ key: key, field: field, level: 'norm' });
      if (field.includes('</script>')) { continue }
      output += `
        // ------------------- ${key} function---------------------     
        ${key}: function () {  
               let field=\`${field}\`;  
               let comp=\`${comp}\`;  
               return [comp,field];
             },`;
      trace.log(key, extendedAttributes[key].type, extendedAttributes[key].input.type);
    }

    output += `
    }`;

    /*** 
     * This function uses the generated fields to create the comparison select 
     * plus input field depending on which field has been selected.. 
     * 
     */


    // 
    output += `

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

    output += `

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

    /*** 
     * anyDataCheck checks that a comparison field has been entered.
    */

    output += `

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

    output += `

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
    for (let key of keys) {
      output += `
          <option value="${key}">
            ${extendedAttributes[key].friendlyName}
          </option>`
    }
    output += `
        </select>
       \`;
        let selectdiv='select_'+num;
        if (debug) console.log(select);
       document.getElementById(selectdiv).innerHTML=select;
       return ;
    }`;


    // end of generated Javascript
    output += `    
      </script>`;
    /**
     * 
     * The Javascript is now generated.
     * Now create the filter button. Which doubles as the start over button.
     * 
     */

    filterButton = lang.filterList;
    if (searchText) {
      filterButton = lang.startOver;
    }

    /**
     * 
     * Start the filter form.
     * 
     */

    output += `

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
        output += `

        <div class="${classes.output.search.andor.row}">
          <div class="${classes.output.search.andor.col}">
            <select name="andor" class="${classes.output.search.select}" id="andor" style="display: none; width: 80px">
              <option value="and">${lang.and}</option>
              <option value="or">${lang.or}</option>
            </select>
          </div>
        </div>`;
      }
      output += `
 
        <div class="${classes.output.search.condition.row}" >
          <div id="select_${num}"  class="${classes.output.search.condition.field}"></div>  
          <div id="compare_${num}" class="${classes.output.search.condition.comp}"></div>   
          <div id="search_${num}"  class="${classes.output.search.condition.value}"></div>
        </div> `;

    }

    output += `
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

  }   // end of search box 


  /* ************************************************
*
*  Sort direction
*
************************************************ */
  let sortable = true;
  if (parent) { sortable = false; }
  if (reportData.view) { sortable = false }
  let sortdirection;
  if (sortKey == tableData.primaryKey) {
    sortdirection = `${sortKey} ${direction}`;
  }
  else {
    sortdirection = [];
    sortdirection[0] = {};
    sortdirection[0][sortKey] = direction;
    sortdirection[1] = {};
    sortdirection[1][tableData.primaryKey] = 'ASC';            //    tie-breaker in case multiple values of sort
  }
  trace.log({ sortdirection: sortdirection });


  /* ************************************************
   *
   *  Create output
   *  Table header
   *
   ************************************************ */


  if (count > 0) {
    output += `
        </p>  <!--  listTablePre -->`;

    output += `
      <div class="${classes.output.table.envelope}">  
      <table class="${classes.output.table.table}" >
          <thead>  
            <tr>`;
    for (let i = 0; i < fieldList.length; i++) {
      key = fieldList[i];


      output += `
        <th class="${classes.output.table.th}">`;
      let description = '';


      // virtual field
      if (Object.keys(virtuals).includes(key)) {
        friendlyName = description = key;
        if (virtuals[key].description) {
          description = virtuals[key].description;
        }
        if (virtuals[key].friendlyName) {
          description = virtuals[key].friendlyName;
        }
        output += `
          <span title="${description}">${friendlyName}</span>`;
      }

      //   database field
      else {
        if (extendedAttributes[key].description) description = extendedAttributes[key].description;
        let thisdirection = 'ASC';
        if (key == sortKey && direction == 'ASC') { thisdirection = 'DESC' }
        output += `
            <span title="${description}">`;
        if (sortable) {
          output += `        
                <a href="${suds.mainPage}?table=${table}&mode=list&sortkey=${key}&direction=${thisdirection}">`;
        }
        let tableHeading = extendedAttributes[key].friendlyName;
        if (key == sortKey && !defaultSort) {
          if (direction == 'ASC') {
            tableHeading += '&nbsp;' + lang.arrowUp;
          }
          else {
            tableHeading += '&nbsp;' + lang.arrowDown;

          }
        }


        if (extendedAttributes[key].display.tableHeading) { tableHeading = extendedAttributes[key].display.tableHeading }
        output += `
                 ${tableHeading}`;

        if (sortable) {
          output += `
               </a>`;
        }
      }


      output += `
                </span>
            </th>`;
    }
    if (!hideEdit || !hideDetails) {
      output += `
            <th class="${classes.output.table.th}"></th>`;
    }
    output += `
            </tr>
          </thead>
          <tbody>`;



    /* ************************************************
    *            MAIN LOOP
    *  loop through file creating lines
    *
    ************************************************ */

    let records = await db.getRows(table, searchSpec, offset, limit, sortKey, direction);
    trace.log({ offset: offset, page: page, records: records, length: records.length });
    /*
    if (page == 1 && records.length==1) {
      let output=`<script>window.location="${suds.mainPage}?table=${table}&id=${records[0][tableData.primaryKey]}&mode=listrow"</script>`;
      trace.log(output);
      return output;
    }
   */

    for (let i = 0; i < records.length; i++) {
      let record = records[i];
      trace.log(record);
      let width;
      output += `
          <tr>`;
      for (let j = 0; j < fieldList.length; j++) {
        let key = fieldList[j];
        let maxWidth = '';
        if (extendedAttributes[key].display.maxWidth) {
          maxWidth = extendedAttributes[key].display.maxWidth;
        }
        let display;
        // virtual field
        if (Object.keys(virtuals).includes(key)) {
          display = await displayField(virtuals[key], virtuals[key].value(record));
          output += `
               <td style="max-width: ${maxWidth}">${display}</TD> `;
        }
        else {


          trace.log({ key: key, extendedAttributes: extendedAttributes[key], level: 'verbose' });
          let attr = extendedAttributes[key];
          let val = record[key]
          display = await displayField(attr, val);
          trace.log({ key: key, extendedAttributes: extendedAttributes[key], level: 'silly' });

          if (display == null) { display = ''; }
          if (extendedAttributes[key].display && extendedAttributes[key].display.width) {
            width = extendedAttributes[key].display.width;
          }
          else {
            width = '';
          }
          trace.log(key, extendedAttributes[key].display.type, extendedAttributes[key].display.truncateForTableList);
          if (extendedAttributes[key].display.truncateForTableList
            && display.length > extendedAttributes[key].display.truncateForTableList) {
            // remove embedded images
            display = sanitizeHtml(display, {
              allowedTags: [], allowedextendedAttributes: {},
            });
            display = display.substring(0, extendedAttributes[key].display.truncateForTableList) + ' ...';
          }

          trace.log('id:', record.id, ' field width: ', width, { level: 'verbose' });

          output += `
          <TD style="max-width: ${maxWidth}">${display}</TD>`;
        }
      }
      trace.log(i, tableData.canEdit);

      //  link to detail line 
      if ((tableData.canEdit && !hideEdit) || !hideDetails) {
        output += `
         <td>`;
      }
      trace.log(tableData.primaryKey, record[tableData.primaryKey])
      let target;
      if (suds.dbtype == 'nosql') {
        target = db.stringifyId(record[tableData.primaryKey])
      }
      else {
        target = record[tableData.primaryKey];
      }

      trace.log(i, records.length);

      if (!hideDetails) {
        output += `
        <span id="spinnerv${i}" style="display: none">${lang.spinner}</span>
         <a href="${suds.mainPage}?table=${table}&mode=listrow&id=${target}" 
         title="${lang.listRowHelpView}"
         id="view${i}"
         onclick="document.getElementById('spinnerv${i}').style.display='inline'; document.getElementById('view${i}').style.display='none'"
         >
            ${lang.TableListRow}
         </a>
&nbsp;`;
      }
      if (tableData.canEdit && !hideEdit) {
        output += `
                    <span id="spinnere${i}" style="display: none">${lang.spinner}</span>
                    <a href="${suds.mainPage}?table=${table}&mode=populate&id=${target}" 
                    title="${lang.listRowHelpEdit}"
                    id="edit${i}"
                    onclick="document.getElementById('spinnere${i}').style.display='inline'; document.getElementById('edit${i}').style.display='none'"
                              >
                    ${lang.TableEditRow}
                    </a>`;
      }
      if ((tableData.canEdit && !hideEdit) || !hideDetails) {
        output += `
       </td>`;
      }
      output += `
      </tr>`;
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

    let prev = '';
    let next = '';
    trace.log({ page: page, type: typeof page, count: count, limit: limit });
    /*** No pagination for child lists */
    if (parent) {
      if (limit != -1 && count > limit) {
        next = `<a href="${suds.mainPage}?table=${table}&mode=list&sortkey=${sortKey}&direction=${direction}&${parentSearch}">${lang.more}</a>`;
      }
    }
    else {
      if (page > 1) {   // Not the first page, can't be a child listing
        prev = `<a href="${suds.mainPage}?table=${table}&mode=list&page=${page - 1}&sortkey=${sortKey}&direction=${direction}">${lang.prev}</a>`;
      }
      let anotherPage = false;
      if (suds[suds.dbDriver].countable) {
        if (limit * page <= count) { anotherPage = true; }
      }
      else {
        if (limit <= count) { anotherPage = true; }
      }
      trace.log({ countable: suds[suds.dbDriver].countable, limit: limit, page: page, count: count, another: anotherPage });
      if (anotherPage) {
        next = `<a href="${suds.mainPage}?table=${table}&mode=list&page=${page + 1}&sortkey=${sortKey}&direction=${direction}">${lang.next}</a>`;
      }
    }
    if (prev || next) {
      output += `
      <tr>
        <td colspan="${fieldList.length + 1}">
          <span style="float:left">${prev}</span><span style="float:right">${next}</span>
        </td?>
      </tr>`;
    }
    output += `
      </tbody> 
    </table>
    </div>`;
  }
  /* ************************************************
       *
       *  Links 
       *
       ************************************************ */

  trace.log('creating links row');

  output += `
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
  let link = `${suds.mainPage}?table=${table}&mode=new`;
  output += `
         <p>`;
  if (!parent && tableData.canEdit) {
    output += `
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
    output += `
 <button onclick="document.location='${suds.mainPage}'" type="button" class="${classes.output.links.button}">

${lang.backToTables} 
</button>`;

  }
  output += `
       </p>
    </DIV>     <!--  sudsListTableLinks -->`;
  trace.log(global.suds);
  trace.log('returning');
  trace.log({ output: output, level: 'verbose' });

  return (output);

}
