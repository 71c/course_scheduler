import json
import random
from time import time, sleep
import cProfile
import networkx as nx
from networkx.algorithms import clique


class Section:
    def __init__(self, course_num, course_title, course_id, class_num, assoc_class, comp_desc, comp_desc_short, section_id):
        self.course_num = course_num
        self.course_title = course_title
        self.course_id = course_id
        self.class_num = class_num
        self.assoc_class = assoc_class
        self.comp_desc = comp_desc
        self.meeting_times = {}
        self.section_id = section_id

    def add_time(self, day, meet_start_min, meet_end_min):
        if day in self.meeting_times:
            self.meeting_times[day].append({'start': meet_start_min, 'end': meet_end_min})
        else:
            self.meeting_times[day] = [{'start': meet_start_min, 'end': meet_end_min}]

    # def conflicts_with(self, other):

    #     if self.course_id != other.course_id or self.assoc_class == other.assoc_class and self.comp_desc != other.comp_desc:
    #         print('o')
    #         return not self.time_conflicts(other)
        
    #     return True

    def conflicts_with(self, b):
        different_assoc_class = self.assoc_class != b.assoc_class and self.assoc_class != '9999' and b.assoc_class != '9999'
        if self.section_id == b.section_id:
            return True
        if self.course_id == b.course_id and different_assoc_class:
            return True
        if not different_assoc_class and self.course_id == b.course_id and self.comp_desc != b.comp_desc:
            return self.time_conflicts(b)
        if self.course_id != b.course_id:
            return self.time_conflicts(b)
        if not different_assoc_class and self.course_id == b.course_id and self.comp_desc == b.comp_desc and self.class_num != b.class_num:
            return True
        print(self.assoc_class, b.assoc_class, self.course_id, b.course_id, self.comp_desc, b.comp_desc, self.class_num, b.class_num)


    def time_conflicts(self, other):
        for day, periods in self.meeting_times.items():
            if day in other.meeting_times.keys():
                for period_1 in periods:
                    for period_2 in other.meeting_times[day]:
                        if period_1['start'] <= period_2['end'] and period_1['end'] >= period_2['start']:
                            return True
        return False

    def __repr__(self):
        return f'Section(course_num={self.course_num}, class_num={self.class_num}, assoc_class={self.assoc_class}, comp_desc={self.comp_desc})'


class ScheduleGenerate:
    def __init__(self):
        self.sections_by_id = {}
        self.neighbor_sections = {}
        self.conflict_matrix = {}
        # self.course_to_

    def get_sections(self, courses, exclude_classes_with_no_days=True, only_consider_open_classes=True):
        sections = []
        curr_id = 0
        for course in courses:
            course_num = course['course_num']
            course_title = course['course_title']
            course_id = course['level1_groupid']
            for section in course['sections']:
                comp_desc = section['comp_desc']
                for component in section['components']:
                    if only_consider_open_classes and component['status'] != 'O':
                        continue

                    assoc_class = component['assoc_class']
                    class_num = component['class_num']
                    comp_desc_short = component['ssr_comp']
                    
                    # combine all locations into 1 because we don't care about where things are
                    section = Section(course_num, course_title, course_id, class_num, assoc_class, comp_desc, comp_desc_short, curr_id)
                    curr_id += 1
                    n_times = 0
                    for location in component['locations']:
                        for meeting in location['meetings']:
                            for day in meeting['days']:
                                section.add_time(day, meeting['meet_start_min'], meeting['meet_end_min'])
                                n_times += 1
                    
                    if not (exclude_classes_with_no_days and n_times == 0):
                        self.sections_by_id[section.section_id] = section

    # def sections_are_compatible(self, a_id, b_id):
        # if a_id == b_id:
        #     return False
        # if a_id not in self.conflict_matrix or b_id not in self.conflict_matrix[a_id]:
        #     if a_id not in self.conflict_matrix:
        #         self.conflict_matrix[a_id] = {}
        #         self.conflict_matrix[b_id] = {}
        #     conflict_status = not self.sections_by_id[a_id].conflicts_with(self.sections_by_id[b_id])
        #     self.conflict_matrix[a_id][b_id] = conflict_status
        #     self.conflict_matrix[b_id][a_id] = conflict_status
        # return self.conflict_matrix[a_id][b_id]

    def sections_are_compatible(self, a_id, b_id):
        if a_id == b_id:
            return False
        if a_id not in self.conflict_matrix:
            self.conflict_matrix[a_id] = {}
        if b_id not in self.conflict_matrix:
            self.conflict_matrix[b_id] = {}

        if b_id not in self.conflict_matrix[a_id]:
            conflict_status = not self.sections_by_id[a_id].conflicts_with(self.sections_by_id[b_id])
            self.conflict_matrix[a_id][b_id] = conflict_status
            self.conflict_matrix[b_id][a_id] = conflict_status
        # print("RES", self.conflict_matrix[a_id][b_id])
        return self.conflict_matrix[a_id][b_id]

    def get_neighbors(self, section_id):
        if section_id not in self.neighbor_sections:
            neighbors = {x for x in self.sections_by_id.keys() if self.sections_are_compatible(section_id, x)}
            self.neighbor_sections[section_id] = neighbors
        return self.neighbor_sections[section_id]

    # def get_possible_schedules(self, section_ids):
    #     self.max_len = 0
    #     schedules = []
    #     # def bron_kerbosch(R, P, X):
    #     #     if len(P) == 0 and len(X) == 0:
    #     #         if len(R) == 0:
    #     #             return
    #     #         if len(R) < self.max_len:
    #     #             return
    #     #         if len(R) > self.max_len:
    #     #             self.max_len = len(R)
    #     #         schedules.append(R)
    #     #     if len(P | R) < self.max_len:
    #     #         return
    #     #     for v in P.copy():
    #     #         neighbors = self.get_neighbors(v)
    #     #         bron_kerbosch(R | {v}, P & neighbors, X & neighbors)
    #     #         P.discard(v)
    #     #         X.add(v)

    #     def bron_kerbosch(R, P, X):
    #         if len(P) == 0 and len(X) == 0:
    #             if len(R) < self.max_len:
    #                 return
    #             if len(R) > self.max_len:
    #                 self.max_len = len(R)
    #             schedules.append(R)
    #             return
    #         if len(P | R) < self.max_len:
    #             return
    #         u = next(iter(P | X))
    #         for v in (P - self.get_neighbors(u)).copy():
    #             neighbors = self.get_neighbors(v)
    #             bron_kerbosch(R | {v}, P & neighbors, X & neighbors)
    #             P.discard(v)
    #             X.add(v)
    #     bron_kerbosch(set(), section_ids, set())
    #     max_ = max(list(map(len, schedules)))
    #     return [s for s in schedules if len(s) == max_]



    # def get_possible_schedules(self, section_ids):
    #     g = nx.Graph()
    #     n = len(section_ids)
    #     for i in section_ids:
    #         for neighbor in self.get_neighbors(i):
    #             g.add_edge(i, neighbor)
    #     cliques = clique.find_cliques_recursive(g)
    #     return list(cliques)
    #     # for i, section_id_1 in enumerate(section_ids):
    #     #     for j, section_id_2




if __name__ == '__main__':
    with open('classes_data/classes Spring 2020.json') as json_file:
        classes = json.load(json_file)

    courses_by_course_num = {}
    for c in classes['searchResults']:
        course_num = c['course_num']
        if course_num in courses_by_course_num:
            courses_by_course_num[course_num].append(c)
        else:
            courses_by_course_num[course_num] = [c]
    

    # t = time()
    # schedule_generate = ScheduleGenerate()
    # schedule_generate.get_sections(classes['searchResults'])
    # print(time() - t)


    # names = ['PHY-0012', 'MATH-0042', 'ENG-0001', 'ES-0002', 'COMP-0015', 'CHEM-0001', 'MATH-0061', 'MATH-0070']
    # random.shuffle(names)
    # # names = ['MATH-0042', 'COMP-0015']
    # courses = [courses_by_course_num[x][0] for x in names]
    # schedule_generate = ScheduleGenerate()
    # schedule_generate.get_sections(courses)

    # t = time()
    # schedules = schedule_generate.get_possible_schedules((schedule_generate.sections_by_id.keys()))
    # print(time() - t)
    # print(len(schedules))
    # # print(list(map(len, schedules)))
    # # print(schedules)

    # cProfile.run('schedule_generate.get_possible_schedules(set(schedule_generate.sections_by_id.keys()))', sort='cumulative')



    
    t = time()
    schedule_generate = ScheduleGenerate()
    schedule_generate.get_sections(classes['searchResults'])
    print(time() - t)
    comp_descs = {s.comp_desc for s in schedule_generate.sections_by_id.values()}
    comp_descs_frequencies = {comp_desc: 0 for comp_desc in comp_descs}
    for s in schedule_generate.sections_by_id.values():
        comp_descs_frequencies[s.comp_desc] += 1
    print(comp_descs)
    print(comp_descs_frequencies)
    print(sorted(comp_descs_frequencies.items(), key=lambda x: x[1], reverse=True))



    
    
    # for c in classes['searchResults']:
    #     sections.extend(get_sections(c))
    # print(len(sections), len(classes['searchResults']))


    # ids = {x.class_num for x in sections}
    # print(len(ids), len(sections))






