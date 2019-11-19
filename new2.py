import re
import time
import urllib
import urllib.request
import json
import requests
from lxml import html

import os  
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import asyncio
import concurrent.futures

import aiohttp

import signal





def get_term_number(term):
    '''input: term: Spring 2020, Fall 2019, Summer 2019, Annual Term 2019-2020, Spring 2019, ...
    Returns a term number according to their wacky rules'''
    term = term.lower() 
    thing = re.search(r'(spring|summer|fall|spring|annual term) (\d{4})', term, flags=re.I)
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


async def get_datas(s, urls, class_nums):
    with concurrent.futures.ThreadPoolExecutor(max_workers=40) as executor:
        loop = asyncio.get_event_loop()
        futures = [
            loop.run_in_executor(
                executor, 
                s.get, 
                url
            )
            for url in urls
        ]
        o = dict()
        for class_num, response in zip(class_nums, await asyncio.gather(*futures)):
            o[class_num] = response.json()
        return o


def get_datas_2(s, urls, class_nums):
    with concurrent.futures.ThreadPoolExecutor(max_workers=30) as executor:
        results = executor.map(s.get, urls)
        o = dict()
        for class_num, response in zip(class_nums, results):
            o[class_num] = response.json()
        return o

def get_session():
    s = requests.Session()
    r = s.get('https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH#class_search')
    print('got session')
    return s


def get_classes_data(s, term):
    T = time.time()
    r = s.get(get_search_url(term))
    print('got to classes page')
    classes = r.json()
    print('got data')
    print("time taken:", time.time() - T)
    return classes


def get_data_with_requests_async(s, term, classes):
    T = time.time()
    urls = []
    class_nums = []
    for o in classes['searchResults']:
        for section in o['sections']:
            for component in section['components']:
                if component['class_num'] not in class_nums:
                    details_url = get_details_url(term, component['class_num'])
                    urls.append(details_url)
                    class_nums.append(component['class_num'])
    
    # loop = asyncio.get_event_loop()
    # details = loop.run_until_complete(get_datas(s, urls, class_nums))

    details = get_datas_2(s, urls, class_nums)
    
    print("Time taken:", time.time() - T)
    return details


def get_and_save_data(term):
    s = get_session()
    classes = get_classes_data(s, term)
    with open(f'classes {term}.json', 'w') as outfile:
        json.dump(classes, outfile, indent=4)
    details = get_data_with_requests_async(s, term, classes)
    with open(f'details {term}.json', 'w') as outfile:
        json.dump(details, outfile, indent=4)

# get_and_save_data('Fall 2019')



with open('classes Fall 2019.json') as json_file:
    classes = json.load(json_file)
s = get_session()
term = 'Fall 2019'

details = get_data_with_requests_async(s, term, classes)

with open(f'details {term}.json', 'w') as outfile:
    json.dump(details, outfile, indent=4)


# with open('classes Spring 2020.json') as json_file:
#     classes = json.load(json_file)
# for r in classes['searchResults']:
#     for section in r['sections']:
#         for component in section['components']:
#             if len(component['locations']) != 1:
#                 print(len(component['locations']))


# https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSearchresultsAll3?term=2202&career=ASE