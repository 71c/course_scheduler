from abc import ABC, abstractmethod
from time import time
import json


class Groupable(ABC):
    def evaluate(self):
        return (self,)


class DummyGroupable(Groupable):
    '''can be used for testing'''
    def __init__(self, v):
        self.v = v

    def __repr__(self):
        return str(self.v)


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

get_depth = lambda L: isinstance(L, list) and max(map(get_depth, L))+1

class Group:
    def __init__(self, contents, kind, merge=False):
        '''
        contents: a list of things that the group contains
        kind: way that contents are grouped together. either "and" or "or"
        '''
        self.contents = contents
        self.kind = kind
        self.merge = merge

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
                    if (type(x) is list or type(x) is tuple) and get_depth(x) == max_depth:
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


class PeriodGroup(Group):
    def belongs_to_group(self, a, rest):
        # print(a, rest)
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

    with open('classes_data/classes Fall 2019.json') as json_file:
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



