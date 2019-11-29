import json
import re
from course_scheduler import PeriodGroup
from sqlalchemy import or_, and_

from models import *

course_num_regex = re.compile(r'([A-Za-z]{2,4})(?:-|\s*)([A-Za-z]{0,2})(\d{1,4})([A-Za-z]{0,2})$')

def get_classes_by_course_num(course_num):
    return Course.query.filter_by(course_num=course_num).all()

def get_classes_by_title(title):
    return Course.query.filter_by(title=title).all()

def get_classes_by_subject(subject):
    return Course.query.filter_by(subject=subject).all()


def get_search_results(term):
    term = term.strip()
    course_num_match = course_num_regex.match(term)
    if course_num_match:
        subject = course_num_match.group(1).upper()
        before_num = course_num_match.group(2).upper()
        num = int(course_num_match.group(3))
        after_num = course_num_match.group(4).upper()
        if before_num == '':
            s = f'{subject}-{num:04}{after_num}'
        else:
            s = f'{subject}-{before_num}{num}{after_num}'
        results = Course.query.filter_by(course_num=s).all()
        if len(results) != 0:
            return results
    
    if re.match(r'[a-zA-Z]{2,4}$', term):
        results = Course.query.filter_by(subject=term.upper()).all()
        if len(results) != 0:
            return results

    results = Course.query.filter(Course.subject_long.ilike(term)).all()
    results.extend(
        Course.query.filter(Course.subject_long.ilike(term+' %')).all()
    )
    results.extend(
        Course.query.filter(Course.subject_long.ilike('% '+term)).all()
    )
    results.extend(
        Course.query.filter(Course.subject_long.ilike('% '+term+' %')).all()
    )
    if len(results) != 0:
        return results

    results = Course.query.filter(Course.title.ilike(term)).all()
    results.extend(
        Course.query.filter(Course.title.ilike(term+' %')).all()
    )
    results.extend(
        Course.query.filter(Course.title.ilike('% '+term)).all()
    )
    results.extend(
        Course.query.filter(Course.title.ilike('% '+term+' %')).all()
    )
    if len(results) != 0:
        return results

    return []


def course_object_to_period_group(course, exclude_classes_with_no_days=True, accepted_statuses=('O',)):
    period_dict = {}
    for section in course.sections:
        if section.status in accepted_statuses and not (exclude_classes_with_no_days and len(section.periods) == 0):
            assoc_class, component = section.assoc_class, section.component
            if assoc_class in period_dict:
                if section.component in period_dict[assoc_class]:
                    period_dict[assoc_class][component].append(section)
                else:
                    period_dict[assoc_class][component] = [section]
            else:
                period_dict[assoc_class] = {component: [section]}

    class_components_group_9999 = None
    assoc_class_period_groups = []
    for key, assoc_class_dict in period_dict.items():
        class_components = []
        for period_groups in assoc_class_dict.values():
            class_components.append(PeriodGroup(period_groups, 'or'))
        class_components_group = PeriodGroup(class_components, 'and', True)
        if key == '9999':
            class_components_group_9999 = class_components_group
        else:
            assoc_class_period_groups.append(class_components_group)
    class_options = PeriodGroup(assoc_class_period_groups, 'or')
    if '9999' in period_dict:
        class_options = PeriodGroup([class_components_group_9999, class_options], 'and', True)
    class_options.data = course.course_num
    return class_options
