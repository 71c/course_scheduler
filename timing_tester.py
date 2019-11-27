from scipy import stats
import numpy as np
import random
from time import time


def get_timings(n, func1, func2, print_progress=False):
    times_1 = []
    times_2 = []
    choices = [False for _ in range(n)] + [True for _ in range(n)]
    random.shuffle(choices)
    if print_progress:
        start_time = time()
    for i, choice in enumerate(choices):
        if choice:
            t = time()
            func1()
            times_1.append(time() - t)
        else:
            t = time()
            func2()
            times_2.append(time() - t)
        if print_progress:
            c = i+1
            eta = (time() - start_time) / c * (2*n - c)
            mins = int(eta // 60)
            secs = int(eta % 60)
            print(f"Done with {c} of {2*n} ({c/(2*n)*100:.1f}%), ETA: {mins:02d}:{secs:02d}")
    return times_1, times_2


def ttest(a, b, alpha, a_name='A', b_name='B', equal_var=True):
    result = stats.ttest_ind(a, b)
    statistic, pvalue = result.statistic, result.pvalue
    print(f"statistic: {statistic}, pvalue: {pvalue}")
    if pvalue < alpha:
        conclusion = f"{a_name} mean {'<' if statistic < 0 else '>'} {b_name} mean"
        print(f"Null hypothesis rejected because p < {alpha}: {conclusion}")
    else:
        print(f"Null hypothesis not rejected because p > {alpha}")


def filter_out_outliers(values, k):
    q1 = np.quantile(values, 0.25)
    q3 = np.quantile(values, 0.75)
    iqr = q3 - q1
    a, b = q1 - k * iqr, q3 + k * iqr
    filtered, outliers = [], []
    for x in values:
        if a <= x <= b:
            filtered.append(x)
        else:
            outliers.append(x)
    return filtered, outliers


def get_timings_and_print_results(func1, func2, a_name, b_name, n, alpha, equal_var=False, print_progress=False, remove_outliers=True, k=3, show_outliers=True):
    times_1, times_2 = get_timings(n, func1, func2, print_progress)
    n1, n2 = n, n
    if remove_outliers:
        times_filtered_1, outliers_1 = filter_out_outliers(times_1, k)
        times_filtered_2, outliers_2 = filter_out_outliers(times_2, k)
        a_mean, b_mean = np.mean(times_filtered_1), np.mean(times_filtered_2)
        a_std, b_std = np.std(times_filtered_1, ddof=1), np.std(times_filtered_2, ddof=1)
        n1, n2 = len(times_filtered_1), len(times_filtered_2)
        
        print(f"{a_name} times (outliers removed):\n{times_filtered_1}")
        if show_outliers:
            print(f"{a_name} times outliers:\n{outliers_1}")
        print(f"{b_name} times (outliers removed):\n{times_filtered_2}")
        if show_outliers:
            print(f"{b_name} times outliers:\n{outliers_2}")
    else:
        a_mean, b_mean = np.mean(times_1), np.mean(times_1)
        a_std, b_std = np.std(times_2, ddof=1), np.std(times_2, ddof=1)
        
        print(f"{a_name} times:\n{times_1}")
        print(f"{b_name} times:\n{times_2}")

    max_len = max(len(a_name), len(b_name))
    print(f"n={n}")
    print(f"{a_name:>{max_len}} time: mean={a_mean:.3f}, std={a_std:.3f}, n={n1}")
    print(f"{b_name:>{max_len}} time: mean={b_mean:.3f}, std={b_std:.3f}, n={n2}")

    if remove_outliers:
        ttest(times_filtered_1, times_filtered_2, alpha, a_name+' time', b_name+' time', equal_var)
    else:
        ttest(times_1, times_2, alpha, a_name+' time', b_name+' time', equal_var)
    
    return times_1, times_2
