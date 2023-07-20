"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let fcsCache = {};
let starting = {};
let checking = false;
/**
 * Populate a select list based on parent field (or fields)
 *
 *
 * @param {string} fieldName - field name
 * @param {*} apiName - the name of an api in bin/custom thast will be called
 * @param {*} parentName  can be:
 *                 ['field1','field2'...] in which case the values in field 1 and 2 are passed to the api  These can't be in an array
 *                 'field' the value of this field is passed to the api
 *                 'field1.1.field2.1....  of field1.1.1... in which case the feld passed is the parent of of this field in the structure (WIP)
 * @param {*} fieldValue - value passed to the routine is used when the page is initially loaded.
 * @returns options set in fieldName
 */
async function fillChildSelect(fieldName, apiName, parentName, fieldValue) {
    let debug = 3;
    if (debug)
        console.log(`******************* start  ${fieldName} ************************`);
    if (debug)
        console.log(fieldName, apiName, parentName, fieldValue, starting);
    /** Make sure only ne of these is running at a time for each field */
    if (starting[fieldName])
        return;
    if (fieldValue)
        starting[fieldName] = true;
    /***  Get the current value of the field
     * if one is provided as a parameter this is called when the page loads.
     */
    if (!fieldValue) {
        fieldValue = document.mainform[fieldName].value;
    }
    if (debug > 2)
        console.log(fieldName, apiName, fieldValue, starting, fcsCache);
    if (!Array.isArray(parentName)) {
        parentName = [parentName];
    }
    let parentParams = '';
    let cachName = '';
    let parentValue;
    for (let i = 0; i < parentName.length; i++) {
        parent = findParent(fieldName, parentName[i]);
        if (debug)
            console.log(parent);
        parentValue = document.mainform[parent].value;
        if (debug)
            console.log(fieldName, parent, parentValue);
        parentParams += `&parentValue${i}=${parentValue}`;
        if (cachName) {
            cachName += '+';
        }
        cachName += parentValue;
        //console.lo g(document.mainform['autoid_product'].value);
    }
    /*** If the examination has not changed and this is not a new paper selection field then no
     * need to repopulate the select.
     */
    let labels = [];
    let values = [];
    if (debug > 2)
        console.log(fieldName, parentValue, fcsCache[parentValue]);
    /*** Don't want to keep going to the api. */
    if (fcsCache[cachName]) {
        if (debug > 2)
            console.log('restoring labels,values', fcsCache[cachName]);
        labels = fcsCache[cachName][0];
        values = fcsCache[cachName][1];
    }
    else {
        /*** Call the api to retrieve labels and values from the database */
        if (debug > 1)
            console.log(fieldName, document.mainform[fieldName].options.length);
        document.mainform[fieldName].options[0].label = 'Please wait....';
        let csrf = document.mainform['_csrf'].value;
        /*** not convinced the csrf check is working... outstanding issue  */
        let url = `apicustomrouter?app=${apiName}&${parentParams}&_csrf=${csrf}`;
        if (debug > 0)
            console.log(fieldName, url);
        url = encodeURI(url);
        try {
            let response = await fetch(url);
            let data = await response.json();
            if (debug > 2)
                console.log(Array.isArray(data), data);
            /** If the result is not an array, assume it is an object with error  */
            if (!Array.isArray(data)) {
                labels = [data.err];
                values = ['err'];
            }
            else {
                console.log(data);
                if (debug > 2)
                    console.log(fieldName, data);
                [labels, values] = data;
                if (debug)
                    console.log(fieldName, 'caching', parent, labels, values);
                fcsCache[cachName] = [labels, values];
            }
        }
        catch (error) {
            console.log(fieldName, error, url);
            labels = values = ['error'];
        }
        ;
    }
    document.mainform[fieldName].options[0].label = 'Please select....';
    /** Clear down the select list before rebuilding it */
    if (debug > 1)
        console.log(fieldName, document.mainform[fieldName].length);
    let L = document.mainform[fieldName].options.length - 1;
    for (let i = L; i > 0; i--) {
        if (debug > 1)
            console.log(i, document.mainform[fieldName][i]);
        document.mainform[fieldName].remove(i);
        if (debug > 1)
            console.log('removed', i);
    }
    if (!Array.isArray(values)) {
        if (debug > 1)
            console.log(`*********************** no values - ${fieldName}  *********************************** `);
        values = [];
    }
    if (debug > 1)
        console.log(fieldName, labels, values, document.mainform[fieldName].options);
    if (labels) {
        for (let i = 0; i < labels.length; i++) {
            if (debug > 1)
                console.log(fieldName, 'adding', i, labels[i], document.mainform[fieldName].options);
            var option;
            if (values[i] == fieldValue) {
                option = new Option(labels[i], values[i], true, true);
            }
            else {
                option = new Option(labels[i], values[i]);
            }
            document.mainform[fieldName].add(option);
        }
        document.mainform[fieldName].options[0].label = 'Please select ....';
    }
    starting[fieldName] = false;
    return;
}
/**
* Now we need to find the parent fully qualified name
* e.g.
* aaa.2.bbb.3.ccc.4.ddd  ccc.4.ddd is this field so strip it out
* aaa.2.bbb.3.4.ddd    this is a list of items not an object so 3.4.ddd neds to go
* ddd  we are not in any sort of array so just use it.
*
* @param {string} fieldName
* @param {string} parentName
*/
function findParent(fieldName, parentName) {
    let debug = 0;
    let route = fieldName.split('.');
    if (debug)
        console.log(fieldName, route, route.length);
    let parent = '';
    if (route.length == 1) {
        parent = parentName;
    }
    else {
        /** work in progress */
        parent = `${route[0]}.${route[1]}.${parentName}`;
    }
    if (debug)
        console.log(fieldName, parent, typeof document.mainform[parent]);
    if (typeof document.mainform[parent] == 'undefined') {
        console.log(`********************** field [${parent}] not present *********** `);
        if (debug)
            console.log(document.mainform);
    }
    return parent;
}
function clicked(fieldName, label, value, onchange) {
    let debug = false;
    document.getElementById(`autoid_${fieldName}`).value = value;
    document.getElementById(`${fieldName}`).value = label;
    document.getElementById(`${fieldName}-autocomplete-list`).remove();
    if (debug)
        console.log(`Field ${document.getElementById(`autoid_${fieldName}`).name} set to ${document.getElementById(`autoid_${fieldName}`).value} `);
    if (onchange) {
        eval(onchange);
    }
}
function apiWait(qualifiedName) {
    //   const suds = require(['/javascripts/config/suds.js';
    let debug = true;
    if (debug)
        console.log(qualifiedName);
    checking = true;
    document.getElementById('submitbutton').type = 'button';
    document.getElementById('submitbutton').title = `Please wait while we check ${qualifiedName}`;
    document.getElementById(`err_${qualifiedName}`).innerHTML = 'Will be validated when you leave this field';
}
/**
 * Create an on=bject with all of the 'useful' field values
 * Ignore numeric field names
 * ignore csrf
 *
 */
function getFieldValues() {
    let debug = false;
    let data = {};
    for (let key of Object.keys(document.mainform.elements)) {
        if (!isNaN(key)) {
            continue;
        }
        if (key == '_csrf') {
            continue;
        }
        let field = document.mainform[key];
        let value = field.value;
        //  if (field.options) { value = field.options[field.selectedIndex].value }
        data[key] = value;
    }
    if (debug)
        console.log(data);
    return data;
}
function apiCheck(qualifiedName, route, table, id) {
    let debug = 'false';
    if (debug)
        console.log(checking, qualifiedName, `err_${qualifiedName}`);
    let value = document.getElementById('mainform')[qualifiedName].value;
    if (!table) {
        table = '';
    }
    if (!id) {
        id = '';
    }
    let url = `${route}?table=${table}&id=${id}&field=${qualifiedName}&value=` + encodeURIComponent(value);
    let result = [];
    document.getElementById(`err_${qualifiedName}`).innerHTML = 'Checking';
    console.log(url);
    fetch(url).then(function (response) {
        // The API call was successful!
        return response.json();
    }).then(function (data) {
        // This is the JSON from our response
        result = data;
        console.log(result);
        if (result[0] == 'validationError') {
            console.log(result[1]);
            document.getElementById(`err_${qualifiedName}`).innerHTML = result[1];
            document.getElementById('submitbutton').title = `Please correct ${qualifiedName}`;
        }
        else {
            document.getElementById(`err_${qualifiedName}`).innerHTML = '';
            checking = false;
            document.getElementById('submitbutton').type = 'submit';
            document.getElementById('submitbutton').title = `Submit form`;
        }
    }).catch(function (err) {
        // There was an error
        console.warn('Something went wrong.', err);
    });
}
/*
function nextArrayItem(nextItem, counter, button) {
    console.log(arguments);
    if (document.getElementById(nextItem).style.display == 'inline') { return }
    document.getElementById(nextItem).style.display = 'inline';
    document.getElementById(button + '.button').style.display = 'none';
    document.getElementById(counter).value++;
    console.log(document.getElementById(counter).value);
}
*/
/**
 * This function copies the last html for an array and add one to the
 * array number in the html to product a new div for the next item.
 * It is hidden
 *
 *    * The structure of the HTML for an array item/object called xxxx
   * with two sets of values is as follows
   *
   * There is always a blank entry as the last one in the array
   * which is hidden. So a new document will always have at least
   * one array entry.
   *
   * <hidden-field id=xxxx.length value 2>
   * <div id=xxxx.1.fld>
   *      HTML for xxxx.1
   * <div id=xxxx.2.fld>
   *      HTML for xxxx.2
   * <div id=xxxx.3.fld>
   *      HTML for xxxx.3
   *
   * When a new item is added with the 'new xxxx' button
   * 1 the last .fld div is copied
   * 2 the index nunber incremented in the copy
   * 3 the .length hidden field is incrememented.
   * 4 the old last entry (now penultimate) entry is un-hidden
   *
 *
 *
 * @param {string} item (xxxx in this example)
 */
function nextArrayItem(item) {
    let debug = false;
    if (debug)
        console.log(item);
    if (debug)
        console.log(item + '.length'); // Field containing number of items in the array currently
    let last = document.getElementById(item + '.length').value; // Number of items currently
    last = parseInt(last) + 1; // Add one - and make it an integer rather than string
    if (debug)
        console.log(last, `${item}.${last}.fld`);
    let nexthtml = document.getElementById(`${item}.${last}.fld`).innerHTML; // The HTML in the last+1 (blank) item
    let next = last + 1; // this will be the new blank item
    nexthtml = `
            <div style = "display: none" id = "${item}.${next}.fld">
                ${nexthtml}
    </div>
            `;
    let re = new RegExp(`${item}.${last}`.replace(/\./g, '\\.'), 'g'); // regular expression /xxxx\.3/
    if (debug)
        console.log(re);
    nexthtml = nexthtml.replace(re, `${item}.${next}`); // replace xxxx.3 by xxxx.4
    let re2 = new RegExp(`#${last}`); // replace #3 by #4 ???? why?
    nexthtml = nexthtml.replace(re2, `#${next}`);
    if (debug)
        console.log(item + '.more');
    document.getElementById(item + '.more').innerHTML += nexthtml; // add the new html we have created to the .more div
    if (debug)
        console.log(document.getElementById(item + '.more'));
    document.getElementById(`${item}.${last}.fld`).style.display = 'inline'; // expose the old blank html section
    document.getElementById(item + '.length').value = last.toString(); // update the last counter
    if (debug)
        console.log(document.getElementById(item + '.length').value);
    //   console.log(document.getElementById(item + '.envelope'))
}
function auto(route, fieldName, linkedTable, display, limit, searchparm, sortparm, onchange) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    let debug = false;
    if (debug) {
        console.log('auto', fieldName);
    }
    var currentFocus;
    var inp;
    var thisField = inp = document.getElementById(fieldName);
    var keyfield = document.getElementById('autoid_' + fieldName);
    /*execute a function when someone writes in the text field:*/
    if (debug) {
        console.log(fieldName, thisField);
    }
    var a, b, i;
    var val = thisField.value;
    let result = [];
    if (debug) {
        console.log(document.getElementById(fieldName + "-autocomplete-list"));
    }
    ;
    if (document.getElementById(fieldName + "-autocomplete-list") != null) {
        document.getElementById(fieldName + "-autocomplete-list").remove();
    }
    if (!val) {
        return false;
    }
    let url = `${route}?linkedtable=${linkedTable}&display=${display}&limit=${limit}${searchparm}${sortparm}&term=${val} `;
    if (debug) {
        console.log(url);
    }
    fetch(url).then(function (response) {
        // The API call was successful!
        return response.json();
    }).then(function (data) {
        // This is the JSON from our response
        // Which will be [labels,values] where labels and values are both arrays.
        let labels = data[0];
        let values = data[1];
        if (debug) {
            console.log('labels', labels);
        }
        if (debug) {
            console.log('values', values);
        }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", fieldName + "-autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        thisField.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < labels.length; i++) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            b.id = "autocomplete-item-" + i;
            b.setAttribute("class", "autocomplete-item");
            /*make the matching letters bold:*/
            b.innerHTML = `
            <span onclick="clicked('${fieldName}','${labels[i]}','${values[i]}','${onchange}')"> ${labels[i]}</span> `;
            /*execute a function when someone clicks on the item value (DIV element):*/
            if (debug) {
                console.log(b.id, '\n', b.innerHTML);
            }
            a.appendChild(b);
        }
        ;
        /*execute a function presses a key on the keyboard:*/
        inp.addEventListener("keydown", function (e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x)
                x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                /*If the arrow DOWN key is pressed,
                increase the currentFocus variable:*/
                currentFocus++;
                /*and and make the current item more visible:*/
                addActive(x);
            }
            else if (e.keyCode == 38) { //up
                /*If the arrow UP key is pressed,
                decrease the currentFocus variable:*/
                currentFocus--;
                /*and and make the current item more visible:*/
                addActive(x);
            }
            else if (e.keyCode == 13) {
                /*If the ENTER key is pressed, prevent the form from being submitted,*/
                e.preventDefault();
                if (currentFocus > -1) {
                    /*and simulate a click on the "active" item:*/
                    if (x)
                        x[currentFocus].click();
                }
            }
        });
        function addActive(x) {
            /*a function to classify an item as "active":*/
            if (!x)
                return false;
            /*start by removing the "active" class on all items:*/
            removeActive(x);
            if (currentFocus >= x.length)
                currentFocus = 0;
            if (currentFocus < 0)
                currentFocus = (x.length - 1);
            /*add class "autocomplete-active":*/
            x[currentFocus].classList.add("autocomplete-active");
        }
        function removeActive(x) {
            /*a function to remove the "active" class from all autocomplete items:*/
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }
    }).catch(function (err) {
        // There was an error
        console.warn('Something went wrong.', err);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wdWJsaWMvamF2YXNjcmlwdHMvc3Vkcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNsQixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbEIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3JCOzs7Ozs7Ozs7Ozs7R0FZRztBQUVILEtBQUssVUFBVSxlQUFlLENBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVTtJQUN0RSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxJQUFJLEtBQUs7UUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixTQUFTLDJCQUEyQixDQUFDLENBQUM7SUFDcEYsSUFBSSxLQUFLO1FBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdEUscUVBQXFFO0lBQ3JFLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUNuQixPQUFPO0lBQ1gsSUFBSSxVQUFVO1FBQ1YsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUMvQjs7T0FFRztJQUNILElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDYixVQUFVLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FDbkQ7SUFDRCxJQUFJLEtBQUssR0FBRyxDQUFDO1FBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDNUIsVUFBVSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDN0I7SUFDRCxJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7SUFDdEIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLElBQUksV0FBVyxDQUFDO0lBQ2hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3hDLE1BQU0sR0FBRyxVQUFVLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlDLElBQUksS0FBSztZQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEIsV0FBVyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzlDLElBQUksS0FBSztZQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNoRCxZQUFZLElBQUksZUFBZSxDQUFDLElBQUksV0FBVyxFQUFFLENBQUM7UUFDbEQsSUFBSSxRQUFRLEVBQUU7WUFDVixRQUFRLElBQUksR0FBRyxDQUFDO1NBQ25CO1FBQ0QsUUFBUSxJQUFJLFdBQVcsQ0FBQztRQUN4QiwwREFBMEQ7S0FDN0Q7SUFDRDs7T0FFRztJQUNILElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsSUFBSSxLQUFLLEdBQUcsQ0FBQztRQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUMvRCw0Q0FBNEM7SUFDNUMsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDcEIsSUFBSSxLQUFLLEdBQUcsQ0FBQztZQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDL0QsTUFBTSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQixNQUFNLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xDO1NBQ0k7UUFDRCxvRUFBb0U7UUFDcEUsSUFBSSxLQUFLLEdBQUcsQ0FBQztZQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hFLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxpQkFBaUIsQ0FBQztRQUNsRSxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM1QyxxRUFBcUU7UUFDckUsSUFBSSxHQUFHLEdBQUcsdUJBQXVCLE9BQU8sSUFBSSxZQUFZLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDekUsSUFBSSxLQUFLLEdBQUUsQ0FBQztZQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckIsSUFBSTtZQUNBLElBQUksUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDLElBQUksSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2pDLElBQUksS0FBSyxHQUFHLENBQUM7Z0JBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3ZELHdFQUF3RTtZQUN4RSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdEIsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQixNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNwQjtpQkFBTTtnQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNqQixJQUFJLEtBQUssR0FBRyxDQUFDO29CQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNqQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7Z0JBQ3hCLElBQUksS0FBSztvQkFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDOUQsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3pDO1NBQ0o7UUFDRCxPQUFPLEtBQUssRUFBRTtZQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNuQyxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDL0I7UUFDRCxDQUFDO0tBQ0o7SUFDRCxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUM7SUFDcEUsc0RBQXNEO0lBQ3RELElBQUksS0FBSyxHQUFHLENBQUM7UUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hFLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDeEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QixJQUFJLEtBQUssR0FBRyxDQUFDO1lBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksS0FBSyxHQUFHLENBQUM7WUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNqQztJQUNELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ3hCLElBQUksS0FBSyxHQUFHLENBQUM7WUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxTQUFTLHdDQUF3QyxDQUFDLENBQUM7UUFDMUcsTUFBTSxHQUFHLEVBQUUsQ0FBQztLQUNmO0lBQ0QsSUFBSSxLQUFLLEdBQUcsQ0FBQztRQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqRixJQUFJLE1BQU0sRUFBRTtRQUNSLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3BDLElBQUksS0FBSyxHQUFHLENBQUM7Z0JBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6RixJQUFJLE1BQU0sQ0FBQztZQUNYLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsRUFBRTtnQkFDekIsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3pEO2lCQUNJO2dCQUNELE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDN0M7WUFDRCxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM1QztRQUNELFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxvQkFBb0IsQ0FBQztLQUN4RTtJQUNELFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDNUIsT0FBTztBQUNYLENBQUM7QUFDRDs7Ozs7Ozs7O0VBU0U7QUFDRixTQUFTLFVBQVUsQ0FBRSxTQUFTLEVBQUUsVUFBVTtJQUN0QyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDLElBQUksS0FBSztRQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEQsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7UUFDbkIsTUFBTSxHQUFHLFVBQVUsQ0FBQztLQUN2QjtTQUNJO1FBQ0QsdUJBQXVCO1FBQ3ZCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxFQUFFLENBQUM7S0FDcEQ7SUFDRCxJQUFJLEtBQUs7UUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDckUsSUFBSSxPQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksV0FBVyxFQUFFO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLE1BQU0sNEJBQTRCLENBQUMsQ0FBQztRQUNqRixJQUFJLEtBQUs7WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN0QztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFDRCxTQUFTLE9BQU8sQ0FBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRO0lBQy9DLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixRQUFRLENBQUMsY0FBYyxDQUFDLFVBQVUsU0FBUyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQzdELFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdEQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLFNBQVMsb0JBQW9CLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNuRSxJQUFJLEtBQUs7UUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLFNBQVMsRUFBRSxDQUFDLENBQUMsSUFBSSxXQUFXLFFBQVEsQ0FBQyxjQUFjLENBQUMsVUFBVSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDaEosSUFBSSxRQUFRLEVBQUU7UUFDVixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbEI7QUFDTCxDQUFDO0FBRUQsU0FBUyxPQUFPLENBQUUsYUFBYTtJQUMzQix5REFBeUQ7SUFDekQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ2pCLElBQUksS0FBSztRQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDL0IsUUFBUSxHQUFHLElBQUksQ0FBQztJQUNoQixRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7SUFDeEQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLEdBQUcsOEJBQThCLGFBQWEsRUFBRSxDQUFDO0lBQzlGLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxhQUFhLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyw2Q0FBNkMsQ0FBQztBQUM5RyxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLGNBQWM7SUFDbkIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNkLEtBQUssSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDYixTQUFTO1NBQ1o7UUFDRCxJQUFJLEdBQUcsSUFBSSxPQUFPLEVBQUU7WUFDaEIsU0FBUztTQUNaO1FBQ0QsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ3hCLDJFQUEyRTtRQUMzRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0tBQ3JCO0lBQ0QsSUFBSSxLQUFLO1FBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QixPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBQ0QsU0FBUyxRQUFRLENBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUM5QyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUM7SUFDcEIsSUFBSSxLQUFLO1FBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsYUFBYSxFQUFFLE9BQU8sYUFBYSxFQUFFLENBQUMsQ0FBQztJQUNqRSxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNyRSxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1IsS0FBSyxHQUFHLEVBQUUsQ0FBQztLQUNkO0lBQ0QsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUNMLEVBQUUsR0FBRyxFQUFFLENBQUM7S0FDWDtJQUNELElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxVQUFVLEtBQUssT0FBTyxFQUFFLFVBQVUsYUFBYSxTQUFTLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkcsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxhQUFhLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7SUFDdkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsUUFBUTtRQUM5QiwrQkFBK0I7UUFDL0IsT0FBTyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSTtRQUNsQixxQ0FBcUM7UUFDckMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEIsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksaUJBQWlCLEVBQUU7WUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sYUFBYSxFQUFFLENBQUMsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxHQUFHLGtCQUFrQixhQUFhLEVBQUUsQ0FBQztTQUNyRjthQUNJO1lBQ0QsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLGFBQWEsRUFBRSxDQUFDLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUMvRCxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ2pCLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztZQUN4RCxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUM7U0FDakU7SUFDTCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHO1FBQ2xCLHFCQUFxQjtRQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUNEOzs7Ozs7Ozs7RUFTRTtBQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTZCRztBQUNILFNBQVMsYUFBYSxDQUFFLElBQUk7SUFDeEIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLElBQUksS0FBSztRQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0IsSUFBSSxLQUFLO1FBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQywwREFBMEQ7SUFDcEcsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsNEJBQTRCO0lBQ3hGLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsc0RBQXNEO0lBQ2pGLElBQUksS0FBSztRQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLENBQUM7SUFDN0MsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLHNDQUFzQztJQUMvRyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsa0NBQWtDO0lBQ3ZELFFBQVEsR0FBRztpREFDa0MsSUFBSSxJQUFJLElBQUk7a0JBQzNDLFFBQVE7O2FBRWIsQ0FBQztJQUNWLElBQUksRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQywrQkFBK0I7SUFDbEcsSUFBSSxLQUFLO1FBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzQixRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLDJCQUEyQjtJQUMvRSxJQUFJLEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyw2QkFBNkI7SUFDL0QsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM3QyxJQUFJLEtBQUs7UUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQztJQUNoQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLENBQUMsb0RBQW9EO0lBQ25ILElBQUksS0FBSztRQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNqRSxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxvQ0FBb0M7SUFDN0csUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLDBCQUEwQjtJQUM3RixJQUFJLEtBQUs7UUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pFLDZEQUE2RDtBQUNqRSxDQUFDO0FBQ0QsU0FBUyxJQUFJLENBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVE7SUFDeEY7MkVBQ3VFO0lBQ3ZFLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixJQUFJLEtBQUssRUFBRTtRQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQ2xDO0lBQ0QsSUFBSSxZQUFZLENBQUM7SUFDakIsSUFBSSxHQUFHLENBQUM7SUFDUixJQUFJLFNBQVMsR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6RCxJQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQztJQUM5RCw2REFBNkQ7SUFDN0QsSUFBSSxLQUFLLEVBQUU7UUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUFDO0lBQy9DLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDWixJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO0lBQzFCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixJQUFJLEtBQUssRUFBRTtRQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO0tBQzFFO0lBQ0QsQ0FBQztJQUNELElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxJQUFJLEVBQUU7UUFDbkUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUN0RTtJQUNELElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDTixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUNELElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxnQkFBZ0IsV0FBVyxZQUFZLE9BQU8sVUFBVSxLQUFLLEdBQUcsVUFBVSxHQUFHLFFBQVEsU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUN2SCxJQUFJLEtBQUssRUFBRTtRQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEI7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsUUFBUTtRQUM5QiwrQkFBK0I7UUFDL0IsT0FBTyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSTtRQUNsQixxQ0FBcUM7UUFDckMseUVBQXlFO1FBQ3pFLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxLQUFLLEVBQUU7WUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNqQztRQUNELElBQUksS0FBSyxFQUFFO1lBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDakM7UUFDRCxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbEIsOERBQThEO1FBQzlELENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDOUMsb0VBQW9FO1FBQ3BFLFNBQVMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLGlDQUFpQztRQUNqQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsbURBQW1EO1lBQ25ELENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxFQUFFLEdBQUcsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFDN0MsbUNBQW1DO1lBQ25DLENBQUMsQ0FBQyxTQUFTLEdBQUc7c0NBQ1ksU0FBUyxNQUFNLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sUUFBUSxRQUFRLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1lBQzNHLDJFQUEyRTtZQUMzRSxJQUFJLEtBQUssRUFBRTtnQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUN4QztZQUNELENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDcEI7UUFDRCxDQUFDO1FBQ0QscURBQXFEO1FBQ3JELEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQztnQkFDRCxDQUFDLEdBQUcsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFLEVBQUU7Z0JBQ2pCO3FEQUNxQztnQkFDckMsWUFBWSxFQUFFLENBQUM7Z0JBQ2YsK0NBQStDO2dCQUMvQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDaEI7aUJBQ0ksSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUk7Z0JBQzVCO3FEQUNxQztnQkFDckMsWUFBWSxFQUFFLENBQUM7Z0JBQ2YsK0NBQStDO2dCQUMvQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDaEI7aUJBQ0ksSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRTtnQkFDdEIsdUVBQXVFO2dCQUN2RSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ25CLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUNuQiw4Q0FBOEM7b0JBQzlDLElBQUksQ0FBQzt3QkFDRCxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQy9CO2FBQ0o7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILFNBQVMsU0FBUyxDQUFFLENBQUM7WUFDakIsK0NBQStDO1lBQy9DLElBQUksQ0FBQyxDQUFDO2dCQUNGLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLHNEQUFzRDtZQUN0RCxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsSUFBSSxZQUFZLElBQUksQ0FBQyxDQUFDLE1BQU07Z0JBQ3hCLFlBQVksR0FBRyxDQUFDLENBQUM7WUFDckIsSUFBSSxZQUFZLEdBQUcsQ0FBQztnQkFDaEIsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNsQyxvQ0FBb0M7WUFDcEMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBQ0QsU0FBUyxZQUFZLENBQUUsQ0FBQztZQUNwQix3RUFBd0U7WUFDeEUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7YUFDaEQ7UUFDTCxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRztRQUNsQixxQkFBcUI7UUFDckIsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMvQyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMifQ==