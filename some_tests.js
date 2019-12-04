const get_data = require('./get_data');
const api = require('./api');
const models = require('./models');
const course_scheduler = require('./course_scheduler');
const _und = require('underscore');
const distributions = require('distributions');

// const n_trials = 500;
// const n_classes = 2;
// const min_class_n = 40;
// const min_max_n = 0;
const REG_2 = {
  slope: 1.0174308946838073,
  intercept: -6.671769600392137,
  r: 0.9829552398683108,
  r2: 0.9662010035845684,
  s: 0.12558485662710256,
  n: 500,
  ssxx: 216.8990890980214,
  xbar: 9.173155193926135
};
// {
//   slope: 0.0024767671705202164,
//   itercept: 0,
//   r2: 0.7692668090465402,
//   s: 5.517392532102293,
//   rmsr: 5.579357160627056
// }

// const n_trials = 500;
// const n_classes = 3;
// const min_class_n = 18;
// const min_max_n = 120000;
const REG_3 = {
  slope: 0.7553066448337206,
  intercept: -4.401955652218651,
  r: 0.9360264252669097,
  r2: 0.8761454687979497,
  s: 0.2022533958370323,
  n: 267,
  ssxx: 134.41731832030644,
  xbar: 12.747109174960684
};
// {
//   slope: 0.0013699181343762152,
//   itercept: 0,
//   r2: 0.9210248790982926,
//   s: 39.646106123162596,
//   rmsr: 40.29713661227599
// }

// const n_trials = 50;
// const n_classes = 4;
// const min_class_n = 18;
// const min_max_n = 300000;
const REG_4 = {
  slope: 0.7938566838042098,
  intercept: -4.914388887978464,
  r: 0.9345518505884318,
  r2: 0.8733871614382626,
  s: 0.3739967125687555,
  n: 50,
  ssxx: 73.48888426492923,
  xbar: 15.86669793314753
};
// {
//   slope: 0.0015266676251995681,
//   itercept: 0,
//   r2: 0.9722548676336493,
//   s: 520.0722760149362,
//   rmsr: 520.6798568562139
// }

// const n_trials = 50;
// const n_classes = 5;
// const min_class_n = 7;
// const min_max_n = 300000;
const REG_5 = {
  slope: 1.0121458092527023,
  intercept: -9.402977441506932,
  r: 0.8942249057208551,
  r2: 0.7996381820114722,
  s: 0.8721345785231324,
  n: 44,
  ssxx: 124.45395397752344,
  xbar: 15.526041684581463
};
// {
//   slope: 0.002025727258467776,
//   itercept: 0,
//   r2: 0.9943737608860345,
//   s: 347.73129736241685,
//   rmsr: 356.64916525787237
// }

// const n_trials = 500;
// const n_classes = 6;
// const min_class_n = 4;
// const min_max_n = 10000;
const REG_6 = {
  slope: 0.8014284844122601,
  intercept: -7.176686031503152,
  r: 0.8137692234599286,
  r2: 0.6622203490505753,
  s: 1.2613562428117286,
  n: 454,
  ssxx: 2195.0956437730183,
  xbar: 13.284655838653944
}
// { WRONG!!
//   slope: 0.00004730784709632621,
//   itercept: 0,
//   r2: 0.5555392268117121,
//   s: 1103.423673263318,
//   rmsr: 1104.1218329723085
// }


// const n_trials = 500;
// const n_classes = 7;
// const min_class_n = 3;
// const min_max_n = 50000;
const REG_7 = {
  slope: 0.7567987241706313,
  intercept: -7.3361490104133384,
  r: 0.7532968235356584,
  r2: 0.5674561043489129,
  s: 1.3391053334257648,
  n: 383,
  ssxx: 1564.9330321696852,
  xbar: 13.899827398744295
};
// {  WRONG!!
//   slope: 0.00002410112785328755,
//   itercept: 0,
//   r2: 0.3973122262230342,
//   s: 1281.896431807087,
//   rmsr: 1280.3417767938977
// }



// const n_trials = 100;
// const n_classes = 3;
// const min_class_n = 35;
// const min_max_n = 10000;
// reg 3
// {
//   slope: 0.9183314575303941,
//   intercept: -6.5888211639668715,
//   r: 0.976229541286975,
//   r2: 0.9530241172813777,
//   s: 0.2445794924698862,
//   n: 432,
//   ssxx: 618.7832557171824,
//   xbar: 11.175932781682734
// }
// {
//   slope: 0.6432886491296889,
//   intercept: -2.835911390543674,
//   r: 0.9364959366493533,
//   r2: 0.8770246393607495,
//   s: 0.17087919238346982,
//   n: 100,
//   ssxx: 49.31583086912753,
//   xbar: 13.681338735805559
// }

function time() {
    return Date.now();
}

function get_prediction_interval_for_time(m, alpha, reg) {
    const [lo_log, hi_log] = get_prediction_interval(Math.log(m), alpha, reg);
    return {
        lo: Math.exp(lo_log),
        mid: Math.exp((lo_log + hi_log) / 2),
        hi: Math.exp(hi_log)
    };
}

function get_prediction_interval(x, alpha, reg) {
    /*
    x: dependent variable value
    alpha: parameter chianging 100*(1-alpha)% preidction interval
    reg should have the parameters:
        xbar: mean of x
        slope: slope of regression line
        intercept: intercept of regression line
        n: number of samples
        s: standard deviation of the residuals (with 2 or 1 degrees of freedom)
        ssxx: sum of squares of deviations of x from mean of x
    */
    const tdist = distributions.Studentt(reg.n - 2);
    const tstar = -tdist.inv(alpha/2);
    const half_interval = tstar * reg.s * Math.sqrt(1 + 1/reg.n + Math.pow(x - reg.xbar, 2) / reg.ssxx);
    const prediction = reg.slope * x + reg.intercept;
    return [prediction - half_interval, prediction + half_interval];
}

function linear_regression(x, y, extra=false) {
    const n = x.length;
    let sx = 0;
    let sxy = 0;
    let sxx = 0;
    let sy = 0;
    let syy = 0;
    for (let i = 0; i < n; i++) {
        sx += x[i];
        sy += y[i];
        sxy += x[i]*y[i];
        sxx += x[i]*x[i];
        syy += y[i]*y[i];
    }
    const lr = {};
    const xy = n * sxy - sx * sy; // n \sum_{i=1}^n(x_i-\bar x)(y_i-\bar y)
    const xx = n * sxx - sx * sx; // n \sum_{i=1}^n(x_i-\bar x)^2
    const yy = n * syy - sy * sy; // n \sum_{i=1}^n(y_i-\bar y)^2
    lr.slope = xy / xx;
    lr.intercept = (sy - lr.slope * sx) / n;
    lr.r = xy / Math.sqrt(xx * yy);
    lr.r2 = lr.r * lr.r;
    const sst = yy / n; // \overline{(y-\bar y)^2}
    const sse = sst * (1 - lr.r2); // \sum{i=1}^n(y_i-\hat y_i)^2
    lr.s = Math.sqrt(sse / (n - 2)); // standard deviation of residuals
    lr.n = n;
    if (extra) {
        lr.ssxx = xx / n; // sum of square deviations of x from mean of x
        lr.xbar = sx / n; // mean of x
    }
    return lr;
}

// https://stackoverflow.com/a/42594819
const regress = (x, y) => {
    const n = y.length;
    let sx = 0;
    let sy = 0;
    let sxy = 0;
    let sxx = 0;
    let syy = 0;
    for (let i = 0; i < n; i++) {
        sx += x[i];
        sy += y[i];
        sxy += x[i] * y[i];
        sxx += x[i] * x[i];
        syy += y[i] * y[i];
    }
    const mx = sx / n;
    const my = sy / n;
    const yy = n * syy - sy * sy;
    const xx = n * sxx - sx * sx;
    const xy = n * sxy - sx * sy;
    const slope = xy / xx;
    const intercept = my - slope * mx;
    const r = xy / Math.sqrt(xx * yy);
    const r2 = Math.pow(r,2);
    let sst = 0;
    for (let i = 0; i < n; i++) {
       sst += Math.pow((y[i] - my), 2);
    }
    const sse = sst - r2 * sst;
    const see = Math.sqrt(sse / (n - 2));
    const ssr = sst - sse;
    return {slope, intercept, r, r2, sse, ssr, sst, sy, sx, see};
}


function linear_regression_no_intercept(x, y) {
    const n = x.length;
    let sum_x = 0;
    let sum_xy = 0;
    let sum_xx = 0;
    let sum_y = 0;
    let sum_yy = 0;
    for (let i = 0; i < n; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += x[i]*y[i];
        sum_xx += x[i]*x[i];
        sum_yy += y[i]*y[i];
    }
    const total_square_error = sum_yy-sum_xy*sum_xy/sum_xx;
    const total_square_y_minus_mean_y = sum_yy - sum_y * sum_y / n;
    const total_error = sum_y-sum_x*sum_xy/sum_xx;
    return {
        slope: sum_xy / sum_xx,
        itercept: 0,
        r2: 1 - total_square_error / total_square_y_minus_mean_y,
        s: Math.sqrt((n*total_square_error-total_error*total_error)/(n*(n-1))),
        rmsr: Math.sqrt(total_square_error/n)
    };
}

function evaluation_timing_test(names) {
    // ['PHY-0012', 'MATH-0042', 'ENG-0001', 'ES-0002', 'COMP-0015'];
    // ['CHEM-0001', 'SPN-0002', 'COMP-0011', 'FR-0002']
    // ['CHEM-0001', 'CHEM-0002', 'SPN-0002', 'SPN-0004']

    // time getting results
    let t = time();
    const courses = names.map(x => api.get_search_results(x)[0]);
    console.log(time() - t);
        
    // time turning courses into PeriodGroups
    t = time();
    const pg = new course_scheduler.PeriodGroup(
        courses.map(x => api.course_object_to_period_group(x, true, ['O', 'C', 'W'])),
        'and'
    );
    console.log(time() - t);

    // time evaluate
    t = time();
    const ev = pg.evaluate();
    console.log(time() - t);

    console.log(ev.length);
}

function get_timing_data(n_trials, n_classes, min_class_n, min_max_n, callback) {
    const pgs = models.courses.map(course => api.course_object_to_period_group(course, exclude_classes_with_no_days=true, accepted_statuses=['O','W','C']))
    const ev_lens = pgs.map(pg => pg.evaluate().length)
    let indices = ev_lens.map((_, i) => i)
    indices.sort((i1, i2) => ev_lens[i1] - ev_lens[i2])
    // indices = indices.slice(-50)
    indices = indices.filter(i => ev_lens[i] >= min_class_n)
    console.log(indices.map(i => ev_lens[i]))

    const ns = []
    const n_maxs = []
    const ts = []
    for (let trial_count = 0; trial_count < n_trials; trial_count++) {
        const indices_sample = _und.sample(indices, n_classes)        
        let max_n_possibilities = 1;
        for (const i of indices_sample)
            max_n_possibilities *= ev_lens[i];

        if (max_n_possibilities >= min_max_n) {
            const prediction = get_prediction_interval_for_time(max_n_possibilities, 0.05, REG_5);
            console.log(`${prediction.lo}   ${prediction.mid}   ${prediction.hi}`);
            if (prediction.lo >= 15000) {
                console.log(max_n_possibilities, 'TOO MUCH');
                continue;
            }
            t = time()
            const n_possibilities = new course_scheduler.PeriodGroup(indices_sample.map(i=>pgs[i]), 'and').evaluate().length;
            t = time() - t

            console.log(`n: ${n_possibilities}, t: ${t}`)

            ns.push(n_possibilities)
            n_maxs.push(max_n_possibilities)
            ts.push(t)
        }
        if (trial_count === n_trials - 1)
            callback(ns, n_maxs, ts);

        console.log(trial_count);
    }
}

function time_complexity_test(n_trials, n_classes, min_class_n, min_max_n) {
    get_timing_data(n_trials, n_classes, min_class_n, min_max_n, do_after);
    function do_after(ns, n_maxs, ts) {
        for (let i = 0; i < ns.length; i++) {
            const n = ns[i];
            const m = n_maxs[i];
            const t = ts[i];
            if (m !== 0 && n !== 0 && t !== 0)
                console.log(`${Math.log(m)}\t${Math.log(t)}`);
        }
        console.log('');
        for (let i = 0; i < ns.length; i++) {
            const n = ns[i];
            const m = n_maxs[i];
            const t = ts[i];
            if (m !== 0 && n !== 0 && t !== 0)
                console.log(`${m}\t${t}`);
        }
        console.log('');
        for (let i = 0; i < ns.length; i++) {
            const n = ns[i];
            const m = n_maxs[i];
            const t = ts[i];
            if (m !== 0 && n !== 0 && t !== 0)
                console.log(`${Math.log(n)}\t${Math.log(t)}`);
        }
        console.log('');
        for (let i = 0; i < ns.length; i++) {
            const n = ns[i];
            const m = n_maxs[i];
            const t = ts[i];
            if (m !== 0 && n !== 0 && t !== 0)
                console.log(`${n}\t${t}`);
        }
    }
}

function print_log_log_plot(ns, n_maxs, ts) {
    for (let i = 0; i < ns.length; i++) {
        const n = ns[i];
        const m = n_maxs[i];
        const t = ts[i];
        if (m !== 0 && n !== 0 && t !== 0)
            console.log(`${Math.log(m)}\t${Math.log(t)}`);
    }
}

function get_parameters(n_trials, n_classes, min_class_n, min_max_n, callback) {
    get_timing_data(n_trials, n_classes, min_class_n, min_max_n, do_after);
    function do_after(N, M, T) {
        // log(t) ~ a_1 + b_1 log(m)
        const log_M = [];
        const log_T = [];
        const log_T_vs_log_M = [];
        for (let i = 0; i < M.length; i++) {
            const m = M[i];
            const t = T[i];
            if (m !== 0 && t !== 0) {
                const log_m = Math.log(m);
                const log_t = Math.log(t);
                log_M.push(log_m);
                log_T.push(log_t);
                log_T_vs_log_M.push([log_m, log_t]);
            }
        }
        const result1 = linear_regression(log_M, log_T, extra=true);
        const result2 = linear_regression_no_intercept(N, T);
        console.log(result1);
        console.log(result2);
        console.log("log(t) ~ a + b log(m)");
        console.log("t ~ exp(a) m^b");
        console.log(`a=${result1.intercept}\nb=${result1.slope}\ns=${result1.s}\nR^2=${result1.r2}\n`);
        console.log(`t ~ c n`);
        console.log(`c=${result2.slope}\nrmsr=${result2.rmsr}\nR^2=${result2.r2}\n`);
        callback(result1, result2, N, M, T);
    }
}

function make_desmos(reg) {
    const bounds = '\\left\\{x_{m}-2\\sigma\\le x\\le x_{m}+2\\sigma\\right\\}'
    const declare_variables = `a=${reg.intercept}\nb=${reg.slope}\ns=${reg.s}\nn=${reg.n}\nS_{xx}=${reg.ssxx}\nx_m=${reg.xbar}\n\\alpha=0.05`;
    return `${declare_variables}
\\sigma=\\sqrt{\\frac{S_{xx}}{n-2}}
t=-\\operatorname{inversecdf}\\left(\\operatorname{tdist}\\left(n-2\\right),\\frac{\\alpha}{2}\\right)
I\\left(x\\right)=ts\\sqrt{1+\\frac{1}{n}+\\frac{\\left(x-x_{m}\\right)^{2}}{S_{xx}}}${bounds}
L\\left(x\\right)=a+bx-I\\left(x\\right)
U\\left(x\\right)=a+bx+I\\left(x\\right)
A\\left(x\\right)=a+bx${bounds}
e^{A\\left(\\ln x\\right)}
e^{L\\left(\\ln x\\right)}
e^{U\\left(\\ln x\\right)}`;
}


/*
log(t) ~ a_1 + b_1 log(m) (higher R^2 for both log-log and linear-linear)
for larger values of m
t ~ a_1 + b_1 m
for smaller values of m (lower R^2 for both log-log and linear-linear. I don't think I should work with this conclusion)

t ~ a_2 + b_2 n (for both higher and lower values of m; pretty clear winner for smaller m but close for larger m; for winner, R^2=0.96 for small and R^2=0.99 for large)
this means O(n)?

log(n) ~ a_3 + b_3 log(m) (for both higher and lower values of m; R^2 values for both log-log and linear-linear are close)


m -> n -> t:
t ~ a_2 + b_2 exp(a_3 + b_3 log(m))
t ~ a_2 + b_2 exp(a_3) m^b_3
but I think it's better just to go straight from m -> t:
t ~ exp(a_1) m^b_1




actually, when linearly predicting t from m or n, removing the bias term hardly
affects the R^2 value, and it makes more sens to not have the bias term
so with the bias terms removed:

log(t) ~ a_1 + b_1 log(m) (higher R^2 for both log-log and linear-linear)
for larger values of m, and
t ~ b_1 m
for smaller values of m (lower R^2 for both log-log and linear-linear. I don't think I should work with this conclusion)

t ~ b_2 n (for both higher and lower values of m; pretty clear winner for smaller m but close for larger m; for winner, R^2=0.96 for small and R^2=0.99 for large)
this means O(n)?

log(n) ~ a_3 + b_3 log(m) (for both higher and lower values of m; R^2 values for both log-log and linear-linear are close)


m -> n -> t:
t ~ b_2 exp(a_3 + b_3 log(m))
t ~ b_2 exp(a_3) m^b_3
but I think it's better just to go straight from m -> t:
t ~ exp(a_1) m^b_1

also... if log(t) ~ a_1 + b_1 log(m) ± s
then t ~ exp(a_1) m^b_1 ± (exp(a_1) m^b_1) s
*/

function main() {
    // get_timing_data(n_trials, n_classes, min_class_n, min_max_n, callback(ns, n_maxs, ts))
    // let u = time();
    // get_timing_data(1000, 4, 3, 100, function(N, M, T) {
    //     console.log(time() - u);
    //     console.log('N:');
    //     console.log(N);
    //     console.log('M:');
    //     console.log(M);
    //     console.log('T:');
    //     console.log(T);
    //     console.log(Math.max(...N), Math.max(...M), Math.max(...T));
    // });

    // const x = [1,3,5,4,6];
    // const y = [2,5,3,7,8];
    // let x = [];
    // let y = [];
    // for (let i = 0; i < 400; i++) {
    //     let randnum = Math.random() * 100;
    //     x.push(randnum);
    //     y.push(4 * randnum + 3 + (Math.random() - 0.5) * 100)
    // }
    // const res = linear_regression(x, y, true);
    // console.log(res);
    // time_complexity_test(3000, 4, 3, 20000);
    
    const n_trials = 50;
    const n_classes = 5;
    const min_class_n = 7;
    const min_max_n = 300000;
    get_parameters(n_trials, n_classes, min_class_n, min_max_n, (reg1, reg2, N, M, T) => {
        console.log(make_desmos(reg1));
        console.log();
        print_log_log_plot(N, M, T);
    });
    // time_complexity_test(n_trials, n_classes, min_class_n, min_max_n);

    // console.log(make_desmos(REG_1));

}


if (require.main === module) {
    get_data.get_and_save_data('Spring 2020', () => {
        main();
    });
}




// let interval = get_prediction_interval_for_time(212*174*105*88, 0.05, REG_1);
// console.log(interval);
// interval = get_prediction_interval_for_time(212*174*105*88*79, 0.05, REG_1);
// console.log(interval);

// main();

// let x = [1,5,3,5,6,3];
// let y = x.map(p=>p*2+390);
// function thing() {
//     console.log(time() - t);
// }

// console.log(linear_regression_no_intercept(x, y))



module.exports = {
    evaluation_timing_test: evaluation_timing_test
};
