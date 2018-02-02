from flask import Flask, send_from_directory, request, redirect, url_for, g
from flask import jsonify, render_template, abort
import os, json

app = Flask(__name__)
BASE_URL = os.path.abspath(os.path.dirname(__file__))
CLIENT_APP_FOLDER = os.path.join(BASE_URL, "dist")

@app.route('/', defaults={'path': ''}) #Catch All urls, enabling copy-paste url
def home(path):
	print('here: %s' % path)
	return send_from_directory(CLIENT_APP_FOLDER, 'index.html')

@app.route('/<path:filename>')
def client_app_app_folder(filename):
	return send_from_directory(os.path.join(CLIENT_APP_FOLDER, "app"), filename)

if __name__ == "__main__":
	app.run(threaded=True, debug=True)
