from flask import Flask, escape, request
from get_data import get_and_save_data

app = Flask(__name__)

@app.route('/')
def hello():
    name = request.args.get("name", "World")
    return f'Hello, {escape(name)}!'
