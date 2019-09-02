# import datetime
from datetime import datetime, time, date
import re
import math
import numpy as np

day_or_time = re.compile('Mo|Tu|We|Th|Fr|\d?\d:\d\d[AP]M')
find_time = re.compile(
    '(?:(?:Mo|Tu|We|Th|Fr), )*(?:Mo|Tu|We|Th|Fr) \d?\d:\d\d[AP]M - \d?\d:\d\d[AP]M')
weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr']


def remove_duplicates(a_list):
    new_list = []
    for x in a_list:
        if x not in new_list:
            new_list.append(x)
    return new_list


# class CourseArrangementCombination:
#     def __init__(self, course_arrangements):
#         self.course_arrangements = course_arrangements
#
#     def score_by_gap_times(self, start_time, end_time, f):
#         print((self.lecture_times))
#         # for day in weekdays:
#         #     lectures = [l for l in self.lecture_times if l]


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
                if ClassTimes.intersects(a, b):
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
        self.recitation_times = (recitation_times)
        if self.lab_times == []:
            self.lab_times = [None]
        if self.recitation_times == []:
            self.recitation_times = [None]
        if allowed_recitation_by_lecture is None:
            self.allowed_recitation_by_lecture = [
                [True] * len(self.recitation_times)
                ] * len(self.lecture_times)
        else:
            self.allowed_recitation_by_lecture = allowed_recitation_by_lecture

    def __repr__(self):
        return self.name

    def all_possible_arrangements(self):
        arrangements = []
        for lecs_index, lecs in enumerate(self.lecture_times):
            for labs in self.lab_times:
                if ClassTimes.intersects(lecs, labs):
                    continue
                for rcts_index, rcts in enumerate(self.recitation_times):
                    if ClassTimes.intersects(lecs, rcts) or ClassTimes.intersects(labs, rcts):
                        continue
                    if self.allowed_recitation_by_lecture[lecs_index][rcts_index]:
                        arrangements.append(CourseArrangement(
                            self.name, lecs, rcts, labs))
        return arrangements

    def filter_classes(self, f):
        i = 0
        while i < len(self.lecture_times):
            lecs = self.lecture_times[i]
            if not ClassTimes.periods_satisfy_condition(lecs, f):
                self.lecture_times.pop(i)
                self.allowed_recitation_by_lecture.pop(i)
                continue
            i += 1
        i = 0
        while i < len(self.recitation_times):
            rcts = self.recitation_times[i]
            if not ClassTimes.periods_satisfy_condition(rcts, f):
                self.recitation_times.pop(i)
                for row in self.allowed_recitation_by_lecture:
                    row.pop(i)
                continue
            i += 1
        i = 0
        while i < len(self.lab_times):
            labs = self.lab_times[i]
            if not ClassTimes.periods_satisfy_condition(labs, f):
                self.lab_times.pop(i)
                continue
            i += 1


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

    @staticmethod
    def intersects(a, b):
        if a is None or b is None:
            return False
        for period_1 in a.periods:
            for period_2 in b.periods:
                if period_1.intersects(period_2):
                    return True
        return False

    # def periods_satisfy_condition(self, f):
    #     for period in self.periods:
    #         if not f(period):
    #             return False
    #     return True

    @staticmethod
    def periods_satisfy_condition(periods, f):
        if periods is None:
            return True
        for period in periods.periods:
            if not f(period):
                return False
        return True


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
        return self.day == other.day and not (self.end_time < other.start_time or self.start_time > other.end_time)


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


def combine_course_arrangements(combinations, arrangements):
    new_combinations = []
    for c in combinations:
        for a_new in arrangements:
            # check that a_new does not intersect any of a in c
            new_combo_works = True
            for a in c:
                if a_new.intersects(a):
                    new_combo_works = False
                    break
            if new_combo_works:
                new_combinations.append(c + [a_new])
    return new_combinations


def class_combinations(classes):
    combinations = [[]]
    for c in classes:
        a = c.all_possible_arrangements()
        combinations = combine_course_arrangements(combinations, a)
    return combinations


def score_by_gap_times(arrangements, start_time, end_time, f_between, f_begin, f_end):
    total_minutes = 0
    for day in weekdays:
        day_blocks = []
        for arrangement in arrangements:
            for times in [arrangement.lecture_times, arrangement.recitation_times, arrangement.lab_times]:
                if times is not None:
                    for period in times.periods:
                        if period.day == day:
                            day_blocks.append(period)
        day_blocks.sort(key=lambda block: block.start_time)

        gaps_minutes = []
        last_time = start_time
        for block in day_blocks:
            gap_duration = datetime.combine(date.today(), block.start_time) - datetime.combine(date.today(), last_time)
            gaps_minutes.append(gap_duration.total_seconds() / 60)
            last_time = block.end_time
        gap_duration = datetime.combine(date.today(), end_time) - datetime.combine(date.today(), last_time)
        gaps_minutes.append(gap_duration.total_seconds() / 60)

        total_classtime = sum([(datetime.combine(date.today(), block.end_time) - datetime.combine(date.today(), block.start_time)).total_seconds()/60 for block in day_blocks])

        # print(gaps_minutes)
        a = [f_begin(gaps_minutes[0])] + [f_between(gap_minutes) for gap_minutes in gaps_minutes[1:-1]] + [f_end(gaps_minutes[-1])]
        # print(a)
        # print()
        total_minutes += sum(a)
    return total_minutes


def get_day_class_lengths(arrangements):
    minute_counts = []
    for day in weekdays:
        day_blocks = []
        for arrangement in arrangements:
            for times in [arrangement.lecture_times, arrangement.recitation_times, arrangement.lab_times]:
                if times is not None:
                    for period in times.periods:
                        if period.day == day:
                            day_blocks.append(period)
        day_blocks.sort(key=lambda block: block.start_time)
        total_classtime = sum([(datetime.combine(date.today(), block.end_time) - datetime.combine(date.today(), block.start_time)).total_seconds()/60 for block in day_blocks])
        minute_counts.append(total_classtime)
    return np.array(minute_counts)# / sum(minute_counts)


def course_from_file(file_name, course_name, allowed_recitation_by_lecture=None):
    with open(file_name) as f:
        data = f.read()
    return text_to_course(data, course_name, allowed_recitation_by_lecture)


allowed_recitation_by_lecture = [
    [1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1]
]
math42 = course_from_file('math42.txt', 'MATH-0042',
                          allowed_recitation_by_lecture)
bio13 = course_from_file('bio13.txt', 'BIO-0013')
# no bio recitation (recitation is optional)
bio13.recitation_times = [None]
chem1 = course_from_file('chem1.txt', 'CHEM-0001')
en1_1 = course_from_file('en1-1.txt', 'EN-0001')
en1_9 = course_from_file('en1-9.txt', 'EN-0001')
eng1 = course_from_file('eng1.txt', 'ENG-0001')


def period_is_between_hours(period, start, end):
    return period.start_time >= start and period.end_time <= end


courses = [math42, bio13, en1_1, eng1]
# courses = [math42, chem1, en1_9, eng1]
# courses = [math42, bio13, en1_9, eng1]
# start, stop = time(10), time(19)
start, stop = time(10), time(21)
# start, stop = time(12), time(18)


def filter_function(p): return period_is_between_hours(p, start, stop)


for course in courses:
    course.filter_classes(filter_function)

combinations = class_combinations(courses)

def S(x):
    if x < 0:
        return 0
    if x > 1:
        return 1
    return 6*x**5 - 15*x**4 + 10*x**3
# a, b = 20, 40
a, b = 25, 55
# a, b = 40, 90
f_between = lambda m: m * S((m - a)/(b - a)) - 120 * math.exp(-m/7) - 100000 * math.exp(-m/2)
f_begin = lambda m: m * S((m - a)/(b - a)) # - 120 * math.exp(-m/7) - 100000 * math.exp(-m/2)
f_end = lambda m: m * S((m - a)/(b - a))
# f_end = lambda m: m

# f = lambda m: 1 if m < 15 else 0


scores = []
for combination in combinations:
    scores.append(score_by_gap_times(combination, time(10), time(21), f_between, f_begin, f_end))
print(scores)


# combinations.sort(key=lambda x: -score_by_gap_times(x, time(10), time(21), f_between, f_begin, f_end))
# get_day_class_lengths(arrangements)


combinations.sort(key=lambda x: -(score_by_gap_times(x, time(10), time(21), f_between, f_begin, f_end) - np.mean(scores)) / np.std(scores, ddof=1) + max(get_day_class_lengths(x))/sum(get_day_class_lengths(x)))

# combinations.sort(key=lambda x: -(score_by_gap_times(x, time(10), time(21), f_between, f_begin, f_end) - np.mean(scores)) / np.std(scores, ddof=1) + np.std(get_day_class_lengths(x)/sum(get_day_class_lengths(x))))


print(len(combinations), 'combinations')
for c in combinations:
    # for aa in c:
    #     print(aa)
    # print(score_by_gap_times(c, time(10), time(21), f_between, f_begin, f_end))

    # print(-(score_by_gap_times(c, time(10), time(21), f_between, f_begin, f_end) - np.mean(scores)) / np.std(scores, ddof=1) + max(get_day_class_lengths(c)))

    print(-(score_by_gap_times(c, time(10), time(21), f_between, f_begin, f_end) - np.mean(scores)) / np.std(scores, ddof=1), max(get_day_class_lengths(c))/sum(get_day_class_lengths(c)))
    # print(-(score_by_gap_times(c, time(10), time(21), f_between, f_begin, f_end) - np.mean(scores)) / np.std(scores, ddof=1) + max(get_day_class_lengths(c))/sum(get_day_class_lengths(c)))

    # print((score_by_gap_times(c, time(10), time(21), f_between, f_begin, f_end)) , max(get_day_class_lengths(c)))

    print(get_day_class_lengths(c) / sum(get_day_class_lengths(c)))

    print(np.std(get_day_class_lengths(c)/sum(get_day_class_lengths(c))))


    for aa in c:
        print(aa)


# for c in combinations:
#     # for aa in c:
#     #     print(aa)
#     # print(max(get_day_class_lengths(c)))
#
#     lengths = get_day_class_lengths(c)
#     a = max(lengths) - np.mean(lengths)
#     print(f'{a}\t{b}')
    # print()

# c = combinations[0]
# print(score_by_gap_times(c, time(10), time(21), f_between, f_begin, f_end))
# c[3].lecture_times.periods[0].start_time = time(10, 30)
# c[3].lecture_times.periods[0].end_time = time(11, 45)
# c[3].lecture_times.periods[1].start_time = time(10, 30)
# c[3].lecture_times.periods[1].end_time = time(11, 45)
# print(score_by_gap_times(c, time(10), time(21), f_between, f_begin, f_end))
# c[0].recitation_times.periods[0].start_time = time(16, 30)
# c[0].recitation_times.periods[0].end_time = time(17, 25)
# print(score_by_gap_times(c, time(10), time(21), f_between, f_begin, f_end))
# for aa in c:
#     print(aa)




# 62 powderhouse 209 college
