const {get_classes_by_course_num, get_search_results} = require('../src/api')
const get_data = require('../src/get_data');
const models = require('../src/models');
const assert = require('assert').strict;

const levenshtein = require('js-levenshtein');



const course_num_regex = /^([A-Z]{2,4})-([A-Z]{0,3})(\d{3,4})([A-Z]{0,2})$/i;
const course_num_regex_2 = /^[A-Z]{2,4}-(\d\d\/\d|[A-Z]{3,6})$/;


function arrayEquals(a, b) {
    if (a.length !== b.length)
        return false;
    for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

get_data.load_all_course_data(main, console.error, true);

function main() {
    let c = get_classes_by_course_num('FR-0191', 'Fall 2020')[0]
    let variants = ['FR 191', 'FR191', 'FR0191', 'FR-0191', 'FR-191', 'FrEnch191', 'French-191', 'FrencH-0191']
    for (const variant of variants) {
        assert.equal(c.courseNumVariantIncludedInString(variant), true);
    }

    c = get_classes_by_course_num('MATH-0061', 'Fall 2020')[0]
    variants = ['MATH-0061']
    for (const variant of variants) {
        assert.equal(c.courseNumVariantIncludedInString(variant), true);
    }


    for (const term in models.courses) {
        for (const course of models.courses[term]) {
            const a = course_num_regex.test(course.course_num);
            const b = course_num_regex_2.test(course.course_num);
            assert(a || b);
            assert(a !== b);
        }
        console.log(models.courses[term].length)
    }
}



// function testMyWordSimilarity() {
//     for (let i = 0; i < 10000; i++) {
//         const start = makeid(Math.floor(Math.random() * 2));
//         const middle1 = makeid(Math.floor(Math.random() * 2));
//         const middle2 = makeid(Math.floor(Math.random() * 2));
//         const end = makeid(Math.floor(Math.random() * 2));
//
//         const a = start + middle1 + end;
//         const b = start + middle2 + end;
//
//         const result1 = start.length + end.length;
//         const result2 = myWordSimilarity(a, b);
//         if (result1 !== result2) {
//             console.log(a, b)
//             console.log(result1, result2)
//         }
//     }
// }
//
// testMyWordSimilarity()


A = 'robosjflkajffnvnnnnnncdndkncslndnnnnsfdweksd;astic'
B = 'rdnnfsklfneoooofidsojpnnobfnsfnnnnnosfiwoboitics'
t=Date.now();
u=(myWordSimilarity(A, B));
console.log(Date.now()-t);
console.log(u)

t=Date.now();
u=(longestCommonSubstringPositions(A, B));
console.log(Date.now()-t);
console.log(u)

// https://stackoverflow.com/a/1349426/9911203
function makeid(length) {
   var result = '';
   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

// function myWordSimilarity(a, b) {
//     var minLength = Math.min(a.length, b.length)
//     var maxLeft = 0
//     while (maxLeft < minLength && a[maxLeft] === b[maxLeft])
//         maxLeft++;
//     var maxRight = 0
//     while (maxRight < minLength - maxLeft && a[a.length - 1 - maxRight] === b[b.length - 1 - maxRight])
//         maxRight++;
//     return maxLeft + maxRight;
// }

// sub-optimal implementation of longest common substring problem
function myWordSimilarity(a, b) {
    var smallerString = a.length < b.length ? a : b;
    var minLength = smallerString.length;
    var largerString = a.length < b.length ? b : a;
    var maxLength = largerString.length;

    for (var currN = minLength; currN > 0; currN--) {
        var maxIndex = minLength - currN;
        for (var i = 0; i <= maxIndex; i++) {
            for (var beta = 0; beta <= maxLength - currN; beta++) {
                var eq = true;
                for (var j = 0; j < currN; j++) {
                    if (a[i + j] !== b[beta + j]) {
                        eq = false;
                        break;
                    }
                }
                if (eq)
                    return currN;
            }
        }
    }
    return 0;
}


// smarter implementation of the longest common substring problem
function LCSubStrLength(X, Y) {
    var m = X.length
    var n = Y.length

    var lCSuff = new Array(m+1);

    for (var i = 0; i < lCSuff.length; i++) {
        lCSuff[i] = new Array(n+1);
    }

    var result = 0

    for (var i = 0; i <= m; i++) {
        for (var j = 0; j <= n; j++) {
            if (i === 0 || j === 0) {
                lCSuff[i][j] = 0;
            } else if (X[i-1] === Y[j-1]) {
                lCSuff[i][j] = lCSuff[i-1][j-1] + 1
                result = Math.max(result, lCSuff[i][j])
            } else {
                lCSuff[i][j] = 0;
            }
        }
    }
    return result
}


// smarter implementation of the longest common substring problem
function longestCommonSubstringPositions(X, Y) {
    var m = X.length
    var n = Y.length

    var lCSuff = new Array(m+1);

    for (var i = 0; i < lCSuff.length; i++) {
        lCSuff[i] = new Array(n+1);
    }

    var length = 0;
    var x_end;
    var y_end;

    for (var i = 0; i <= m; i++) {
        for (var j = 0; j <= n; j++) {
            if (i === 0 || j === 0) {
                lCSuff[i][j] = 0;
            } else if (X[i-1] === Y[j-1]) {
                lCSuff[i][j] = lCSuff[i-1][j-1] + 1
                if (lCSuff[i][j] > length) {
                    length = lCSuff[i][j]
                    x_end = i;
                    y_end = j;
                }
            } else {
                lCSuff[i][j] = 0;
            }
        }
    }
    return [length, [x_end - length, x_end], [y_end - length, y_end]]
}
