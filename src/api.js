const models = require('./models');
const course_scheduler = require('./course_scheduler');
const {default_compare} = require('./partial_sort');

const course_num_regex = /\b([A-Z]{2,})(?:-|\s*)([A-Z]{0,3})(\d{1,4})([A-Z]{0,2})\b/i;
const course_num_regex_2 = /\b([A-Z]{2,})(?:-|\s*)(\d\d\/\d|[A-Z]{3,6})\b/i;


function get_classes_by_course_num(course_num, term) {
    return models.courses[term].filter(course => course.course_num === course_num);
}

function get_classes_by_title(title, term) {
    return models.courses[term].filter(course => course.title === title);
}

function get_classes_by_subject(subject, term) {
    return models.courses[term].filter(course => course.subject === subject);
}

// https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function get_search_results(query, term) {
    query = query.trim().toUpperCase();
    let sortedCourses = [];
    const searchRankingFunction = getSearchRankingFunction(query, term);
    let hasAnyCoursenums = false;
    for (const course of models.courses[term]) {
        const score = searchRankingFunction(course);
        const info = {
            score: score,
            course: course
        };
        if (score[0] === 2) {
            hasAnyCoursenums = true;
            sortedCourses.push(info);
        } else if (!hasAnyCoursenums && (score[0] !== 0 || score[1] !== 0 || score[2] !== 0 || score[3] !== 0 || score[4] !== 0 || score[5] !== 0)) {
            sortedCourses.push(info);
        }
    }
    if (hasAnyCoursenums)
        sortedCourses = sortedCourses.filter(x => x.score[0] === 2);
    sortedCourses.sort((a, b) => default_compare(b.score, a.score));
    console.log(sortedCourses.map(x=>[x.score,x.course.course_num,x.course.title]).slice(0,30));
    // console.log(sortedCourses.map(x=>[x.score,x.course.course_num,x.course.title]).slice(sortedCourses.length-10));
    // console.log(sortedCourses.length, models.courses[term].length)
    return sortedCourses.map(x => x.course);
}

function getSearchRankingFunction(query, term) {
    const escapedQuery = escapeRegExp(query);
    const includes_query_words = new RegExp(`\\b${escapedQuery}\\b`, 'i');
    const begins_with_query_words = new RegExp(`(^|: )${escapedQuery}\\b`, 'i');
    const ends_with_query_words = new RegExp(`\\b${escapedQuery}$`, 'i');
    const query_is_course_num = getCorrectCourseNum(query, term);
    if (query_is_course_num) {
        var is_corrected_coursenum_regex = query_is_course_num.regex;
        var query_subject = query_is_course_num.subject;
    }
    return function(course) {
        // if the subject equals, i want them in alphabetical order
        if (course.subject === query) {
            return [1, 0, 0, 0, 0, 0];
        }

        if (course.courseNumVariantIncludedInString(query)) {
            return [2, 0, 0, 0, 0, 0];
        }

        const subject_long = course.subject_long.toUpperCase();
        const title = course.title.toUpperCase();

        const score = [
            0,


            title === query ? 6 : // course title equals query
            begins_with_query_words.test(title) ? 5 : // course title begins with query as word(s)
            ends_with_query_words.test(title) ? 4 : // course title ends with query as word(s)
            includes_query_words.test(title) ? 3 : // course title includes query, as word(s)
            title.startsWith(query) ? 2 :
            title.indexOf(query) !== -1 ? 1 : // course title includes query
            0,


            // query_is_course_num ? 0 :

            subject_long === query ? 7 : // long subject equals query

            // long subject contained in query
            course.begins_with_long_subject_words_regex.test(query) ? 7 : // query begins with long subject words
            course.includes_long_subject_words_regex.test(query) ? 6 : // query contains long subject words
            query.indexOf(subject_long) !== -1 ? 5 : // query contains long subject

            // query in contained in long subject
            begins_with_query_words.test(subject_long) ? 4 : // long subject begins with query words
            includes_query_words.test(subject_long) ? 3 : // long subject includes with query words
            subject_long.indexOf(query) === 0 ? 2 : // long subject starts with query
            subject_long.indexOf(query) !== -1 ? 1 : // long subject includes query
            mySimilarity(query, subject_long),


            course.begins_with_subject_words_regex.test(query) ? 2 :
            course.includes_subject_words_regex.test(query) ? 1 : 0,


            query_is_course_num ? (is_corrected_coursenum_regex.test(course.course_num) ? 1 : 0) : 0,

            0
        ];

        if (! query_is_course_num) { // not course num type query
            score[5] = mySimilarity(query, title)
        } else if (query_subject === course.subject) {
            score[5] = mySimilarity(query, course.course_num)
        }

        return score;
    };
}

function getCorrectCourseNum(query, term) {
    const course_num_match = course_num_regex.exec(query);
    if (course_num_match) {
        let subject = course_num_match[1];
        if (! (subject in models.short_subject_to_long_subject[term])) {
            if (subject in models.long_subject_to_short_subject[term]) {
                subject = models.long_subject_to_short_subject[term][subject];
            } else {
                return false;
            }
        }
        const before_num = course_num_match[2];
        let num = course_num_match[3];
        num = before_num === '' ? `0*${num}` : num;
        const after_num = course_num_match[4];
        return {
            subject: subject,
            regex: new RegExp(`^${subject}-${before_num}${num}${after_num}.*`)
        };
    }
    const course_num_match_2 = course_num_regex_2.exec(query);
    if (course_num_match_2) {
        let subject = course_num_match_2[1];
        if (! (subject in models.short_subject_to_long_subject[term])) {
            if (subject in models.long_subject_to_short_subject[term]) {
                subject = models.long_subject_to_short_subject[term][subject];
            } else {
                return false;
            }
        }
        return {
            subject: subject,
            regex: new RegExp(`^${subject}-${course_num_match_2[2]}`)
        };
    }
    return false;
}

const splitter_regex = /[\s/&,.:-]+|(?<=[A-Za-z])(?=\d)/;

function mySimilarity(a, b) {
    var aList = a.split(splitter_regex)
    var bList = b.split(splitter_regex)

    var score = aList.reduce(function(currVal, wordA) {
        var maximum = 0;
        for (var i = 0; i < bList.length; i++) {
            var sim = myWordSimilarity(wordA, bList[i]);
            if (sim > maximum)
                maximum = sim;
        }
        return currVal + maximum;
    }, 0) / aList.length;

    return score > 0.7 ? score : 0;
}

function myWordSimilarity(a, b) {
    var minLength = Math.min(a.length, b.length)
    var maxLeft = 0
    while (maxLeft < minLength && a[maxLeft] === b[maxLeft])
        maxLeft++;
    var maxRight = 0
    while (maxRight < minLength - maxLeft && a[a.length - 1 - maxRight] === b[b.length - 1 - maxRight])
        maxRight++;

    if (maxLeft > maxRight) {
        return maxLeft / (a.length + b.length) + 0.5;
    } else {
        return maxRight / (a.length + b.length);
    }
}

// function myWordSimilarity(a, b) {
//     var [length, [start_a, end_a], [start_b, end_b]] = longestCommonSubstringPositions(a, b);
//
//     var both_start_at_beginning = start_a === 0 && start_b === 0;
//     var both_end_at_end = end_a === a.length && end_b === b.length;
//
//     if (both_start_at_beginning) {
//         return length / (a.length + b.length) + 0.5;
//     } else if (both_end_at_end) {
//         return length / (a.length + b.length);
//     } else {
//         return length / (a.length + b.length);
//     }
// }


function longestCommonSubstringPositions(X, Y) {
    var m = X.length
    var n = Y.length

    var lCSuff = new Array(m+1);

    for (var i = 0; i < lCSuff.length; i++) {
        lCSuff[i] = new Array(n+1);
    }

    var length = 0;
    var x_end = -1;
    var y_end = -1;

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

function course_object_to_period_group(course, exclude_classes_with_no_days, accepted_statuses, cache, give_ids, section_accept_function, term) {
    /*
        course: models.Course
        exclude_classes_with_no_days: boolean
        accepted_statuses: array of strings, no duplicates, each element can be either 'O', 'C', or 'W'
        cache: boolean
        give_ids: boolean
        section_accept_function: function returning either true or false
    */
    const period_dict = {};
    for (const section of course.sections) {
        if (!exclude_classes_with_no_days || section.periods.length !== 0) {
            const assoc_class = section.assoc_class;
            const component = section.component;
            if (! (assoc_class in period_dict))
                // https://stackoverflow.com/q/2274242
                period_dict[assoc_class] = {[component]: []};
            else if (! (component in period_dict[assoc_class]))
                period_dict[assoc_class][component] = [];
            const status_ok = accepted_statuses.includes(section.status);
            if (status_ok && section_accept_function(section))
                period_dict[assoc_class][component].push(give_ids ? section.id : section);
        }
    }
    let class_components_group_9999 = null
    const assoc_class_period_groups = []
    for (const assoc_class in period_dict) {
        const class_components = []
        const assoc_class_dict = period_dict[assoc_class]
        for (const component in assoc_class_dict)
            class_components.push(new course_scheduler.PeriodGroup(assoc_class_dict[component], 'or', false, false, null, term))
        const class_components_group = new course_scheduler.PeriodGroup(class_components, 'and', true, false, null, term)
        if (assoc_class === '9999')
            class_components_group_9999 = class_components_group
        else
            assoc_class_period_groups.push(class_components_group)
    }
    let class_options = new course_scheduler.PeriodGroup(assoc_class_period_groups, 'or', false, false, null, term)
    if ('9999' in period_dict)
        class_options = new course_scheduler.PeriodGroup([class_components_group_9999, class_options], 'and', true, false, null, term)
    class_options.do_cache = cache;
    return class_options
}

module.exports = {
    get_classes_by_course_num: get_classes_by_course_num,
    get_classes_by_title: get_classes_by_title,
    get_classes_by_subject: get_classes_by_subject,
    get_search_results: get_search_results,
    course_object_to_period_group: course_object_to_period_group
};
