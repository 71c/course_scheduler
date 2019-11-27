import json
import re
from course_scheduler import course_to_period_group

with open('classes_data/classes Spring 2020.json') as json_file:
    classes_original = json.load(json_file)

classes_for_display = [
    {
        "course_num": c["course_num"],
        "course_title": c["course_title"],
        "desc_long": c["desc_long"]
    }
    for c in classes_original['searchResults']
]

def make_select_dict(items, key_function, value_function=lambda x: x):
    dictionary = {}
    for x in items:
        key = key_function(x)
        result = value_function(x)
        if key in dictionary:
            dictionary[key].append(result)
        else:
            dictionary[key] = [result]
    return dictionary

classes_groups_by_course_num = make_select_dict(
    classes_original['searchResults'],
    lambda c: c['course_num'],
    lambda c: course_to_period_group(c, only_consider_open_classes=False))

classes_for_display_by_course_num = make_select_dict(
    classes_for_display,
    lambda c: c['course_num'])

classes_for_display_by_course_title = make_select_dict(
    classes_for_display,
    lambda c: c['course_title'].lower())

classes_for_display_by_course_subject = make_select_dict(
    classes_for_display,
    lambda c: re.match('[a-z]+', c['course_num'].lower()).group())

def get_classes_by_course_num(course_num):
    if course_num in classes_for_display_by_course_num:
        return classes_for_display_by_course_num[course_num]
    return []

def get_classes_by_course_title(course_title):
    course_title = course_title.lower()
    if course_title in classes_for_display_by_course_title:
        return classes_for_display_by_course_title[course_title]
    return []

if __name__ == '__main__':
    print(get_classes_by_course_title('calculus iii'))
    # print(classes_for_display_by_course_title)
