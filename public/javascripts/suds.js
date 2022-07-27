
function clicked(fieldName, label, value, onchange) {
    document.getElementById(`autoid_${fieldName}`).value = value;
    document.getElementById(`${fieldName}`).value = label;
    document.getElementById(`${fieldName}-autocomplete-list`).remove();
    console.log(`Field ${document.getElementById(`autoid_${fieldName}`).name} set to ${document.getElementById(`autoid_${fieldName}`).value} `);
    if (onchange) {
        eval(onchange);
    }
}

function apiWait(qualifiedName) {
    console.log(qualifiedName);
    document.getElementById(`err_${qualifiedName}`).innerHTML = 'Will be validated when you leave this field';
}

/**
 * Create an on=bject with all of the 'useful' field values
 * Ignore numeric field names
 * ignore csrf
 * 
 */
function getFieldValues() {
    let debug = true;
    let data={};
    for (let key of Object.keys(document.mainform.elements)) {
        if (!isNaN(key)) { continue; }
        if (key == 'csrf') {continue;}
        let field = document.mainform[key];
        let value = field.value;
      //  if (field.options) { value = field.options[field.selectedIndex].value }
         data[key] = value;
    }
    if (debug) console.log(data) 
    return data;
}


function apiCheck(qualifiedName, route, table, id,) {
    console.log(qualifiedName, document.getElementById(qualifiedName));
    let value = document.getElementById('mainform')[qualifiedName].value;
    if (!table) { table = '' }
    if (!id) { id = '' }
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
        }
        else {
            document.getElementById(`err_${qualifiedName}`).innerHTML = '';

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
    let debug = true;
    if (debug) console.log(arguments);
    if (debug) console.log(item + '.length');                                     // Field containing number of items in the array currently
    let last = document.getElementById(item + '.length').value;                   // Number of items currently
    last = parseInt(last) + 1;                                                    // Add one - and make it an integer rather than string
    if (debug) console.log(last, `${item}.${last}.fld`);
    let nexthtml = document.getElementById(`${item}.${last}.fld`).innerHTML;      // The HTML in the last+1 (blank) item
    let next = last + 1;                                                          // this will be the new blank item
    nexthtml = `                                                                   
    <div style="display: none" id="${item}.${next}.fld" >
    ${nexthtml}
    </div>
    `;
    let re = new RegExp(`${item}.${last}`.replace(/\./g, '\\.'), 'g')             // regular expression /xxxx\.3/
    if (debug) console.log(re)
    nexthtml = nexthtml.replace(re, `${item}.${next}`);                           // replace xxxx.3 by xxxx.4
    let re2 = new RegExp(`#${last}`)                                              // replace #3 by #4 ???? why?
    nexthtml = nexthtml.replace(re2, `#${next}`);
    if (debug) console.log(item + '.more');
    document.getElementById(item + '.more').innerHTML += nexthtml;                // add the new html we have created to the .more div
  
    document.getElementById(`${item}.${last}.fld`).style.display = 'inline';      // expose the old blank html section
    document.getElementById(item + '.length').value = last.toString();            // update the last counter
    if (debug) console.log(document.getElementById(item + '.length').value)

    //   console.log(document.getElementById(item + '.envelope'))

}

function auto(route, fieldName, linkedTable, display, limit, searchparm, onchange) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    let debug = false;
    if (debug) { console.log('auto', fieldName); }
    var currentFocus;
    var thisField = inp = document.getElementById(fieldName);
    var keyfield = document.getElementById('autoid_' + fieldName);
    /*execute a function when someone writes in the text field:*/
    if (debug) { console.log(fieldName, thisField); }



    var a, b, i;
    var val = thisField.value;
    let result = [];
    if (debug) { console.log(document.getElementById(fieldName + "-autocomplete-list")) };

    if (document.getElementById(fieldName + "-autocomplete-list") != null) {
        document.getElementById(fieldName + "-autocomplete-list").remove();
    }
    if (!val) { return false; }

    let url = `${route}?linkedtable=${linkedTable}&display=${display}&limit=${limit}${searchparm}&term=${val}`;
    fetch(url).then(function (response) {
        // The API call was successful!
        return response.json();
    }).then(function (data) {
        // This is the JSON from our response
        // Which will be [labels,values] where labels and values are both arrays.
        labels = data[0];
        values = data[1];
        if (debug) { console.log('labels', labels) }
        if (debug) { console.log('values', values) }

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
            <span onclick="clicked('${fieldName}','${labels[i]}','${values[i]}','${onchange}')">${labels[i]}</span>`;
            /*execute a function when someone clicks on the item value (DIV element):*/
            if (debug) { console.log(b.id, '\n', b.innerHTML) }

            a.appendChild(b);

        };

        /*execute a function presses a key on the keyboard:*/
        inp.addEventListener("keydown", function (e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                /*If the arrow DOWN key is pressed,
                increase the currentFocus variable:*/
                currentFocus++;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.keyCode == 38) { //up
                /*If the arrow UP key is pressed,
                decrease the currentFocus variable:*/
                currentFocus--;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.keyCode == 13) {
                /*If the ENTER key is pressed, prevent the form from being submitted,*/
                e.preventDefault();
                if (currentFocus > -1) {
                    /*and simulate a click on the "active" item:*/
                    if (x) x[currentFocus].click();
                }
            }
        });


        function addActive(x) {
            /*a function to classify an item as "active":*/
            if (!x) return false;
            /*start by removing the "active" class on all items:*/
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
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


