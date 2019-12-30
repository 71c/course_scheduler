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
    }

    add_section(section) {
        this.sections.push(section);
    }
}
Course.currIds = {};

Course.prototype.toString = function courseToString() {
    return `<Course ${this.id}>`;
};

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
    }

    add_period(day, start_minutes, end_minutes) {
        this.periods.push({
            day: day,
            start: start_minutes,
            end: end_minutes
        });
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
Section.prototype.toString = function sectionToString() {
    return `<Section ${this.id}>`;
};

class SectionGroup {
    constructor(sections) {
        this.assoc_class = sections[0].assoc_class;
        this.component = sections[0].component;
        this.component_short = sections[0].component_short;
        this.periods = sections[0].periods;
        this.term = sections[0].term;
        this.id = SectionGroup.currIds[this.term]++;
        this.sections = sections.map(section => ({
            class_num: section.class_num,
            section_num: section.section_num,
            status: section.status
        }));
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
SectionGroup.currIds = {};
SectionGroup.prototype.toString = function sectionGroupToString() {
    return `<SectionGroup ${this.id}>`;
};

module.exports = {
    Course,
    Section,
    SectionGroup,
    courses: {},
    sections: {},
    term_to_code: {},
    reset: function(term) {
        this.courses[term] = [];
        this.sections[term] = [];
        Course.currIds[term] = 0;
        Section.currIds[term] = 0;
        SectionGroup.currIds[term] = 0;
    }
};
