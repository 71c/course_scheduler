from datetime import datetime, time, date, timedelta
import re
import numpy as np
from ics import Calendar, Event

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


class CourseArrangement:
    def __init__(self, name, lecture_times, recitation_times, lab_times):
        self.name = name
        self.lecture_times = lecture_times
        self.recitation_times = recitation_times
        self.lab_times = lab_times

    def __repr__(self):
        classtimess = [
            self.lecture_times, self.recitation_times, self.lab_times]
        return self.name + ' ' + ' '.join(
            [str(ct) for ct in classtimess if len(ct.periods) != 0])

    def __eq__(self, other):
        return self.name == other.name and self.lecture_times == other.lecture_times and self.recitation_times == other.recitation_times and self.lab_times == other.lab_times

    def intersects(self, other):
        for a in [self.lecture_times, self.recitation_times, self.lab_times]:
            for b in [other.lecture_times, other.recitation_times, other.lab_times]:
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
        self.recitation_times = (recitation_times)
        if self.lab_times == []:
            self.lab_times = [ClassTimes.no_classes()]
        if self.recitation_times == []:
            self.recitation_times = [ClassTimes.no_classes()]
        if allowed_recitation_by_lecture is None:
            self.allowed_recitation_by_lecture = [
                [True] * len(self.recitation_times)
                ] * len(self.lecture_times)
        else:
            self.allowed_recitation_by_lecture = allowed_recitation_by_lecture

    def __repr__(self):
        return self.name

    def all_possible_arrangements(self):
        """returns all possible arrangements of class times as a list of
        CourseArrangements"""
        arrangements = []
        for lecs_index, lecs in enumerate(self.lecture_times):
            for labs in self.lab_times:
                if lecs.intersects(labs):
                    continue
                for rcts_index, rcts in enumerate(self.recitation_times):
                    if lecs.intersects(rcts) or labs.intersects(rcts):
                        continue
                    if self.allowed_recitation_by_lecture[lecs_index][rcts_index]:
                        arrangements.append(CourseArrangement(
                            self.name, lecs, rcts, labs))
        return arrangements

    def filter_classes(self, f, **options):
        """Remove any ClassTimess in which all not all periods satisfy the
        condition specified by f"""
        i = 0
        while i < len(self.lecture_times):
            lecs = self.lecture_times[i]
            if not lecs.periods_satisfy_condition(f, **options):
                self.lecture_times.pop(i)
                self.allowed_recitation_by_lecture.pop(i)
                continue
            i += 1
        i = 0
        while i < len(self.recitation_times):
            rcts = self.recitation_times[i]
            if not rcts.periods_satisfy_condition(f, **options):
                self.recitation_times.pop(i)
                for row in self.allowed_recitation_by_lecture:
                    row.pop(i)
                continue
            i += 1
        i = 0
        while i < len(self.lab_times):
            labs = self.lab_times[i]
            if not labs.periods_satisfy_condition(f, **options):
                self.lab_times.pop(i)
                continue
            i += 1


class ClassTimes:
    def __init__(self, class_time_list):
        self.periods = class_time_list

    @classmethod
    def class_times(cls, times_string, kind):
        """constructs a ClassTimes from strings copy-pasted from SIS
        containing times block occurs and kind of block"""
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

    @classmethod
    def no_classes(cls):
        return cls([])

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
        for period_1 in self.periods:
            for period_2 in other.periods:
                if period_1.intersects(period_2):
                    return True
        return False

    def periods_satisfy_condition(self, f, **options):
        """return whether all periods satisfy condition specified by f"""
        for period in self.periods:
            if not f(period, **options):
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
    """converts text copy-pasted from SIS to a course"""
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
    """adds new class to existing combinations"""
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
    """finds all possible combinations of when to take each block of each
    class"""
    combinations = [[]]
    for c in classes:
        a = c.all_possible_arrangements()
        combinations = combine_course_arrangements(combinations, a)
    return combinations


def score_by_gap_times(arrangements, start_time, end_time, f_between, f_begin, f_end):
    """Scores schedule by sum of functions of gaps between classes"""
    total_minutes = 0
    for day in weekdays:
        day_blocks = []
        for arrangement in arrangements:
            for times in [arrangement.lecture_times, arrangement.recitation_times, arrangement.lab_times]:
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
        a = [f_begin(gaps_minutes[0])] + [f_between(gap_minutes) for gap_minutes in gaps_minutes[1:-1]] + [f_end(gaps_minutes[-1])]
        total_minutes += sum(a)
    return total_minutes


def get_day_class_lengths(arrangements, normalize=True):
    """returns total number of minutes of class time each day from a schedule,
    optionally normalized to sum to 1"""
    minute_counts = []
    for day in weekdays:
        day_blocks = []
        for arrangement in arrangements:
            for times in [arrangement.lecture_times, arrangement.recitation_times, arrangement.lab_times]:
                for period in times.periods:
                    if period.day == day:
                        day_blocks.append(period)
        day_blocks.sort(key=lambda block: block.start_time)
        total_classtime = sum([(datetime.combine(date.today(), block.end_time) - datetime.combine(date.today(), block.start_time)).total_seconds()/60 for block in day_blocks])
        minute_counts.append(total_classtime)
    minute_counts = np.array(minute_counts)
    if normalize:
        minute_counts /= sum(minute_counts)
    return minute_counts


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
bio13.recitation_times = [ClassTimes.no_classes()]
chem1 = course_from_file('chem1.txt', 'CHEM-0001')
en1_1 = course_from_file('en1-1.txt', 'EN-0001')
en1_9 = course_from_file('en1-9.txt', 'EN-0001')
eng1 = course_from_file('eng1.txt', 'ENG-0001')


def period_is_between_hours(period, start, end):
    return period.start_time >= start and period.end_time <= end


courses = [math42, bio13, en1_1, eng1]
# courses = [math42, chem1, en1_9, eng1]
# courses = [math42, bio13, en1_9, eng1]

# courses = [math42, chem1, en1_9, eng1, bio13]


# start, stop = time(10), time(19)
start, stop = time(10), time(21)
# start, stop = time(12), time(18)

for course in courses:
    course.filter_classes(period_is_between_hours, start=start, end=stop)

combinations = class_combinations(courses)


def S(x):
    if x < 0:
        return 0
    if x > 1:
        return 1
    return 6*x**5 - 15*x**4 + 10*x**3
# a, b = 20, 40
# a, b = 25, 55
# a, b = 40, 90
# a, b = 18, 58
a, b = 8, 48
# These functions are arbitrary.
f_between = lambda m: (m - 7.714) * S((m - a)/(b - a))
f_begin = lambda m: (m - 3.857) * S((m - a)/(b - a))
f_end = lambda m: (m - 3.857) * S((m - a)/(b - a))

# f_between = lambda m: (m - 7.714) if (m - 7.714) > 15 else 0
# f_begin = lambda m: (m - 3.857) if (m - 3.857) > 15 else 0
# f_end = lambda m: (m - 3.857) if (m - 3.857) > 15 else 0

scores = []
for combination in combinations:
    scores.append(score_by_gap_times(combination, start, stop, f_between, f_begin, f_end))


def objective_function(course_arrangement):
    gap_score = score_by_gap_times(course_arrangement, start, stop, f_between, f_begin, f_end)
    max_classtime_proportion = max(get_day_class_lengths(course_arrangement))
    return (-gap_score, max_classtime_proportion)


combinations.sort(key=objective_function)

print(len(combinations), 'combinations')
print("Found classses with highest gap score and then lowest max class time proportion")
for c in combinations:
    gap_score = score_by_gap_times(c, start, stop, f_between, f_begin, f_end)
    max_classtime_proportion = max(get_day_class_lengths(c))
    print(f"""gap score: {gap_score}
max class time proportion: {max_classtime_proportion}""")
    for aa in c:
        print(aa)
    print()


def to_ics(schedule):
    monday = date.today() - timedelta(date.today().weekday()) + timedelta(7)
    days = [monday + timedelta(i) for i in range(5)]
    c = Calendar()
    for arrangement in schedule:
        events = arrangement.lecture_times.periods + arrangement.recitation_times.periods + arrangement.lab_times.periods
        for event in events:
            e = Event()
            e.name = arrangement.name + ' ' + event.kind
            start = datetime.combine(days[weekdays.index(event.day)], event.start_time)
            end = datetime.combine(days[weekdays.index(event.day)], event.end_time)
            e.begin = start + timedelta(hours=4)
            e.end = end + timedelta(hours=4)
            c.events.add(e)


best_schedule = combinations[0]
c = to_ics(best_schedule)

with open('my.ics', 'w') as f:
    f.writelines(c)
