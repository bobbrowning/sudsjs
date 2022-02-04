/* ************************************************
*
* List the rows in a table.
* This may be called from the home page (via admin.js), or to list child rows
* at the bottom of a row detail page. 
*
************************************************ */
let trace = require('track-n-trace');
let mergeAttributes = require('./merge-attributes');
let createField = require('./create-field');
let tableDataFunction = require('./table-data');
// let countRows = require('./count-rows');
// let getRows = require('./get-rows');
let getSearchLink = require('./search-link');
let displayField = require('./display-field');
let humaniseFieldname = require('./humanise-fieldname');
let suds = require('../../config/suds');
let classes = require('../../config/classes');
let lang = require('../../config/language')['EN'];
let db = require('./'+suds.dbDriver);

module.exports = async function (
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
  let attributes = mergeAttributes(table, permission);
  let tableData = tableDataFunction(table, permission);
  trace.log({ tabledata: tableData, permission: permission, maxdepth: 3 });
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

  let hideEdit = reportData.hideEdit;
  let hideDetails = reportData.hideDetails;

  if (reportData.open) { open = reportData.open }
  if (reportData.openGroup) { openGroup = reportData.openGroup }
  if (reportData.title) {
    heading = reportData.title;
  }
  else {
    heading = `${lang.listTable} ${tableData.friendlyName}`;
  }
  let headingText = '';
  if (reportData.headingText) {
    headingText = reportData.headingText;
  }
  trace.log({ open: open, openGroup: openGroup, heading: heading, headingText: headingText });




  /* clone search spec */
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

  trace.log(searchSpec);

  //    if (reportData.open) { open = reportData.open }
  //    if (reportData.openGroup) { openGroup = reportData.openGroup }
  let columns = Object.keys(attributes);
  if (tableData.list.columns) { columns = tableData.list.columns }
  if (reportData.columns) { columns = reportData.columns }
  if (reportData.sort) {
    sortKey = reportData.sort[0];
    direction = reportData.sort[1];
    defaultSort = false;
  }

  trace.log({
    table: table,
    heading: heading,
    tableData: tableData,
    attributes: attributes,
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
    searches = getSearchLink(attributes, searchSpec);
  }

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

  /** pagination -note thst if there is a parent parameter 
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
  trace.log({ table: table, page: page, limit: limit, offset: offset })

  //  Get field names and attributes
  let fieldList = [];
  let i = 0;
  for (let key of columns) {
    if (!attributes[key]) {
      console.log(`unrecognised field ${key} in column list`);
      continue;
    }
    if (attributes[key].canView && !attributes[key].collection) {
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
    let compare = searches[i][1];
    let value = searches[i][2];
    let displayValue = value;
    let displayCompare = compare;
    let friendlyName = await humaniseFieldname(searchField);
    if (attributes[searchField].friendlyName) { friendlyName = attributes[searchField].friendlyName }
    displayValue = await displayField(attributes[searchField], value, 0, permission);
    /*
    if (attributes[searchField].input.type == 'date' && attributes[searchField].type == 'number') {
      let date = new Date(value);
      value = date.getTime();
      displayValue = date.toDateString();
    }
    */


    displayCompare = lang[compare];
    if (attributes[searchField].input.type == 'date') {
      if (compare == 'lt') { displayCompare = 'earlier than' }
      if (compare == 'gt') { displayCompare = 'later than' }
    }
    if (attributes[searchField].type == 'string') {
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
  let count = await db.countRows(table, searchSpec);
  trace.log({ count: count, heading: heading });

  if (!defaultSort) {
    let dir = lang.asc;
    if (direction == 'DESC') { dir = lang.desc }
    trace.log(sortKey, attributes[sortKey]);
    searchText += `
          ${lang.sortedBy} ${attributes[sortKey].friendlyName} - ${dir}.`;
  }
  if (parent && limit && limit != -1) {
    searchText += ` ${lang.limit} ${limit} ${lang.rows}`;
  }
  if (parent && limit != -1 && count > limit) {
    searchText += ` <a href="${suds.mainPage}?table=${table}&mode=list&sortkey=${sortKey}&direction=${direction}&${parentSearch}=">${lang.fullList}</a>`;
  }


  if (headingText) {
    searchText += `<br />
           ${headingText}`
  }

  trace.log({ search: searchSpec, searchText: searchText });



  // Create output
  let output = '';





  output = `
        <h1>${heading}</h1>`;
  if (searchText) {
    output += `
    <!-- search text -->
    <p>${searchText}</p>`;
  }



  /** ************************************************
  *
  *              SEARCH BOX
  *
  * *********************************************** */



  // ------------------------
  if (!parent) {                                // never provide search for child listing 
    /**
     * 
     *  Create a list of fields and then remove those that this user
     *  doesn't have permission to see
     * 
     */
    let keys = Object.keys(attributes);
    for (let k = 0; k < keys.length; k++) {
      if (!attributes[keys[k]].canView) { delete keys[k] }
    }
    keys = keys.filter(Boolean);   // compress array after removing elements...

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
      let saved_placeholder = attributes[key].input.placeholder;
      let saved_type = attributes[key].input.type;
      let saved_width = attributes[key].input.width;
      let saved_class = attributes[key].input.class;
      let saved_hidden = attributes[key].input.hidden;

      delete attributes[key].input.hidden;
      attributes[key].input.class = classes.output.search.condition.valueClass;

      // remove placeholder. The one for the input form may not be appropriate
      if (suds.search.allwaysText.includes(attributes[key].input.type)) {
        attributes[key].input.type = 'text';
        attributes[key].input.width = suds.search.fieldWidth;
        if (attributes[key].type == 'number') {
          attributes[key].input.placeholder = lang.enterNumber;
        }
        else {
          delete attributes[key].input.placeholder;
        }
      }
      trace.log(key, attributes[key].type, attributes[key].input.type);

      // compare select depends on field type. defaults to text
      let comp = `
        <select name="{{compare}}" class="${classes.output.search.select}" >
          <option value="contains">Contains</option>
          <option value="lt">Lower Alphabetically</option>
           <option value="eq">Equals</option>
         <option value="gt">Higher</option>
        </select>`;

      if (attributes[key].type == 'number' || attributes[key].input.type == 'number') {
        comp = `
          <select name="{{compare}}" class="${classes.output.search.select}" >
            <option value="lt">Less than</option>
            <option value="le">Less than or equals</option>
            <option value="eq" selected>Equals</option>
            <option value="ge">Greater than or equals</option>
            <option value="gt">Greater than</option>
          </select>`;
      }

      if (attributes[key].process && attributes[key].process.JSON) {
        comp = `
          <select name="{{compare}}" class="${classes.output.search.select}" >
            <option value="includes">Includes</option>
           </select>`;
      }


      if (attributes[key].input.type == 'date') {
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
      if (attributes[key].type == 'number'
        && (
          attributes[key].input.type == 'date'
          || attributes[key].process.createdAt
          || attributes[key].process.updatedAt
        )
      ) {
        comp = `
          <select name="{{compare}}" class="${classes.output.search.select}" >
            <option value="lt">Before</option>
            <option value="gt">After</option>
          </select>`;
        attributes[key].input.type = 'date';
      }
      if (saved_type == 'uploadFile') {
        attributes[key].input.placeholder = 'Please enter a file name ';
      }

      // Better than a checkbox...
      if (attributes[key].type == 'boolean') {
        attributes[key].input.type = 'yesnoRadio';
      }
      if (attributes[key].type == 'number' && !attributes[key].type == 'date') {
        attributes[key].input.type = 'number';
        attributes[key].input.width = suds.search.fieldWidth;
      }
      if (attributes[key].process.updatedBy) {
        attributes[key].input.type = 'autocomplete';
        attributes[key].input.width = '80%';
        attributes[key].input.search = 'fullName';
        attributes[key].input.placeholder = 'Number or type name';
      }
      // some types do not require a compare option 
      if (suds.search.allwaysEquals.includes(attributes[key].input.type)) {
        comp = `<input type="hidden" name="{{compare}}" value="eq">is`;
      }

      if (attributes[key].process && attributes[key].process.JSON) {
        comp = `<input type="hidden" name="{{compare}}" value="includes">includes`;
        attributes[key].input.type = 'select';

      }
      let [field, headerTags] = await createField(key, '', attributes, '', 'search', {}, tableData);
      trace.log({ key: key, changed: attributes[key].input, level: 'verbose' });

      /* restore the attributes we have changed */

      attributes[key].input.class = saved_class;
      if (saved_placeholder) {
        attributes[key].input.placeholder = saved_placeholder;
      }
      delete attributes[key].input.width;
      if (saved_width) {
        attributes[key].input.width = saved_width;
      }
      if (saved_hidden) {
        attributes[key].input.hidden = saved_hidden;
      }
      attributes[key].input.type = saved_type;

      trace.log({ restored: attributes[key].input, level: 'verbose' });
      trace.log({ key: key, field: field, level: 'norm' });
      output += `
        // ------------------- ${key} function---------------------     
        ${key}: function () {  
               let field=\`${field}\`;  
               let comp=\`${comp}\`;  
               return [comp,field];
             },`;
      trace.log(key, attributes[key].type, attributes[key].input.type);
    }

    output += `
    }`;

    /** 
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

    /** 
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
      debug=false;
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
            ${attributes[key].friendlyName}
          </option>`
    }
    output += `
        </select>
       \`;
        let selectdiv='select_'+num;
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
        if (attributes[key].description) description = attributes[key].description;
        let thisdirection = 'ASC';
        if (key == sortKey && direction == 'ASC') { thisdirection = 'DESC' }
        output += `
            <span title="${description}">`;
        if (!parent) {
          output += `        
                <a href="${suds.mainPage}?table=${table}&mode=list&sortkey=${key}&direction=${thisdirection}">`;
        }
        let tableHeading = attributes[key].friendlyName;
        if (attributes[key].display.tableHeading) { tableHeading = attributes[key].display.tableHeading }
        output += `
                 ${tableHeading}`;

        if (!parent) {
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
    *
    *  Sort direction
    *
    ************************************************ */

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
    *            MAIN LOOP
    *  loop through file creating lines
    *
    ************************************************ */

    records = await db.getRows(table, searchSpec, offset, limit, sortKey, direction);
    trace.log({ offset: offset, page: page, records: records });
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
      for (let i = 0; i < fieldList.length; i++) {
        let key = fieldList[i];
        let maxWidth = '';
        if (attributes[key].display.maxWidth) {
          maxWidth = attributes[key].display.maxWidth;
        }
        let display;
        // virtual field
        if (Object.keys(virtuals).includes(key)) {
          display = await displayField(virtuals[key], virtuals[key].value(record));
          output += `
               <td style="max-width: ${maxWidth}">${display}</TD> `;
        }
        else {


          trace.log({ key: key, attributes: attributes[key], level: 'verbose' });
          let attr = attributes[key];
          let val = record[key]
          display = await displayField(attr, val);
          trace.log({ key: key, attributes: attributes[key], level: 'verbose' });

          if (display == null) { display = ''; }
          if (attributes[key].display && attributes[key].display.width) {
            width = attributes[key].display.width;
          }
          else {
            width = '';
          }
          trace.log(key, attributes[key].display.type, attributes[key].display.truncateForTableList);
          if (attributes[key].display.truncateForTableList
            && display.length > attributes[key].display.truncateForTableList) {
            // remove embedded images
            display = sanitizeHtml(display, {
              allowedTags: [], allowedAttributes: {},
            });
            display = display.substring(0, attributes[key].display.truncateForTableList) + ' ...';
          }

          trace.log('id:', record.id, ' field width: ', width, { level: 'verbose' });

          output += `
          <TD style="max-width: ${maxWidth}">${display}</TD>`;
        }
      }
      trace.log(tableData.canEdit);

      //  link to detail line 
      if ((tableData.canEdit && !hideEdit) || !hideDetails) {
        output += `
         <td>`;
      }
      if (!hideDetails) {
        output += `
         <a href="${suds.mainPage}?table=${table}&mode=listrow&id=${record[tableData.primaryKey]}" title="${lang.listRowHelp}">${lang.TableListRow}</a>
&nbsp;`;
      }
      if (tableData.canEdit && !hideEdit) {
        output += `
                     <a href="${suds.mainPage}?table=${table}&mode=populate&id=${record[tableData.primaryKey]}" title="${lang.listRowHelp}">${lang.TableEditRow}</a>`;
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
    /** No pagination for child lists */
    if (parent) {
      if (limit != -1 && count > limit) {
        next = `<a href="${suds.mainPage}?table=${table}&mode=list&sortkey=${sortKey}&direction=${direction}&${parentSearch}=">${lang.more}</a>`;
      }
    }
    else {
      if (page > 1) {   // Not the first page, can't be a child listing
        prev = `<a href="${suds.mainPage}?table=${table}&mode=list&page=${page - 1}&sortkey=${sortKey}&direction=${direction}">${lang.prev}</a>`;
      }
      if (count > limit * page) {
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
