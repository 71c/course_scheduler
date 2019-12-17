const sections = require('./models').sections;

var weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr'];

function arraySum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}

function schedule_to_period_list(schedule) {
	var periods = [];
    for (var sectionids_or_sections of schedule) {
        for (var sectionid_or_section of sectionids_or_sections) {
            var section_periods = typeof sectionid_or_section === "number" ?
                sections[sectionid_or_section].periods :
                sectionid_or_section;
            periods.push(...section_periods);
        }
    }
    return periods;
}

function get_mean_mad(schedule, time_range) {
    /*
        Purpose of function:
        get the mean of all the mean absolute deviations from the mean of whether classes meet for each time point
        across all days in a schedule.

        Inputs:
            schedule:
                a 2D array. Each element of schedule is a 1D array containing the IDs of Sections.
                The Sections in each schedule are grouped together by course: schedule looks like
                [[ID of course A section, ID of course A section, ...], [ID of course B section, ID of course B section, ...], ...]
            time_range (optional):
                the requested time range in the day to average over. This quantity is assumed to be greater than
                or equal to the latest class ending time minus the earliest class starting time in the schedule. It
                defaults to this minimum.

        What the mean absolute deviation (MAD) of whether classes meet at a time means:
        (a) For each point in time in an interval of the day that contains all the classes in a schedule, find
        whether a class meets at that time for all the days that ever have classes in the schedule (usually M-F).
        For a given point in time, for each day that there are ever classes in the schedule, represent whether any
        classes meet at that time with a 1 or a 0, with 1 meaning there is a class and 0 meaning there is no class. 
        For example, if
            1. the schedule in question has classes that meet on Monday, Tuesday, Wednesday, and Friday,
            2. the time to check is 12:00, and a class happens at 12:00 on Mondays and Wednesdays
        this is represented as [1, 0, 1, 0]: class on Monday, no class on Tuesday, class on Wednesday, no class on Friday.
        (b) Then find the mean absolute deviation of this array:
        Mean = (1 + 0 + 1 + 0) / 4 = 0.5, MAD = (|1-0.5|+|0-0.5|+|1-0.5|+|0-0.5|)/4 = 0.5
        But we don't need to calculate this value like that.
        It is actually equivalent to 2 (n1/n) (n0/n) = 2 n1 n0 / n^2, where n1 is the number of ones, n0 is the number of
        zeros, and n is the number of ones plus the number of zeros. This could also be represented like 2 p1 (1-p1)
        where p1 is the proportion of ones. The variance is half the MAD = p1 (1-p1).

        How the mean of all the MADs is calculated:
        So this MAD is now represented as a function of time. To find the mean MAD, integrate the function over the time
        interval and divide by the duration of the time interval:
            Average MAD = 1/T ∫MAD(t)dt
        where T is the duration of the total time interval.
        But obviously it is not possible to look at every point in time. So instead, find where the function is constant
        and calculate the equivalent quantity
            Average MAD = 1/T ∑MAD(t_i)∆t_i = 2/(T n^2) ∑n1(n-n1)∆t_i
        where
            t_i is the start of an interval of time where the number of days at once (and thus the MAD function) is constant, and
            ∆t_i is the duration of this time interval.
    */

    // get all periods from schedule
    var start_and_end_times = [];
    const days_set = new Set();
    for (var sectionids of schedule) {
        for (var sectionid of sectionids) {
        	for (var period of sections[sectionid].periods) {
        		start_and_end_times.append({time: period.start, kind: "start"});
        		start_and_end_times.append({time: period.end, kind: "end"});
        		days_set.add(period.day);
        	}
        }
    }
    // sort times by time
    start_and_end_times.sort((a, b) => a.time < b.time ? -1 : a.time > b.time ? 1 : 0);
    // number of days
    const n = days_set.size;
    
    const beginning_time = start_and_end_times[0].time;
    var current_time = beginning_time;
    var n_classes_at_once = 1;
    var total_mad = 0;
    for (const t of start_and_end_times[1:]) {
    	const new_time = t.time
        const dt = new_time - current_time
        if (dt !== 0) {
        	total_mad += dt * n_classes_at_once * (n - n_classes_at_once);
            current_time = new_time;
            n_classes_at_once += t.kind === "start" ? 1 : -1;
        }
    }
    if (time_range === undefined)
        time_range = current_time - beginning_time;
    total_mad *= 2/n**2 / time_range;
    return total_mad;
}

function get_day_class_lengths(class_time_list, normalize=true) {
    /* returns total number of minutes of class time each day from a schedule,
    optionally normalized to sum to 1 */
    var minute_counts = [0, 0, 0, 0, 0];
    for (const class_time of class_time_list) {
        const index = weekdays.indexOf(class_time.day);
        minute_counts[index] += class_time.end_time - class_time.start_time;
    }
    if (normalize) {
        const total_minutes = arraySum(minute_counts);
        minute_counts = minute_counts.map(minute_count => minute_count / total_minutes);
    }
    return minute_counts
}
