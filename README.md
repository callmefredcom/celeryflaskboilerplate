# Why use Celery?

If you don't use Celery or another method to process tasks asynchronously, you may have faced this type of issue when running a time consuming function in your Pythons script:

```
[2024-02-08 18:58:05 +0000] [16] [CRITICAL] WORKER TIMEOUT (pid:17)
[2024-02-08 19:58:05 +0100] [17] [INFO] Worker exiting (pid: 17)
[2024-02-08 18:58:06 +0000] [16] [ERROR] Worker (pid:17) exited with code 1
[2024-02-08 18:58:06 +0000] [16] [ERROR] Worker (pid:17) exited with code 1.
```

Because, at some point, your main script times out.

That's why you should use Celery,<br> 
as explained by Perplexity.ai

*Celery is a tool used in Python scripts to handle tasks asynchronously, meaning it allows certain parts of a program to run independently in the background without slowing down the main program. This is particularly useful for tasks that take time to complete, like processing large files or handling complex operations. With Celery, these tasks can be offloaded to run separately, ensuring that the main program remains responsive and efficient. Additionally, Celery can schedule tasks to run at specific times or intervals, manage retries for failed tasks, and provide monitoring capabilities. In simple words, Celery helps in improving the performance and responsiveness of Python applications by managing time-consuming tasks effectively in the background.*

# Tips fo local development

## Celery Worker Start Command: 

### On Windows, you should start the Celery worker this way (--pool=solo):
  

 
> celery -A celery_config worker --loglevel=info --pool=solo


Otherwise, you'll get this type of error: 

```
{"status": "FAILURE", "result": {"exc_type": "ValueError", "exc_message": ["not enough values to unpack (expected 3, got 0)"], "exc_module": "builtins"}, "traceback": null, "children": [], "date_done": "2024-03-14T09:26:54.852741", "task_id": "d1b6d633-f579-47e4-a7c9-75e42c43e7f6"}
```

And if you encounter FAILURE errors like this one, even if your task(s) appear as registered,

```
{"status": "FAILURE", "result": {"exc_type": "NotRegistered", "exc_message": ["tasks.apiworld"], "exc_module": "celery.exceptions"}, "traceback": null, "children": [], "date_done": "2024-03-20T09:12:42.728502", "task_id": "361fb771-cd7c-48f8-abe3-82b951571485"}
```

Try:

> celery -A celery_config worker --loglevel=info --pool=solo --queues=cloud_queue

It will explicitely declare the queue for the tasks.<br>
(don't forget the --pool=solo part if you're on Windows)

You should first adapt the content of your config file (celery_config) to this explicit queue routing.

```
from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

celery_app = Celery('main', broker=os.environ.get("REDIS_URL"), backend=os.environ.get("REDIS_URL"))
celery_app.autodiscover_tasks(['tasks'])  # Adjust with the actual name of your tasks module if necessary

# Task routing
celery_app.conf.task_routes = {
    'tasks.apiworld': {'queue': 'cloud_queue'},  # Route 'tasks.apiworld' tasks to 'cloud_queue'
}

celery_app.conf.update(
    result_expires=60,  # 1 minute
)


import tasks  # Import tasks module to register tasks

# Check Redis connection
with celery_app.connection() as connection:
    connection.ensure_connection()
    print("Connected to Redis successfully")


```

### On Mac, you can start it this way: 

> celery -A celery_config worker --loglevel=info

## Check if the task is registered

> celery -A celery_config inspect registered

You'll get something like this if it works properly: 

```
->  celery@CMF_PC: 
OK * tasks.apiworldd
```

# Deployment to Railway

## When deploying to Railway, use this code for railway.json, it includes the start command for the web app & the Redis worker

copy-paste it in a file named railway.json

```
{
    "$schema": "https://schema.up.railway.app/railway.schema.json",
    "build": {
      "nixpacksPlan": {
        "phases": {
          "setup": {
            "nixPkgs": ["...", "parallel"]
          }
        }
      }
    },
    "deploy": {
      "startCommand": "parallel --ungroup --halt now,fail=1 ::: 'celery -A celery_config worker --loglevel=info --concurrency=1' 'gunicorn main:app'"
    }
  }
```


