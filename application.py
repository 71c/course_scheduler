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
    get_and_save_data('Spring 2020')
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
    emit('results', search_results_json)


if __name__ == '__main__':
    socketio.run(app)
