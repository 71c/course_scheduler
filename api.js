const models = require('./models');
const course_scheduler = require('./course_scheduler');
const course_num_regex = /^([A-Za-z]{2,4})(?:-|\s*)([A-Za-z]{0,2})(\d{1,4})([A-Za-z]{0,2})$/;

function get_classes_by_course_num(course_num) {
    return models.courses.filter(course => course.course_num === course_num);
}

function get_classes_by_title(title) {
    return models.courses.filter(course => course.title === title);
}

function get_classes_by_subject(subject) {
    return models.courses.filter(course => course.subject === subject);
}

function get_search_results(term) {
    term = term.trim().toUpperCase();
    const course_num_match = course_num_regex.exec(term);
    if (course_num_match) {
        const subject = course_num_match[1];
        const before_num = course_num_match[2];
        const num = before_num === '' ?
            course_num_match[3].padStart(4, '0') :
            course_num_match[3];
        const after_num = course_num_match[4];
        const course_num = `${subject}-${before_num}${num}${after_num}`;
        const results = get_classes_by_course_num(course_num);
        console.log(course_num);
        console.log(results);
        if (results.length !== 0)
            return results;
    }
    if (/[a-zA-Z]{2,4}/.exec(term)) {
        const results = get_classes_by_subject(term);
        if (results.length !== 0)
            return results;
    }
    const text_before_or_after = new RegExp(`\b${term}\b`, 'i');
    const results_first = [];
    const results_second = [];
    for (const course of models.courses) {
        if (course.subject_long.toUpperCase() === term)
            results_first.push(course);
        else if (text_before_or_after.test(course.subject_long))
            results_second.push(course);
    }
    if (results_first.length !== 0 || results_second.length !== 0)
        return results_first.concat(results_second);
    for (const course of models.courses) {
        if (course.title.toUpperCase() === term)
            results_first.push(course);
        else if (text_before_or_after.test(course.title))
            results_second.push(course);
    }
    if (results_first.length !== 0 || results_second.length !== 0)
        return results_first.concat(results_second);
    return [];
}

// function course_object_to_period_group(course, exclude_classes_with_no_days=true, accepted_statuses=['O']) {
//     const period_dict = {}
//     for (let section of course.sections) {
//         if (section.status in accepted_statuses && ! (exclude_classes_with_no_days && section.periods.length === 0)) {
//             const assoc_class = section.assoc_class
//             const coponent = section.component
//             if (assoc_class in period_dict) {
//                 if (section.component in period_dict[assoc_class])
//                     period_dict[assoc_class][component].push(section)
//                 else
//                     period_dict[assoc_class][component] = [section]
//             } else
//                 period_dict[assoc_class] = {component: [section]}
//         }
//     }
//     let class_components_group_9999 = null
//     const assoc_class_period_groups = []
//     for (const key in period_dict) {
//         const class_components = []
//         for (const key2 in assoc_class_dict)
//             class_components.push(new course_scheduler.PeriodGroup(assoc_class_dict[key2], 'or'))
//         const class_components_group = new course_scheduler.PeriodGroup(class_components, 'and', true)
//         if (key === '9999')
//             class_components_group_9999 = class_components_group
//         else
//             assoc_class_period_groups.push(class_components_group)
//     }
//     let class_options = new course_scheduler.PeriodGroup(assoc_class_period_groups, 'or')
//     if ('9999' in period_dict)
//         class_options = new course_scheduler.PeriodGroup([class_components_group_9999, class_options], 'and', true)
//     class_options.data = course.course_num
//     return class_options
// }


// function course_object_to_period_group(course, exclude_classes_with_no_days=true, accepted_statuses=['O']) {
//     const period_dict = {}
//     console.log(`(transforming course to period group) course: ${course}`)
//     for (const section of course.sections) {
//         console.log(section);
//         let a = false;
//         for (const s of accepted_statuses)
//             if (s === section.status)
//                 a = true;
//         const b = ! (exclude_classes_with_no_days && section.periods.length === 0);
//         if (a && b) {
//             const assoc_class = section.assoc_class
//             const component = section.component
//             if (assoc_class in period_dict) {
//                 if (component in period_dict[assoc_class])
//                     period_dict[assoc_class][component].push(section)
//                 else
//                     period_dict[assoc_class][component] = [section]
//             } else {
//                 // https://stackoverflow.com/q/2274242
//                 period_dict[assoc_class] = {[component]: [section]}
//             }
//             console.log("PD")
//             console.log(period_dict)
//         }
//     }
//     let class_components_group_9999 = null
//     const assoc_class_period_groups = []
//     for (const key in period_dict) {
//         const class_components = []
//         const assoc_class_dict = period_dict[key]
//         for (const key2 in assoc_class_dict)
//             class_components.push(new course_scheduler.PeriodGroup(assoc_class_dict[key2], 'or'))
//         const class_components_group = new course_scheduler.PeriodGroup(class_components, 'and', true)
//         if (key === '9999')
//             class_components_group_9999 = class_components_group
//         else
//             assoc_class_period_groups.push(class_components_group)
//     }
//     let class_options = new course_scheduler.PeriodGroup(assoc_class_period_groups, 'or')
//     if ('9999' in period_dict)
//         class_options = new course_scheduler.PeriodGroup([class_components_group_9999, class_options], 'and', true)
//     class_options.data = course.course_num
//     return class_options
// }


function course_object_to_period_group(course, exclude_classes_with_no_days=true, accepted_statuses=['O']) {
    const period_dict = {}
    for (const section of course.sections) {
        if (! (exclude_classes_with_no_days && section.periods.length === 0)) {
            let status_ok = accepted_statuses.includes(section.status);
            const assoc_class = section.assoc_class;
            const component = section.component;
            
            // if (status_ok) {
            //     if (assoc_class in period_dict) {
            //         if (component in period_dict[assoc_class])
            //             period_dict[assoc_class][component].push(section)
            //         else
            //             period_dict[assoc_class][component] = [section]
            //     } else {
            //         // https://stackoverflow.com/q/2274242
            //         period_dict[assoc_class] = {[component]: [section]}
            //     }
            // } else {
            //     if (assoc_class in period_dict) {
            //         if (! (component in period_dict[assoc_class]))
            //             period_dict[assoc_class][component] = []
            //     } else {
            //         period_dict[assoc_class] = {[component]: []}
            //     }
            // }

            // if (status_ok) {
            //     if (! (assoc_class in period_dict))
            //         period_dict[assoc_class] = {[component]: [section]};
            //     else if (! (component in period_dict[assoc_class]))
            //         period_dict[assoc_class][component] = [section];
            //     else
            //         period_dict[assoc_class][component].push(section);
            // } else {
            //     if (! (assoc_class in period_dict))
            //         period_dict[assoc_class] = {[component]: []};
            //     else if (! (component in period_dict[assoc_class]))
            //         period_dict[assoc_class][component] = [];
            // }

            if (! (assoc_class in period_dict))
                // https://stackoverflow.com/q/2274242
                period_dict[assoc_class] = {[component]: []};
            else if (! (component in period_dict[assoc_class]))
                period_dict[assoc_class][component] = [];
            if (status_ok)
                period_dict[assoc_class][component].push(section);
        }
    }
    let class_components_group_9999 = null
    const assoc_class_period_groups = []
    for (const key in period_dict) {
        const class_components = []
        const assoc_class_dict = period_dict[key]
        for (const key2 in assoc_class_dict)
            class_components.push(new course_scheduler.PeriodGroup(assoc_class_dict[key2], 'or'))
        const class_components_group = new course_scheduler.PeriodGroup(class_components, 'and', true)
        if (key === '9999')
            class_components_group_9999 = class_components_group
        else
            assoc_class_period_groups.push(class_components_group)
    }
    let class_options = new course_scheduler.PeriodGroup(assoc_class_period_groups, 'or')
    if ('9999' in period_dict)
        class_options = new course_scheduler.PeriodGroup([class_components_group_9999, class_options], 'and', true)
    class_options.data = course.course_num
    return class_options
}

module.exports = {
    get_classes_by_course_num: get_classes_by_course_num,
    get_classes_by_title: get_classes_by_title,
    get_classes_by_subject: get_classes_by_subject,
    get_search_results: get_search_results,
    course_object_to_period_group: course_object_to_period_group
};
