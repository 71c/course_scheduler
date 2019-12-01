// I wanted to have id function from python
// https://stackoverflow.com/a/1997811
(function() {
    if ( typeof Object.id == "undefined" ) {
        var id = 0;

        Object.id = function(o) {
            if ( typeof o.__uniqueid == "undefined" ) {
                Object.defineProperty(o, "__uniqueid", {
                    value: ++id,
                    enumerable: false,
                    // This could go either way, depending on your 
                    // interpretation of what an "id" is
                    writable: false
                });
            }

            return o.__uniqueid;
        };
    }
})();

function get_depth(L) {
    return Array.isArray(L) ?
        (L.length === 0 ? 1 : Math.max(...L.map(get_depth)) + 1) :
        0;
}

class PeriodGroup {
    constructor(contents, kind, merge=false, data=null, cache=true) {
        this.contents = contents
        this.isAnd = kind === 'and' // kind should be either 'and' or 'or'
        this.merge = merge
        this.data = data
        this.do_cache = cache
        this.cached_eval = null
        this.conflict_matrix = {}
    }

    evaluate() {
        if (this.do_cache) {
            if (this.cached_eval === null)
                this.cached_eval = this.isAnd ? Array.from(this.product_contents()) : Array.from(this.chain_contents());
            return this.cached_eval;
        }
        return this.isAnd ? this.product_contents() : this.chain_contents();
    }

    *cycle(values, uplevel) {
        // console.log(`values: ${values}\nuplevel: ${uplevel}`);
        for (const prefix of uplevel) {
            for (const current of values) {
                if (this.belongs_to_group(current, prefix))
                    yield prefix.concat([current]);
            }
        }
    }

    *product_contents() {
        let result = [[]];
        // console.log(this.contents)
        for (const level of this.contents) {
            const ev = [];
            for (let x of level.evaluate())
                ev.push(x);
            // console.log(`ev: ${ev}`)
            result = this.cycle(ev, result);
        }
        if (this.merge) {
            for (const r of result) {
                const depths = r.map(get_depth);
                const max_depth = Math.max(...depths);
                let r_ = [];
                for (let i = 0; i < r.length; i++) {
                    const x = r[i];
                    const depth = depths[i];
                    if (Array.isArray(x) && (depth === max_depth || depth === 1 && x.length === 0))
                        r_.push(...x);
                    else
                        r_.push(x);
                }
                yield r_;
            }
        } else {
            for (const r of result)
                yield r;
        }
    }

    *chain_contents() {
        for (const it of this.contents) {
            // console.log(it);
            for (const element of it.evaluate()) {
                yield element;
            }
        }
    }

    // belongs_to_group(a, rest) {
    //     const a_num = Object.id(a)
    //     if (! (a_num in this.conflict_matrix))
    //         this.conflict_matrix[a_num] = {}
    //     for (const u of rest) {
    //         const u_num = Object.id(u)
    //         if (! (u_num in this.conflict_matrix[a_num])) {
    //             if (Array.isArray(a)) {
    //                 this.conflict_matrix[a_num][u_num] = false
    //                 for (const i of a) {
    //                     if (Array.isArray(u)) {
    //                         if (! this.belongs_to_group(i, u)) {
    //                             this.conflict_matrix[a_num][u_num] = true
    //                             return false
    //                         }
    //                     } else {
    //                         if (i.intersects(u)) {
    //                             this.conflict_matrix[a_num][u_num] = true
    //                             return false
    //                         }
    //                     }
    //                 }
    //             } else if (Array.isArray(u)) {
    //                 this.conflict_matrix[a_num][u_num] = ! this.belongs_to_group(a, u)
    //             } else {
    //                 this.conflict_matrix[a_num][u_num] = a.intersects(u)
    //             }
    //         }
    //         if (this.conflict_matrix[a_num][u_num])
    //             return false
    //     }
    //     return true
    // }

    belongs_to_group(a, rest) {
        if (Array.isArray(a)) {
            for (const i of a) {
                if (! this.belongs_to_group(i, rest)) {
                    return false
                }
            }
            return true
        }
        for (const u of rest) {
            if (Array.isArray(u)) {
                if (! this.belongs_to_group(a, u)) {
                    return false
                }
            }
            else {
                if (a.intersects(u)) {
                    return false
                }
            }
        }
        return true
    }
}

module.exports = {
    PeriodGroup: PeriodGroup
};
