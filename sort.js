function default_compare(a, b) {
    /* comparison similar to how Python compares */
    var type_a = a.constructor;
    var type_b = b.constructor;
    if (type_a !== type_b) {
        var err = new TypeError(`instances of '${type_a.name}' and '${type_b.name}' should not be compared`);
        throw err;
    }
    if (type_a === Array) {
        var na = a.length;
        var nb = b.length;
        var n = na < nb ? na : nb; // min of them
        for (var i = 0; i < n; i++) {
            var compare_result = default_compare(a[i], b[i]);
            if (compare_result !== 0)
                return compare_result;
        }
        return na < nb ? -1 : na > nb ? 1 : 0;
    } else {
        if (a < b)
            return -1;
        else if (a > b)
            return 1;
        else if (a === b)
            return 0;
        var err = new TypeError(`instances of '${type_a.name}' and '${type_b.name}' should not be compared`);
        throw err;
    }
}

var basic_compare = (a,b)=>a<b?-1:a>b?1:0;

function sortArr(arr, {key, reverse=false, compare_function=default_compare}={}) {
    /* Sort array similar to how it is done in Python.
       Similar to https://github.com/Pimm/mapsort
       Modifies the array. */
    if (key === undefined) {
        arr.sort(compare_function);
    } else {
        const indices = [], sortables = [];
        arr.forEach((item, index) => {
            indices.push(index);
            sortables[index] = key(item);
        });
        indices.sort((i1, i2) => compare_function(sortables[i1], sortables[i2]));
        
        const inverseIndices = [...indices];
        indices.forEach((item, index) => {
            inverseIndices[item] = index;
        });

        const startIndex = 0;
        let index = startIndex;
        let toTake = arr[index];
        let newIndex;
        while (newIndex !== startIndex) {
            newIndex = inverseIndices[index];
            const newToTake = arr[newIndex];
            arr[newIndex] = toTake;
            toTake = newToTake;
            index = newIndex;
        }
    }
    if (reverse)
        return arr.reverse();
    return arr;
}

module.exports = {
    default_compare: default_compare,
    basic_compare: basic_compare,
    sortArr: sortArr
}

