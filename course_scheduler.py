# import datetime
from datetime import datetime
import re

day_or_time = re.compile('Mo|Tu|We|Th|Fr|\d?\d:\d\d[AP]M')
find_times = re.compile('(?:(?:(?:Mo|Tu|We|Th|Fr), )*(?:Mo|Tu|We|Th|Fr) \d?\d:\d\d[AP]M - \d?\d:\d\d[AP]M\n)+')
find_time = re.compile('(?:(?:Mo|Tu|We|Th|Fr), )*(?:Mo|Tu|We|Th|Fr) \d?\d:\d\d[AP]M - \d?\d:\d\d[AP]M')


def remove_duplicates(a_list):
    new_list = []
    for x in a_list:
        if x not in new_list:
            new_list.append(x)
    return new_list


class Course:
    # allowed_recitation_by_lecture:
    # list of lists
    # length: number of lectures
    def __init__(self, name, lecture_times, recitation_times, lab_times, allowed_recitation_by_lecture):
        self.name = name
        self.lecture_times = remove_duplicates(lecture_times)
        self.lab_times = remove_duplicates(lab_times)
        self.recitation_times = remove_duplicates(recitation_times)
        if self.lab_times == []:
            self.lab_times = [None]
        if self.recitation_times == []:
            self.recitation_times = [None]
        self.allowed_recitation_by_lecture = allowed_recitation_by_lecture

    def __repr__(self):
        return self.name


class ClassTimes:
    def __init__(self, class_time_list):
        self.periods = class_time_list

    @classmethod
    def class_times(cls, times_string, kind):
        times_strings = times_string.splitlines()
        times_strings = [s.strip() for s in times_strings]
        times_strings = [day_or_time.findall(s) for s in times_strings]
        periods = []
        for times_string in times_strings:
            days, time_period = times_string[:-2], times_string[-2:]
            start_time = datetime.strptime(time_period[0], '%I:%M%p').time()
            end_time = datetime.strptime(time_period[1], '%I:%M%p').time()
            for day in days:
                periods.append(ClassTime(start_time, end_time, day, kind))
        return cls(periods)

    def __repr__(self):
        return str(self.periods)

    def __eq__(self, value):
        if len(self.periods) == len(value.periods):
            for me_period in self.periods:
                if me_period not in value.periods:
                    return False
                return True
        return False


class ClassTime:
    def __init__(self, start_time, end_time, day, kind):
        self.start_time = start_time
        self.end_time = end_time
        self.day = day
        self.kind = kind

    def __repr__(self):
        return f'{self.kind} {self.day} {self.start_time} - {self.end_time}'

    def __eq__(self, value):
        return self.start_time == value.start_time and self.end_time == value.end_time and self.day == value.day and self.kind == value.kind



def text_to_course(data, name, allowed_recitation_by_lecture):
    infos = []
    lines = data.splitlines()
    for line in lines:
        if re.search('-(LEC|RCT|LAB)$', line):
            infos.append({'kind': line[-3:]})
        elif find_time.match(line):
            if 'time' in infos[-1]:
                infos[-1]['time'] += '\n' + line
            else:
                infos[-1]['time'] = line
        elif line == 'Time Not Specified':
            infos.pop()
    lecture_times = []
    recitation_times = []
    lab_times = []
    for info in infos:
        class_times = ClassTimes.class_times(info['time'], info['kind'])
        if info['kind'] == 'LEC':
            lecture_times.append(class_times)
        elif info['kind'] == 'LAB':
            lab_times.append(class_times)
        elif info['kind'] == 'RCT':
            recitation_times.append(class_times)
    return Course(name, lecture_times, recitation_times, lab_times, allowed_recitation_by_lecture)


with open('math42.txt') as f:
    data = f.read()
allowed_recitation_by_lecture = [[0, 1, 2], [3, 4, 5], [6, 7, 8]]
math_course = text_to_course(data, 'MATH-0042', allowed_recitation_by_lecture)

with open('bio13.txt') as f:
    data = f.read()
allowed_recitation_by_lecture = [list(range(17))]
bio_course = text_to_course(data, 'BIO-0013', allowed_recitation_by_lecture)

# for lecs in bio_course.lecture_times:
#     for labs in bio_course.lab_times:
#         for rcts in bio_course.recitation_times:
#             print(lecs, labs, rcts)

n = 0
# for lecs_bio in bio_course.lecture_times:
#     for labs_bio in bio_course.lab_times:
#         for rcts_bio in bio_course.recitation_times:
#             for lecs_calc in math_course.lecture_times:
#                 for labs_calc in math_course.lab_times:
#                     for rcts_calc in math_course.recitation_times:
#                         print(labs_bio, lecs_calc, rcts_calc)
#                         n += 1

for lecs_bio in bio_course.lecture_times:
    for labs_bio in bio_course.lab_times:
        for rcts_bio in bio_course.recitation_times:
            for lecs_index, lecs_calc in enumerate(math_course.lecture_times):
                for labs_calc in math_course.lab_times:
                    for rcts_index, rcts_calc in enumerate(math_course.recitation_times):
                        if rcts_index in math_course.allowed_recitation_by_lecture[lecs_index]:
                            print(labs_bio, lecs_calc, rcts_calc)
                            n += 1

print(n)

# 62 powderhouse 209 college
