import numpy as np

weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr']

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

def get_day_class_lengths(class_time_list, normalize=True):
    """returns total number of minutes of class time each day from a schedule,
    optionally normalized to sum to 1"""
    minute_counts = [0, 0, 0, 0, 0]
    for class_time in class_time_list:
        index = weekdays.index(class_time.day)
        minute_counts[index] += class_time.end_time - class_time.start_time
    minute_counts = np.array(minute_counts)
    if normalize:
        minute_counts = minute_counts / sum(minute_counts)
    return minute_counts
