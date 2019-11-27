from schedule_stats import get_mean_mad, get_day_class_lengths
from datetime import datetime, date, timedelta
from ics import Calendar, Event
import itertools
import json
from time import time
import numpy as np
import random
import cProfile
from guppy import hpy
import resource


weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr']


class Groupable:
    def evaluate(self):
        return [self]


class G(Groupable):
    '''can be used for testing'''
    def __init__(self, v):
        self.v = v

    def __repr__(self):
        return str(self.v)


class ClassTime(Groupable):
    def __init__(self, start_time, end_time, day, kind):
        self.start_time = start_time
        self.end_time = end_time
        self.day = day
        self.kind = kind

    def __repr__(self):
        # return f'{self.kind} {self.day} {self.start_time} - {self.end_time}'
        return f'{self.kind} {self.day} {timedelta(minutes=self.start_time)} - {timedelta(minutes=self.end_time)}'

    def __eq__(self, value):
        return self.start_time == value.start_time and self.end_time == value.end_time and self.day == value.day and self.kind == value.kind

    def intersects(self, other):
        return self.day == other.day and not (self.end_time < other.start_time or self.start_time > other.end_time)

    def __hash__(self):
        return hash(str(self.start_time) + str(self.end_time) + self.day + self.kind)


get_depth = lambda L: type(L) is list and (1 if len(L) == 0 else max(map(get_depth, L))+1)


class Group:
    def __init__(self, contents, kind, merge=False, data=None, cache=True):
        '''
        contents: a list of things that the group contains
        kind: way that contents are grouped together. either "and" or "or"
        merge: whether things are merged when evaluating. only applies if kind == 'and'
        data: extra data associated with the group
        cache: whehter to cache the result of the "evaluate" function. on by default.
        '''
        self.contents = contents
        self.kind = kind
        self.merge = merge
        self.data = data
        self.do_cache = cache
        self.cached_eval = None

    def evaluate(self):
        if self.do_cache:
            if self.cached_eval is None:
                if self.kind == 'and':
                    self.cached_eval = list(self.product_contents())
                else:
                    self.cached_eval = list(self.chain_contents())
            return self.cached_eval
        else:
            if self.kind == 'and':
                return self.product_contents()
            return self.chain_contents()

    # def product_contents(self):
    #     result = [[]]
    #     for pool in self.contents:
    #         ev = list(pool.evaluate())
    #         result = [x+[y] for x in result for y in ev if self.belongs_to_group(y, x)]


    #     # result = (itertools.product(*map(lambda x: x.evaluate(), self.contents)))


    #     if self.merge:
    #         for r in result:
    #             depths = list(map(get_depth, r))
    #             max_depth = max(depths)
    #             r_ = []
    #             for x, depth in zip(r, depths):
    #                 if type(x) is list and (depth == max_depth or depth == 1 and len(x) == 0):
    #                     r_.extend(x)
    #                 else:
    #                     r_.append(x)
    #             yield r_
    #     else:
    #         for prod in result:
    #             yield prod


    def product_contents(self):
        # this implementation of itertools.product is a bit faster than the previous version I used
        # found at https://stackoverflow.com/a/12605800
        def cycle(values, uplevel):
            for prefix in uplevel:       # cycle through all upper levels
                for current in values:   # restart iteration of current level
                    if self.belongs_to_group(current, prefix):
                        yield prefix + [current]
        result = iter([[]])
        for level in self.contents:
            result = cycle(list(level.evaluate()), result)  # build stack of iterators

        if self.merge:
            for r in result:
                depths = list(map(get_depth, r))
                max_depth = max(depths)
                r_ = []
                for x, depth in zip(r, depths):
                    if type(x) is list and (depth == max_depth or depth == 1 and len(x) == 0):
                        r_.extend(x)
                    else:
                        r_.append(x)
                yield r_
        else:
            for prod in result:
                yield prod

    def chain_contents(self):
        for it in self.contents:
            for element in it.evaluate():
                yield element

    def belongs_to_group(self, a, rest):
        return True

    def __repr__(self):
        if self.data is not None:
            return str(self.data) + ' (' + (' & ' if self.kind == 'and' else ' | ').join(map(str, self.contents)) + ')'
        return '(' + (' & ' if self.kind == 'and' else ' | ').join(map(str, self.contents)) + ')'


# class PeriodGroup(Group):
#     def belongs_to_group(self, a, rest):
#         if type(a) is list:
#             for i in a:
#                 if not self.belongs_to_group(i, rest):
#                     return False
#             return True
#         for u in rest:
#             if type(u) is list:
#                 if not self.belongs_to_group(a, u):
#                     return False
#             else:
#                 if a.intersects(u):
#                     return False
#         return True


class PeriodGroup(Group):
    def __init__(self, contents, kind, merge=False, data=None, cache=True):
        super().__init__(contents, kind, merge, data, cache)
        self.conflict_matrix = {}

    def belongs_to_group(self, a, rest):
        a_num = id(a)
        if a_num not in self.conflict_matrix:
            self.conflict_matrix[a_num] = {}
        for u in rest:
            u_num = id(u)
            if u_num not in self.conflict_matrix[a_num]:
                if type(a) is list:
                    self.conflict_matrix[a_num][u_num] = False
                    for i in a:
                        if type(u) is list:
                            if not self.belongs_to_group(i, u):
                                self.conflict_matrix[a_num][u_num] = True
                                return False
                        else:
                            if i.intersects(u):
                                self.conflict_matrix[a_num][u_num] = True
                                return False
                elif type(u) is list:
                    self.conflict_matrix[a_num][u_num] = not self.belongs_to_group(a, u)
                else:
                    self.conflict_matrix[a_num][u_num] = a.intersects(u)
            if self.conflict_matrix[a_num][u_num]:
                return False
        return True

    # def belongs_to_group(self, a, rest):
    #     a_num = id(a)
    #     if a_num not in self.conflict_matrix:
    #         self.conflict_matrix[a_num] = {}
    #     for u in rest:
    #         u_num = id(u)
    #         if u_num not in self.conflict_matrix[a_num]:
    #             if type(a) is list:
    #                 self.conflict_matrix[a_num][u_num] = False
    #                 if type(u) is list:
    #                     for i in a:
    #                         if not self.belongs_to_group(i, u):
    #                             self.conflict_matrix[a_num][u_num] = True
    #                             return False
    #                 else:
    #                     for i in a:
    #                         if i.intersects(u):
    #                             self.conflict_matrix[a_num][u_num] = True
    #                             return False
    #             elif type(u) is list:
    #                 self.conflict_matrix[a_num][u_num] = not self.belongs_to_group(a, u)
    #             else:
    #                 self.conflict_matrix[a_num][u_num] = a.intersects(u)
    #         if self.conflict_matrix[a_num][u_num]:
    #             return False
    #     return True



def make_optional(group):
    return Group([group, Group([], 'and')], 'or')


def course_to_period_group(course, exclude_classes_with_no_days=True, only_consider_open_classes=True):
    period_dict = {}
    for section in course['sections']:
        comp_desc = section['comp_desc']
        for component in section['components']:
            if only_consider_open_classes and component['status'] != 'O':
                continue

            assoc_class = component['assoc_class']
            
            # build PeriodGroup
            # combine all locations into 1 because we don't care about where things are
            class_times = []
            for location in component['locations']:
                for meeting in location['meetings']:
                    for day in meeting['days']:
                        class_times.append(ClassTime(meeting['meet_start_min'], meeting['meet_end_min'], day, component['ssr_comp']))
            if not (exclude_classes_with_no_days and len(class_times) == 0):
                class_times_group = PeriodGroup(class_times, 'and')
                if assoc_class in period_dict:
                    if comp_desc in period_dict[assoc_class]:
                        period_dict[assoc_class][comp_desc].append(class_times_group)
                    else:
                        period_dict[assoc_class][comp_desc] = [class_times_group]
                else:
                    period_dict[assoc_class] = {comp_desc: [class_times_group]}

    class_components_group_9999 = None
    assoc_class_period_groups = []
    for key, assoc_class_dict in period_dict.items():
        class_components = []
        for period_groups in assoc_class_dict.values():
            class_components.append(PeriodGroup(period_groups, 'or'))
        class_components_group = PeriodGroup(class_components, 'and', True)
        if key == '9999':
            class_components_group_9999 = class_components_group
        else:
            assoc_class_period_groups.append(class_components_group)
    class_options = PeriodGroup(assoc_class_period_groups, 'or')
    if '9999' in period_dict:
        class_options = PeriodGroup([class_components_group_9999, class_options], 'and', True)
    class_options.data = course['course_num']
    return class_options


def get_schedule_possibilities(courses):
    load = PeriodGroup(courses, 'and')
    names = [course.data for course in courses]
    possibilities = list(load.evaluate())
    possibilities = [{names[i]: p[i] for i in range(len(names))} for p in possibilities]
    return possibilities


def flatten_list(L):
    flattened = []
    for x in L:
        if isinstance(x, list):
            flattened.extend(flatten_list(x))
        else:
            flattened.append(x)
    return flattened


def get_class_options(req, spec):
    spec.insert(0, [req, len(req)])
    spec_expanded = []
    for s in spec:
        if len(s) == 2 and isinstance(s[1], int) and get_depth(s[0]) >= 1:
            options, n = s
        else:
            options, n = s, 1
        spec_expanded.append(combinations(options, n))
    return list(map(list, map(chain.from_iterable, product(*spec_expanded))))


def to_ics(schedule, class_names):
    monday = date.today() - timedelta(date.today().weekday()) + timedelta(7)
    days = [monday + timedelta(i) for i in range(5)]
    c = Calendar()
    for class_name, periods in zip(class_names, schedule):
        for period in periods:
            e = Event()
            e.name = class_name + ' ' + period.kind
            
            start_time = (datetime.min + timedelta(minutes=period.start_time)).time()
            end_time = (datetime.min + timedelta(minutes=period.end_time)).time()
            start = datetime.combine(days[weekdays.index(period.day)], start_time)
            end = datetime.combine(days[weekdays.index(period.day)], end_time)
            
            # timezone
            e.begin = start + timedelta(hours=5)
            e.end = end + timedelta(hours=5)
            c.events.add(e)
    return c


if __name__ == '__main__':
    with open('classes_data/classes Spring 2020.json') as json_file:
        classes_original = json.load(json_file)
    classes_groups_by_course_num = {}
    for c in classes_original['searchResults']:
        pg = course_to_period_group(c, only_consider_open_classes=False)
        course_num = c['course_num']
        pg.do_cache = True
        if course_num in classes_groups_by_course_num:
            classes_groups_by_course_num[course_num].append(pg)
        else:
            classes_groups_by_course_num[course_num] = [pg]
    
    def test_times_with_permutations(names):
        permutations = list(itertools.permutations(names))
        random.shuffle(permutations)
        for permutation in permutations:
            print(permutation)
            contents = [classes_groups_by_course_num[x][0] for x in permutation]
            # print([len(x.contents) for x in contents])
            # print([len(x.evaluate()) for x in contents])

            times = []
            for _ in range(1):
                pg = PeriodGroup(contents, 'and')
                pg.do_cache = False
                t1 = time()
                # print(len(pg.evaluate()))
                # list(pg.evaluate())

                # print(pg.evaluate())
                i = 0
                for x in pg.evaluate():
                    i += 1
                print(i)

                t2 = time()
                times.append(t2 - t1)
            print(min(times))

    def look_at_class_possibility_sizes():
        lens = []
        for k, pgs in classes_groups_by_course_num.items():
            for pg in pgs:
                lens.append((k, len(pg.evaluate())))
        lens.sort(key=lambda x: x[1])
        print(lens[-30:])

    def test_evaluation_time(names, n_trials):
        contents = [classes_groups_by_course_num[x][0] for x in names]
        times = []
        for _ in range(20):
            pg = PeriodGroup(contents, 'and')
            t = time()
            pg.evaluate()
            times.append(time() - t)
        return sum(times) / len(times)

    
    names = ['COMP-0015', 'MATH-0070', 'MATH-0061', 'ES-0003', 'CHEM-0001']
    # names = ['COMP-0015', 'CHEM-0001', 'COMP-0011', 'PHY-0011']
    # names = ['MATH-0070', 'CHEM-0001', 'COMP-0011']
    # names = ['CHEM-0001', 'CHEM-0002', 'SPN-0002', 'SPN-0004']
    # names = ['CHEM-0001', 'SPN-0002', 'COMP-0011', 'PHY-0002']
    # names = ['CHEM-0001', 'SPN-0002', 'COMP-0011', 'ME-0040']

    # test_times_with_permutations(names)
    # print(test_evaluation_time(names, 10))

    # g = Group([G(1), G(2)], 'and', cache=False)
    # print(list(g.evaluate()))


    h = hpy()
    print(h.heap())

    print(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss)





    

