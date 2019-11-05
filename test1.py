import json
from course_scheduler import ClassTime



def get_mean_mad(class_time_list, time_range=None):
	n = len({t.day for t in class_time_list})
	start_and_end_times = []
	for class_time in class_time_list:
		start_and_end_times.append({"time": class_time.start_time, "kind": "start"})
		start_and_end_times.append({"time": class_time.end_time, "kind": "end"})
	start_and_end_times.sort(key=lambda x: x["time"])
	beginning_time = start_and_end_times[0]["time"]
	current_time = beginning_time
	n_classes_at_once = 1
	total_mad = 0
	for t in start_and_end_times[1:]:
		new_time = t["time"]
		dt = new_time - current_time
		if dt != 0:
			total_mad += dt * n_classes_at_once * (n - n_classes_at_once)
			current_time = new_time
		n_classes_at_once += 1 if t["kind"] == "start" else -1
	if time_range is None:
		time_range = current_time - beginning_time
	total_mad *= 2/n**2 / time_range
	return total_mad


if __name__ == '__main__':
	# with open('classes_data/classes Fall 2019.json') as json_file:
	# 	classes = json.load(json_file)

	# for c in classes['searchResults']:
	# 	sections = [s for s in c['sections'] if s['comp_desc'] == 'Lecture']
	# 	if len(sections) != 0:
	# 		# has_special_thing = 'assoc_class' in sections[0]['components'][0]
	# 		for component in sections[0]['components']:
	# 			print(component['assoc_class'])
	# 		print()

	class_time_list = [
		ClassTime(2, 5, 'Mon', '?'),
		ClassTime(2, 5, 'Tue', '?'),
		ClassTime(7, 11, 'Wed', '?')
	]
	print(get_mean_mad(class_time_list, 10))

