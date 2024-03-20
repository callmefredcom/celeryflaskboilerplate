from flask import Flask, json, jsonify, render_template
from tasks import apiworld

app = Flask(__name__)

from celery_config import celery_app
celery_app.autodiscover_tasks(['tasks'], force=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/apiworld')
def apiworld_route():
    task = apiworld.delay()
    print('Task Launched!')
    return jsonify({"success": True, "task_id": task.id})

@app.route('/check_task/<task_id>', methods=['GET'])
def check_task(task_id):
    task = celery_app.AsyncResult(task_id)
    print(f"Task {task_id} is currently in state: {task.state}")  # Print the task state
    if task.state == 'SUCCESS':
        # Assuming the task returns filename upon success
        response = jsonify({"status": "SUCCESS", "filename": task.result})
        return response
    elif task.state == 'PENDING':
        return jsonify({"status": "PENDING"})
    else:
        return jsonify({"status": task.state})
    
    
if __name__ == '__main__':
    app.run(debug=True)