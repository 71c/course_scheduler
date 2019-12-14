var assert = require('assert');

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

// https://medium.com/dailyjs/named-and-optional-arguments-in-javascript-using-es6-destructuring-292a683d5b4e
// https://codeutopia.net/blog/2016/11/24/best-practices-for-javascript-function-parameters/
// IDK what I am doing
function sortArr(arr, {key, reverse=false, compare_function=default_compare}={}) {
    /* Sort array similar to how it is done in Python.
       Similar to https://github.com/Pimm/mapsort
       This is kind of weird but if the key parameter is specified, the
       passed in array will not be modified, but if a key parameter is not
       specified then the array will be modified */
    var sorted = key === undefined ? arr.sort(compare_function) : (() => {
        var indices = [], sortables = [];
        arr.forEach((item, index) => {
            indices.push(index);
            sortables[index] = key(item);
        });
        indices.sort((i1, i2) => compare_function(sortables[i1], sortables[i2]));
        return indices.map(i => arr[i]);
    })();
    if (reverse)
        return sorted.reverse();
    return sorted;
}


// var sortArr = arr => arr.sort(basic_compare);


// console.log(sortArr([[3],[-1], [1]])); 
// console.log(default_compare(1, 1));


var sortArr0=(x,f=x=>x,c=default_compare)=>x.sort((a,b)=>c(f(a),f(b)));
// var sortArr1=(x,f,c=(a,b)=>a-b)=>x.map((e,i)=>({i:i,v:f(e)})).sort((a,b)=>c(a.v,b.v)).map(e=>x[e.i]);
// var sortArr2=(x,f,c=(a,b)=>a-b)=>x.map((e,i)=>[i,f(e)]).sort((a,b)=>c(a[1],b[1])).map(e=>x[e[0]]);
// var sortArr3=(x,f,c=(a,b)=>a-b)=>{var I=[],s=[];x.forEach((e,i)=>{I.push(i);s[i]=f(e)});return I.sort((u,v)=>c(s[u],s[v])).map(i=>x[i])};

function test(n, fn) {
    var vals = [];
    for (var i = 0; i < n; i++)
        vals.push(Math.random() * 10);
    var t = Date.now();
    fn(vals, {reverse: true, key: x=>x*x-x});
    return Date.now() - t;
}

if (require.main === module) {
    console.log(test(100000, sortArr));
    console.log(test(100000, sortArr));
    console.log(test(100000, sortArr));
}

module.exports = {
    default_compare: default_compare,
    basic_compare: basic_compare,
    sortArr: sortArr
}



// var arr = [6, 2, 3];
// console.log(sortArr(arr, {key: u=>-u, reverse: true}));


