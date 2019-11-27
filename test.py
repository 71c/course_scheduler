from course_scheduler import *

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


# classes = ['COMP-0015', 'ES-0003', 'MATH-0061', 'MATH-0070', 'CHEM-0001']
classes = ['COMP-0015', 'MATH-0042', 'MATH-0070', 'CHEM-0001', 'CHEM-0012', 'ENG-0001']
classes = ['COMP-0015', 'MATH-0070', 'MATH-0061', 'ES-0003', 'CHEM-0012']
random.shuffle(classes)
pg = PeriodGroup([classes_groups_by_course_num[x][0] for x in classes], 'and')
cProfile.run('list(pg.evaluate())', sort='cumulative')
ev = list(pg.evaluate())

c = to_ics(random.choice(ev), classes)
with open('crazy.ics', 'w') as f:
    f.writelines(c)

print(ev[0])

print(len(ev))
print("HEREEE")


comp15 = classes_groups_by_course_num['COMP-0015'][0]
chem12 = classes_groups_by_course_num['CHEM-0012'][0]
math70 = classes_groups_by_course_num['MATH-0070'][0]
math61 = classes_groups_by_course_num['MATH-0061'][0]
snd38 = classes_groups_by_course_num['SND-0038'][0]
es3 = classes_groups_by_course_num['ES-0003'][0]
load = PeriodGroup([math70, chem12, comp15, math61], 'and')
t = time()
possibilities = list(load.evaluate())
print(time() - t)
print(len(possibilities))

class_names = [course.data for course in load.contents]

time_range = time_range=60*12
# time_range = None

func1 = lambda x: get_mean_mad(flatten_list(x), time_range=time_range)
func2 = lambda x: max(get_day_class_lengths(flatten_list(x)))
func3 = lambda x: (func1(x), func2(x))
func4 = lambda x: (func2(x), func1(x))
# func5 = lambda x: (func2(x) + func1(x), len([y for y in flatten_list(x) if y.start_time < 630]), len([y for y in flatten_list(x) if y.start_time < 570]))
func5 = lambda x: (len([y for y in flatten_list(x) if y.start_time < 630]), len([y for y in flatten_list(x) if y.start_time < 570]), func2(x) + func1(x))
func6 = lambda x: (len([y for y in flatten_list(x) if y.start_time < 630]), len([y for y in flatten_list(x) if y.start_time < 570]), func2(x), func1(x))
func7 = lambda x: (len(flatten_list(x)), func2(x), func1(x))
# func5 = lambda x: ( func2(x) + func1(x))


possibilities.sort(key=func3)
best = possibilities[0]

print(best)
print(func3(best))


# scores = [func(x) for x in possibilities]
# scores.sort()
# print(scores[:20], scores[-20:])
# print(np.mean(scores))
# plt.hist(scores)
# plt.show()

c = to_ics(best, class_names)
with open('my2.ics', 'w') as f:
    f.writelines(c)


# a = get_class_options(['COMP-0015', 'CHEM-0012'], [
#     ['MATH-0061', 'MATH-0070'],
#     ['ES-0003', 'SND-0038']
# ])
# a = get_class_options(['COMP-0015', 'CHEM-0012'], [
# a = get_class_options(['COMP-0015', 'CHEM-0001'], [
#     [['MATH-0061', 'MATH-0070', 'ES-0003'], 2],
# ])

a = get_class_options(['COMP-0015', 'ES-0003', 'MATH-0061', 'MATH-0070', 'CHEM-0001'], [])
# a = get_class_options(['COMP-0015', 'ES-0003'],
#     [[['MATH-0061', 'MATH-0070', 'CHEM-0001'], 2]])
print(a, len(a))

min_class_time = 630 # 10:30
min_class_time_2 = 570 # 10:30
exclusions = ['CHEM-0012']

# for u in a:
#     pg = PeriodGroup([classes_groups_by_course_num[x][0] for x in u], 'and')
#     ev = list(pg.evaluate())
#     if len(ev) > 0:
#         scores1 = [func1(x) for x in ev]
#         scores2 = [func2(x) for x in ev]
#         scores3 = [(func4(x)) for x in ev]
#         scores5 = [(func5(x)) for x in ev]
#         print(min(scores1), min(scores2), min(scores3))
#         print(min(scores5))
#     else:
#         print("No classes")

# classes = ['COMP-0015', 'CHEM-0012', 'MATH-0061', 'ES-0003']
# classes = ['COMP-0015', 'CHEM-0012', 'MATH-0070', 'ES-0003']
# classes = ['COMP-0015', 'ES-0003', 'MATH-0061', 'MATH-0070']

# classes = ['COMP-0015', 'ES-0003', 'MATH-0061', 'MATH-0070', 'CHEM-0001']
# classes = ['COMP-0015', 'ES-0003', 'MATH-0061', 'CHEM-0001']
classes = ['COMP-0015', 'ES-0003', 'MATH-0061', 'MATH-0070', 'CHEM-0012']
pg = PeriodGroup([classes_groups_by_course_num[x][0] for x in classes], 'and')
cProfile.run('list(pg.evaluate())', sort='cumulative')
ev = list(pg.evaluate())

print(len(ev))
print(len([e for e in ev if func5(e)[0] == 0]))

# ev = [
#     x for x in ev if
#     not any(
#         name not in exclusions and any(z.start_time < min_class_time for z in y)
#         for name, y in zip(u, x)
#     )
# ]

best = min(ev, key=func6)
print(best)
print(func7(best))
print(get_day_class_lengths(flatten_list(best), normalize=False).sum())
c = to_ics(best, classes)
with open('my2.ics', 'w') as f:
    f.writelines(c)




# classes = ['COMP-0015', 'ES-0003', 'MATH-0061', 'MATH-0070', 'CHEM-0001', 'SND-0038', 'CHEM-0012']
# classes = ['SND-0038', 'MATH-0070', 'MATH-0061', 'ES-0003', 'CHEM-0012', 'CHEM-0001', 'COMP-0015']
# classes = ['COMP-0015', 'ES-0003', 'MATH-0061', 'MATH-0070']
# pg = PeriodGroup([classes_groups_by_course_num[x][0] for x in classes], 'and', cache=False)
# cProfile.run('list(pg.evaluate())', sort='cumulative')

# cProfile.run('list(pg.evaluate())', sort='cumulative')

# # print(len(list(pg.evaluate())))


def get_intervals(x):
    if type(x) is ClassTime:
        return x
    if len(x.contents) == 1:
        return get_intervals(x.contents[0])
    return [get_intervals(y) for y in x.contents]
def get_things(course):
    a = []
    for kind in course.contents:
        a.append(get_intervals(kind))
    return a
g = get_things(comp15)
comp15_lab = [[x] for x in g[0]]
comp15_lec = g[1]
math70_lec = get_things(math70)
math61_lec = get_things(math61)
g = get_things(es3)
es3_lab = [[x] for x in g[0][0]]
es3_rct = [[g[0][1]]]
es3_lec = [g[1]]

g = get_things(chem12)
chem12_lab = [[x] for x in g[0][0]]
chem12_rct = [[x] for x in g[0][1]]
chem12_lec = [[x for x in g[1]]]

print(chem12_lab)
print(chem12_rct)
print(chem12_lec)
print("GOOGLE GOOGLE GOOGLE")

for u in get_things(chem12):
    print(u)
    print()

print(comp15_lab, "HISDFHSDFHSDIOFHSDFHSDOFHSDOFHSDOFHSDIFH")

print(chem12)

print(es3)

t = time()
all_sections = comp15_lab + comp15_lec + math70_lec + math61_lec + es3_lab + es3_rct + es3_lec + chem12_lab + chem12_rct + chem12_lec
section_ids = [1 for _ in comp15_lab] + [2 for _ in comp15_lec] + [3 for _ in math70_lec] + [4 for _ in math61_lec] + [5 for _ in es3_lab] + [6 for _ in es3_rct] + [7 for _ in es3_lec] + [8 for _ in chem12_lab] + [9 for _ in chem12_rct] + [10 for _ in chem12_lec]
# ub = list(zip(all_sections, section_ids))
# random.shuffle(ub)
# all_sections, section_ids = list(zip(*ub))
n_sections = len(all_sections)
intersection_matrix = np.zeros((n_sections, n_sections), dtype=np.uint8)
for i in range(n_sections):
    for j in range(i, n_sections):
        if section_ids[i] == section_ids[j]:
            intersection_matrix[i, j] = 1
            intersection_matrix[j, i] = 1
            continue
        
        they_intersect = False
        for a in all_sections[i]:
            for b in all_sections[j]:
                if a.intersects(b):
                    intersection_matrix[i, j] = 1
                    intersection_matrix[j, i] = 1
                    they_intersect = True
                    break
            if they_intersect:
                break

print(str(intersection_matrix.tolist()).replace('[', '{').replace(']', '}'))

print(time() - t)