function all(functions, resolve, reject) {
    /* `functions` is an array; each element is a function of the functions (resolve, reject) */
    var n = functions.length;
    var nDone = 0;
    var vals = [];
    var done = false;
    for (let i = 0; i < functions.length; i++) {
        const f = functions[i];
        f(function(thing) {
            vals[i] = thing;
            if (++nDone === n) {
                resolve(vals);
            }
        }, function(err) {
            if (!done) {
                reject(err);
                done = true;
            }
        });
    }
}

function groupBy(items, groupFunction) {
    const map = new Map();
    for (const item of items) {
        const value = groupFunction(item);
        if (map.has(value)) {
            map.get(value).push(item);
        } else {
            map.set(value, [item]);
        }
    }
    return [...map.values()];
}

module.exports = {all, groupBy};
