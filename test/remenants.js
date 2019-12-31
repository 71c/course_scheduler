const {MinHeap} = require('./minheap');

function mergeKArrays(arrays, compare_function) {
    /* algorithm found at https://www.geeksforgeeks.org/merge-k-sorted-arrays-set-2-different-sized-arrays/ */
    var output = [];
    var pq = new MinHeap(undefined, (a, b) => compare_function(a.value, b.value));
    for (var i = 0; i < arrays.length; i++)
        pq.push({value: arrays[i][0], indexOfArray: i, indexInArray: 0});
    while (pq.size() !== 0) {
        var curr = pq.pop();
        var i = curr.indexOfArray;
        var j = curr.indexInArray;
        output.push(curr.value);
        if (j + 1 < arrays[i].length)
            pq.push({value: arrays[i][j + 1], indexOfArray: i, indexInArray: j + 1});
    }
    return output;
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
    periods.sort((a, b) => a.start < b.start ? -1 : a.start > b.start ? 1 : 0);
    return periods;

    

    // var arrs = [];
    // for (var sectionids_or_sections of schedule) {
    //     for (var sectionid_or_section of sectionids_or_sections) {
    //         var section_periods = typeof sectionid_or_section === "number" ?
    //             models.sections[term][sectionid_or_section].periods :
    //             sectionid_or_section.periods;
    //         arrs.push(section_periods);
    //     }
    // }
    // var periods = mergeKArrays(arrs, (a, b) => a.start < b.start ? -1 : a.start > b.start ? 1 : 0);
    // return periods;
}