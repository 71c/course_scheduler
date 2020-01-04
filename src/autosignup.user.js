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
// @match        https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_GoToCart
// @match        https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/PSFT_SA/c/SA_LEARNER_SERVICES_2.SSR_SSENRL_CART.GBL???Page=SSR_SSENRL_CART&Action=A&INSTITUTION=TUFTS&TargetFrameName=Tfp_cart_iframe&ACAD_CAREER=ASEU&STRM=2202
// @grant        GM_getValue
// @grant        GM_setValue
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

'use strict';



if (window.location.href.indexOf("https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/PSFT_SA/c/SA_LEARNER_SERVICES_2.SSR_SSEN") === 0) {
    // alert('boo');
    
    // setTimeout(function() {
    //     console.log(window.parent);
    //     // window.parent.jQuery(window.parent.document).trigger('complete');
    //     window.parent.triggerComplete();
    // }, 3000);

    
}

const getEnrollmentCartURL = "https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_GoToCart";
const baseURL = "https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/";
const searchSearch = "?tab=TFP_CLASS_SEARCH";

if (window.location.origin === "https://sis.uit.tufts.edu" || window.location.origin === "https://siscs.uit.tufts.edu") {
    function waitFor(i,n){if(i())n();else{var t=function(){setTimeout(function(){i()?n():t()},100)};t()}}
    function executeSequentially(f,c){f.length==0?c():f[0](function(){executeSequentially(f.slice(1),c)})}
    function addClass(term_code, career, subject, num, classNums) {
        return function(callback) {
            if (window.location.search.indexOf("?tab=TFP_CLASS_SEARCH") != 0) {
                return;
            }
            window.location.hash = "#search_results/term/" + term_code + "/career/" + career + "/subject/" + subject + "/course/" + num + "/attr/keyword/instructor";
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

    const homeSearch = "?tab=DEFAULT";

    if (window.location.search.indexOf(homeSearch) == 0) {
        const button = document.createElement('button');
        button.innerHTML = 'auto sign up';
        button.onclick = function() {
            window.location.href = baseURL + searchSearch;
        };
        document.body.appendChild(button);
    } else if (window.location.search.indexOf(searchSearch) == 0) {
        if (GM_getValue('setClassesImmediately', false)) {
            // next time we go to url don't auto; only do once
            GM_setValue('setClassesImmediately', false);
            if (GM_getValue('clearClasses', false)) {
                GM_setValue('clearClasses', false);
                if (window.location.hash.indexOf('#cart') === 0) { // this should always be the case

                    jQuery('body').bind('complete', function() {
                      alert('Complete');
                    });

                    var script = document.createElement('script');
                    script.textContent = "function triggerComplete() {alert('horray!')}";
                    (document.head||document.documentElement).appendChild(script);

                    let iframe;

                    let currLen;

                    function deleteCourse() {
                        // argh https://stackoverflow.com/a/42907951/9911203
                        var trashCan = iframe.contentWindow.document.body.querySelector('img[src="/cs/csprd/cache/PS_DELETE_ICN_1.gif"]');
                        if (trashCan === null) {
                            // done deleting classes from cart
                            addClassesToCart();
                            return;
                        }
                        trashCan.click();
                        waitFor(function() {
                            var len = getTableLength();
                            if (len === currLen) 
                                return false;
                            currLen = len;
                            return true;
                        }, deleteCourse);
                    }
                    // alert('hey');
                    waitFor(function() {
                        iframe = document.querySelector('iframe#Tfp_cart_iframe');
                        if (iframe === null)
                            return false;
                        if (iframe.contentWindow.document.body.querySelector('th.PSLEVEL1GRIDCOLUMNHDR') === null)
                            return false;
                        return true;
                    }, function() {
                        currLen = getTableLength();
                        // alert('hey2');
                        deleteCourse();
                    });

                    function getTableLength() {
                        return iframe.contentWindow.document.body.querySelector('table.PSLEVEL1GRIDNBO').children[0].children.length;
                    }
                    // deleteCourse();
                }   // document.querySelector('iframe#Tfp_cart_iframe').contentWindow.document.body.querySelector('table.PSLEVEL1GRIDNBO')
                

            } else {
                addClassesToCart();
            }
            function addClassesToCart() {
                // alert('hey3');
                const info = JSON.parse(GM_getValue('classes', '{}'));
                addClasses(info);
            }
        } else {
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
    } else if (window.location.href === getEnrollmentCartURL) {
        var url = jQuery('span#IS_AC_RESPONSE').text().trim();
        location.href = url;
    }
} else {
    const scriptBox = document.createElement('textarea');
    scriptBox.rows = "50";
    scriptBox.cols = "40";

    const left = document.getElementById('left');
    left.appendChild(scriptBox);

    const setClassesButton = document.createElement('button');
    setClassesButton.innerHTML = 'replace cart with these';
    const addClassesButton = document.createElement('button');
    addClassesButton.innerHTML = 'add these to cart';

    setClassesButton.onclick = function() {
        GM_setValue('clearClasses', true);
        GM_setValue('setClassesImmediately', true);

        // would do but doesn't work because of cross-origin restriction
        // jQuery.get(getEnrollmentCartURL, function(r) {
        //     var url = jQuery(r).find('span#IS_AC_RESPONSE').text().trim();
        //     if (!!url) {
        //         window.open(url);
        //     } else {
        //         alert('Sign in to SIS');
        //     }
        // });

        window.open(getEnrollmentCartURL);
    }

    addClassesButton.onclick = function() {
        GM_setValue('clearClasses', false);
        GM_setValue('setClassesImmediately', true);
        window.open(baseURL + searchSearch);
    }

    left.appendChild(setClassesButton);
    left.appendChild(addClassesButton);

    function updateClasses() {
        var val = getInfoForAddClasses("ASE"); // TODO: change "ASE" to "ALL" or make it possible to specify career
        console.log(val);
        GM_setValue('classes', val);
        scriptBox.value = val; // more clear to write 'window.'
    }

    document.addEventListener('updateClasses', updateClasses, false);

    updateClasses();

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
