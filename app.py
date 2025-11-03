# app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='client/build', static_url_path='/')
CORS(app)

# ----- API ROUTES (Task 1) -----
# We read query params from the URL and echo them back to the frontend.

@app.route('/api/checkin')
def checkIn_hardware():
    project_id = request.args.get('projectId', '')
    qty = request.args.get('qty', '')
    # In the team project, you'd validate & update DB here.
    return jsonify({
        'projectId': project_id,
        'qty': qty,
        'message': f'{qty} hardware checked in'
    })

@app.route('/api/checkout')
def checkOut_hardware():
    project_id = request.args.get('projectId', '')
    qty = request.args.get('qty', '')
    return jsonify({
        'projectId': project_id,
        'qty': qty,
        'message': f'{qty} hardware checked out'
    })

@app.route('/api/join')
def joinProject():
    project_id = request.args.get('projectId', '')
    return jsonify({
        'projectId': project_id,
        'message': f'Joined {project_id}'
    })

@app.route('/api/leave')
def leaveProject():
    project_id = request.args.get('projectId', '')
    return jsonify({
        'projectId': project_id,
        'message': f'Left {project_id}'
    })

# ----- STATIC FILES (serve React build on Heroku) -----
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Let client-side routing work:
@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Local dev run: python app.py
    app.run(host='0.0.0.0', port=5000, debug=True)
