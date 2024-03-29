// ==UserScript==
// @name         Tufts Course Scheduler Auto-Sign-Up
// @namespace    71c
// @version      0.4.4
// @description  To be used with tuftscoursescheduler.com; automatically signs up for classes at Tufts
// @homepageURL  https://github.com/71c/course_scheduler
// @author       71c
// @copyright    2020, 71c (https://openuserjs.org/users/71c)
// @updateURL    https://openuserjs.org/meta/71c/Tufts_Course_Scheduler_Auto-Sign-Up.meta.js
// @downloadURL  https://openuserjs.org/install/71c/Tufts_Course_Scheduler_Auto-Sign-Up.user.js
// @license      MIT
// @match        https://sis.it.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/*
// @match        http://localhost:5000/schedule*
// @match        https://tuftscoursescheduler.com/schedule*
// @match        https://tuftscoursescheduler.com/schedule*
// @match        https://sis.it.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_GoToCart
// @match        https://siscs.it.tufts.edu/psc/csprd/EMPLOYEE/PSFT_SA/c/SA_LEARNER_SERVICES_2.SSR_SSENRL_CART.GBL???Page=SSR_SSENRL_CART&Action=A&INSTITUTION=TUFTS&TargetFrameName=Tfp_cart_iframe*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

'use strict';

// Used to be "uit.tufts.edu"
// Now it's "it.tufts.edu"
const MAIN_DOMAIN = 'it.tufts.edu';


// http://mths.be/unsafewindow
window.unsafeWindow || (
    unsafeWindow = (function() {
        var el = document.createElement('p');
        el.setAttribute('onclick', 'return window;');
        return el.onclick();
    }())
);

var jQuery;


if (window.location.origin === `https://sis.${MAIN_DOMAIN}` || window.location.origin === `https://siscs.${MAIN_DOMAIN}`) {
    // we're at one of the SIS sites
    document.addEventListener('DOMContentLoaded', function() {
        jQuery = unsafeWindow.jQuery;
        whenOnSIS();
    });
} else {
    // we're at my website
    unsafeWindow.hasUserscript = true;
    
    document.addEventListener('startUserscript', whenOnMyWebsite);
}

const getEnrollmentCartURL = `https://sis.${MAIN_DOMAIN}/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_GoToCart`;
const baseURL = `https://sis.${MAIN_DOMAIN}/psp/paprd/EMPLOYEE/EMPL/h/`;
const searchSearch = "?tab=TFP_CLASS_SEARCH";

var whenOnSIS = function() {
    unsafeWindow.addClassesToCart = function() {
        const info = JSON.parse(GM_getValue('classes', '{}'));
        console.log(window.location.href);
        whenOnSIS.addClasses(info);
    };

    const homeSearch = "?tab=DEFAULT";

    if (window.location.search.indexOf(homeSearch) === 0) {
        // we're at SIS home
        // whenOnSIS.makeAutoSignUpButton();
    } else if (window.location.search.indexOf(searchSearch) === 0) {
        // we're at one of the search pages

        if (GM_getValue('setClassesImmediately', false)) {
            // we want to do it immediately

            if (!GM_getValue('clearClasses', false)) {
                // next time we go to url don't auto; only do once
                // turn setClassesImmediately off only if clearClasses is false because otherwise, classes won't be deleted from cart when clearClasses is true
                GM_setValue('setClassesImmediately', false);
                unsafeWindow.addClassesToCart();
            }
        } else {
            // we don't want to do it immediately
            // whenOnSIS.addManualEntryUI();
        }
    } else if (window.location.href === getEnrollmentCartURL) {
        if (GM_getValue('setClassesImmediately', false)) {
            // we're at a page that gives us a URL; immediately redirect to that URL
            const url = document.querySelector('span#IS_AC_RESPONSE').innerText.trim();
            location.href = url;
        }
    } else if (window.location.href.indexOf(`https://siscs.${MAIN_DOMAIN}/psc/csprd/EMPLOYEE/PSFT_SA/c/SA_LEARNER_SERVICES_2.SSR_SSEN`) === 0) {
        // we're in the iframe inside the Enrollment Cart page
        whenOnSIS.deleteClassesFromCart();
    }
}

whenOnSIS.waitFor = function(condition, callback) {
    /* wait for condition() to evaluate to to true, then execute callback */
    if (condition())
        callback();
    else {
        var t = function() {
            setTimeout(function() {
                if (condition())
                    callback();
                else
                    t();
            }, 100);
        };
        t();
    }
}

whenOnSIS.executeSequentially = function(functions, callback) {
    /* Execute asynchronous functions one-by-one. functions is an array of
    functions which each take a callback as a parameter. callback is
    executed when all the functions have finished executing. Yes, it would
    make more sense to use promises but this works fine */
    if (functions.length === 0)
        callback();
    else
        functions[0](function() {
            whenOnSIS.executeSequentially(functions.slice(1), callback);
        });
}

whenOnSIS.addClasses = function(info) {
    const functions = info.classes.map(classInfo =>
       whenOnSIS.addClass(info.term_code, info.career,
                /^[A-Z]+/.exec(classInfo.course_num)[0],
                /-.*/.exec(classInfo.course_num)[0].slice(1), classInfo.classNums, classInfo.title));
    whenOnSIS.executeSequentially(functions, function() {
        console.log('done');
    });
}

whenOnSIS.addClass = function(term_code, career, subject, num, classNums, title) {
    return function(callback) {
        if (window.location.search.indexOf("?tab=TFP_CLASS_SEARCH") !== 0) {
            return;
        }
        window.location.hash = "#search_results/term/" + term_code + "/career/" + career + "/subject/" + subject + "/course/" + num + "/attr/keyword/" + title + "/instructor";
        whenOnSIS.waitFor(function() {
            return !jQuery('.tfp-results-overlay')[0] && !jQuery('.tfp_cls_srch_loading')[0] && jQuery('.accorion-head')[0] && jQuery('td:contains(' + classNums[0] + ')')[0];
        }, function() {
            if (document.querySelector('.tfp-offstate') !== null) {
                alert("You can't add to this term now");
                return;
            }

            // click the checkbox to show sections.
            // if there is more than one result, sections will be hidden, and clicking the checkbox will show the sections
            // if there is one result, clicking the checkbox won't do anything
            jQuery('.tfp-show-result-sect').click();

            whenOnSIS.selectSections(classNums, subject, num, callback);
        });
    };
}

whenOnSIS.selectSections = function(classNums, subject, num, callback) {
    for (const classNum of classNums) {
        const inputBubbleOrSpan = jQuery('td:contains(' + classNum + ')')[0].parentElement.children[6].children[0];
        if (inputBubbleOrSpan.nodeName === "SPAN") {
            // the section is in cart or enrolled
            if (inputBubbleOrSpan.innerHTML === "In Cart") {
                alert("Section with class num " + classNum + " in course " + subject + "-" + num + " is already in your cart. Continuing.");
            } else if (inputBubbleOrSpan.innerHTML === "Enrolled") {
                alert("You have already enrolled for section with class num " + classNum + " in course " + subject + "-" + num + ". Continuing.");
            } else {
                // this shouldn't happen
                console.error("something unexpected happened");
                return;
            }
            callback();
        } else if (inputBubbleOrSpan.nodeName === "INPUT") { // just making sure
            if (!inputBubbleOrSpan.disabled) {
                inputBubbleOrSpan.click();
            }
            else {
                alert("You can't add classes now");
                return;
            }
        } else {
            // this shouldn't happen
            console.error("something unexpected happened");
            return;
        }
    }
    jQuery('button:contains(Add to Cart)').click();
    callback();
}

whenOnSIS.makeAutoSignUpButton = function() {
    const button = document.createElement('button');
    button.innerHTML = 'auto sign up';
    button.onclick = function() {
        window.location.href = baseURL + searchSearch;
    };
    document.body.appendChild(button);
}

whenOnSIS.addManualEntryUI = function() {
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

        whenOnSIS.addClasses(info);
    };
    div.appendChild(textarea);
    div.appendChild(button);
    document.body.appendChild(div);
}

whenOnSIS.deleteClassesFromCart = function() {
    if (GM_getValue('setClassesImmediately', false)) {
        // next time we go to url don't auto; only do once
        GM_setValue('setClassesImmediately', false);
        if (GM_getValue('clearClasses', false)) {
            GM_setValue('clearClasses', false);
            if (window.parent.location.hash.indexOf('#cart') === 0) { // this should always be the case
                whenOnSIS.waitFor(function() {
                    return document.querySelector('th.PSLEVEL1GRIDCOLUMNHDR') !== null;
                }, whenOnSIS.deleteCourse);
            }
        }
    }
}

whenOnSIS.deleteCourse = function(currLen) {
    if (currLen === undefined) {

        currLen = whenOnSIS.getTableLength();
    }
    // argh https://stackoverflow.com/a/42907951/9911203
    var trashCan = document.querySelector('img[src="/cs/csprd/cache/PS_DELETE_ICN_1.gif"]');
    if (trashCan === null) {
        // done deleting classes from cart
        window.parent.addClassesToCart();
        return;
    }
    trashCan.click();
    var len;
    whenOnSIS.waitFor(function() {
        if (document.querySelector('img[src="/cs/csprd/cache/PS_DELETE_ICN_1.gif"]') === null)
            return true;
        len = whenOnSIS.getTableLength();
        if (len === currLen)
            return false;
        return true;
    }, function() {
        whenOnSIS.deleteCourse(len);
    });
}

whenOnSIS.getTableLength = function() {
    return document.querySelector('table.PSLEVEL1GRIDNBO').children[0].children.length;
}

function whenOnMyWebsite() {
    // document.getElementById('nouserscript').parentElement.removeChild(document.getElementById('nouserscript'))

    // const scriptBox = document.createElement('textarea');
    // scriptBox.rows = "7";
    // scriptBox.cols = "40";

    const left = document.getElementById('left');
    // left.appendChild(scriptBox);

    let e = document.getElementById("no-userscript");
    if (e !== null) {
        e.remove();
    }

    const setClassesButton = document.createElement('button');
    setClassesButton.className = "btn btn-primary mr-2";
    setClassesButton.innerHTML = 'replace cart with these';
    const addClassesButton = document.createElement('button');
    addClassesButton.className = "btn btn-primary";
    addClassesButton.innerHTML = 'add these to cart';

    setClassesButton.onclick = function() {
        GM_setValue('clearClasses', true);
        GM_setValue('setClassesImmediately', true);
        window.open(getEnrollmentCartURL);
    };

    addClassesButton.onclick = function() {
        GM_setValue('clearClasses', false);
        GM_setValue('setClassesImmediately', true);
        window.open(baseURL + searchSearch);
    };

    const p = document.createElement('p');
    p.className = "hide-in-small-screen";
    // p.appendChild(setClassesButton); // not having this button anymore because it doesn't work now
    p.appendChild(addClassesButton);
    left.appendChild(p);

    function updateClasses() {
        var val = getInfoForAddClasses("ALL"); // is this a good idea? does it matter? should it be ASE?
        GM_setValue('classes', val);
        // scriptBox.value = val;
    }

    document.addEventListener('updateClasses', updateClasses, false);

    updateClasses();

    function getInfoForAddClasses(career) {
        var schedule = top_schedules[scheduleIndex].schedule;
        var classes = [];
        for (let i = 0; i < schedule.length; i++) {
            const current_course = courses[i];
            const classNums = schedule[i].map(section_id => sections_by_id[section_id].class_num);
            classes.push({
                course_num: current_course.course_num,
                classNums: classNums,
                title: current_course.title,
            });
        }
        return JSON.stringify({
            term_code: term_code,
            career: career,
            classes: classes
        });
    }
}


