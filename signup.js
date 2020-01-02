var homepageURL = 'https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=DEFAULT'
var searchURL   = 'https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH&pt_fname=TFP_SEARCH_FOR_CLASSES_FLDR&FolderPath=PORTAL_ROOT_OBJECT.TFP_CLASSES_FLDR.TFP_SEARCH_FOR_CLASSES_FLDR&IsFolder=true#class_search'

jQuery("#s2id_tfp_clssrch_term").click()

document.querySelectorAll('[name]').forEach(u=>console.log(u.value))

jQuery("form")[0].onsubmit = function(x) {
    console.log(x.target.action);
    console.log(this);
    thing = this;
    document.querySelectorAll('[name]').forEach(u=>console.log(u.name))
}





TFP_CLASS_CART.trigger('navigate:searchresultbyclass', this.model.toJSON())



TFP_CLASS_SEARCH.TFP_CLASS_CART.Tfp_CartModule.Tfp_Search.View.prototype._formSubmit_byclass
TFP_CLASS_SEARCH.TFP_CLASS_CART.Tfp_CartModule.Tfp_Search.View.prototype._formSubmit_bycourse


TFP_CLASS_SEARCH.TFP_CLASS_CART._events['navigate:searchresultbyclass']

TFP_CLASS_SEARCH.TFP_CLASS_CART.trigger('navigate:searchresultbyclass', {})

var TFP_CLASS_SEARCH.TFP_CLASS_CART.Tfp_CartModule.Tfp_SearchResults



window.Behaviors.ClassDetailLbx


_addToCart



searchResultsModule = TFP_CLASS_SEARCH.TFP_CLASS_CART.Tfp_CartModule.Tfp_SearchResults



addToCart = {
     addToCartRequest : {
         career : self.model.get('acad_career'),
         term : self.getOption('context_term') || TFP_CLASS_CART.request('get:qrycriteria', 'term'),
         comp_reqd_desc : self.model.get('comp_reqd_desc'),
         classes : selectedData,
         cids : cids
     }
 }

addToCart = {
     addToCartRequest : {
         career : self.model.get('acad_career'),
         term : self.getOption('context_term') || TFP_CLASS_CART.request('get:qrycriteria', 'term'),
         comp_reqd_desc : self.model.get('comp_reqd_desc'),
         classes : [],
         cids : cids
     }
 }

// https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_postToShoppingCart2

jQuery.ajax("https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_postToShoppingCart2", {
    method: "POST",
    data: {"addToCartRequest":{"career":"ASEU","term":"2202","comp_reqd_desc":"Select 1 Lecture, 1 (Optional) Recitation","classes":[{"class_num":"21178","assoc_flag":"P","assoc_class":"1","credit_select":"N","unit_selected":4,"component":"Lecture","ssr_comp":"LEC","grd_basis":"GRD","cid":"c286"},{"class_num":"21207","assoc_flag":"S","assoc_class":"9999","credit_select":"N","unit_selected":0,"component":"Recitation (Optional)","ssr_comp":"RCT","grd_basis":"","cid":"c302"}],"cids":["c286","c302"]}}
})

jQuery.ajax("https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_postToShoppingCart2", {
    method: "POST",
    data: {"addToCartRequest":{"career":"ASEU","term":"2202","comp_reqd_desc":"","classes":[{"class_num":"21200","assoc_flag":"A","assoc_class":"1","credit_select":"N","unit_selected":3,"component":"Lecture","ssr_comp":"LEC","grd_basis":"GRD","cid":"c123"}],"cids":["c123"]}}
})

jQuery.ajax("https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_postToShoppingCart2", {
    method: "POST",
    data: {"addToCartRequest":{"career":"ASEU","term":"2202","comp_reqd_desc":"Select 1 Lecture, 1 (Optional) Recitation","classes":[{"class_num":"21178","assoc_flag":"P","assoc_class":"1","credit_select":"N","unit_selected":4,"component":"Lecture","ssr_comp":"LEC","grd_basis":"GRD"},{"class_num":"21207","assoc_flag":"S","assoc_class":"9999","credit_select":"N","unit_selected":0,"component":"Recitation (Optional)","ssr_comp":"RCT","grd_basis":""}]}}
})

jQuery.ajax("https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_postToShoppingCart2", {
    method: "POST",
    data: {"addToCartRequest":{"term":"2202","classes":[{"class_num":"21178","assoc_flag":"P","assoc_class":"1","credit_select":"N","unit_selected":4,"component":"Lecture","ssr_comp":"LEC","grd_basis":"GRD"},{"class_num":"21207","assoc_flag":"S","assoc_class":"9999","credit_select":"N","unit_selected":0,"component":"Recitation (Optional)","ssr_comp":"RCT","grd_basis":""}]}}
})

jQuery.ajax("https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_postToShoppingCart2", {
    method: "POST",
    data: {"addToCartRequest":{"term":"2202","classes":[{"class_num":"21178","credit_select":"N","unit_selected":4,"component":"Lecture","ssr_comp":"LEC","grd_basis":"GRD"},{"class_num":"21207","assoc_flag":"S","assoc_class":"9999","credit_select":"N","unit_selected":0,"component":"Recitation (Optional)","ssr_comp":"RCT","grd_basis":""}]}}
})

jQuery.ajax("https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_postToShoppingCart2", {
    method: "POST",
    data: {"addToCartRequest":{"term":"2202","classes":[{"class_num":"21178","unit_selected":4,"component":"Lecture","ssr_comp":"LEC","grd_basis":"GRD"},{"class_num":"21207","assoc_flag":"S","assoc_class":"9999","credit_select":"N","unit_selected":0,"component":"Recitation (Optional)","ssr_comp":"RCT","grd_basis":""}]}}
})

jQuery.ajax("https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_postToShoppingCart2", {
    method: "POST",
    data: {"addToCartRequest":{"term":"2202","classes":[{"class_num":"21178","component":"Lecture","ssr_comp":"LEC","grd_basis":"GRD"},{"class_num":"21207","component":"Recitation (Optional)","ssr_comp":"RCT","grd_basis":""}]}}
})

jQuery.ajax("https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_postToShoppingCart2", {
    method: "POST",
    data: {"addToCartRequest":{"term":"2202","classes":[{"class_num":"21178"},{"class_num":"21207"}]}}
})


.done(function(res) {
       console.log(res);
    }).fail(function(err) {
      console.log('Error: ' + err.status);
    });

// old, does not work
// function getJavascript() {
//     var schedule = top_schedules[scheduleIndex].schedule;
//     let js = `var url = "https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/PSFT_SA/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_postToShoppingCart2";`;
//     for (let i = 0; i < schedule.length; i++) {
//         const current_course = courses[i];
//         const classes = schedule[i].map(section_id => {
//             const section = sections_by_id[section_id];
//             const subsection = section.sections[section_indices_by_id[section_id]];
//             return {class_num: subsection.class_num};
//         });
//         const data = {addToCartRequest: {term: "2202", classes: classes}};
//         js += `\njQuery.ajax(url, ${JSON.stringify(data)});`;
//     }
//     return js;
// }

// function getJavascript(term, career) {
//     var schedule = top_schedules[scheduleIndex].schedule;
//     var baseURL = "https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH&pt_fname=TFP_SEARCH_FOR_CLASSES_FLDR&FolderPath=PORTAL_ROOT_OBJECT.TFP_CLASSES_FLDR.TFP_SEARCH_FOR_CLASSES_FLDR&IsFolder=true#search_results";
//     var js = 'function waitFor(n){var t=function(i){n()?i():setTimeout(function(){t(i)},100)};return new Promise(t)}';
//     js += 'Promise.resolve()';

//     for (let i = 0; i < schedule.length; i++) {
//         const current_course = courses[i];
//         const classes = schedule[i].map(section_id => {
//             const section = sections_by_id[section_id];
//             const subsection = section.sections[section_indices_by_id[section_id]];
//             return {class_num: subsection.class_num};
//         });
//         const data = {addToCartRequest: {term: term, classes: classes}};
//         js += '.then(function() {'

//         js += `window.location.href = "${baseURL}/term/${term}/career/${career}/subject/${current_course.subject}/course/${/(?<=-).*/.exec(current_course.course_num)}/attr/keyword/instructor";`
//         // wait for results to appear
//         js += `waitFor(function() {return !jQuery(".tfp-results-overlay")[0] && !jQuery(".tfp_cls_srch_loading")[0] && jQuery(".accorion-head")[0]})`
//         // Show Sections
//         js += '.then(function() {jQuery(".tfp-show-result-sect").click();});'; // show sections

//         js += 'return Promise.resolve();\n})\n'
//     }
//     return js;
// }

// function getJavascript(term, career) {
//     var schedule = top_schedules[scheduleIndex].schedule;
//     var baseURL = "https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH&pt_fname=TFP_SEARCH_FOR_CLASSES_FLDR&FolderPath=PORTAL_ROOT_OBJECT.TFP_CLASSES_FLDR.TFP_SEARCH_FOR_CLASSES_FLDR&IsFolder=true#search_results";
//     var js = 'function waitFor(i,n){if(i())n();else{var t=function(){setTimeout(function(){i()?n():t()},100)};t()}}\n';
//     js += 'function executeSequentially(f,c){f.length==0?c():f[0](function(){executeSequentially(f.slice(1),c)})}\n'
//     js += 'var functions = [];\n'

//     for (let i = 0; i < schedule.length; i++) {
//         const current_course = courses[i];

//         js += 'functions.push(function(callback) {\n'
//         js += `window.location.href = "${baseURL}/term/${term}/career/${career}/subject/${current_course.subject}/course/${/(?<=-).*/.exec(current_course.course_num)}/attr/keyword/instructor";\n`
//         // wait for results to appear
//         js += `waitFor(function() {\nreturn !jQuery(".tfp-results-overlay")[0] && !jQuery(".tfp_cls_srch_loading")[0] && jQuery(".accorion-head")[0]\n}, `
//         // Show Sections
//         js += 'function() {\njQuery(".tfp-show-result-sect").click();\nsetTimeout(callback, 2000);\n});\n'; // show sections

//         js += '});\n';
//     }
//     js += `executeSequentially(functions, function() {console.log('done');});`;
//     return js;
// }

// function getJavascript(term, career) {
//     var schedule = top_schedules[scheduleIndex].schedule;
//     var baseURL = "https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH&pt_fname=TFP_SEARCH_FOR_CLASSES_FLDR&FolderPath=PORTAL_ROOT_OBJECT.TFP_CLASSES_FLDR.TFP_SEARCH_FOR_CLASSES_FLDR&IsFolder=true#search_results";
//     var js = 'function waitFor(i,n){if(i())n();else{var t=function(){setTimeout(function(){i()?n():t()},100)};t()}}\n';
//     js += 'function executeSequentially(f,c){f.length==0?c():f[0](function(){executeSequentially(f.slice(1),c)})}\n';
//     js += 'var functions = [];\n';

//     js += `function addClass(subject, num) {
//     return function(callback) {
//         window.location.href = \`${baseURL}/term/${term}/career/${career}/subject/\${subject}/course/\${num}/attr/keyword/instructor\`;
//         waitFor(function() {
//             return !jQuery(".tfp-results-overlay")[0] && !jQuery(".tfp_cls_srch_loading")[0] && jQuery(".accorion-head")[0]
//         }, function() {
//             jQuery(".tfp-show-result-sect").click();
//             setTimeout(callback, 2000);
//         });
//     };
// }`

//     for (let i = 0; i < schedule.length; i++) {
//         const current_course = courses[i];
//         js += `functions.push(addClass("${current_course.subject}", "${/(?<=-).*/.exec(current_course.course_num)}"))\n`;
//     }
//     js += `executeSequentially(functions, function() {console.log('done');});`;
//     return js;
// }


// function getJavascript(term, career) {
//     var schedule = top_schedules[scheduleIndex].schedule;
//     var baseURL = "https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH&pt_fname=TFP_SEARCH_FOR_CLASSES_FLDR&FolderPath=PORTAL_ROOT_OBJECT.TFP_CLASSES_FLDR.TFP_SEARCH_FOR_CLASSES_FLDR&IsFolder=true#search_results";
//     var js = 'function waitFor(i,n){if(i())n();else{var t=function(){setTimeout(function(){i()?n():t()},100)};t()}}\n';
//     js += 'function executeSequentially(f,c){f.length==0?c():f[0](function(){executeSequentially(f.slice(1),c)})}\n';
//     js += 'var functions = [];\n';

//     js +=
//     "function addClass(subject, num) {\n"+
//     "    return function(callback) {\n"+
//     "        window.location.href = '"+baseURL+"/term/"+term+"/career/"+career+"/subject/' + subject + '/course/' + num + '/attr/keyword/instructor';\n"+
//     "        waitFor(function() {\n"+
//     "            return !jQuery('.tfp-results-overlay')[0] && !jQuery('.tfp_cls_srch_loading')[0] && jQuery('.accorion-head')[0]\n"+
//     "        }, function() {\n"+
//     "            jQuery('.tfp-show-result-sect').click();\n"+
//     "            setTimeout(callback, 2000);\n"+
//     "        });\n"+
//     "    };\n"+
//     "}\n";
//     for (let i = 0; i < schedule.length; i++) {
//         const current_course = courses[i];
//         js += 'functions.push(addClass("' + current_course.subject + '", "' + /(?<=-).*/.exec(current_course.course_num) + '"))\n';
//     }
//     js += "executeSequentially(functions, function() {console.log('done');});";
//     return js;
// }



function getJavascript(term, career) {
    var schedule = top_schedules[scheduleIndex].schedule;
    var baseURL = "https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH&pt_fname=TFP_SEARCH_FOR_CLASSES_FLDR&FolderPath=PORTAL_ROOT_OBJECT.TFP_CLASSES_FLDR.TFP_SEARCH_FOR_CLASSES_FLDR&IsFolder=true#search_results";
    var js = 'function waitFor(i,n){if(i())n();else{var t=function(){setTimeout(function(){i()?n():t()},100)};t()}}\n';
    js += 'function executeSequentially(f,c){f.length==0?c():f[0](function(){executeSequentially(f.slice(1),c)})}\n';
    js += 'var functions = [];\n';

    js +=
    "function addClass(subject, num, classNums) {\n"+
    "    return function(callback) {\n"+
    "        window.location.href = '"+baseURL+"/term/"+term+"/career/"+career+"/subject/' + subject + '/course/' + num + '/attr/keyword/instructor';\n"+
    "        waitFor(function() {\n"+
    "            return !jQuery('.tfp-results-overlay')[0] && !jQuery('.tfp_cls_srch_loading')[0] && jQuery('.accorion-head')[0] && jQuery('td:contains(' + classNums[0] + ')')[0]\n"+
    "        }, function() {\n"+
    "           jQuery('.tfp-show-result-sect').click();\n"+
    "           for (var classNum of classNums) {\n"+
    "               jQuery('td:contains(' + classNum + ')')[0].parentElement.children[6].children[0].click();// click on bubble with that class num\n"+
    "           }\n"+
    "           jQuery('button:contains(Add to Cart)').click();\n"+
    "           setTimeout(callback, 0);\n"+
    "        });\n"+
    "    };\n"+
    "}\n";
    for (let i = 0; i < schedule.length; i++) {
        const current_course = courses[i];
        const classNums = [];
        for (const section_id of schedule[i]) {
            const section = sections_by_id[section_id];
            const subsection = section.sections[section_indices_by_id[section_id]];
            classNums.push(subsection.class_num);
        }
        js += 'functions.push(addClass("' + current_course.subject + '", "' + /(?<=-).*/.exec(current_course.course_num) + '", ' + JSON.stringify(classNums) + '))\n';
    }
    js += "executeSequentially(functions, function() {console.log('done');});";
    return js;
}


function executeSequentially(f,c){f.length==0?c():f[0](function(){executeSequentially(f.slice(1),c)})}

function executeSequentially(functions, callback) {
    if (functions.length === 0)
        callback();
    else
        functions[0](function() {
            executeSequentially(functions.slice(1), callback);
        });
}


function waitFor(n){var t=function(i){n()?i():setTimeout(function(){t(i)},100)};return new Promise(t)}
waitFor(function() {
    return !jQuery(".tfp-results-overlay")[0] && !jQuery(".tfp_cls_srch_loading")[0] && jQuery(".accorion-head")[0];
}).then(function() {
    console.log("done loading");
    // return Promise.resolve();
}).then(function() {
    console.log('hi')
});



smthing()
wait(fn, function() {
    smthing()
    wait(fn, function() {
        smthing()
        wait(fn, function() {

        })
    })
});


// function waitFor(i,n){if(i())n();else{var t=function(){setTimeout(function(){i()?n():t()},100)};t()}}

function waitFor(conditionFunction, callback) {
    if (conditionFunction())
        callback();
    else {
        var check = function() {
            setTimeout(function() {
                if (conditionFunction())
                    callback();
                else
                    check();
            }, 100);
        };
        check();
    }
}

function waitFor(conditionFunction) {
    const poll = resolve => {
        if (conditionFunction()) resolve();
        else setTimeout(_ => poll(resolve), 100);
    }
    return new Promise(poll);
}



function waitFor(i,n){if(i())n();else{var t=function(){setTimeout(function(){i()?n():t()},100)};t()}}


{"addToCartRequest":{"career":"ASEU","term":"2202","comp_reqd_desc":"Select 1 Lecture, 1 (Optional) Recitation","classes":[{"class_num":"21178","assoc_flag":"P","assoc_class":"1","credit_select":"N","unit_selected":4,"component":"Lecture","ssr_comp":"LEC","grd_basis":"GRD","cid":"c286"},{"class_num":"21207","assoc_flag":"S","assoc_class":"9999","credit_select":"N","unit_selected":0,"component":"Recitation (Optional)","ssr_comp":"RCT","grd_basis":"","cid":"c302"}],"cids":["c286","c302"]}}

{
  "addToCartRequest": {
    "career": "ASEU",
    "term": "2202",
    "comp_reqd_desc": "Select 1 Lecture, 1 (Optional) Recitation",
    "classes": [
      {
        "class_num": "21178",
        "assoc_flag": "P",
        "assoc_class": "1",
        "credit_select": "N",
        "unit_selected": 4,
        "component": "Lecture",
        "ssr_comp": "LEC",
        "grd_basis": "GRD",
        "cid": "c286"
      },
      {
        "class_num": "21207",
        "assoc_flag": "S",
        "assoc_class": "9999",
        "credit_select": "N",
        "unit_selected": 0,
        "component": "Recitation (Optional)",
        "ssr_comp": "RCT",
        "grd_basis": "",
        "cid": "c302"
      }
    ],
    "cids": [
      "c286",
      "c302"
    ]
  }
}


}); TFP_CLASS_CART.dialog.show(addLoading); return; }




document.location.href = xyz;

jQuery("a:contains(012)").click()



// https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH&pt_fname=TFP_SEARCH_FOR_CLASSES_FLDR&FolderPath=PORTAL_ROOT_OBJECT.TFP_CLASSES_FLDR.TFP_SEARCH_FOR_CLASSES_FLDR&IsFolder=true#search_results
// /term/2202/career/ASE/subject/AST/course/attr/keyword/instructor

// https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH&pt_fname=TFP_SEARCH_FOR_CLASSES_FLDR&FolderPath=PORTAL_ROOT_OBJECT.TFP_CLASSES_FLDR.TFP_SEARCH_FOR_CLASSES_FLDR&IsFolder=true#search_results
// /term/2202/career/ASE/subject/ARB/course/0022/attr/keyword/instructor


function getJavascr

