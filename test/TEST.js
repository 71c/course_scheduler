const fs = require('fs');

async function test() {
    // fs.promises.writeFile("test/testfile", "this is a test!").then(function(err) {
    //     console.log("DUN FILE");
    // });
    // dot();

    // Promise.all([
    //     (async function() {
    //         await fs.promises.writeFile("test/testfile", "this is a test!");
    //         console.log("DUN FILE");
    //     })(),
    //     (async function() {
    //         dot();
    //     })()
    // ]);

    // fs.writeFile("test/testfile", "this is a test!", function(err) {
    //     console.log("DUN FILE");
    // });
    // dot();

    dot();
}

function dot() {
    for (var i = 0; i < 1000000; i++) {
        // console.log(i);
        for (var j = 0; j < 1000; j++) {
            var b = j * i;
        }
    }
    console.log("DUN")
}

console.log("A");
test();
console.log("B");
