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
        variant_id=document.getElementById('variant').value;
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







