from abc import ABC, abstractmethod
# from course_scheduler import ClassTime
from time import time
import itertools

'''
(a & b) & (c & d)
(a & b) | (c & d)
'''

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

    def evaluate(self):
        return (self,)


class Group(ABC):
    def __init__(self, contents, kind):
        self.contents = contents
        self.kind = kind

    def product(self, *args):
        result = [[]]
        for pool in args:
            result = [x+[y] for x in result for y in pool.evaluate() if self.belongs_to_group(y, x)]
        for prod in result:
            yield tuple(prod)

    def evaluate(self):
        if self.kind == 'and':
            return self.product(*self.contents)
        else:
            # return [tuple(x.evaluate()) for x in self.contents]
            u = []
            for x in self.contents:
                for h in tuple(x.evaluate()):
                    u.append(h)
            return u

    @abstractmethod
    def belongs_to_group(self, a, rest):
        return True
        
class PeriodGroup(Group):
    def belongs_to_group(self, a, rest):
        if type(a) is tuple:
            for i in a:
                if not self.belongs_to_group(i, rest):
                    return False
            return True
        if len(rest) >= 1 and type(rest[0]) is tuple:
            # return self.belongs_to_group(a, rest[0])
            
            for u in rest:
                if not self.belongs_to_group(a, u):
                    return False
            return True
        for r in rest:
            if a.intersects(r):
                return False
        return True

# pg = PeriodGroup([
#     PeriodGroup([ClassTime(1, 4, 'Mo', '?'), ClassTime(9, 10, 'Mo', '?')], 'or'),
#     PeriodGroup([ClassTime(5, 7, 'Mo', '?'), ClassTime(8, 10, 'Mo', '?')], 'or')
# ], 'and')

# pg = PeriodGroup([
#     PeriodGroup([ClassTime(1, 4, 'Mo', '?'), ClassTime(9, 10, 'Mo', '?'), ClassTime(10, 11, 'Mo', '?')], 'or'),
#     PeriodGroup([ClassTime(5, 7, 'Mo', '?'), ClassTime(11, 12, 'Mo', '?')], 'and')
# ], 'and')

# pg = PeriodGroup([ClassTime(1, 4, 'Mo', '?'), ClassTime(9, 10, 'Mo', '?')], 'and')

# pg = PeriodGroup([
#     PeriodGroup([ClassTime(1, 4, 'Mo', '?'), ClassTime(11, 12, 'Mo', '?')], 'and'),
#     PeriodGroup([ClassTime(5, 7, 'Mo', '?'), ClassTime(8, 10, 'Mo', '?')], 'or')
# ], 'and')

# pg = PeriodGroup([
#     PeriodGroup([ClassTime(1, 4, 'Mo', '?')],'or'), PeriodGroup([ClassTime(9, 10, 'Mo', '?')],'or')
# ], 'and')

# pg = PeriodGroup([
#     ClassTime(1, 4, 'Mo', '?'), ClassTime(9, 10, 'Mo', '?')
# ], 'and')


# pg = PeriodGroup([
#     PeriodGroup([ClassTime(1, 2, 'Mo', '?'), ClassTime(4, 6, 'Mo', '?')], 'or'),
#     PeriodGroup([ClassTime(3, 4, 'Mo', '?'), ClassTime(5, 6, 'Mo', '?')], 'or')
# ], 'and')

# pg = PeriodGroup([
#     PeriodGroup([
#         PeriodGroup([ClassTime(1, 2, 'Mo', 'LEC'), ClassTime(4, 6, 'Mo', 'LEC')], 'or'),
#         PeriodGroup([ClassTime(3, 4, 'Mo', 'RCT'), ClassTime(5, 6, 'Mo', 'RCT')], 'or')
#     ], 'and'),
#     PeriodGroup([
#         PeriodGroup([ClassTime(11, 12, 'Mo', 'LEC'), ClassTime(0, 1, 'Mo', 'LEC')], 'or'),
#         PeriodGroup([ClassTime(7, 8, 'Mo', 'RCT'), ClassTime(2, 3, 'Mo', 'RCT')], 'or')
#     ], 'and')
# ], 'and')

# pg = PeriodGroup([
#     PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(1, 2, 'Mo', '?')], 'and'),
#             PeriodGroup([ClassTime(4, 6, 'Mo', '?')], 'and')
#         ], 'or'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(3, 4, 'Mo', '?')], 'and'),
#             PeriodGroup([ClassTime(5, 6, 'Mo', '?')], 'and')
#         ], 'or')
#     ], 'and'),
#     PeriodGroup([
#         PeriodGroup([
#             ClassTime(11, 12, 'Mo', '?'),
#             ClassTime(0, 1, 'Mo', '?')
#         ], 'or'),
#         PeriodGroup([
#             ClassTime(7, 8, 'Mo', '?'),
#             ClassTime(2, 3, 'Mo', '?')
#         ], 'or')
#     ], 'and')
# ], 'and')

# pg = PeriodGroup([PeriodGroup([
#     PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(1, 2, 'Mo', '?')], 'and'),
#             PeriodGroup([ClassTime(4, 6, 'Mo', '?')], 'and')
#         ], 'or'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(3, 4, 'Mo', '?')], 'and'),
#             PeriodGroup([ClassTime(5, 6, 'Mo', '?')], 'and')
#         ], 'or')
#     ], 'and'),
#     PeriodGroup([
#         PeriodGroup([
#             ClassTime(11, 12, 'Mo', '?'),
#             ClassTime(0, 1, 'Mo', '?')
#         ], 'or'),
#         PeriodGroup([
#             ClassTime(7, 8, 'Mo', '?'),
#             ClassTime(2, 3, 'Mo', '?')
#         ], 'or')
#     ], 'and')
# ], 'and')], 'and')

# pg = PeriodGroup([
#     PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(1, 2, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([ClassTime(4, 6, 'Mo', 'LEC')], 'and')
#         ], 'or'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(3, 4, 'Mo', 'RCT')], 'and'),
#             PeriodGroup([ClassTime(5, 6, 'Mo', 'RCT')], 'and')
#         ], 'or')
#     ], 'and'),
#     PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(11, 12, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([ClassTime(0, 1, 'Mo', 'LEC')], 'and')
#         ], 'or'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(7, 8, 'Mo', 'RCT')], 'and'),
#             PeriodGroup([ClassTime(2, 3, 'Mo', 'RCT')], 'and')
#         ], 'or')
#     ], 'and')
# ], 'and')



# pg = PeriodGroup([
#     PeriodGroup([
#         ClassTime(1, 2, 'Mo', 'LEC'),
#         PeriodGroup([
#             ClassTime(3, 4, 'Mo', 'RCT'),
#             ClassTime(5, 6, 'Mo', 'RCT'),
#             ClassTime(7, 8, 'Mo', 'RCT')
#         ], 'or')
#     ], 'and'),
#     PeriodGroup([
#         ClassTime(2, 3, 'Mo', 'LEC'),
#         PeriodGroup([
#             ClassTime(4, 5, 'Mo', 'RCT'),
#             ClassTime(6, 7, 'Mo', 'RCT'),
#             ClassTime(8, 9, 'Mo', 'RCT')
#         ], 'or')
#     ], 'and')
# ], 'or')



# pg = PeriodGroup([
#     PeriodGroup([
#         PeriodGroup([ClassTime(1, 2, 'Mo', 'LEC')],'and'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(3, 4, 'Mo', 'RCT')],'and'),
#             PeriodGroup([ClassTime(5, 6, 'Mo', 'RCT')],'and'),
#             PeriodGroup([ClassTime(7, 8, 'Mo', 'RCT')],'and')
#         ], 'or')
#     ], 'and'),
#     PeriodGroup([
#         PeriodGroup([ClassTime(2, 3, 'Mo', 'LEC')],'and'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(4, 5, 'Mo', 'RCT')],'and'),
#             PeriodGroup([ClassTime(6, 7, 'Mo', 'RCT')],'and'),
#             PeriodGroup([ClassTime(8, 9, 'Mo', 'RCT')],'and')
#         ], 'or')
#     ], 'and')
# ], 'or')



# pg = PeriodGroup([
#     PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(1, 2, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([ClassTime(4, 6, 'Mo', 'LEC')], 'and')
#         ], 'or'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(3, 4, 'Mo', 'RCT')], 'and'),
#             PeriodGroup([ClassTime(5, 6, 'Mo', 'RCT')], 'and')
#         ], 'or')
#     ], 'and'),
#     PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(11, 12, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([ClassTime(0, 1, 'Mo', 'LEC')], 'and')
#         ], 'or'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(7, 8, 'Mo', 'RCT')], 'and'),
#             PeriodGroup([ClassTime(2, 3, 'Mo', 'RCT')], 'and')
#         ], 'or')
#     ], 'and'),
#     PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(11, 12, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([
#                 PeriodGroup([ClassTime(13, 14, 'Mo', 'RCT')], 'and'),
#                 PeriodGroup([ClassTime(5, 6, 'Mo', 'RCT')], 'and'),
#                 PeriodGroup([ClassTime(7, 8, 'Mo', 'RCT')], 'and')
#             ], 'or')
#         ], 'and'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(23, 34, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([
#                 PeriodGroup([ClassTime(56, 57, 'Mo', 'RCT')], 'and'),
#                 PeriodGroup([ClassTime(6, 7, 'Mo', 'RCT')], 'and'),
#                 PeriodGroup([ClassTime(8, 9, 'Mo', 'RCT')], 'and')
#             ], 'or')
#         ], 'and')
#     ], 'or')
# ], 'and')

class Dummy:
	def __init__(self, v):
		self.v = v

	def evaluate(self):
		return (self,)

	def __repr__(self):
		return str(self.v)

pg = Group([Group([Dummy(1), Dummy(2)], 'or'), Dummy(3)], 'and')





# pg = PeriodGroup([
#     PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(1, 2, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([ClassTime(4, 6, 'Mo', 'LEC')], 'and')
#         ], 'or'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(3, 4, 'Mo', 'RCT')], 'and'),
#             PeriodGroup([ClassTime(5, 6, 'Mo', 'RCT')], 'and')
#         ], 'or')
#     ], 'and'),
#     PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(11, 12, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([ClassTime(0, 1, 'Mo', 'LEC')], 'and')
#         ], 'or'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(7, 8, 'Mo', 'RCT')], 'and'),
#             PeriodGroup([ClassTime(2, 3, 'Mo', 'RCT')], 'and')
#         ], 'or')
#     ], 'and'),
#     PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(11, 12, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([
#                 ClassTime(13, 14, 'Mo', 'RCT'),
#                 ClassTime(5, 6, 'Mo', 'RCT'),
#                 ClassTime(7, 8, 'Mo', 'RCT')
#             ], 'or')
#         ], 'and'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(2, 3, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([
#                 ClassTime(4, 5, 'Mo', 'RCT'),
#                 ClassTime(6, 7, 'Mo', 'RCT'),
#                 ClassTime(8, 9, 'Mo', 'RCT')
#             ], 'or')
#         ], 'and')
#     ], 'or')
# ], 'and')

# pg = PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(2, 3, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([
#                 ClassTime(4, 5, 'Mo', 'RCT'),
#                 ClassTime(6, 7, 'Mo', 'RCT'),
#                 ClassTime(8, 9, 'Mo', 'RCT')
#             ], 'or')
#         ], 'and'),
#         ClassTime(12,35,'Mo', 'BOB')
#     ], 'or')


t=time()
print(list(pg.evaluate()))
print(time()-t)
# [
#     (
#         (
#             (? Mo 1 - 2,), 
#             (? Mo 3 - 4,)
#         ), 
#         (
#             (? Mo 11 - 12,), 
#             (? Mo 7 - 8,)
#         )
#     ), 
#     (
#         (
#             (? Mo 1 - 2,), 
#             (? Mo 5 - 6,)
#         ), 
#         (
#             (? Mo 11 - 12,), 
#             (? Mo 7 - 8,)
#         )
#     )
# ]

# [
#     (
#         (
#             (
#                 (? Mo 1 - 2,),
#             ), 
#             (
#                 (? Mo 3 - 4,),
#             )
#         ), 
#         (
#             (? Mo 11 - 12,), 
#             (? Mo 7 - 8,)
#         )
#     ), 
#     (
#         (
#             (
#                 (? Mo 1 - 2,),
#             ), 
#             (
#                 (? Mo 5 - 6,),
#             )
#         ), 
#         (
#             (? Mo 11 - 12,), 
#             (? Mo 7 - 8,)
#         )
#     )
# ]

# [
#     (
#         (
#             (
#                 (LEC Mo 1 - 2,),
#             ), 
#             (
#                 (RCT Mo 3 - 4,),
#             )
#         ), 
#         (
#             (
#                 (LEC Mo 11 - 12,),
#             ), 
#             (
#                 (RCT Mo 7 - 8,),
#             )
#         ), 
#         (
#             (
#                 (LEC Mo 11 - 12,), 
#                 (
#                     (RCT Mo 13 - 14,),
#                 )
#             ), 
#             (
#                 (LEC Mo 11 - 12,), 
#                 (
#                     (RCT Mo 5 - 6,),
#                 )
#             ), 
#             (
#                 (LEC Mo 11 - 12,), 
#                 (
#                     (RCT Mo 7 - 8,),
#                 )
#             )
#         )
#     ), 
#     (
#         (
#             (
#                 (LEC Mo 1 - 2,),
#             ), 
#             (
#                 (RCT Mo 5 - 6,),
#             )
#         ), 
#         (
#             (
#                 (LEC Mo 11 - 12,),
#             ), 
#             (
#                 (RCT Mo 7 - 8,),
#             )
#         ), 
#         (
#             (
#                 (LEC Mo 11 - 12,), 
#                 (
#                     (RCT Mo 13 - 14,),
#                 )
#             ), 
#             (
#                 (LEC Mo 11 - 12,), 
#                 (
#                     (RCT Mo 5 - 6,),
#                 )
#             ), 
#             (
#                 (LEC Mo 11 - 12,), 
#                 (
#                     (RCT Mo 7 - 8,),
#                 )
#             )
#         )
#     )
# ]

# [
    # ((((LEC Mo 1 - 2,),), ((RCT Mo 3 - 4,),)), (((LEC Mo 11 - 12,),), ((RCT Mo 7 - 8,),)), (((LEC Mo 11 - 12,), (RCT Mo 13 - 14,)), ((LEC Mo 11 - 12,), (RCT Mo 5 - 6,)), ((LEC Mo 11 - 12,), (RCT Mo 7 - 8,)))), ((((LEC Mo 1 - 2,),), ((RCT Mo 5 - 6,),)), (((LEC Mo 11 - 12,),), ((RCT Mo 7 - 8,),)), (((LEC Mo 11 - 12,), (RCT Mo 13 - 14,)), ((LEC Mo 11 - 12,), (RCT Mo 5 - 6,)), ((LEC Mo 11 - 12,), (RCT Mo 7 - 8,))))]

'''

CourseArrangement - &
    [ClassTimes]

Course - (a|b) & (c|d)
    [ClassTimes]

ClassTimes - |
    [ClassTime]

'''

