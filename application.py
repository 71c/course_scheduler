# run python3 application.py NOT flask run
# export FLASK_ENV=development
# export FLASK_ENV=production
# export DATABASE_URL=sqlite:////tmp/test.db

import os
from flask import Flask, escape, request, render_template
from flask_socketio import SocketIO, emit
from models import *
from flask import current_app as app
from get_data_2 import *
from api_2 import *
import cProfile

# get data on startup
with app.app_context():
    socketio = SocketIO(app)
    # print("getting data...")
    # get_and_save_data('Spring 2020')
    # print("got data")

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on("update data")
def update_data():
    t = time.time()
    get_and_save_data('Spring 2020')
    print(time.time() - t)
    emit('updated data')

@socketio.on("search")
def search(data):

    print('serch term:', data['term'])
    search_results = get_search_results(data['term'])
    search_results_json = [{
        'course_num': x.course_num,
        'title': x.title,
        'desc_long': x.desc_long,
        'id': x.id
    } for x in search_results]

    # names = ['MATH-0166', 'PHIL-0192', 'MATH-0070']
    # t = time.time()
    # courses = [get_search_results(x)[0] for x in names]
    # print(time.time() - t)
    # t = time.time()
    # pg = PeriodGroup([course_object_to_period_group(x, accepted_statuses=('O','W','C')) for x in courses], 'and')
    # print(time.time() - t)
    # t = time.time()
    # schedules = pg.evaluate()
    # print(time.time() - t)
    # print(schedules)

    # cProfile.run("[get_search_results(x)[0] for x in ['MATH-0166', 'PHIL-0192', 'MATH-0070']]", sort='cumulative')

    



    emit('results', search_results_json)


if __name__ == '__main__':
    socketio.run(app)
