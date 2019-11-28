import json
import re
from course_scheduler import course_to_period_group

from models import *

def get_classes_by_course_num(course_num):
    return Course.query.filter_by(course_num=course_num).all()

def get_classes_by_title(course_title):
    return Course.query.filter_by(course_title=course_title).all()

def get_classes_by_subject(subject):
    return Course.query.filter_by(subject=subject).all()

