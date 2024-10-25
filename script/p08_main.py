import time
from datetime import time as datetime_time
from uuid import uuid4
from p00_util import *
from p03_scraping import *
from p07_quality import *

load_dotenv()  # load variables from .env file

start_time = datetime_time(int(os.getenv("SCRIPT_START_TIME")), 0)  # ex: 01:00
end_time = datetime_time(int(os.getenv("SCRIPT_END_TIME")), 0)  # ex: 23:00
scraping_duration = float(os.getenv("SCRIPT_SCRAPING_DURATION_MINUTES"))  # in minutes
quality_duration = float(os.getenv("SCRIPT_QUALITY_DURATION_MINUTES"))  # in minutes
pause_duration = float(os.getenv("SCRIPT_PAUSE_DURATION_MINUTES"))  # in minutes


def scraping_job(duration):
    print(datetime.now(), "scraping start")
    db, cursor = db_open()
    execid = str(uuid4())

    try:
        scrape(db, cursor, execid, duration)
    except Exception as e:
        db_log_execution(
            db,
            cursor,
            execid,
            "opendata scraping",
            f"error: {str(e)} ",
        )

    db_close(db, cursor)
    print(datetime.now(), "scraping finish")


def quality_job(duration):
    print(datetime.now(), "quality start")
    db, cursor = db_open()
    execid = str(uuid4())

    try:
        quality(db, cursor, execid, duration)
    except Exception as e:
        db_log_execution(
            db,
            cursor,
            execid,
            "csv quality measures",
            f"error: {str(e)} ",
        )

    db_close(db, cursor)
    print(datetime.now(), "quality finish")


current_time = datetime.now().time()
while True:
    current_time = datetime.now().time()
    if start_time <= current_time <= end_time:
        print(datetime.now(), "schedule start")
        scraping_job(scraping_duration)
        quality_job(quality_duration)
    else:
        print(datetime.now(), "schedule pause")
        time.sleep(pause_duration * 60)  # in seconds
