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

class PartialSorter {
    /* Uses a max heap to find the k smallest values.
       To make it find the k largest values just negate the output of the compare function
       or reverse the order of the arguments given to the compare function.
       https://stackoverflow.com/a/57359800/9911203
    */
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
        for (var i = this.halfK; i--; )
            this.maxSiftDown(i, this.heap[i]);
    }

    insert(item) {
        this.numPassed++;
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
    }

    insertAll(items) {
        /* items should be an iterator or generator */
        var result;
        if (!this.reached) {
            while (true) {
                if (this.numPassed === this.k) {
                    this.maxHeapify();
                    this.reached = true;
                    break;
                }
                result = items.next();
                if (result.done)
                    return;
                this.numPassed++;
                this.heap.push(result.value);
                this.count++;
            }
        }
        while (true) {
            result = items.next();
            if (result.done)
                return;
            this.numPassed++;
            if (this.compare_function(result.value, this.heap[0]) < 0)
                this.maxSiftDown(0, result.value);   
        }
    }

    getMinArray() {
        return this.heap.sort(this.compare_function);
    }
}

module.exports = {
    default_compare: default_compare,
    basic_compare: basic_compare,
    PartialSorter: PartialSorter
};
