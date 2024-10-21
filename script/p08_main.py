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
    print(" scraping job  start:", datetime.now())
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
    print(" scraping job finish:", datetime.now())


def quality_job(duration):
    print("  quality job  start:", datetime.now())
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
    print("  quality job finish:", datetime.now())


current_time = datetime.now().time()
while True:
    current_time = datetime.now().time()
    if start_time <= current_time <= end_time:
        print(" starting job schedl:", datetime.now())
        scraping_job(scraping_duration)
        quality_job(quality_duration)
    else:
        print("  pausing job schedl:", datetime.now())
        time.sleep(pause_duration * 60)  # in seconds
