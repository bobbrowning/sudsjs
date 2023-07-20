"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fillVariant(selected) {
    let debug = false;
    if (debug) {
        console.log(selected);
    }
    let id = document.getElementById(`autoid_product`).value;
    if (debug) {
        console.log('id=', id);
    }
    if (!id) {
        return;
    }
    ;
    variant = document.getElementById('variant');
    while (variant.options.length > 1) {
        variant.remove(1);
    }
    if (debug) {
        console.log('options removed');
    }
    //       while (subvariant.options.length > 1) {subvariant.remove(1);}
    let url = `/getvariants?id=${id}`;
    if (debug) {
        console.log(url);
    }
    fetch(url).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (debug) {
            console.log(data);
        }
        if (data.err) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            let option = new Option(data[i], data[i]);
            variant.add(option, undefined);
            if (selected && data[i] == selected) {
                if (debug)
                    console.log(i, selected, data[i]);
                variant.options[i + 1].selected = true;
            }
        }
    });
}
function fillSubVariant(variant_id, selected) {
    let debug = false;
    if (debug)
        console.log(arguments);
    let id = document.getElementById(`autoid_product`).value;
    if (debug) {
        console.log('id=', id);
    }
    if (!id) {
        return;
    }
    ;
    if (!variant_id) {
        if (document.getElementById('variant').value) {
            variant_id = document.getElementById('variant').value;
        }
        else {
            return;
        }
    }
    subvariant = document.getElementById('subVariant');
    if (debug)
        console.log(subvariant);
    while (subvariant.options.length > 1) {
        subvariant.remove(1);
    }
    if (debug) {
        console.log('options removed');
    }
    //       while (subvariant.options.length > 1) {subvariant.remove(1);}
    let url = `/getsubvariants?id=${id}&variant_id=${encodeURIComponent(variant_id)}`;
    if (debug) {
        console.log(url);
    }
    fetch(url).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (debug) {
            console.log(data);
        }
        if (data.err) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            let option = new Option(data[i], data[i]);
            subvariant.add(option, undefined);
            if (selected && data[i] == selected) {
                if (debug)
                    console.log(i, selected, data[i]);
                subvariant.options[i + 1].selected = true;
            }
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3B1YmxpYy9qYXZhc2NyaXB0cy9jdXN0b20uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxTQUFTLFdBQVcsQ0FBQyxRQUFRO0lBQ3pCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixJQUFJLEtBQUssRUFBRTtRQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDekI7SUFDRCxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ3pELElBQUksS0FBSyxFQUFFO1FBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDMUI7SUFDRCxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQ0wsT0FBTztLQUNWO0lBQ0QsQ0FBQztJQUNELE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQy9CLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckI7SUFDRCxJQUFJLEtBQUssRUFBRTtRQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNsQztJQUNELHNFQUFzRTtJQUN0RSxJQUFJLEdBQUcsR0FBRyxtQkFBbUIsRUFBRSxFQUFFLENBQUM7SUFDbEMsSUFBSSxLQUFLLEVBQUU7UUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCO0lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLFFBQVE7UUFDOUIsT0FBTyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVB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