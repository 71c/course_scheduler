# import datetime
from datetime import datetime
import re

day_or_time = re.compile('Mo|Tu|We|Th|Fr|\d?\d:\d\d[AP]M')
find_time = re.compile(
    '(?:(?:Mo|Tu|We|Th|Fr), )*(?:Mo|Tu|We|Th|Fr) \d?\d:\d\d[AP]M - \d?\d:\d\d[AP]M')


def remove_duplicates(a_list):
    new_list = []
    for x in a_list:
        if x not in new_list:
            new_list.append(x)
    return new_list


class CourseArrangement:
    def __init__(self, name, lecture_times, recitation_times, lab_times):
        self.name = name
        self.lecture_times = lecture_times
        self.recitation_times = recitation_times
        self.lab_times = lab_times

    def __repr__(self):
        return f'{self.name} {self.lecture_times} {self.recitation_times} {self.lab_times}'

    def intersects(self, other):
        for a in [self.lecture_times, self.recitation_times, self.lab_times]:
            for b in [other.lecture_times, other.recitation_times, other.lab_times]:
                if a is None:
                    continue
                if a.intersects(b):
                    return True
        return False


class Course:
    # allowed_recitation_by_lecture:
    # list of lists
    # length: number of lectures
    def __init__(self, name, lecture_times, recitation_times, lab_times, allowed_recitation_by_lecture=None):
        self.name = name
        self.lecture_times = remove_duplicates(lecture_times)
        self.lab_times = remove_duplicates(lab_times)
        self.recitation_times = remove_duplicates(recitation_times)
        if self.lab_times == []:
            self.lab_times = [None]
        if self.recitation_times == []:
            self.recitation_times = [None]
        if allowed_recitation_by_lecture is None:
            self.allowed_recitation_by_lecture = [
                list(range(len(self.recitation_times)))
                ] * len(self.lecture_times)
        else:
            self.allowed_recitation_by_lecture = allowed_recitation_by_lecture

    def __repr__(self):
        return self.name

    def all_possible_arrangements(self):
        arrangements = []
        for lecs_index, lecs in enumerate(self.lecture_times):
            for labs in self.lab_times:
                if labs is not None and lecs.intersects(labs):
                    continue
                for rcts_index, rcts in enumerate(self.recitation_times):
                    if rcts is not None:
                        if lecs is not None and lecs.intersects(rcts):
                            continue
                        if labs is not None and labs.intersects(rcts):
                            continue
                    if rcts_index in self.allowed_recitation_by_lecture[lecs_index]:
                        # arrangements.append([lecs, labs, rcts])
                        arrangements.append(CourseArrangement(
                            self.name, lecs, rcts, labs))
        return arrangements


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

    def intersects(self, other):
        if self is None or other is None:
            return False
        for period_1 in self.periods:
            for period_2 in other.periods:
                if period_1.intersects(period_2):
                    return True
        return False

    # @staticmethod
    # def intersects(a, b):
    #     if a is None or b is None:
    #         return False
    #     for period_1 in a.periods:
    #         for period_2 in b.periods:
    #             if period_1.intersects(period_2):
    #                 return True
    #     return False


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

    def intersects(self, other):
        return not (self.end_time < other.start_time or self.start_time > other.end_time)


def text_to_course(data, name, allowed_recitation_by_lecture=None):
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
bio_course = text_to_course(data, 'BIO-0013')
# no bio recitation (recitation is optional)
bio_course.recitation_times = [None]

bio_arrangements = bio_course.all_possible_arrangements()
math_arrangements = math_course.all_possible_arrangements()

for a in bio_arrangements:
    print(a)
print(len(bio_arrangements))
print()
for a in math_arrangements:
    print(a)
print(len(math_arrangements))

'''TODO: make method to find all possible arrangements of combining any number
of classes together'''

for x in bio_arrangements:
    for y in math_arrangements:
        print(x.intersects(y))

# 62 powderhouse 209 college
