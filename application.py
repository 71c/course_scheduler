# run python3 application.py NOT flask run
# export FLASK_ENV=development
# export FLASK_ENV=production

import os
from flask import Flask, escape, request, render_template
from flask_socketio import SocketIO, emit
from models import *
from flask import current_app as app
from get_data_2 import *
from api_2 import get_classes_by_course_num

# get data on startup
with app.app_context():
    socketio = SocketIO(app)
    print("getting data...")
    get_and_save_data('Spring 2020')
    print("got data")

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
    x = get_classes_by_course_num(data['term'])
    print(x)
    print(x[0].sections)

if __name__ == '__main__':
    socketio.run(app)
