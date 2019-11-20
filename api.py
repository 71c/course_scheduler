import json
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

classes_groups_by_course_num = {}
for c in classes_original['searchResults']:
    pg = course_to_period_group(c, only_consider_open_classes=False)
    course_num = c['course_num']
    if course_num in classes_groups_by_course_num:
        classes_groups_by_course_num[course_num].append(pg)
    else:
        classes_groups_by_course_num[course_num] = [pg]

classes_for_display_by_course_num = {}
for c in classes_for_display:
    course_num = c['course_num']
    if course_num in classes_for_display_by_course_num:
        classes_for_display_by_course_num[course_num].append(c)
    else:
        classes_for_display_by_course_num[course_num] = [c]

classes_for_display_by_course_title = {}
for c in classes_for_display:
    course_title = c['course_title'].lower()
    if course_num in classes_for_display_by_course_num:
        classes_for_display_by_course_num[course_title].append(c)
    else:
        classes_for_display_by_course_num[course_title] = [c]

def get_classes_by_course_num(course_num):
    if course_num in classes_for_display_by_course_num:
        return classes_for_display_by_course_num[course_num]
    return []

def get_classes_by_course_title(course_title):
    course_title = course_title.lower()
    if course_title in classes_for_display_by_course_num:
        return classes_for_display_by_course_num[course_title]
    return []
