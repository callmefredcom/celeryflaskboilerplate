import logging
from celery.utils.log import get_task_logger
from celery_config import celery_app
import time

# for debugging purposes

logger = get_task_logger(__name__)
logger.setLevel(logging.INFO)  # Set logging level to INFO
handler = logging.FileHandler('my_log.log')
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


# the task itself

@celery_app.task(name='tasks.apiworld')
def apiworld():
    logger.info('Demo task started!')
    time.sleep(10)  # Simulate a task that takes 10 seconds to complete
    logger.info('Demo task completed!')
    return 'Demo task completed!'