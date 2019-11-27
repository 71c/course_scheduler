# run python3 application.py NOT flask run
# export FLASK_ENV=development
# export FLASK_ENV=production

from flask import Flask, escape, request, render_template
from flask_socketio import SocketIO, emit
from get_data import get_and_save_data
from api import get_classes_by_course_num

app = Flask(__name__)
socketio = SocketIO(app)

# get data on startup
get_and_save_data('Spring 2020')

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
    print(get_classes_by_course_num(data['term']))

if __name__ == '__main__':
    socketio.run(app)
