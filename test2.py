from course_scheduler import *

# def test_it(pg):
#     ev = pg.evaluate()
#     print(ev)
#     print('length:', len(ev))
#     for x in ev:
#         for y in x:
#             print(y.kind, y.start_time, y.end_time)
#         print()

# same for js and python
# pg = PeriodGroup([
#     PeriodGroup([ClassTime(1, 3, 'M', 'A'), ClassTime(7, 8, 'M', 'B')], 'or'),
#     PeriodGroup([ClassTime(2, 4, 'M', 'C'), ClassTime(9, 10, 'M', 'D')], 'or')
# ], 'and')

# same for js and python
# pg = PeriodGroup([
#     PeriodGroup([ClassTime(23, 34, 'Mo', 'A')], 'and'),
#     PeriodGroup([
#         PeriodGroup([ClassTime(56, 57, 'Mo', 'B')], 'and'),
#         PeriodGroup([ClassTime(6, 7, 'Mo', 'C')], 'and'),
#         PeriodGroup([ClassTime(8, 9, 'Mo', 'D')], 'and')
#     ], 'or')
# ], 'and', False)

# same for js and python
# pg = PeriodGroup([
#     PeriodGroup([
#         ClassTime(1, 2, 'Mo', 'A'),
#         ClassTime(4, 6, 'Mo', 'B')
#     ], 'or'),
#     PeriodGroup([
#         PeriodGroup([ClassTime(3, 4, 'Mo', 'C')], 'and'),
#         PeriodGroup([ClassTime(5, 6, 'Mo', 'D')], 'and')
#     ], 'or')
# ], 'and', False)

# same for js and python
# pg = PeriodGroup([
#     PeriodGroup([
#         PeriodGroup([ClassTime(11, 13, 'Mo', 'A')], 'and'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(13, 14, 'Mo', 'B')], 'and'),
#             PeriodGroup([ClassTime(5, 12, 'Mo', 'C')], 'and'),
#             PeriodGroup([ClassTime(7, 8, 'Mo', 'D')], 'and')
#         ], 'or')
#     ], 'and', False),
#     PeriodGroup([
#         PeriodGroup([ClassTime(23, 34, 'Mo', 'E')], 'and'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(56, 57, 'Mo', 'F')], 'and'),
#             PeriodGroup([ClassTime(6, 7, 'Mo', 'G')], 'and'),
#             PeriodGroup([ClassTime(8, 9, 'Mo', 'H')], 'and')
#         ], 'or')
#     ], 'and', False)
# ], 'or')

# pg = PeriodGroup([
#     PeriodGroup([
#         PeriodGroup([
#             ClassTime(1, 2, 'Mo', 'LEC'),
#             ClassTime(4, 6, 'Mo', 'LEC')
#         ], 'or'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(3, 4, 'Mo', 'RCT')], 'and'),
#             PeriodGroup([ClassTime(5, 6, 'Mo', 'RCT')], 'and')
#         ], 'or')
#     ], 'and', False),
#     PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(11, 12, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([ClassTime(0, 1, 'Mo', 'LEC')], 'and')
#         ], 'or'),
#         PeriodGroup([
#             PeriodGroup([ClassTime(7, 8, 'Mo', 'RCT')], 'and'),
#             PeriodGroup([ClassTime(2, 3, 'Mo', 'RCT')], 'and')
#         ], 'or')
#     ], 'and', False),
#     PeriodGroup([
#         PeriodGroup([
#             PeriodGroup([ClassTime(11, 12, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([
#                 PeriodGroup([ClassTime(13, 14, 'Mo', 'RCT')], 'and'),
#                 PeriodGroup([ClassTime(5, 6, 'Mo', 'RCT')], 'and'),
#                 PeriodGroup([ClassTime(7, 8, 'Mo', 'RCT')], 'and')
#             ], 'or')
#         ], 'and', False),
#         PeriodGroup([
#             PeriodGroup([ClassTime(23, 34, 'Mo', 'LEC')], 'and'),
#             PeriodGroup([
#                 PeriodGroup([ClassTime(56, 57, 'Mo', 'RCT')], 'and'),
#                 PeriodGroup([ClassTime(6, 7, 'Mo', 'RCT')], 'and'),
#                 PeriodGroup([ClassTime(8, 9, 'Mo', 'RCT')], 'and')
#             ], 'or')
#         ], 'and', False)
#     ], 'or')
# ], 'and', False)

# t = time()
# ev = pg.evaluate()
# print(time() - t)
# print(len(ev))
# for x in ev:
#     print(x)

with open('classes_data/classes Spring 2020.json') as json_file:
    classes = json.load(json_file)

classes_groups_by_course_num = {}
for c in classes['searchResults']:
    pg = course_to_period_group(c, only_consider_open_classes=True)
    course_num = c['course_num']
    if course_num in classes_groups_by_course_num:
        classes_groups_by_course_num[course_num].append(pg)
    else:
        classes_groups_by_course_num[course_num] = [pg]

# names = ['PHY-0012', 'MATH-0042', 'ENG-0001', 'ES-0002', 'COMP-0015']
names = ['MATH-0042']
t = time()
cs_i = [classes_groups_by_course_num[x][0] for x in names]
pg = PeriodGroup(cs_i, 'and')
schedules = pg.evaluate()
print(time() - t)
print(len(schedules))
for s in schedules:
    print(s)
    print()
print(pg)

# Group([], 'and') means the presence of nothing; 1 possibility
# Group([], 'or') means the absence of anything; 0 possibilities
g = Group([Group([G(1), G(2)], 'or'), Group([], 'or')], 'and')
print(g)
print(g.evaluate())
'''

(MATH-0042 ((((LEC Mo 9:30:00 - 10:20:00 & LEC We 9:30:00 - 10:20:00 & LEC Fr 9:30:00 - 10:20:00)) & ((RCT Tu 8:30:00 - 9:20:00) | (RCT Tu 10:30:00 - 11:20:00) | (RCT Tu 13:30:00 - 14:20:00))) | (((RCT Tu 9:30:00 - 10:20:00) | (RCT Tu 12:00:00 - 12:50:00)))))



(
    (
        (
            (
                (LEC Mo 9:30:00 - 10:20:00 & LEC We 9:30:00 - 10:20:00 & LEC Fr 9:30:00 - 10:20:00)
            )
            &
            (
                (RCT Tu 8:30:00 - 9:20:00)
                |
                (RCT Tu 10:30:00 - 11:20:00)
                |
                (RCT Tu 13:30:00 - 14:20:00)
            )
        )
        |
        (
            (
                (RCT Tu 9:30:00 - 10:20:00)
                |
                (RCT Tu 12:00:00 - 12:50:00)
            )
        )
    )
)

The problem is that there are recitations which are open in assoc_class 5 but all lectures in assoc_class 5 are closed so those assoc_class 5 recitations shouldn't be there

'''