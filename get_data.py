import re
import time
import urllib
import json
import requests
import concurrent.futures
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry


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
    T = time.time()
    r = s.get(get_search_url(term))
    classes = r.json()
    return classes


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


def get_and_save_data(term, save_details=False):
    s = get_session()
    classes = get_classes_data(s, term)
    with open(f'classes_data/classes {term}.json', 'w') as outfile:
        json.dump(classes, outfile, indent=4)
    if save_details:
        details = get_data_with_requests(s, term, classes)
        with open(f'classes_data/details {term}.json', 'w') as outfile:
            json.dump(details, outfile, indent=4)

if __name__ == '__main__':
    # t = time.time()
    # get_and_save_data('Spring 2020')
    # print(time.time() - t)

    t = time.time()

    term = 'Spring 2020'
    s = get_session()
    r = s.get(get_search_url(term))
    with open(f'classes_data/classes {term}_.json', 'w') as outfile:
        outfile.write(r.text)

    print(time.time() - t)
