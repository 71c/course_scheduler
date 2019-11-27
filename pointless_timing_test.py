import matplotlib.pyplot as plt
from get_data import *
from timing_tester import get_timings_and_print_results
from http import cookiejar
import urllib.request


# https://stackoverflow.com/a/21714597
class BlockAll(cookiejar.CookiePolicy):
    set_ok = domain_return_ok = path_return_ok = lambda self, *args, **kwargs: False
    return_ok = lambda self, *args, **kwargs: True
    netscape = True
    rfc2965 = hide_cookie2 = False


# cookies = {
#     '$Cookie: F5-SISCS-PROD2-COOKIE': '1049688586.29991.0000',
#     'SignOnDefault': '',
#     'PS_TOKEN_WC': 'pwAAAAQDAgEBAAAAvAIAAAAAAAAsAAAABABTaGRyAk4AcQg4AC4AMQAwABSMMxpXCsc+J0Oem3qW8TjwmCnJsWcAAAAFAFNkYXRhW3icHclLDkBAEEXR6xNDsRGiu32HCBIDJMytwf4szktXJaeSui8QR2EQ6H4hfrKBjYGJgxGDI5nZWUlPLhZuHk71ylIq9+TSSOs1dBQqrbeRjlpb6t/DD5ZBC7Q=',
#     'PS_TOKEN_WCEXPIRE': '22_Nov_2019_04:07:07_GMT',
#     'F5-SISCS-PROD2-COOKIE': '1049688586.29991.0000',
#     'PS_TokenSite': 'https://sis.uit.tufts.edu/psp/paprd/?sisweb-prod-06-10120-PORTAL-PSJSESSIONID',
#     'lcsrftoken': 'dpJCiKr4YWfmxADJm5tIkLTONURI9ckDc+M8RiWq3es=',
#     'ExpirePage': 'https://sis.uit.tufts.edu/psp/paprd/',
#     'PS_TOKEN': 'pwAAAAQDAgEBAAAAvAIAAAAAAAAsAAAABABTaGRyAk4Acwg4AC4AMQAwABQ2efZIDQRC1ejUPnNZzBkNWMWBKWcAAAAFAFNkYXRhW3icHYlNDkAwGERfSywt3INQf7G0UDtpotY9hOs5nOH7kjfzMjeQZ9YY5WP5r4p4Aomdi42TSLFxSMsg8/KkfWVwtHQs1GInOv3XexotThx/DrKvTczwAt+NDHc=',
#     'PS_DEVICEFEATURES': 'width:1280 height:800 pixelratio:2 touch:0 geolocation:1 websockets:1 webworkers:1 datepicker:1 dtpicker:1 timepicker:1 dnd:1 sessionstorage:1 localstorage:1 history:1 canvas:1 svg:1 postmessage:1 hc:0 maf:0',
#     'sisweb-prod-06-10120-PORTAL-PSJSESSIONID': 'UnCV4Hmd2wfycdrSUdUBiW2IO_owvl5L\\u0021-1938185455',
#     'https%3a%2f%2fsis.uit.tufts.edu%2fpsp%2fpaprd%2femployee%2fempl%2frefresh': 'list:%20%3Ftab%3Dtfp_affiliate_registration%7C%3Frp%3Dtfp_affiliate_registration%7C7c%3Ftab%3Dtfp_ap_forgot_password%7C%3Frp%3Dtfp_ap_forgot_password%7C%3Ftab%3Dtfp_ap_password_reset%7C%3Frp%3Dtfp_ap_password_reset%7C%3Ftab%3Dremoteunifieddashboard%7C%3Frp%3Dremoteunifieddashboard',
#     'psback': '%22%22url%22%3A%22https%3A%2F%2Fsis.uit.tufts.edu%2Fpsp%2Fpaprd%2FEMPLOYEE%2FEMPL%2Fh%2F%3Ftab%3DTFP_CLASS_SEARCH%22%20%22label%22%3A%22LabelNotFound%22%20%22origin%22%3A%22PIA%22%20%22layout%22%3A%220%22%20%22refurl%22%3A%22https%3A%2F%2Fsis.uit.tufts.edu%2Fpsp%2Fpaprd%2FEMPLOYEE%2FEMPL%2Fh%2F%3Ftab%3DTFP_CLASS_SEARCH%22%22',
#     'sisweb-prod-06-10100-PORTAL-PSJSESSIONID': '2w6V4K3-551hvbx2AhnUqXIrAkw2qMBi\\u0021622299616',
#     'PS_LOGINLIST': 'https://siscs.uit.tufts.edu/csprd https://sis.uit.tufts.edu/paprd',
#     'PS_LASTSITE': 'https://siscs.uit.tufts.edu/psc/csprd/',
#     'PS_TOKENEXPIRE': '23_Nov_2019_01:29:26_GMT',
# }

cookies = {
    'ExpirePage': 'https://sis.uit.tufts.edu/psp/paprd/',
    'PS_TOKEN': 'pwAAAAQDAgEBAAAAvAIAAAAAAAAsAAAABABTaGRyAk4Acwg4AC4AMQAwABQ2efZIDQRC1ejUPnNZzBkNWMWBKWcAAAAFAFNkYXRhW3icHYlNDkAwGERfSywt3INQf7G0UDtpotY9hOs5nOH7kjfzMjeQZ9YY5WP5r4p4Aomdi42TSLFxSMsg8/KkfWVwtHQs1GInOv3XexotThx/DrKvTczwAt+NDHc='
}

headers = {
    # 'Connection': 'keep-alive',
    # 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
    # 'Accept': '*/*',
    # 'Sec-Fetch-Site': 'same-site',
    # 'Sec-Fetch-Mode': 'no-cors',
    # 'Referer': 'https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH',
    # 'Accept-Encoding': 'gzip, deflate, br',
    # 'Accept-Language': 'en-US,en;q=0.9',
}



def main():
    term = 'Spring 2020'
    params = (
        ('term', get_term_number(term)),
        ('career', 'ALL')
    )

    s = get_session()
    
    s2 = requests.Session()
    s2.cookies.update(cookies)

    s3 = requests.Session()
    s3.cookies.set_policy(BlockAll())
    s3.cookies.update(cookies)
    
    search_url = get_search_url(term)
    
    func1 = lambda: s.get(search_url)
    func2 = lambda: requests.get('https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSearchresultsAll3', headers=headers, params=params, cookies=cookies)
    func3 = lambda: s2.get(search_url)
    func4 = lambda: s3.get(search_url)
    def func5():
        s4 = requests.Session()
        s4.cookies.update(cookies)
        a = s4.get(search_url)
        print(a.json())
        return s4.get(search_url)

    n = 20
    alpha = 0.1
    a_name = 'session method'
    b_name = 'cookie method'
    c_name = 'session+cookie method'
    d_name = 'session+cookie method set_ok=False'
    e_name = 'make session every time'
    
    # times_1, times_2 = get_timings_and_print_results(func1, func2, a_name, b_name, n, alpha, equal_var=False, print_progress=True)
    # plt.hist(times_1, bins='auto')
    # plt.title(f'{a_name} time histogram')
    # plt.figure()
    # plt.hist(times_2, bins='auto')
    # plt.title(f'{b_name} time histogram')
    # plt.show()

    # times_1, times_2 = get_timings_and_print_results(func1, func3, a_name, c_name, n, alpha, equal_var=False, print_progress=True)
    # plt.hist(times_1, bins='auto')
    # plt.title(f'{a_name} time histogram')
    # plt.figure()
    # plt.hist(times_2, bins='auto')
    # plt.title(f'{c_name} time histogram')
    # plt.show()

    # times_1, times_2 = get_timings_and_print_results(func1, func4, a_name, d_name, n, alpha, equal_var=False, print_progress=True)
    # plt.hist(times_1, bins='auto')
    # plt.title(f'{a_name} time histogram')
    # plt.figure()
    # plt.hist(times_2, bins='auto')
    # plt.title(f'{d_name} time histogram')
    # plt.show()

    # times_1, times_2 = get_timings_and_print_results(func3, func5, c_name, e_name, n, alpha, equal_var=False, print_progress=True)
    # plt.hist(times_1, bins='auto')
    # plt.title(f'{c_name} time histogram')
    # plt.figure()
    # plt.hist(times_2, bins='auto')
    # plt.title(f'{e_name} time histogram')
    # plt.show()

    # print(s3.cookies)
    # t = time.time()
    # r = s3.get(search_url)
    # print(time.time() - t)
    # print(s3.cookies)

def main2():
    term = 'Spring 2020'
    params = (
        ('term', get_term_number(term)),
        ('career', 'ALL')
    )
    search_url = get_search_url(term)

    # t = time.time()
    # s = requests.Session()
    # s.get('https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH#class_search')
    # print(time.time() - t)

    # t = time.time()
    # s2 = requests.Session()
    # s2.get('https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?cmd=getCachedPglt&pageletname=TFP_CLASS_SEARCH_2&tab=TFP_CLASS_SEARCH&PORTALPARAM_COMPWIDTH=Narrow&bNoGlobal=Y')
    # print(time.time() - t)


    # t = time.time()
    # s = requests.Session()
    # s.head('https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH#class_search')
    # print(time.time() - t)

    # t = time.time()
    # s2 = requests.Session()
    # s2.head('https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?cmd=getCachedPglt&pageletname=TFP_CLASS_SEARCH_2&tab=TFP_CLASS_SEARCH&PORTALPARAM_COMPWIDTH=Narrow&bNoGlobal=Y')
    # # s2.head('https://sis.uit.tufts.edu/cs/paprd/cache/TFP_CLS_SEARCH_JS_MIN_1.js?_=1574537010368')
    # # s2.head('https://sis.uit.tufts.edu/psc/paprd/EMPLOYEE/EMPL/s/WEBLIB_TFP_PG.ISCRIPT2.FieldFormula.IScript_AutoLogOuts')
    # print(time.time() - t)

    # t = time.time()
    # # r = s.get(search_url)
    # r = s.head(search_url)
    # # print(r)
    # print(time.time() - t)
    # # print(len(r.text))

    # # r2 = s2.get(search_url, stream=True)
    # # print(len(r2.text))

    # link0 = 'https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH#class_search'
    link0 = 'https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH'
    link1 = 'https://sis.uit.tufts.edu/psc/paprd/EMPLOYEE/EMPL/s/WEBLIB_TFP_PG.ISCRIPT2.FieldFormula.IScript_AutoLogOut'
    link2 = 'https://sis.uit.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?cmd=getCachedPglt&pageletname=TFP_CLASS_SEARCH_2&tab=TFP_CLASS_SEARCH&PORTALPARAM_COMPWIDTH=Narrow&bNoGlobal=Y'
    link3 = 'https://sis.uit.tufts.edu/psc/paprd/EMPLOYEE/EMPL/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_ClsSearch'
    link4 = 'https://sis.uit.tufts.edu/psc/paprd/EMPLOYEE/EMPL/s/WEBLIB_IS_AP.ISCRIPT1.FieldFormula.IScript_GetCSSURL?css=TFP_CLS_SEARCH_CSS'
    link5 = 'https://sis.uit.tufts.edu/cs/paprd/cache/TFP_CLS_SEARCH_JS_MIN_1.js'


    def get(link):
        session = requests.Session()
        with session.get(link, allow_redirects=False, stream=True) as r:
            pass


    # req = requests.Request('GET', link0)
    # r = req.prepare()
    # print(req)
    # print(r)
    # s = requests.Session()

    # s.send(r)

    # s = requests.session()
    # with s.get(url0, allow_redirects=True, stream=True) as r:
    #     print(r)
    #     for resp in r.history:
    #         print(resp.status_code, resp.url)
    #     print(r.status_code, r.url)
    #     # print(r.headers['Location'])
    #     # print(r.url)
    #     # print(r.headers)
    # r = s.get(search_url)
    # print(len(r.text))

    # r = requests.get(link0, allow_redirects=True)
    # print(r.headers)


    # res = urllib.request.urlopen(link0)
    # finalurl = res.geturl()
    # print(finalurl)

    s = requests.Session()
    t = time.time()
    s.get(link1)
    print(time.time() - t)
    result = s.get(search_url)
    print(len(result.text))


    





    # times_1, times_2 = get_timings_and_print_results(lambda: get(link1), lambda: get(link2), 'link1', 'link2', 20, 0.05, equal_var=False, print_progress=False)
    # times_1, times_2 = get_timings_and_print_results(lambda: get(link1), lambda: get(link0),
    #     'link1', 'link0', 40, 0.05, equal_var=False, print_progress=True)
    # times_1, times_2 = get_timings_and_print_results(lambda: get(link5), lambda: get(link0),
        # 'link5', 'link0', 120, 0.01, equal_var=False, print_progress=True)

    # times_1, times_2 = get_timings_and_print_results(
    #     lambda: requests.get(link0, allow_redirects=False, stream=False),
    #     lambda: requests.get(link0, allow_redirects=False, stream=True),
    #     'NO', 'YES', 40, 0.05, equal_var=False, print_progress=False
    # )
    
    
'''
link5 < link4
link5 < link2
link5 < link3
link5 < link1
link5 < link0
LINK5 DOES NOT WORK
'''

if __name__ == '__main__':
    main2()


'''
Results (n=80):
func1 vs func2

session method times (outliers removed):
[3.19121623 2.80457497 2.79871583 2.98190999 2.88532686 3.1925199
 3.07563591 3.08841133 2.88761997 3.11884475 3.17319798 2.88696098
 2.98288727 2.88003302 3.29446697 2.8999939  3.18378234 3.2951622
 2.99089599 3.09459615 2.88389921 2.78478527 3.13840795 3.19703221
 2.97945213 2.98589873 2.85389495 2.83365703 3.27406192 3.19735503
 2.88689709 2.95324421 2.7049942  2.78138089 3.10799813 2.97463918
 2.76097703 3.02442789 2.90493894 2.78460383 3.08863091 3.24597597
 3.05912781 2.676929   2.78509307 3.2512362  3.0369029  2.81655192
 2.90813804 3.48387313 2.8824091  2.9792037  2.99316311 3.23927903
 3.14556098 2.9928     2.81310701 2.84445906 3.12348509 3.3317101
 3.00013208 2.91761208 2.91406417 3.22628903 3.06666183 2.99291372
 2.91361904 2.80934405 3.16191173 2.83359909 3.06523919 2.91172409
 2.787359   2.88819814 3.22655511 2.90463901 2.97431183 2.81845689]
session method times outliers:
[4.22671509 4.30931711]
cookie method times (outliers removed):
[3.14498043 2.74686599 2.9036839  2.84472084 3.0732131  3.09687901
 2.94510198 3.19359899 2.69344902 3.14659572 3.34858584 2.98369884
 3.09725499 2.89701891 2.78782797 3.24818826 2.998106   3.18399525
 3.09610581 2.90017319 2.99525213 3.51590514 3.08032274 3.22475529
 2.95912695 3.07340527 2.78550291 2.78765798 3.53564906 3.01471806
 2.89697695 3.24013329 3.0796051  2.97628284 2.98495889 2.88475275
 2.99793696 3.00049496 2.99640012 2.9636817  3.29957223 2.98899579
 2.8843019  3.25228691 3.66600966 3.38453412 3.14346004 3.21192217
 3.11363292 3.13727069 3.17432404 3.09607172 2.99770427 2.87159801
 3.09000897 2.97514176 3.01642704 3.23515701 3.28109503 2.89797592
 3.29684806 3.16395497 2.84905195 3.22466493 3.03420687 2.81756735
 3.27796197 3.06329703 2.85688519 3.29521394 3.29715896 3.193784
 2.88626981 3.4033947  3.19560027 3.2707243  3.11705804 3.06188178
 2.88513708]
cookie method times outliers:
[4.63766193]
session method time: mean=2.998, std=0.170
 cookie method time: mean=3.079, std=0.190
statistic: -2.817416176750709, pvalue: 0.005472036857287945
Null hypothesis rejected because p < 0.1: session method time mean < cookie method time mean
'''

