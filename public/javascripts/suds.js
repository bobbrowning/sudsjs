
function clicked(fieldName, label, value,onchange) {
    document.getElementById(`autoid_${fieldName}`).value = value;
    document.getElementById(`${fieldName}`).value = label;
    document.getElementById(`${fieldName}-autocomplete-list`).remove();
    console.log(`Field ${document.getElementById(`autoid_${fieldName}`).name} set to ${document.getElementById(`autoid_${fieldName}`).value} `);
    if (onchange){
        eval(onchange);
    }
}

function apiWait(qualifiedName) {
    console.log(qualifiedName);
    document.getElementById(`err_${qualifiedName}`).innerHTML = 'Will be validated when you leave this field';
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




function nextArrayItem(nextItem, counter, button) {
    console.log(arguments);
    if (document.getElementById(nextItem).style.display == 'inline') { return }
    document.getElementById(nextItem).style.display = 'inline';
    document.getElementById(button + '.button').style.display = 'none';
    document.getElementById(counter).value++;
    console.log(document.getElementById(counter).value);
}

function auto(route, fieldName, linkedTable, display, limit, searchparm,onchange) {
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


