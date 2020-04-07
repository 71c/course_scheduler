const assert = require('assert').strict;

const course_num_regex = /^([A-Z]{2,4})(?:-|\s*)([A-Z]{0,3})(\d{3,4})([A-Z]{0,2})$/;

// https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

class Course {
    constructor(course_num, subject, subject_long, title, desc_long, term) {
        this.id = Course.currIds[term]++;
        this.course_num = course_num;
        this.subject = subject;
        this.subject_long = subject_long;
        this.title = title;
        this.desc_long = desc_long;
        this.sections = [];
        this.term = term;

        const course_num_match = course_num_regex.exec(course_num);
        if (course_num_match) {
            assert.equal(course_num_match[1], subject);
            const before_num = course_num_match[2];

            const num = course_num_match[3];
            const num_no_padding = parseInt(num, 10) + '';
            const after_num = course_num_match[4];
            const regexString = `\\b(${subject}|${escapeRegExp(subject_long)})(?:-|\\s*)${before_num}0*${num_no_padding}${after_num}\\b`;
            this.includes_course_num_variant_regex = new RegExp(regexString, 'i');
        } else {
            const parts = course_num.split('-');
            assert.equal(parts.length, 2);
            this.includes_course_num_variant_regex = new RegExp(`\\b(${parts[0]}|${escapeRegExp(subject_long)})(?:-|\\s+)${parts[1]}\\b`, 'i');
        }

        this.begins_with_long_subject_words_regex = new RegExp(`^${subject_long}\\b`, 'i');
        this.includes_long_subject_words_regex = new RegExp(`\\b${subject_long}\\b`, 'i');
        this.begins_with_subject_words_regex = new RegExp(`^${subject}\\b`, 'i');
        this.includes_subject_words_regex = new RegExp(`\\b${subject}(\\b|\\d)`, 'i');
    }

    courseNumVariantIncludedInString(s) {
        return this.includes_course_num_variant_regex.test(s);
    }

    add_section(section) {
        this.sections.push(section);
    }
}
Course.currIds = {};

class Section {
    constructor(class_num, section_num, assoc_class, component, component_short, status, term, periods=[]) {
        this.id = Section.currIds[term]++;
        this.class_num = class_num;
        this.section_num = section_num;
        this.assoc_class = assoc_class;
        this.component = component;
        this.component_short = component_short;
        this.status = status;
        this.periods = periods;
        this.term = term;
        this.instructors = [];
    }

    add_period(day, start_minutes, end_minutes, instructor) {
        this.periods.push({
            day: day,
            start: start_minutes,
            end: end_minutes,
            instructor: instructor
        });
        if (!this.instructors.includes(instructor)) {
            this.instructors.push(instructor);
        }
    }

    evaluate() {
        return [this];
    }

    intersects(other) {
        for (const period_1 of this.periods) {
            for (const period_2 of other.periods) {
                if (period_2.day === period_1.day && period_1.start <= period_2.end && period_1.end >= period_2.start) {
                    return true;
                }
            }
        }
        return false;
    }
}
Section.currIds = {};

module.exports = {
    Course,
    Section,
    courses: {},
    sections: {},
    term_to_code: {},
    reset: function(term) {
        this.courses[term] = [];
        this.sections[term] = [];
        Course.currIds[term] = 0;
        Section.currIds[term] = 0;
        this.long_subject_to_short_subject[term] = {};
        this.short_subject_to_long_subject[term] = {};
    },
    long_subject_to_short_subject: {},
    short_subject_to_long_subject: {}
};
