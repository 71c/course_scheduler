from course_scheduler import *

def annalise_reminants():
    print("hello")
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

    ds = set()
    for x in classes['searchResults']:
        d = x['level1_groupid']
        ds.add(d)
    print(len(ds), len(classes['searchResults']))


    # math42 = classes_groups_by_course_num['MATH-0042'][0]
    # print(math42)

    # t = time()
    # for v in classes_groups_by_course_num.values():
    #     for c in v:
    #         c.evaluate()
    # print(time() - t)

    # names = ['COMP-0015', 'ES-0003', 'MATH-0061', 'MATH-0070', 'CHEM-0012']
    # classes = [classes_groups_by_course_num[x][0] for x in names]
    # classes_evaluated = [x.evaluate() for x in classes]
    # for x in classes:
    #     print(x)
    #     print()

    # names = ['PHY-0012', 'MATH-0042', 'ENG-0001', 'ES-0002', 'COMP-0015', 'CHEM-0001', 'MATH-0061']
    # names = ['PHY-0012', 'MATH-0042', 'ENG-0001', 'ES-0002']
    names = ['PHY-0012', 'MATH-0042', 'ENG-0001', 'ES-0002', 'COMP-0015']
    random.shuffle(names)
    # names = ['MATH-0042', 'COMP-0015']
    cs_i = [classes_groups_by_course_num[x][0] for x in names]
    # phy_2_2 = classes_groups_by_course_num['PHY-0002'][1]
    # cs_i.append(phy_2_2)
    # names.append('PHY-0002')

    pg = PeriodGroup(cs_i, 'and')
    print(pg)
    t = time()
    ev = pg.evaluate()
    print(time() - t, 'EV_TIME')
    print(len(ev))
    print(len(ev))

    # exclusions = []
    # min_class_time = 570
    # ev = [
    #     x for x in ev if
    #     not any(
    #         name not in exclusions and any(z.start_time < min_class_time for z in y)
    #         for name, y in zip(names, x)
    #     )
    # ]
    # print(len(ev))

    # func2 = lambda x: max(get_day_class_lengths(flatten_list(x)))

    # ev.sort(key=func2)

    # most_spread_out = ev[0]
    # least_spread_out = ev[-1]

    # most_spread_out_cal = to_ics(most_spread_out, names)
    # least_spread_out_cal = to_ics(least_spread_out, names)

    # print(func2(most_spread_out))
    # print(func2(least_spread_out))

    # rands = random.sample(ev, 5)

    # with open('most_spread_out.ics', 'w') as f:
    #     f.writelines(most_spread_out_cal)

    # with open('least_spread_out.ics', 'w') as f:
    #     f.writelines(least_spread_out_cal)

    # for i, rand in enumerate(rands):
    #     cal = to_ics(rand, names)
    #     print(rand)
    #     print()
    #     with open(f'rand{i}.ics', 'w') as f:
    #         f.writelines(cal)



    '''
    More afternoon than morning classes:
    Classes MUST start 10AM or later!
    '''


    # u = classes_groups_by_course_num['PHY-0012'][0]
    # print(len(u.evaluate()))



def main():
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



    # names = ['PHY-0012', 'MATH-0042', 'ENG-0001', 'ES-0002', 'COMP-0015', 'CHEM-0001', 'MATH-0061', 'ES-0003', 'CHEM-0012']
    # # names = ['PHY-0012', 'MATH-0042', 'ENG-0001', 'ES-0002', 'COMP-0015']
    # # names = ['COMP-0015', 'MATH-0070', 'MATH-0061', 'ES-0003']
    # # random.shuffle(names)
    # # names = ['MATH-0042', 'COMP-0015']
    # cs_i = [classes_groups_by_course_num[x][0] for x in names]
    # # phy_2_2 = classes_groups_by_course_num['PHY-0002'][1]
    # # cs_i.append(phy_2_2)
    # # names.append('PHY-0002')

    # pg = PeriodGroup(cs_i, 'and')
    # print([len(x.contents) for x in pg.contents])
    # # pg = PeriodGroup([pg, classes_groups_by_course_num['MATH-0070'][0]], 'and')
    # cProfile.runctx('pg.evaluate()', None, locals(), sort='cumulative')

    # t = time()
    # ev = pg.evaluate()
    # print(time() - t, 'EV_TIME')
    # print(len(ev))

    # names = ['MATH-0166', 'PHIL-0192', 'MATH-0070']
    names = ['PHY-0012', 'MATH-0042', 'ENG-0001', 'ES-0002', 'COMP-0015']
    t = time()
    cs_i = [classes_groups_by_course_num[x][0] for x in names]
    pg = PeriodGroup(cs_i, 'and')
    schedules = pg.evaluate()
    print(time() - t)
    print(len(schedules))

    # t = time()
    # for c in classes['searchResults']:
    #     pg = course_to_period_group(c, only_consider_open_classes=False)
    # print(time() - t)

    # for x in schedules:
    #     print(x)
    #     print()
    # a_calendar = to_ics(schedules[0], names)
    # with open('sam_cal.ics', 'w') as f:
    #     f.writelines(a_calendar)








if __name__ == '__main__':
    main()




'''

PHY-0012 (
    (
        (
            (RCT Tu 16:30:00 - 17:20:00) | (RCT We 16:30:00 - 17:20:00) | (RCT Th 9:30:00 - 10:20:00) | (RCT Tu 18:00:00 - 18:50:00) | (RCT Th 15:00:00 - 15:50:00)
        )
    )
    &
    (
        (
            (
                (LEC Tu 10:30:00 - 11:45:00 & LEC Th 10:30:00 - 11:45:00 & LEC Tu 10:30:00 - 11:45:00 & LEC Th 10:30:00 - 11:45:00)
            )
        )
    )
)




MATH-0042
(
    (
        (
            (LEC Tu 9:30:00 - 10:20:00 & LEC We 9:30:00 - 10:20:00 & LEC Fr 9:30:00 - 10:20:00)
        )
        &
        (
            (RCT We 8:30:00 - 9:20:00) | (RCT We 16:30:00 - 17:20:00) | (RCT We 18:00:00 - 18:50:00)
        )
    )
    |
    (
        (
            (LEC Mo 9:30:00 - 10:20:00 & LEC Tu 10:30:00 - 11:20:00 & LEC Th 10:30:00 - 11:20:00))
        &
        (
            (RCT Th 8:30:00 - 9:20:00) | (RCT Th 12:00:00 - 12:50:00) | (RCT Th 16:30:00 - 17:25:00)
        )
    )
    |
    (
        (
            (LEC Tu 12:00:00 - 12:50:00 & LEC Th 12:00:00 - 12:50:00 & LEC Fr 12:00:00 - 12:50:00)
        )
        &
        (
            (RCT Th 8:30:00 - 9:20:00) | (RCT Th 15:00:00 - 15:50:00) | (RCT Th 16:30:00 - 17:25:00)
        )
    )
)





MATH-0042
(
    ( (A & B & C) & (D | E | F) )
    |
    ( (G & H & I) & (J | K | L) )
    |
    ( (M & N & O) & (P | Q | R) )
)





((A & B & C) | (D & E & F))
&
((G & H & I) | (J & K & L))
&
((M & N & O) | (P & Q & R))





(p9999_1 | p9999_2)
&
(
    ((c1l1 | c1l2) & (c1r1 | c1r2))
    |
    ((c2l1 | c2l2) & (c2r1 | c2r2))
)


(p9999_1 | p9999_2)
&
(
    (
        (c1l1 | c1l2)
        &
        (c1r1 | c1r2)
    )
    |
    (
        (c2l1 | c2l2)
        &
        (c2r1 | c2r2)
    )
)


(p9999_1 | p9999_2)
&
(
    (
        ((c1l1t1 & c1l1t2) | (c1l2t1 & c1l2t2))
        &
        ((c1r1t1 & c1r1t2) | (c1r2t1 & c1r2t2))
    )
    |
    (
        ((c2l1t1 & c2l1t2) | (c2l2t1 & c2l2t2))
        &
        ((c2r1t1 & c2r1t2) | (c2r2t1 & c2r2t2))
    )
)


(
    ((c9999l1t1 & c9999l1t2) | (c9999l2t1 & c9999l2t2))
    &
    ((c9999r1t1 & c9999r1t2) | (c9999r2t1 & c9999r2t2))
)
&
(
    (
        ((c1l1t1 & c1l1t2) | (c1l2t1 & c1l2t2))
        &
        ((c1r1t1 & c1r1t2) | (c1r2t1 & c1r2t2))
    )
    |
    (
        ((c2l1t1 & c2l1t2) | (c2l2t1 & c2l2t2))
        &
        ((c2r1t1 & c2r1t2) | (c2r2t1 & c2r2t2))
    )
)

that above is the same as
(
    (
        ((c9999l1t1 & c9999l1t2) | (c9999l2t1 & c9999l2t2))
        &
        ((c9999r1t1 & c9999r1t2) | (c9999r2t1 & c9999r2t2))
        &
        ((c1l1t1 & c1l1t2) | (c1l2t1 & c1l2t2))
        &
        ((c1r1t1 & c1r1t2) | (c1r2t1 & c1r2t2))
    )
    |
    (
        ((c9999l1t1 & c9999l1t2) | (c9999l2t1 & c9999l2t2))
        &
        ((c9999r1t1 & c9999r1t2) | (c9999r2t1 & c9999r2t2))
        &
        ((c2l1t1 & c2l1t2) | (c2l2t1 & c2l2t2))
        &
        ((c2r1t1 & c2r1t2) | (c2r2t1 & c2r2t2))
    )
)


I am not compatible with myself
If I am in an & group, I am compatible with everyone else in my group,
    and if the group I am in is a group of periods, it can be assumed that none of these periods conflicts with any other
If I am in an | group, I am not compatible with anyone else in my group
If groups A and B are compatible (i.e. in an & group), a is compatible with b for any a from A and b from B, unless a and b conflict
If groups A and B are not compatible (i.e. in an | group), a is not compatible with b for any a from A and b from B



Let's check which periods c1l1t1 is compatible with

(? & ?)
&
(
    (
        ((N & Y) | (N & N))
        &
        ((? & ?) | (? & ?))
    )
    |
    (
        ((N & N) | (N & N))
        &
        ((N & N) | (N & N))
    )
)



classv1 | classv2

classv1 =
component1 & component2

component1 =
component1v1 | component1v2

component1v1 =
period1 & period2




compatible = lambda a, b: a.course_id != b.course_id and not a.intersects(b) or a.course_id == b.course_id and a != b and a.assoc_class == b.assoc_class and (a.comp_desc == b.comp_desc and a.class_num == b.class_num or a.comp_desc != b.comp_desc and not a.intersects(b))
def compatible(a, b):
    if a.course_id != b.course_id:
        return not a.intersects(b)
    if a == b or a.assoc_class != b.assoc_class:
        return False
    if a.comp_desc == b.comp_desc:
        return a.class_num == b.class_num
    return not a.intersects(b)

def compatible(a, b):
    if a.course_id != b.course_id:
        return not a.intersects(b)
    if a.assoc_class != b.assoc_class or a.comp_desc == b.comp_desc:
        return False
    return not a.intersects(b)

def compatible(a, b):
    if a.course_id != b.course_id or not (a.assoc_class != b.assoc_class or a.comp_desc == b.comp_desc):
        return not a.intersects(b)
    return False

def compatible(a, b):
    if a.course_id != b.course_id or a.assoc_class == b.assoc_class and a.comp_desc != b.comp_desc:
        return not a.intersects(b)
    return False


so we have

(
    (
        ((c9999l1t1 & c9999l1t2) | (c9999l2t1 & c9999l2t2))
        &
        ((c9999r1t1 & c9999r1t2) | (c9999r2t1 & c9999r2t2))
        &
        ((c1l1t1 & c1l1t2) | (c1l2t1 & c1l2t2))
        &
        ((c1r1t1 & c1r1t2) | (c1r2t1 & c1r2t2))
    )
    |
    (
        ((c9999l1t1 & c9999l1t2) | (c9999l2t1 & c9999l2t2))
        &
        ((c9999r1t1 & c9999r1t2) | (c9999r2t1 & c9999r2t2))
        &
        ((c2l1t1 & c2l1t2) | (c2l2t1 & c2l2t2))
        &
        ((c2r1t1 & c2r1t2) | (c2r2t1 & c2r2t2))
    )
)


intersection_matrix = np.zeros((n_periods, n_periods))
for class_version in class_versions:
    for component in class_version:
        for component_version in component:
            for period in component_version:
                intersection_matrix[period.id, period.id] = 1
                for 



'''