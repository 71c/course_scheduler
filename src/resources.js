const fs = require('fs');
const path = require('path');
const request = require('request');
const fetch = require('node-fetch');
const sriToolbox = require('sri-toolbox');

// const RESOURCES = {
//     css: {
//         'bootstrap': {
//             cdn: '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">',
//             local: '<link rel="stylesheet" href="bootstrap/dist/css/bootstrap.min.css">'
//         },
//         'jquery-ui': {
//             cdn: '<link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.min.css" integrity="sha384-kcAOn9fN4XSd+TGsNu2OQKSuV5ngOwt7tg73O4EpaD91QXvrfgvf0MR7/2dUjoI6" crossorigin="anonymous">',
//             local: '<link rel="stylesheet" href="jquery-ui.min.css">'
//         },
//         '@fullcalendar/core': {
//             cdn: '<link rel="stylesheet" href="https://unpkg.com/@fullcalendar/core@4.3.1/main.min.css" integrity="sha384-UYbBlSMkHrbuUVqSs26Rm1UEii5VOTR80mD2wjrJaIedgHgS5LWDt9d7rcbqEDxR" crossorigin="anonymous">',
//             local: '<link rel="stylesheet" href="@fullcalendar/core/main.min.css">'
//         },
//         '@fullcalendar/timegrid': {
//             cdn: '<link rel="stylesheet" href="https://unpkg.com/@fullcalendar/timegrid@4.3.0/main.min.css" integrity="sha384-Y2E7KGXSxkviA14jxA5DeBmVwovKH3ipCOXJ1ByetT9DLlwehyYf/3Lm2wSncMR2" crossorigin="anonymous">',
//             local: '<link rel="stylesheet" href="@fullcalendar/timegrid/main.min.css">'
//         },
//         'main': {
//             local: '<link rel="stylesheet" href="./main.css">'
//         },
//         'bootstrap-cerulean': {
//             local: '<link rel="stylesheet" href="./bootstrap-cerulean.min.css">'
//         }
//     },
//     js: {
//         'jquery': {
//             cdn: '<script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha384-vk5WoKIaW/vJyUAd9n/wmopsmNhiy+L2Z+SBxGYnUkunIxVxAv/UtMOhba/xskxh" crossorigin="anonymous" defer></script>',
//             local: '<script src="jquery/dist/jquery.min.js" defer></script>'
//         },
//         'popper.js': {
//             cdn: '<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous" defer></script>',
//             local: '<script src="popper.js/dist/umd/popper.min.js" defer></script>'
//         },
//         'bootstrap': {
//             cdn: '<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous" defer></script>',
//             local: '<script src="bootstrap/dist/js/bootstrap.min.js" defer></script>'
//         },
//         'jquery-ui': {
//             cdn: '<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous" defer></script>',
//             local: '<script src="jquery-ui.min.js" defer></script>'
//         },
//         'jqueryui-touch-punch': {
//             cdn: '<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js" integrity="sha384-MI/QivrbkVVJ89UOOdqJK/w6TLx0MllO/LsQi9KvvJFuRHGbYtsBvbGSM8JHKCS0" crossorigin="anonymous" defer></script>'
//         },
//         '@fullcalendar/core': {
//             cdn: '<script src="https://unpkg.com/@fullcalendar/core@4.3.1/main.min.js" integrity="sha384-m/iMkOZWaAFStlxoUSSGM0Ow9kDwNOIzw2aQDNC3SFffa50jU2HSuluMYODsvAGR" crossorigin="anonymous" defer></script>',
//             local: '<script src="@fullcalendar/core/main.min.js" defer></script>'
//         },
//         '@fullcalendar/daygrid': {
//             cdn: '<script src="https://unpkg.com/@fullcalendar/daygrid@4.3.0/main.min.js" integrity="sha384-Vg8WM1KZn59u30ahJ4mGZwEw2R4ieRhhvX2PPiKKCSpuxms+HvoC3XPii6CnMvFD" crossorigin="anonymous" defer></script>',
//             local: '<script src="@fullcalendar/daygrid/main.min.js" defer></script>'
//         },
//         '@fullcalendar/timegrid': {
//             cdn: '<script src="https://unpkg.com/@fullcalendar/timegrid@4.3.0/main.min.js" integrity="sha384-yyTZuDPNQFp/xKe4Yk67GZBC6Pm3OXdipzs78KRRA37YWJuy3rcgDQTxCxbIviHs" crossorigin="anonymous" defer></script>',
//             local: '<script src="@fullcalendar/timegrid/main.min.js" defer></script>'
//         },
//         'index': {
//             local: '<script src="index.js" defer></script>'
//         },
//         'schedule': {
//             local: '<script src="./schedule.js" defer></script>'
//         }
//     }
// }

const RESOURCES_USED = {
    index: {
        css: ['bootstrap-cerulean', 'jquery-ui', 'main'],
        js: ['jquery', 'popper.js', 'bootstrap', 'jquery-ui', 'index', 'jqueryui-touch-punch']
    },
    schedule: {
        css: ['bootstrap', 'main', '@fullcalendar/core', '@fullcalendar/timegrid'],
        js: ['jquery', '@fullcalendar/core', '@fullcalendar/daygrid', '@fullcalendar/timegrid', 'popper.js', 'bootstrap', 'schedule']
    }
}

const URLS = {
    css: {
        'bootstrap': {
            cdn: 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',
            local: 'bootstrap/dist/css/bootstrap.min.css'
        },
        'jquery-ui': {
            cdn: 'https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.min.css',
            local: 'jquery-ui.min.css'
        },
        '@fullcalendar/core': {
            cdn: 'https://unpkg.com/@fullcalendar/core@4.3.1/main.min.css',
            local: '@fullcalendar/core/main.min.css'
        },
        '@fullcalendar/timegrid': {
            cdn: 'https://unpkg.com/@fullcalendar/timegrid@4.3.0/main.min.css',
            local: '@fullcalendar/timegrid/main.min.css'
        },
        'main': {
            local: './main.css'
        },
        'bootstrap-cerulean': {
            local: './bootstrap-cerulean.min.css'
        }
    },
    js: {
        'jquery': {
            cdn: 'https://code.jquery.com/jquery-3.4.1.min.js',
            local: 'jquery/dist/jquery.min.js'
        },
        'popper.js': {
            cdn: 'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js',
            local: 'popper.js/dist/umd/popper.min.js'
        },
        'bootstrap': {
            cdn: 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js',
            local: 'bootstrap/dist/js/bootstrap.min.js'
        },
        'jquery-ui': {
            cdn: 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js',
            local: 'jquery-ui.min.js'
        },
        'jqueryui-touch-punch': {
            cdn: 'https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js'
        },
        '@fullcalendar/core': {
            cdn: 'https://unpkg.com/@fullcalendar/core@4.3.1/main.min.js',
            local: '@fullcalendar/core/main.min.js'
        },
        '@fullcalendar/daygrid': {
            cdn: 'https://unpkg.com/@fullcalendar/daygrid@4.3.0/main.min.js',
            local: '@fullcalendar/daygrid/main.min.js'
        },
        '@fullcalendar/timegrid': {
            cdn: 'https://unpkg.com/@fullcalendar/timegrid@4.3.0/main.min.js',
            local: '@fullcalendar/timegrid/main.min.js'
        },
        'index': {
            local: 'index.js'
        },
        'schedule': {
            local: './schedule.js'
        }
    }
}

const STATIC_PATHS = ['..', 'public', '../node_modules'];


function all(functions, resolve, reject) {
    /* `functions` is an array; each element is a function of the functions (resolve, reject) */
    var n = functions.length;
    var nDone = 0;
    var vals = [];
    var done = false;
    for (let i = 0; i < functions.length; i++) {
        const f = functions[i];
        f(function(thing) {
            vals[i] = thing;
            if (++nDone === n) {
                resolve(vals);
            }
        }, function(err) {
            if (!done) {
                reject(err);
                done = true;
            }
        });
    }
}

function getSriHash(obj, resolve, reject) {
    if ('local' in obj) {
        for (const staticPath of STATIC_PATHS) {
            const codePath = path.join(__dirname, staticPath, obj.local);
            if (fs.existsSync(codePath)) {
                fs.readFile(codePath, {encoding: "ascii"}, (err, data) => {
                    if (err) reject(err);
                    var result = sriToolbox.generate({algorithms: ["sha384"]}, data);
                    resolve(result);
                    return;
                });
            }
        }
    }
    else if ('cdn' in obj) {
        (async function() {
            const response = await fetch(obj.cdn);
            if (response.status !== 200) {
                reject(response);
                return;
            }
            const data = await response.buffer();
            const result = sriToolbox.generate({algorithms: ["sha384"]}, data);
            resolve(result);
        })();
    }
    else {
        reject('no source for making hash!');
    }

    // if ('cdn' in obj) {
    //     (async function() {
    //         const response = await fetch(obj.cdn);
    //         if (response.status !== 200) {
    //             reject(response);
    //             return;
    //         }
    //         const data = await response.buffer();
    //         const result = sriToolbox.generate({algorithms: ["sha384"]}, data);
    //         resolve(result);
    //     })();
    // }
    // else {
    //     reject('no source for making hash!');
    // }
}

const DO_SRI_THING = true;
const DEFER = true;

function getResources(useCDN, resolve, reject) {
    const resources = {};
    const functions = [];
    for (const type in URLS) {
        resources[type] = {};
        for (const name in URLS[type]) {
            resources[type][name] = {};
            if ('local' in URLS[type][name]) {
                if (type === 'js') {
                    resources[type][name].local = `<script src="${URLS[type][name].local}"${DEFER ? " defer" : ""}></script>`;
                } else if (type === 'css') {
                    resources[type][name].local = `<link rel="stylesheet" href="${URLS[type][name].local}">`;
                }
            }
            if ('cdn' in URLS[type][name]) {
                if (DO_SRI_THING) {
                    functions.push(function(resolve, reject) {
                        getSriHash(URLS[type][name], function(integrity) {
                            if (type === 'js') {
                                resources[type][name].cdn = `<script src="${URLS[type][name].cdn}" integrity="${integrity}" crossorigin="anonymous"${DEFER ? " defer" : ""}></script>`;
                            } else if (type === 'css') {
                                resources[type][name].cdn = `<link rel="stylesheet" href="${URLS[type][name].cdn}" integrity="${integrity}" crossorigin="anonymous">`;
                            }
                            resolve(integrity);
                        }, reject);
                    });
                } else {
                    if (type === 'js') {
                        resources[type][name].cdn = `<script src="${URLS[type][name].cdn}"${DEFER ? " defer" : ""}></script>`;
                    } else if (type === 'css') {
                        resources[type][name].cdn = `<link rel="stylesheet" href="${URLS[type][name].cdn}">`;
                    }
                }
            }
        }
    }
    if (functions.length === 0) {
        done();
    }
    else {
        all(functions, done, reject);
    }

    function done(vals) {
        const resourcesStrings = {};
        for (const view in RESOURCES_USED) {
            resourcesStrings[view] = {};
            for (const kind in RESOURCES_USED[view]) {
                const theseResources = [];
                for (const name of RESOURCES_USED[view][kind]) {
                    const options = resources[kind][name];
                    if (options === undefined) {
                        const err = new Error(`${kind} resource named ${name} is not included in resources`);
                        throw err;
                    }
                    if (useCDN) {
                        if ('cdn' in options)
                            theseResources.push(options.cdn);
                        else
                            theseResources.push(options.local);
                    }
                    else {
                        if ('local' in options)
                            theseResources.push(options.local);
                    }
                }
                resourcesStrings[view][kind] = theseResources;
            }
        }
        resolve(resourcesStrings);
    }
}

module.exports = getResources;
