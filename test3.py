from abc import ABC, abstractmethod
from time import time
import json


class Groupable(ABC):
    def evaluate(self):
        return (self,)


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
        return f'{self.kind} {self.day} {self.start_time} - {self.end_time}'

    def __eq__(self, value):
        return self.start_time == value.start_time and self.end_time == value.end_time and self.day == value.day and self.kind == value.kind

    def intersects(self, other):
        return self.day == other.day and not (self.end_time < other.start_time or self.start_time > other.end_time)


get_depth = lambda L: isinstance(L, list) and (1 if len(L) == 0 else max(map(get_depth, L))+1)


class Group:
    def __init__(self, contents, kind, merge=False, data=None):
        '''
        contents: a list of things that the group contains
        kind: way that contents are grouped together. either "and" or "or"
        '''
        self.contents = contents
        self.kind = kind
        self.merge = merge
        self.data = data

    def evaluate(self):
        if self.kind == 'and':
            return self.product_contents()
        return self.chain_contents()

    def product_contents(self):
        result = [[]]
        for pool in self.contents:
            result = [x+[y] for x in result for y in pool.evaluate() if self.belongs_to_group(y, x)] 
        
        if self.merge:
            for r in result:
                max_depth = get_depth(r) - 1
                r_ = []
                for x in r:
                    depth = get_depth(x)
                    if (type(x) is list or type(x) is tuple) and (depth == max_depth or depth == 1 and len(x) == 0):
                        r_.extend(x)
                    else:
                        r_.append(x)
                yield r_
        else:
            for prod in result:
                yield (prod)

    def belongs_to_group(self, a, rest):
        return True

    def chain_contents(self):
        for it in self.contents:
            for element in it.evaluate():
                yield element

    def __repr__(self):
        if self.data is not None:
            return str(self.data) + ' (' + (' & ' if self.kind == 'and' else ' | ').join(map(str, self.contents)) + ')'
        return '(' + (' & ' if self.kind == 'and' else ' | ').join(map(str, self.contents)) + ')'


class PeriodGroup(Group):
    def belongs_to_group(self, a, rest):
        if type(a) is tuple or type(a) is list:
            for i in a:
                if not self.belongs_to_group(i, rest):
                    return False
            return True
        for u in rest:
            if type(u) is tuple or type(u) is list:
                if not self.belongs_to_group(a, u):
                    return False
            else:
                if a.intersects(u):
                    return False
        return True


def make_optional(group):
    return Group([group, Group([], 'and')], 'or')


def course_to_period_group(course, exclude_classes_with_no_days=True):
    period_dict = {}
    for section in course['sections']:
        comp_desc = section['comp_desc']
        for component in section['components']:
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


if __name__ == '__main__':
    pg = PeriodGroup([
        PeriodGroup([
            PeriodGroup([
                ClassTime(1, 2, 'Mo', 'LEC'),
                ClassTime(4, 6, 'Mo', 'LEC')
            ], 'or'),
            PeriodGroup([
                PeriodGroup([ClassTime(3, 4, 'Mo', 'RCT')], 'and'),
                PeriodGroup([ClassTime(5, 6, 'Mo', 'RCT')], 'and')
            ], 'or')
        ], 'and', False),
        PeriodGroup([
            PeriodGroup([
                PeriodGroup([ClassTime(11, 12, 'Mo', 'LEC')], 'and'),
                PeriodGroup([ClassTime(0, 1, 'Mo', 'LEC')], 'and')
            ], 'or'),
            PeriodGroup([
                PeriodGroup([ClassTime(7, 8, 'Mo', 'RCT')], 'and'),
                PeriodGroup([ClassTime(2, 3, 'Mo', 'RCT')], 'and')
            ], 'or')
        ], 'and', False),
        PeriodGroup([
            PeriodGroup([
                PeriodGroup([ClassTime(11, 12, 'Mo', 'LEC')], 'and'),
                PeriodGroup([
                    PeriodGroup([ClassTime(13, 14, 'Mo', 'RCT')], 'and'),
                    PeriodGroup([ClassTime(5, 6, 'Mo', 'RCT')], 'and'),
                    PeriodGroup([ClassTime(7, 8, 'Mo', 'RCT')], 'and')
                ], 'or')
            ], 'and', False),
            PeriodGroup([
                PeriodGroup([ClassTime(23, 34, 'Mo', 'LEC')], 'and'),
                PeriodGroup([
                    PeriodGroup([ClassTime(56, 57, 'Mo', 'RCT')], 'and'),
                    PeriodGroup([ClassTime(6, 7, 'Mo', 'RCT')], 'and'),
                    PeriodGroup([ClassTime(8, 9, 'Mo', 'RCT')], 'and')
                ], 'or')
            ], 'and', False)
        ], 'or')
    ], 'and', False)


    # pg = Group([
    #     Group([G('C'), G('D')], 'or'),
    #     Group([G('A'), G('B'), G('O')], 'and')
    # ], 'and')
    # [[[[LEC Mo 1 - 2], [RCT Mo 3 - 4]], [[LEC Mo 11 - 12], [RCT Mo 7 - 8]], [[LEC Mo 23 - 34], [RCT Mo 56 - 57]]], [[[LEC Mo 1 - 2], [RCT Mo 5 - 6]], [[LEC Mo 11 - 12], [RCT Mo 7 - 8]], [[LEC Mo 23 - 34], [RCT Mo 56 - 57]]]]
    # [[[[LEC Mo 1 - 2], [RCT Mo 3 - 4]], [[LEC Mo 11 - 12], [RCT Mo 7 - 8]], [[LEC Mo 23 - 34], [RCT Mo 56 - 57]]], [[[LEC Mo 1 - 2], [RCT Mo 5 - 6]], [[LEC Mo 11 - 12], [RCT Mo 7 - 8]], [[LEC Mo 23 - 34], [RCT Mo 56 - 57]]]]

    t=time()
    ev = list(pg.evaluate())
    for e in ev:
        print(e)
    print(time() - t)

    with open('classes_data/classes Spring 2020.json') as json_file:
      classes = json.load(json_file)
    for c in classes['searchResults']:
        lectures = [s for s in c['sections'] if s['comp_desc'] == 'Lecture']
        recitations = [s for s in c['sections'] if s['comp_desc'] == 'Recitation']
        funny_sections = [s for s in c['sections'] if s['comp_desc'] != 'Recitation' and s['comp_desc'] != 'Recitation (Optional)' and s['comp_desc'] != 'Lecture']
        # if len(funny_sections) != 0 and len(recitations) != 0:
        if len(recitations) != 0:
            if len(funny_sections) > 0:
                funny_assoc_classes = [component['assoc_class'] for component in funny_sections[0]['components']]
            recitations_assoc_classes = [component['assoc_class'] for component in recitations[0]['components']]
            lectures_assoc_classes = [component['assoc_class'] for component in lectures[0]['components']]
            
            # if len(assoc_classes) > 1 and len(set(assoc_classes)) == len(assoc_classes):
            #     print(funny_sections[0]['comp_desc'])
            #     for assoc_class in assoc_classes:
            #       print(assoc_class)
            #     print()

            # if len(funny_assoc_classes) > 1 and len(set(funny_assoc_classes)) != 1 and len(recitations_assoc_classes) > 1 and len(set(recitations_assoc_classes)) != 1:
            if len(recitations_assoc_classes) > 1 and len(set(recitations_assoc_classes)) != 1:
            # if len(funny_assoc_classes) > 1 and len(set(funny_assoc_classes)) != 1:
                print(c['course_num'])
                if len(funny_sections) > 0:
                    print(funny_sections[0]['comp_desc'])
                    for assoc_class in funny_assoc_classes:
                      print(assoc_class)
                print(recitations[0]['comp_desc'])
                for assoc_class in recitations_assoc_classes:
                  print(assoc_class)
                print(lectures[0]['comp_desc'])
                for assoc_class in lectures_assoc_classes:
                  print(assoc_class)
                print()

    # for c in classes['searchResults']:
    #     for s in c['sections']:
    #         for component in s['components']:
    #             locations = component['locations']
    #             if len(locations) != 1:
    #                 print("Locations length:", len(locations))
    #                 for location in locations:
    #                     print("Meetings length:", len(location['meetings']))
    #                 print(locations)
    #                 print(c['course_num'])
    #                 print()
    #             # else:
    #             #     meetings_lengths = [len(location['meetings']) for location in locations]
    #             #     if any(x != 1 for x in meetings_lengths):
    #             #         print("Locations length:", len(locations))
    #             #         for meetings_length in meetings_lengths:
    #             #             print("Meetings length:", meetings_length)
    #             #         print(locations[0]['meetings'])
    #             #         print(c['course_num'])
    #             #         print()



    # lab_group = Group([G('LAB1'), G('LAB2')], 'or')
    # rct_group_1 = Group([G('RCT1'), G('RCT2')], 'or')
    # rct_group_2 = Group([G('RCT3'), G('RCT4')], 'or')
    # lec_1 = G('LEC1')
    # lec_2 = G('LEC2')
    lab_group = Group([Group([G('LAB1')], 'and'), Group([G('LAB2')], 'and')], 'or')
    rct_group_1 = Group([Group([G('RCT1')], 'and'), Group([G('RCT2')], 'and')], 'or')
    rct_group_2 = Group([Group([G('RCT3')], 'and'), Group([G('RCT4')], 'and')], 'or')
    lec_1 = Group([G('LEC1')], 'and')
    lec_2 = Group([G('LEC2')], 'and')
    group_v1 = Group([
        Group([lab_group, rct_group_1, lec_1], 'and'),
        Group([lab_group, rct_group_2, lec_2], 'and')
    ], 'or')
    # group_v2 =  Group([
    #     lab_group,
    #     Group([
    #         Group([rct_group_1, lec_1], 'and', True),
    #         Group([rct_group_2, lec_2], 'and', True)
    #     ], 'or')
    # ], 'and', True)
    group_v2 =  Group([
        lab_group,
        Group([
            Group([rct_group_1, lec_1], 'and'),
            Group([rct_group_2, lec_2], 'and')
        ], 'or')
    ], 'and', True)

    print(list(group_v1.evaluate()))
    print(list(group_v2.evaluate()))


    group_v3 =  Group([
        Group([lab_group, lec_1, rct_group_1], 'and'),
        Group([lab_group, lec_1], 'and')
    ], 'or')
    
    group_v4 =  Group([
        Group([lab_group, lec_1], 'and', True),
        Group([
            rct_group_1,
            Group([], 'and')
        ], 'or')
    ], 'and', True)
    print(list(group_v3.evaluate()))
    print(list(group_v4.evaluate()))

    # g = Group([
    #     Group([G('a'), Group([],'and')], 'or'),
    #     Group([G('b'), Group([],'and')], 'or'),
    #     Group([G('c'), Group([],'and')], 'or'),
    #     Group([G('d'), Group([],'and')], 'or')
    # ], 'and', True)
    # print(list(g.evaluate()))




    # es3 = [c for c in classes['searchResults'] if c['course_num'] == 'ES-0003'][0]
    # for s in es3['sections']:
    #     print(s)
    #     print()

    classes_groups_by_course_num = {}
    for c in classes['searchResults']:
        pg = course_to_period_group(c)
        course_num = c['course_num']
        if course_num in classes_groups_by_course_num:
            classes_groups_by_course_num[course_num].append(pg)
        else:
            classes_groups_by_course_num[course_num] = [pg]
    

    comp15 = classes_groups_by_course_num['COMP-0015'][0]
    chem12 = classes_groups_by_course_num['CHEM-0012'][0]
    math70 = classes_groups_by_course_num['MATH-0070'][0]
    math61 = classes_groups_by_course_num['MATH-0061'][0]
    load = PeriodGroup([math70, chem12, comp15, math61], 'and')
    t = time()
    possibilities = list(load.evaluate())
    print(time() - t)
    print(len(possibilities))
    for possibility in possibilities:
        print(possibility)



    # for u in get_schedule_possibilities([math70, chem12, comp15, math61]):
    #     print(u)

   



    course_to_period_group(classes['searchResults'][0])




'''
(A1 | A2 | ... A11) & (R1 | R2 | R3 | R4) & L1 | (A1 | A2 | ... A11) & (R5 | R6 | R7 | R8 | R9) & L2
(A1 | A2 | ... A11) & ((R1 | R2 | R3 | R4) & L1 | (R5 | R6 | R7 | R8 | R9) & L2)

CourseArrangement - &
    [ClassTimes]

Course - (a|b) & (c|d)
    [ClassTimes]

ClassTimes - |
    [ClassTime]








Laboratory
1
1
1
2
2
2
Recitation
1
2
Lecture
1
2

(A1 | A2 | A3) & R1 & L1 | (A4 | A5 | A6) & R2 & L2


Laboratory
9999
9999
9999
9999
9999
9999
9999
9999
9999
9999
9999
Recitation
1
1
1
1
2
2
2
2
2
Lecture
1
2

(A1 | A2 | ... A11) & (R1 | R2 | R3 | R4) & L1 | (A1 | A2 | ... A11) & (R5 | R6 | R7 | R8 | R9) & L2
(A1 | A2 | ... A11) & ((R1 | R2 | R3 | R4) & L1 | (R5 | R6 | R7 | R8 | R9) & L2)

'''




