const models = require('./models');
const course_scheduler = require('./course_scheduler');
const course_num_regex = /^([A-Za-z]{2,4})(?:-|\s*)([A-Za-z]{0,2})(\d{1,4})([A-Za-z]{0,2})$/;
const {default_compare} = require('./partial_sort');

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
    const course_num_match = course_num_regex.exec(query);
    if (course_num_match) {
        const subject = course_num_match[1];
        const before_num = course_num_match[2];
        const num = before_num === '' ?
            course_num_match[3].padStart(4, '0') :
            course_num_match[3];
        const after_num = course_num_match[4];
        const course_num = `${subject}-${before_num}${num}${after_num}`;
        const results = get_classes_by_course_num(course_num, term);
        if (results.length !== 0)
            return results;
    }

    const sortedCourses = [];
    const searchRankingFunction = getSearchRankingFunction(query);
    for (const course of models.courses[term]) {
        const score = searchRankingFunction(course);
        if (score[0] !== 0 || score[1] !== 0 || score[2] !== 0) {
            sortedCourses.push({
                score: score,
                course: course
            });
        }
    }
    sortedCourses.sort((a, b) => default_compare(b.score, a.score));
    return sortedCourses.map(x => x.course);
}

function getSearchRankingFunction(query) {
    const escapedQuery = escapeRegExp(query);
    const word_regex = new RegExp(`\\b${escapedQuery}\\b`, 'i');
    const first_regex = new RegExp(`^${escapedQuery}\\b`, 'i');
    return function(course) {
        if (course.subject === query) {
            return [1, 0, 0];
        }
        return [
            0,

            course.title.toUpperCase() === query ? 4 :
            first_regex.test(course.title) ? 3 :
            word_regex.test(course.title) ? 2 :
            course.title.toUpperCase().indexOf(query) !== -1 ? 1 :
            0,

            (course.subject_long || '').toUpperCase() === query ? 4 :
            first_regex.test(course.subject_long) ? 3 :
            word_regex.test(course.subject_long) ? 2 :
            (course.subject_long || '').toUpperCase().indexOf(query) !== -1 ? 1 :
            0
        ];
    };
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
