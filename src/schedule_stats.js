const models = require('./models');

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr'];

// The scoring system is of course arbitrary and is determined by what seems reasonable and logical,
// and what seems to give good results.

// if a class starts at or before this many minutes after midnight, it is considered a morning class
const MORNING_CLASS_THRESHOLD = 12 * 60; // 12:00
const MORNING_SLOPE = 1/105; // morningness score increase per increase in number of minutes before MORNING_CLASS_THRESHOLD
const MORNING_BIAS = 0.429; // morningness score when time = MORNING_CLASS_THRESHOLD

// if a class starts at or after this many minutes after midnight, it is considered an evening class
const EVENING_CLASS_THRESHOLD = 16 * 60; // 16:00
const EVENING_SLOPE = 1/105; // eveningness score increase per increase in number of minutes after EVENING_CLASS_THRESHOLD
const EVENING_BIAS = 0.429; // eveningness score when time = EVENING_CLASS_THRESHOLD

// maximum time between two classes such that those classes are considered consecutive
// (though the scoring function gives no points for gaps of this length)
const MAX_SHORT_GAP_TIME = 60;
// this number is always multiplied by the consecutiveness score to compensate for it being too low compared to other values
const CONSECUTIVENESS_WEIGHT = 2.0;

// maximum time between two classes that is considered definitely too short
const MAX_TOO_SHORT_GAP_TIME = 5;
// this number is always multiplied by the short-gapness score because these cases are important
const TOO_SHORT_GAPNESS_WEIGHT = 4.0;


// min start: 7:45AM
// min end: 9:00AM
// max start: 7:30PM
// max end: 10:00PM

function arraySum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}

function schedule_to_period_list(schedule, term) {
    /*
        Gets all the periods in a schedule
        Inputs:
            schedule:
                a 2D array. Each element of schedule is a 1D array containing the IDs of Sections or the Sections themselves.
                The Sections in each schedule are grouped together by course: schedule looks like
                [[ID of course A section, ID of course A section, ...], [ID of course B section, ID of course B section, ...], ...]
            term:
                the term (e.g. Fall 2019)
    */
	var periods = [];
    for (var sectionids_or_sections of schedule) {
        for (var sectionid_or_section of sectionids_or_sections) {
            var section_periods = typeof sectionid_or_section === "number" ?
                models.sections[term][sectionid_or_section].periods :
                sectionid_or_section.periods;
            periods.push(...section_periods);
        }
    }
    return periods;
}

function get_mean_mad(periods, time_range) {
    /*
        Purpose of function:
        get the mean of all the mean absolute deviations from the mean of whether classes meet for each time point
        across all days in a schedule.

        Inputs:
            periods:
                a list of periods in the schedule that can be obtained from the function schedule_to_period_list
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

    const start_and_end_times = [];
    const days_set = new Set();
    for (const period of periods) {
        start_and_end_times.push({time: period.start, kind: "start"});
        start_and_end_times.push({time: period.end, kind: "end"});
        days_set.add(period.day);
    }

    // sort times by time
    start_and_end_times.sort((a, b) => a.time < b.time ? -1 : a.time > b.time ? 1 : 0);
    // number of days
    const n = days_set.size;
    
    const beginning_time = start_and_end_times[0].time;
    var current_time = beginning_time;
    var n_classes_at_once = 1;
    var total_mad = 0;
    for (const t of start_and_end_times.slice(1)) {
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

function get_day_class_lengths(periods, normalize=true) {
    /* returns total number of minutes of class time each day from a schedule,
    optionally normalized to sum to 1 */
    var minute_counts = [0, 0, 0, 0, 0];
    for (const period of periods) {
        const index = WEEKDAYS.indexOf(period.day);
        minute_counts[index] += period.end - period.start;
    }
    if (normalize) {
        const total_minutes = arraySum(minute_counts);
        minute_counts = minute_counts.map(minute_count => minute_count / total_minutes);
    }
    return minute_counts
}

function get_schedule_by_day(periods) {
    var schedule_by_day = {};
    for (var period of periods) {
        if (period.day in schedule_by_day) {
            schedule_by_day[period.day].push(period);
        } else {
            schedule_by_day[period.day] = [period];
        }
    }
    for (var day in schedule_by_day) {
        schedule_by_day[day].sort((a, b) => a.start < b.start ? -1 : a.start > b.start ? 1 : 0);
    }
    return schedule_by_day;
}

function get_score(schedule, term, weights) {
    const periods = schedule_to_period_list(schedule, term);
    
    let morningness = 0;
    let eveningness = 0;
    // let total_class_time = 0;
    for (const period of periods) {
        if (period.start <= MORNING_CLASS_THRESHOLD) {
            morningness += MORNING_SLOPE * (MORNING_CLASS_THRESHOLD - period.start) + MORNING_BIAS;
        }
        if (period.start >= EVENING_CLASS_THRESHOLD) {
            eveningness += EVENING_SLOPE * (period.start - EVENING_CLASS_THRESHOLD) + EVENING_BIAS;
        }
        // total_class_time += period.end - period.start;
    }
    const schedule_by_day = get_schedule_by_day(periods);
    // const day_lengths = {};
    let total_consecutiveness = 0;
    let total_too_short_gapness = 0;
    for (const day in schedule_by_day) {
        const day_periods = schedule_by_day[day];
        // day_lengths[day] = day_periods[day_periods.length - 1].end - day_periods[0].start;
        for (let i = 0; i < day_periods.length - 1; i++) {
            const gap_time = day_periods[i + 1].start - day_periods[i].end;
            if (gap_time <= MAX_SHORT_GAP_TIME) {
                // total_consecutiveness += 1 - gap_time / MAX_SHORT_GAP_TIME;
                // total_consecutiveness += MAX_SHORT_GAP_TIME - gap_time;
                total_consecutiveness += 1 - gap_time / MAX_SHORT_GAP_TIME;
            }
            if (gap_time <= MAX_TOO_SHORT_GAP_TIME) {
                total_too_short_gapness += 1 - gap_time / MAX_SHORT_GAP_TIME;
            }
        }
    }

    // const mean_mad = get_mean_mad(periods);

    // scale all weights such that the one with the greatest magnitude equals 1
    // this ensures that the scale of the given weights will be consistent so
    // TOO_SHORT_GAPNESS_WEIGHT is consistently comparable to the given weights
    const max_weight_magnitude = Math.max(...Object.values(weights).map(Math.abs));
    if (max_weight_magnitude !== 0)
        for (const key in weights)
            weights[key] = weights[key] / max_weight_magnitude;


    // console.log(morningness, eveningness, total_consecutiveness, total_too_short_gapness);
    return weights.morningness_weight * morningness
        + weights.eveningness_weight * eveningness
        + weights.consecutiveness_weight * CONSECUTIVENESS_WEIGHT * total_consecutiveness
        - TOO_SHORT_GAPNESS_WEIGHT * total_too_short_gapness;
}

module.exports = {
    get_score
};
