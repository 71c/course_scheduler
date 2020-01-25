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

function* combinations(pool, r) {
    var n = pool.length;
    if (r > n)
        return;
    var indices = [...Array(r).keys()];
    yield indices.map(i => pool[i]);
    while (true) {
        var breaked = false;
        for (var i = r - 1; i >= 0; i--) {
            if (indices[i] !== i + n - r) {
                breaked = true;
                break;
            }
        }
        if (!breaked)
            return;
        indices[i]++;
        for (let j = i+1; j < r; j++) {
            indices[j] = indices[j-1] + 1;
        }
        yield indices.map(i => pool[i]);
    }
}

function chain_from_iterable(iterables) {
    const elements = [];
    for (const it of iterables) {
        for (const element of it) {
            elements.push(element);
        }
    }
    return elements;
}

function* cycle(values, uplevel) {
    for (const prefix of uplevel) {
        for (const current of values) {
            yield prefix.concat([current]);
        }
    }
}

function product_from_iterable(values) {
    let stack = [[]];
    for (const level of values) {
        stack = cycle(level, stack);
    }
    return stack;
}

function get_class_options(spec) {
    return spec.map(s => {
        if (s.length === 2 && typeof s[0] === 'number' && Array.isArray(s[1])) {
            const [n, options] = s;
            return [...combinations(options, n)];
        }
        else {
            return [s];
        }
    });
}

// function get_class_options_evaluated(spec) {
//     const spec_expanded = get_class_options(spec);
//     return [...product_from_iterable(spec_expanded)].map(chain_from_iterable);
// }

// const spec = [[3, ['C', 'D', 'A', 'N']], [2, ['I', 'J', 'K']]]
// const options = get_class_options(spec)
// console.log(options)

module.exports = {all, groupBy, get_class_options};
