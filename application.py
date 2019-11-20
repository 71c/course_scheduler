import requests
from flask import Flask, escape, request, render_template
from flask_socketio import SocketIO, emit
from get_data import get_and_save_data

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

# @app.route('/update_data', methods=['POST'])
# def update_data():
#     print('OK')
#     get_and_save_data('Spring 2020')


@socketio.on("update data")
def update_data():
    emit('my response')
    print('OK')
    get_and_save_data('Spring 2020')


if __name__ == '__main__':
    # app.debug = True
    # app.run()

    socketio.run(app)
