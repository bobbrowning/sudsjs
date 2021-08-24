
  let friendlyName= 'Autocomplete input.';


  let description= `Generates autocomplete field. This can be based in a fixed set of items which are in the model (isIn), 
  or more normally based on a linked table. In this case the field must be a key to some other table. 
  The user either enters the key of the linked file, or starts typing the 
  value in the linked table that is specified (e.g.someone's name). 
  A list of candidates is shown and one can be selected or more characters typed to narrow it down. 
  The selected name is shown on screen and the record key ('id' always) is stored in a hidden field. 
  `;


/*inputs: {
  fieldType: { type: 'string' },
  fieldName: { type: 'string' },
  fieldValue: { type: 'string' },
  attributes: { type: 'ref' },
  errorMsg: { type: 'string' },

},*/

let suds = require('../../../config/suds');
let trace = require('track-n-trace');
let lang = require('../../../config/language')['EN'];
let getLabelsValues = require('./get-labels-values');
let mergeAttributes = require('../merge-attributes');
let tableDataFunction = require('../table-data');
let db=require('./db');

//let getRow = require('../get-row');
//let getRows = require('../get-rows');


module.exports = async function (fieldType, fieldName, fieldValue, attributes, errorMsg,thisrecord) {
  if (arguments[0] == 'documentation') { return ({ friendlyName:friendlyName, description: description }) }
  trace.log(arguments);

  let results = '';
  
  linkedTable = attributes.model;
    if (attributes.input.linkedTable) { linkedTable = attributes.input.linkedTable; }
    let display = '';
    trace.log(linkedTable);

    if (!linkedTable) {
      results = `
        <script>
          const datasrc=${attributes.isIn};
          $("#${fieldName}").autocomplete({
            source:dataSrc
          });
        </script>
        ${attributes.friendlyName}<br />
        <input id="${fieldName}" 
           name="${fieldName}"  
           class="form-control"  
           style="
            width: ${width};
            border: 1px solid #ccc;
            height: 40px;
            -webkit-border-radius: 5px;
            -moz-border-radius   : 5px;
            border-radius        : 5px;
            "  
           id="${inputs.fieldName}" 
           value="${fieldValue}"> ${inputs.errorMsg}`;
      return exits.success(results);
    }
    // searching linked tble (the normal case)
    let tableData = tableDataFunction(linkedTable);
    let displayFunction = false;
    if (tableData.rowTitle) {
      displayFunction = tableData.rowTitle;
    }
    fieldValue=parseInt(fieldValue);   //Must be a number
 
    let record = [];
    let title = '';   // starting value to put in filter
    if (fieldValue) {
      record = await db.getRow(linkedTable, fieldValue);     // populate record from database
      if (record.err) {
        title = `<span class="text-danger">${record.errmsg}</span>`;
      }
      else {
        if (display) {
          title = record[display];
        }
        else {
          if (displayFunction) {
            title = displayFunction(record);
          }
        }
      }
    }
    minLength = 2;
    if (attributes.input.minLength) { minLength = attributes.input.minLength };
      if (attributes.input.limit) { limit = attributes.input.limit }
    let placeholder = '';
    if (lang.type) { placeholder = lang.type }
    if (attributes.input.placeholder) { placeholder = attributes.input.placeholder }

    limit = 5;
    if (attributes.input.limit) { limit = attributes.input.limit }
    let size = 50;
    let width = suds.defaultInputFieldWidth;
    if (attributes.input.width) {
      width = attributes.input.width;
    }


    idPrefix = 'ID: ';
    if (attributes.input.idPrefix) { idPrefix = attributes.input.idPrefix }
    if (!attributes.input.search) {
      return exits.error(`Field ${inputs.fieldName} in table being edited requires search  in config file`);
    }

    searchparm = '';
    if (typeof attributes.input.search == 'string') {
      searchparm = `&andor=and&searchfield_1=${attributes.input.search}&compare_1=contains&value_1=%23input`;
    }
    else {
      if (attributes.input.search && attributes.input.search.searches) {
        andor = 'and';
        if (attributes.input.search.andor) { andor = attributes.input.search.andor; }
        searchparm = `&andor=${andor}`;
        for (let i = 0; i < attributes.input.search.searches.length; i++) {
          j = i + 1;
          let value = attributes.input.search.searches[i][2];
          if (value == '#input') { value = '%23input' }
          if (value.substr(0, 1) == '$') { value = thisrecord[value.substr(1)] }
          if (!value) {break;}
          searchparm += `&searchfield_${j}=${attributes.input.search.searches[i][0]}`;
          searchparm += `&compare_${j}=${attributes.input.search.searches[i][1]}`;
          searchparm += `&value_${j}=${value}`;
        }
      }
    }
    let onchange = '';
    if (attributes.input.onchange) {
      onchange = attributes.input.onchange;
    }
    // because this is jquery there are conflicts with Bootstrap. 
    // I tried to fix the field appearance, but can't change the 
    // behaviour when you click on the box. The outline goes to black 
    // rather than blue...
    results = `
      <script src="//code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
      <script>\
        $( function() {
          var split=[];
          $( "#auto_${fieldName}" ).autocomplete({
            source: "auto?linkedtable=${linkedTable}&display=${display}&limit=${limit}${searchparm}",
            minLength: ${minLength},
            select: function( event, ui) {
            split=ui.item.label.split(':',1);
            document.getElementById("autoid_${fieldName}").value=split[0];
            document.getElementById("msg_${fieldName}").innerHTML='(${idPrefix}'+split[0]+')';
            ${onchange}
            }
          });
        } );
      </script>
      <div class="ui-widget" >
         <input 
          id="autoid_${fieldName}" 
          name="${fieldName}"  
          value="${fieldValue}"
          type="hidden">
        <input  
          id="auto_${fieldName}" 
          name="${fieldName}disp" 
          value="${title}"
          style="
          width: ${width};
          border: 1px solid #ccc;
          height: 40px;
          -webkit-border-radius: 5px;
          -moz-border-radius   : 5px;
          border-radius        : 5px;"  
          placeholder="${placeholder}" > 
        <span id="msg_${fieldName}"></span>
        <span id="err_${fieldName}" class="sudserror"> ${errorMsg}</span>
      </div>
    `;

    return results;


  }



