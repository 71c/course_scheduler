function getArrayDepth1(value) {
    return !Array.isArray(value) ? 0 :
           value.length === 0 ? 1 :
           Math.max(...value.map(getArrayDepth1)) + 1;
}

function getArrayDepth2(value) {
  return Array.isArray(value) ?
    1 + Math.max(...value.map(getArrayDepth2), 0) :
    0;
}

function getArrayDepth5(value) {
  return Array.isArray(value) ?
    1 + value.map(getArrayDepth5).reduce(function(a, b) {
        return Math.max(a, b);
    }, 0) :
    0;
}

function getArrayDepth6(value) {
  return Array.isArray(value) ?
    1 + value.map(getArrayDepth6).reduce(function(a, b) {
        return a > b ? a : b;
    }, 0) :
    0;
}

function getArrayDepth7(value) {
    if (Array.isArray(value)) {
        var maxDepth = 0;
        for (var x of value) {
            var depth = getArrayDepth7(x);
            if (depth > maxDepth)
                maxDepth = depth;
        }
        return 1 + maxDepth;
    }
    return 0;
}

// 8, 9, 10 seem to be fastest with arrays of of more depth; 13, 14, 15 fastest with arrays of less depth, 8, 9, 10, 11 best for really less depth
function getArrayDepth8(value) {
    return Array.isArray(value) ? 1 + value.reduce(function(depthA, b) {
        var depthB = getArrayDepth8(b);
        return depthA > depthB ? depthA : depthB;
    }, 0) : 0;
}

function getArrayDepth9(value) {
    if (Array.isArray(value))
        return 1 + value.reduce(function(depthA, b) {
            var depthB = getArrayDepth9(b);
            return depthA > depthB ? depthA : depthB;
        }, 0);
    return 0;
}

function getArrayDepth10(value) {
    if (Array.isArray(value))
        return 1 + value.reduce(function(depthA, b) {
            var depthB = getArrayDepth10(b);
            if (depthA > depthB)
                return depthA;
            return depthB;
        }, 0);
    return 0;
}

function getArrayDepth11(value) {
    if (Array.isArray(value)) {
        if (value.length === 0)
            return 1;
        return 1 + value.reduce(function(depthA, b) {
            var depthB = getArrayDepth11(b);
            return depthA > depthB ? depthA : depthB;
        }, 0);
    }
    return 0;
}

function getArrayDepth12(value) {
    if (Array.isArray(value)) {
        var maxDepth = 0;
        value.forEach(x => {
            var depth = getArrayDepth12(x);
            if (depth > maxDepth)
                maxDepth = depth;
        });
        return 1 + maxDepth;
    }
    return 0;
}

function getArrayDepth13(value) {
    if (Array.isArray(value)) {
        var maxDepth = 0;
        for (var i = 0; i < value.length; i++) {
            var depth = getArrayDepth13(value[i]);
            if (depth > maxDepth)
                maxDepth = depth;
        }
        return 1 + maxDepth;
    }
    return 0;
}

function getArrayDepth14(value) {
    if (Array.isArray(value)) {
        var maxDepth = 0;
        var l = value.length;
        for (var i = 0; i < l; i++) {
            var depth = getArrayDepth14(value[i]);
            if (depth > maxDepth)
                maxDepth = depth;
        }
        return 1 + maxDepth;
    }
    return 0;
}

function getArrayDepth15(value) {
    if (Array.isArray(value)) {
        var l = value.length;
        if (l === 0)
            return 1;
        var maxDepth = 0;
        for (var i = 0; i < l; i++) {
            var depth = getArrayDepth15(value[i]);
            if (depth > maxDepth)
                maxDepth = depth;
        }
        return 1 + maxDepth;
    }
    return 0;
}

function randomNestedArray(n, maxDepth, nestProbability, maxN, depth=0) {
    var arr = [];
    for (var i = 0; i < n; i++) {
        var r = Math.floor(Math.random() * maxN);
        if (depth <= maxDepth && Math.random() < nestProbability)
            var v = randomNestedArray(r, maxDepth, nestProbability, maxN, depth + 1);
        else
            var v = 7;
        arr.push(v);
    }
    return arr;
}
var arr = randomNestedArray(100, 2, 0.4, 5);
















































// function getArrayDepth(value) {
//     return !Array.isArray(value) ? 0 :
//            value.length === 0 ? 1 :
//            Math.max(...value.map(getArrayDepth)) + 1;
// }

// function getArrayDepth(value) {
//   return Array.isArray(value) ?
//     1 + Math.max(...value.map(getArrayDepth), 0) :
//     0;
// }

// function getArrayDepth(value) {
//   return Array.isArray(value) ?
//     1 + value.map(getArrayDepth).reduce(function(a, b) {
//         return Math.max(a, b);
//     }, 0) :
//     0;
// }



// value.map(getArrayDepth).reduce(function(a, b) {return Math.max(a, b);}, 0)
// value.map(getArrayDepth).reduce((a, b) => Math.max(a, b), 0)
// value.map(getArrayDepth).reduce((a, b) => a > b ? a : b, 0)

// function getArrayDepth(value) {
//     return Array.isArray(value) ?
//     1 + value.reduce(function(a, b) {
//         var depthA = getArrayDepth(a);
//         var depthB = getArrayDepth(b);
//         return depthA > depthB ? depthA : depthB;
//     }, 0) : 0;
// }

// function getArrayDepth(value) {
//     if (Array.isArray(value))
//         return 1 + value.reduce(function(a, b) {
//             var depthA = getArrayDepth(a);
//             var depthB = getArrayDepth(b);
//             return depthA > depthB ? depthA : depthB;
//         }, 0);
//     return 0;
// }

// function randomNestedArray(n) {
//     var arr = [];
//     for (var i = 0; i < n; i++) {
//         if (arr.length === 0 || Math.random() < 0.8) {
//             arr.push([]);
//         }  else {
//             arr[Math.floor(Math.random() * arr.length)].push(randomNestedArray(3));
//         }
//     }
//     return arr;
// }

// function randomNestedArray(n) {
//     var arr = [];
//     for (var i = 0; i < n; i++) {
//         var r = Math.floor(Math.random() * 4);
//         var v = Math.random() < 0.3 ? 7 : randomNestedArray(r);
//         if (arr.length === 0 || Math.random() < 0.8) {
//             arr.push(v);
//         }  else {
//             var randElement = arr[Math.floor(Math.random() * arr.length)];
//             if (Array.isArray(randElement))
//                 randElement.push(v);
//         }
//     }
//     return arr;
// }


// function randomNestedArray(n, maxDepth, depth=0) {
//     var arr = [];
//     for (var i = 0; i < n; i++) {
//         var r = Math.floor(Math.random() * 4);
//         if (depth <= maxDepth && Math.random() < 0.8)
//             var v = randomNestedArray(r, maxDepth, depth + 1);
//         else
//             var v = 7;
//         if (arr.length === 0 || Math.random() < 0.8) {
//             arr.push(v);
//         }  else {
//             var randElement = arr[Math.floor(Math.random() * arr.length)];
//             if (Array.isArray(randElement))
//                 randElement.push(v);
//         }
//     }
//     return arr;
// }