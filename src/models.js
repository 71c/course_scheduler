class Course {
    constructor(course_num, subject, subject_long, title, desc_long) {
        this.id = Course.currId++;
        this.course_num = course_num;
        this.subject = subject;
        this.subject_long = subject_long;
        this.title = title;
        this.desc_long = desc_long;
        this.sections = [];
    }

    add_section(section) {
        this.sections.push(section);
    }
}
Course.currId = 0;
// Course.currIds = {};

Course.prototype.toString = function courseToString() {
  return `<Course ${this.id}>`;
}

class Section {
    constructor(class_num, section_num, assoc_class, component, component_short, status, periods=[]) {
        this.id = Section.currId++;
        this.class_num = class_num;
        this.section_num = section_num;
        this.assoc_class = assoc_class;
        this.component = component;
        this.component_short = component_short;
        this.status = status;
        this.periods = periods;
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
Section.currId = 0;
// Section.currIds = {};
Section.prototype.toString = function sectionToString() {
  return `<Section ${this.id}>`;
}

module.exports = {
    Course: Course,
    Section: Section,
    courses: [],
    sections: [],
    reset: function() {
        this.courses = [];
        this.sections = [];
        Course.currId = 0;
        Section.currId = 0;
    }
};

// module.exports = {
//     Course: Course,
//     Section: Section,
//     courses: {},
//     sections: {},
//     reset: function(term) {
//         this.courses[term] = [];
//         this.sections[term] = [];
//         Course.currIds[term] = 0;
//         Section.currIds[term] = 0;
//     }
// };
