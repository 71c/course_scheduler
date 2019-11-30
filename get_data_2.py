import os
import re
import time
import urllib
import json
import requests
import concurrent.futures
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

from models import *


GET_SESSION_URL = 'https://sis.uit.tufts.edu/psc/paprd/EMPLOYEE/EMPL/s/WEBLIB_TFP_PG.ISCRIPT2.FieldFormula.IScript_AutoLogOut'
term_parser = re.compile(r'(spring|summer|fall|spring|annual term) (\d{4})', flags=re.I)


def get_term_number(term):
    '''input: term: Spring 2020, Fall 2019, Summer 2019, Annual Term 2019-2020, Spring 2019, ...
    Returns a term number according to their wacky rules'''
    term = term.lower() 
    thing = term_parser.search(term)
    period = thing.group(1)
    year = thing.group(2)
    return year[0] + year[2:] + {
        'spring': '2',
        'annual term': '4',
        'summer': '5',
        'fall': '8'
    }[period]


def get_search_url(term, career='ALL'):
    url = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSearchresultsAll3?'
    params = {'term': get_term_number(term), 'career': career}
    return url + urllib.parse.urlencode(params)


def get_details_url(term, class_num):
    url = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getResultsDetails?'
    params = {'term': get_term_number(term), 'class_num': class_num}
    return url + urllib.parse.urlencode(params)


def get_course_subjects_url(term, career='ALL'):
    url = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSubjects?'
    params = {'term': get_term_number(term), 'career': career}
    return url + urllib.parse.urlencode(params)


def get_datas(s, urls, class_nums):
    with concurrent.futures.ThreadPoolExecutor(max_workers=40) as executor:
        results = executor.map(s.get, urls)
        o = dict()
        for class_num, response in zip(class_nums, results):
            o[class_num] = response.json()
        return o


def get_session():
    s = requests.Session()
    r = s.get(GET_SESSION_URL)
    retry = Retry(connect=3, backoff_factor=0.5)
    adapter = HTTPAdapter(max_retries=retry)
    s.mount('http://', adapter)
    s.mount('https://', adapter)
    return s


def get_classes_data(s, term):
    r = s.get(get_search_url(term))
    return r.json()['searchResults']


def get_data_with_requests(s, term, classes):
    urls = []
    class_nums = []
    for o in classes['searchResults']:
        for section in o['sections']:
            for component in section['components']:
                if component['class_num'] not in class_nums:
                    details_url = get_details_url(term, component['class_num'])
                    urls.append(details_url)
                    class_nums.append(component['class_num'])

    details = get_datas(s, urls, class_nums)
    return details


def get_and_save_data(term):
    s = get_session()
    courses = get_classes_data(s, term)
    
    course_subjects = s.get(get_course_subjects_url(term)).json()
    long_subject_dict = {x['value']: x['desc'][len(x['value'])+3:]
            for x in course_subjects}
    
    db.drop_all()
    db.create_all()
    
    courses_objects = []
    for course_data in courses:
        course_num = course_data['course_num']
        title = course_data['course_title']
        desc_long = course_data['desc_long']
        subject = re.match(r'[A-Z]+', course_num).group()
        subject_long = long_subject_dict[subject]
        course = Course(course_num=course_num, subject=subject,
            subject_long=subject_long, title=title,
            desc_long=desc_long)
        courses_objects.append(course)
    db.session.bulk_save_objects(courses_objects)
    # db.session.add_all(courses_objects)
    courses_objects = Course.query.all()
    sections_objects = []
    for course, course_data in zip(courses_objects, courses):
        for section in course_data['sections']:
            comp_desc = section['comp_desc']
            for component_data in section['components']:
                assoc_class = component_data['assoc_class']
                class_num = component_data['class_num']
                comp_desc_short = component_data['ssr_comp']
                section_num = component_data['section_num']
                component_short = component_data['ssr_comp']
                status = component_data['status']
                section = Section(class_num=class_num, section_num=section_num,
                    assoc_class=assoc_class, component=comp_desc,
                    component_short=component_short, status=status,
                    course_id=course.id)
                sections_objects.append(section)
    db.session.bulk_save_objects(sections_objects)
    # db.session.add_all(sections_objects)
    sections_objects = Section.query.all()
    index = 0
    periods_objects = []
    for course_data in courses:
        for section in course_data['sections']:
            for component_data in section['components']:
                for location in component_data['locations']:
                    for meeting in location['meetings']:
                        for day in meeting['days']:
                            period = Period(
                                day=day,
                                meet_start_min=meeting['meet_start_min'],
                                meet_end_min=meeting['meet_end_min'],
                                section_id=sections_objects[index].id)
                            periods_objects.append(period)
                index += 1
    db.session.bulk_save_objects(periods_objects)
    # db.session.add_all(periods_objects)
    db.session.commit()


if __name__ == '__main__':
    # t = time.time()
    # get_and_save_data('Spring 2020')
    # print(time.time() - t)

    # t = time.time()

    # term = 'Spring 2020'
    # s = get_session()
    # r = s.get(get_search_url(term))
    # with open(f'classes_data/classes {term}_.json', 'w') as outfile:
    #     outfile.write(r.text)

    # print(time.time() - t)

    r = requests.get(GET_SESSION_URL)
    print(r.headers)
    print(r.cookies)
    v = requests.get(get_search_url('Spring 2020'), headers=r.headers);
    print(v.text)
