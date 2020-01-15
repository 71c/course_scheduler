/* copy and paste this into application.js and replace get_top_schedules_list with get_top_schedules_list_timing_test
to test the speed */
function get_top_schedules_list_timing_test(course_ids, accepted_statuses, score_function, k, section_accept_function, term) {
    const courses = course_ids.map(id => models.courses[term][id]);

    const schedules1 = get_schedules(courses, accepted_statuses, section_accept_function, term);
    const schedules2 = get_schedules(courses, accepted_statuses, section_accept_function, term);
    const schedules3 = get_schedules(courses, accepted_statuses, section_accept_function, term);

    const schedules_and_scores2 = (function* () {
        for (const schedule of schedules2) {
            yield {
                schedule: schedule,
                score: score_function(schedule)
            };
        }
    })();
    const schedules_and_scores3 = (function* () {
        for (const schedule of schedules3) {
            yield {
                schedule: schedule,
                score: score_function(schedule)
            };
        }
    })();

    const sorter3 = new PartialSorter((a, b) => {
        var cmp = default_compare(b.score, a.score);
        if (cmp === 0)
            return Math.random() - 0.5;
        return cmp;
    }, k);

    tic('schedule generate');
    for (const s of schedules1) {

    }
    toc('schedule generate');

    tic('schedule generate and add score');
    for (const s of schedules_and_scores2) {

    }
    toc('schedule generate and add score');

    tic('schedule generate and add score and sort');
    sorter3.insertAll(schedules_and_scores3);
    toc('schedule generate and add score and sort');

    return {
        n_possibilities: sorter3.numPassed,
        top_schedules: sorter3.getMinArray(),
        courses: courses
    };
}
