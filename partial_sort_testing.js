// const { Seq } = require('immutable-sorted');

// https://jsperf.com/partial-sort-aloja

function default_compare(a, b) {
    /* comparison similar to how Python compares */
    var type_a = a.constructor;
    var type_b = b.constructor;
    if (type_a !== type_b) {
        var err = new TypeError(`instances of '${type_a.name}' and '${type_b.name}' should not be compared`);
        throw err;
    }
    if (type_a === Array) {
        var na = a.length;
        var nb = b.length;
        var n = na < nb ? na : nb; // min of them
        for (var i = 0; i < n; i++) {
            var compare_result = default_compare(a[i], b[i]);
            if (compare_result !== 0)
                return compare_result;
        }
        return na < nb ? -1 : na > nb ? 1 : 0;
    } else {
        if (a < b)
            return -1;
        else if (a > b)
            return 1;
        else if (a === b)
            return 0;
        var err = new TypeError(`instances of '${type_a.name}' and '${type_b.name}' should not be compared`);
        throw err;
    }
}

var basic_compare = (a,b)=>a<b?-1:a>b?1:0;


// https://stackoverflow.com/a/57359800/9911203
class PartialSort {
    constructor(compare_function) {
        this.compare_function = compare_function;
    }

    maxSiftDown(arr, i=0, value=arr[i]) {
        if (i >= arr.length) return;
        while (true) {
            var j = i*2+1;
            if (j+1 < arr.length && this.compare_function(arr[j], arr[j+1]) < 0) j++;
            if (j >= arr.length || this.compare_function(value, arr[j]) >= 0) break;
            arr[i] = arr[j];
            i = j;
        }
        arr[i] = value;
    }

    maxHeapify(arr) {
        for (var i = arr.length>>1; i--; ) this.maxSiftDown(arr, i);
        return arr;
    }

    partialSortWithMaxHeap(items, k) {
        var heap = this.maxHeapify(items.slice(0, k));
        for (var i = k, len = items.length; i < len; ++i) {
            var item = items[i];
            if (this.compare_function(item, heap[0]) < 0) this.maxSiftDown(heap, 0, item);
        }
        return heap.sort(this.compare_function);
    }
}

class PartialIncrementalSort {
    constructor(compare_function, k) {
        this.compare_function = compare_function;
        this.k = k;
        this.halfK = k >> 1;
        this.heap = [];
        this.count = 0;
        this.numPassed = 0;
        this.reached = false;
    }

    maxSiftDown(i=0, value=this.heap[i]) {
        if (i >= this.count) return;
        while (true) {
            var j = i*2+1;
            if (j+1 < this.count && this.compare_function(this.heap[j], this.heap[j+1]) < 0) j++;
            if (j >= this.count || this.compare_function(value, this.heap[j]) >= 0) break;
            this.heap[i] = this.heap[j];
            i = j;
        }
        this.heap[i] = value;
    }

    maxHeapify() {
        for (var i = this.halfK; i--; ) {
            this.maxSiftDown(i, this.heap[i]);
        }
    }

    insert(item) {
        if (this.reached) {
            if (this.compare_function(item, this.heap[0]) < 0)
                this.maxSiftDown(0, item);
            return;
        }
        if (this.numPassed === this.k) {
            this.maxHeapify();
            this.reached = true;
            this.insert(item);
            return;
        }
        this.heap.push(item);
        this.count++;
        this.numPassed++;
    }

    insertAll1(items) {
        let result = items.next();
        if (!this.reached) {
            while (!result.done) {
                if (this.numPassed === this.k) {
                    this.maxHeapify();
                    this.reached = true;
                    break;
                }
                this.heap.push(result.value);
                this.count++;
                this.numPassed++;
                result = items.next();
            }
        }
        while (!result.done) {
            if (this.compare_function(result.value, this.heap[0]) < 0)
                this.maxSiftDown(0, result.value);
            result = items.next();
        }
    }

    insertAll2(items) {
        for (const value of items) {
            if (this.reached) {
                if (this.compare_function(value, this.heap[0]) < 0)
                    this.maxSiftDown(0, value);
            } else if (this.numPassed < this.k) {
                this.heap.push(value);
                this.count++;
                this.numPassed++;
            } else {
                this.maxHeapify();
                this.reached = true;
                if (this.compare_function(value, this.heap[0]) < 0)
                    this.maxSiftDown(0, value);
            }
        }
    }

    getMinArray() {
        return this.heap.sort(this.compare_function);
    }
}

//https://stackoverflow.com/a/19303725/9911203
var seed = 3891;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

var t;

var n = 5000;
var k = 10;

t = Date.now()
var arr = Array.from({length:n}, function() {
    return {q: Math.floor(random() * 1e5)}
});
console.log(Date.now() - t, 'to make')

function* makeGenerator() {
    var i = 0;
    while (++i !== n)
        yield {q: Math.floor(random() * 1e5)};
}
var arrGenerator = makeGenerator();

// var arr = [{q: 3}, {q: -1}, {q: 7}, {q: 6}, {q: -10}, {q: 8}]





// t = Date.now()
// const seq1=Seq(arr);
// var best2 = seq1.partialSortBy(k, x => x.q, basic_compare);
// console.log(Date.now() - t)


t = Date.now()
var sorter2 = new PartialIncrementalSort((a, b) => default_compare(a.q, b.q), k);
for (var x of arr) {
    sorter2.insert(x);
}
var best3 = sorter2.getMinArray();
console.log(Date.now() - t)



t = Date.now();
var sorter = new PartialSort((a, b) => default_compare(a.q, b.q));
var best = sorter.partialSortWithMaxHeap(arr, k);
console.log(Date.now() - t)



seed = 3891;
t = Date.now();
var sorter3 = new PartialIncrementalSort((a, b) => default_compare(b.q, a.q), k);
sorter3.insertAll1(arrGenerator);
var best4 = sorter3.getMinArray();
console.log(Date.now() - t)




// console.log(best2)
console.log(best)
console.log(best3)
console.log(best4)

// function* makeGenerator2(n) {
//     var i = 0;
//     while (++i !== n)
//         yield {q: Math.floor(Math.random() * 1e5)};
// }
// var gen = makeGenerator2(10);
// var i = 0;
// for (var x of gen) {
//     if (i++ === 5)
//         break;
//     console.log(x);
// }
// console.log('YEE')
// for (var x of gen) {
//     console.log(x);
// }
