


let examCache = {};
let lastExam = {};
let starting={};

/** 
 * Fill in paper select values depending on the exam. 
 * */
async function fillPaperSelect(fieldName, fieldValue) {
    let debug = 0;
   // if (fieldName='results.1.paper.1.paper') {debug=2}
    if (debug) console.log(fieldName,fieldValue,starting);
    if (starting[fieldName]) return;
    if (fieldValue) starting[fieldName]=true;
    if (debug) console.log('*******************************************\n');
    /***  Get the current value of the field 
     * if one is provided as a parameter this is called when the page loads.
     */
    if (!fieldValue) {
        fieldValue = document.mainform[fieldName].value; 
    }
    if (debug) console.log(fieldName, fieldValue);
    /***  Find the name of the exam field*/
    let route = fieldName.split('.');
    if (debug) console.log(fieldName, route, fieldValue);
    let examName = `${route[0]}.${route[1]}.subject`;
    examValue = document.mainform[examName].value;
    if (debug) console.log(fieldName,starting);
    if (debug) console.log(examCache);
    if (debug) console.log(examValue);
    /*** If the examination has not changed and this is not a new paper selection field then no 
     * need to repopulate the select.  
     */
    //   if (debug) console.log(document.mainform[fieldName]);
    //   if (lastExam[fieldName] === examName && document.mainform[fieldName].select.labels.length) { return }

    //   lastExam[fieldName] = examName;
    let labels = [];
    let values = [];
    if (debug > 1) console.log(examCache[examValue]);
    /*** Don't want to keep going to the api. */
    if (examCache[examValue]) {

        [labels,values] = examCache[examValue];
    }
    else {
        if (debug) console.log(document.mainform[fieldName].options.length);
        document.mainform[fieldName].options[0].label = 'Please wait....';
        csrf = document.mainform['csrf'].value;
        if (debug) console.log(examName, examValue);
        /*** not convinced the csrf check is working... outstanding issue  */
        let url = `/apicustomrouter?app=exampaper&exam=${examValue}&csrf=${csrf}`;

        if (debug) console.log(url);
        url = encodeURI(url);
        try {
            if (debug) console.log('fetching');
            let response = await fetch(url);
            if (debug) console.log('fetched');
            let data = await response.json();
            if (debug) console.log(data);
            [labels, values] = data;
            if (debug) console.log('caching', examName, labels,values);
            examCache[examValue] = [labels,values];
        }
        catch (error) {
            console.log(error, url);
            labels = values = ['error']
        };
    }

    /** Clear down the select list before rebuilding it */
    if (debug) console.log(document.mainform[fieldName].length)
    let L = document.mainform[fieldName].options.length - 1;
    for (let i = L; i > 0; i--) {
        if (debug) console.log(i, document.mainform[fieldName][i])
        document.mainform[fieldName].remove(i);
        if (debug) console.log('removed', i);
    }

    if (debug) console.log(labels, values, document.mainform[fieldName].options);
    if (labels) {
        for (let i = 0; i < labels.length; i++) {
            if (debug) console.log('adding', i, labels[i], document.mainform[fieldName].options)
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
    starting[fieldName]=false;
    return;


}



function fillVariant(selected) {
    let debug = false;
    if (debug) { console.log(selected) }
    let id = document.getElementById(`autoid_product`).value;
    if (debug) { console.log('id=', id) }
    if (!id) { return };
    variant = document.getElementById('variant');
    while (variant.options.length > 1) { variant.remove(1); }
    if (debug) { console.log('options removed'); }
    //       while (subvariant.options.length > 1) {subvariant.remove(1);}
    let url = `/getvariants?id=${id}`;
    if (debug) { console.log(url); }
    fetch(url).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (debug) { console.log(data) }
        if (data.err) { return }
        for (let i = 0; i < data.length; i++) {
            let option = new Option(data[i], data[i]);
            variant.add(option, undefined);
            if (selected && data[i] == selected) {
                if (debug) console.log(i, selected, data[i])
                variant.options[i + 1].selected = true;
            }
        }
    });

}


function fillSubVariant(variant_id, selected) {
    let debug = false;
    if (debug) console.log(arguments);
    let id = document.getElementById(`autoid_product`).value;
    if (debug) { console.log('id=', id) }
    if (!id) { return };
    if (!variant_id) {
        if (document.getElementById('variant').value) {
            variant_id = document.getElementById('variant').value;
        }
        else {
            return
        }
    }
    subvariant = document.getElementById('subVariant');
    if (debug) console.log(subvariant);
    while (subvariant.options.length > 1) { subvariant.remove(1); }
    if (debug) { console.log('options removed'); }
    //       while (subvariant.options.length > 1) {subvariant.remove(1);}
    let url = `/getsubvariants?id=${id}&variant_id=${encodeURIComponent(variant_id)}`;
    if (debug) { console.log(url); }
    fetch(url).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (debug) { console.log(data) }
        if (data.err) { return }
        for (let i = 0; i < data.length; i++) {
            let option = new Option(data[i], data[i]);
            subvariant.add(option, undefined);
            if (selected && data[i] == selected) {
                if (debug) console.log(i, selected, data[i])
                subvariant.options[i + 1].selected = true;
            }
        }
    });

}







