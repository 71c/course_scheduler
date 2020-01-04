// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/*
// @match        http://localhost:5000/schedule*
// @match        https://tuftscoursescheduler.com/schedule*
// @match        https://www.tuftscoursescheduler.com/schedule*
// @grant        GM_getValue
// @grant        GM_setValue
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

'use strict';

if (location.origin === "https://sis.uit.tufts.edu") {
    const baseURL = "https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/";

    function waitFor(i,n){if(i())n();else{var t=function(){setTimeout(function(){i()?n():t()},100)};t()}}
    function executeSequentially(f,c){f.length==0?c():f[0](function(){executeSequentially(f.slice(1),c)})}
    function addClass(term_code, career, subject, num, classNums) {
        return function(callback) {
            if (location.search.indexOf("?tab=TFP_CLASS_SEARCH") != 0) {
                return;
            }
            location.hash = "#search_results/term/" + term_code + "/career/" + career + "/subject/" + subject + "/course/" + num + "/attr/keyword/instructor";
            waitFor(function() {
                return !jQuery('.tfp-results-overlay')[0] && !jQuery('.tfp_cls_srch_loading')[0] && jQuery('.accorion-head')[0] && jQuery('td:contains(' + classNums[0] + ')')[0]
            }, function() {
                // click the checkbox to show sections.
                // if there is more than one result, sections will be hidden, and clicking the checkbox will show the sections
                // if there is one result, clicking the checkbox won't do anything
                jQuery('.tfp-show-result-sect').click();

                for (const classNum of classNums) {
                    const inputBubbleOrSpan = jQuery('td:contains(' + classNum + ')')[0].parentElement.children[6].children[0];
                    if (inputBubbleOrSpan.nodeName == "SPAN") {
                        // the section is in cart or enrolled
                        if (inputBubbleOrSpan.innerHTML == "In Cart") {
                            alert("Section with class num " + classNum + " in course " + subject + "-" + num + " is already in your cart");
                        } else if (inputBubbleOrSpan.innerHTML == "Enrolled") {
                            alert("You have already enrolled for section with class num " + classNum + " in course " + subject + "-" + num);
                        } else {
                            // this shouldn't happen
                            console.error("something unexpected happened");
                            return;
                        }
                        setTimeout(callback, 0);
                        return;
                    } else if (inputBubbleOrSpan.nodeName == "INPUT") { // just making sure
                        inputBubbleOrSpan.click();
                    } else {
                        // this shouldn't happen
                        console.error("something unexpected happened");
                        return;
                    }
                }
                jQuery('button:contains(Add to Cart)').click();
                setTimeout(callback, 0);
            });
        };
    }

    function addClasses(info) {
        const functions = info.classes.map(classInfo =>
           addClass(info.term_code, info.career,
                    /^[A-Z]+/.exec(classInfo.course_num)[0],
                    /(?<=-).*/.exec(classInfo.course_num)[0], classInfo.classNums));
        executeSequentially(functions, function() {
            console.log('done');
        });
    }

    const searchSearch = "?tab=TFP_CLASS_SEARCH";
    const homeSearch = "?tab=DEFAULT";

    // location.search starts with "?tab=DEFAULT"
    if (location.search.indexOf(homeSearch) == 0) {
        const button = document.createElement('button');
        button.innerHTML = 'auto sign up';
        button.onclick = function() {
            location.href = baseURL + searchSearch;
        };
        document.body.appendChild(button);
    } else if (location.search.indexOf(searchSearch) == 0) {
        const div = document.createElement('div');
        const textarea = document.createElement('textarea');
        const button = document.createElement('button');
        button.innerHTML = 'add classes';
        button.onclick = function() {
            // extensive error checking
            try {
                var info = JSON.parse(textarea.value);
            } catch (e) {
                alert('invalid JSON');
                return;
            }
            for (const key of ["term_code", "career", "classes"]) {
                if (!(key in info)) {
                    alert("missing attribute " + key);
                    return;
                }
            }
            for (var i = 0; i < info.classes.length; i++) {
                const classInfo = info.classes[i];
                for (const key of ["course_num", "classNums"]) {
                    if (!(key in classInfo)) {
                        alert("class info at index " + i + " missing attribute " + key);
                        return;
                    }
                }
            }

            addClasses(info);
        }
        div.appendChild(textarea);
        div.appendChild(button);
        document.body.appendChild(div);
    }
} else {
    document.addEventListener('updateClasses', function() {
        var val = getInfoForAddClasses("ASE");
        GM_setValue('classes', val);
        window.scriptBox.value = val; // more clear to write 'window.'
    }, false);

    function getInfoForAddClasses(career) {
        var schedule = top_schedules[scheduleIndex].schedule;
        var classes = [];
        for (let i = 0; i < schedule.length; i++) {
            const current_course = courses[i];
            const classNums = schedule[i].map(section_id => {
                const section = sections_by_id[section_id];
                const subsection = section.sections[section_indices_by_id[section_id]];
                return subsection.class_num;
            });
            classes.push({
                course_num: current_course.course_num,
                classNums: classNums
            });
        }
        return JSON.stringify({
            term_code: term_code,
            career: career,
            classes: classes
        });
    }
}
