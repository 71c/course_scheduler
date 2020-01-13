const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const sriToolbox = require('sri-toolbox');

const DO_SRI_THING = true;
const ALGORITHMS = ["sha256"];
const DEFER = true;

const EXTRA_PART = DEFER ? " defer" : "";

const {all} = require('./utils');

const RESOURCES_USED = {
    index: {
        css: ['bootstrap-flatly', 'jquery-ui', 'main'],
        js: ['jquery', 'popper.js', 'bootstrap', 'jquery-ui', 'index', 'jqueryui-touch-punch']
    },
    schedule: {
        css: ['bootstrap-flatly', 'main', '@fullcalendar/core', '@fullcalendar/timegrid'],
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
        },
        'bootstrap-flatly': {
            local: './bootstrap-flatly.min.css'
        },
        'bootstrap-materia': {
            local: './bootstrap-materia.min.css'
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
            cdn: 'https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js',
            local: 'jquery.ui.touch-punch.min.js'
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

const STATIC_PATHS = ['public/css', 'public/js', 'public/vendor', '../node_modules'];

function getSriHash(obj, resolve, reject) {
    if ('local' in obj) {
        for (const staticPath of STATIC_PATHS) {
            const codePath = path.join(__dirname, staticPath, obj.local);
            if (fs.existsSync(codePath)) {
                fs.readFile(codePath, (err, data) => {
                    if (err) reject(err);
                    var result = sriToolbox.generate({algorithms: ALGORITHMS}, data);
                    resolve(result);
                });
                return;
            }
        }
        reject(`${obj.local} does not exist`)
    }
    else if ('cdn' in obj) {
        (async function() {
            const response = await fetch(obj.cdn);
            if (response.status !== 200) {
                reject(response);
                return;
            }
            const data = await response.buffer();
            const result = sriToolbox.generate({algorithms: ALGORITHMS}, data);
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
    //         console.log(data);
    //         const result = sriToolbox.generate({algorithms: ALGORITHMS}, data);
    //         resolve(result);
    //     })();
    // }
    // else {
    //     reject('no source for making hash!');
    // }
}

function getResourcesObject(callback) {
    const resources = {};
    const functions = [];
    for (const type in URLS) {
        resources[type] = {};
        for (const name in URLS[type]) {
            resources[type][name] = {};
            if ('local' in URLS[type][name]) {
                if (type === 'js') {
                    resources[type][name].local = `<script src="${URLS[type][name].local}"${EXTRA_PART}></script>`;
                } else if (type === 'css') {
                    resources[type][name].local = `<link rel="stylesheet" href="${URLS[type][name].local}">`;
                }
            }
            if ('cdn' in URLS[type][name]) {
                if (DO_SRI_THING) {
                    functions.push(function(resolve, reject) {
                        getSriHash(URLS[type][name], function(integrity) {
                            if (type === 'js') {
                                resources[type][name].cdn = `<script src="${URLS[type][name].cdn}" integrity="${integrity}" crossorigin="anonymous"${EXTRA_PART}></script>`;
                            } else if (type === 'css') {
                                resources[type][name].cdn = `<link rel="stylesheet" href="${URLS[type][name].cdn}" integrity="${integrity}" crossorigin="anonymous">`;
                            }
                            resolve(integrity);
                        }, reject);
                    });
                } else {
                    if (type === 'js') {
                        resources[type][name].cdn = `<script src="${URLS[type][name].cdn}"${EXTRA_PART}></script>`;
                    } else if (type === 'css') {
                        resources[type][name].cdn = `<link rel="stylesheet" href="${URLS[type][name].cdn}">`;
                    }
                }
            }
        }
    }
    if (functions.length === 0) {
        callback(resources);
    }
    else {
        all(functions, function() {
            callback(resources);
        }, reject);
    }
}

function getResources(useCDN, resolve, reject) {
    getResourcesObject(function(resources) {
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
    });
}

module.exports = getResources;
