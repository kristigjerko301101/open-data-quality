from p04_quality_db import *
from p05_quality_csv import *
from p06_quality_measures import *
from datetime import datetime
import time
import random

DEBUG = False


def quality(db, cursor, execid, duration):

    csv_resources = db_get_csv_resources_to_process(cursor)
    random.shuffle(csv_resources)

    # log execution start
    db_log_execution(
        db,
        cursor,
        execid,
        "csv quality measures",
        f"start: total to process {len(csv_resources)}",
    )

    # init log statistics counters
    n_error, n_ok, n_type_error = 0, 0, 0

    try:
        start_time = time.time()
        for i, csv in enumerate(csv_resources):
            if time.time() - start_time > duration*60:
                print("quality - time up")
                break

            # follow progress in debug mode
            if DEBUG and (i == 0 or (i + 1) % 10 == 0):
                print(i + 1, datetime.now(), n_error, n_type_error)

            id, url, num_available, num_accesses = csv[0], csv[5], csv[9], csv[10]

            msg, avail = "", 0
            try:  # try getting the dataframe from the csv
                msg, avail, df, enc, dlm, nr, nc, nl = open_csv(url)
                log = (msg, enc, dlm, nr, nc, nl)
            except Exception as e:
                msg = msg + "$" + str(e)
                log = (msg, "", "", -1, -1, -1)

            # update the log with the csv processing result
            db_log_csv_resources(db, cursor, id, log, execid)

            # update dataset availability
            num_available += avail
            num_accesses += 1
            db_update_resource_avail(db, cursor, id, num_available, num_accesses)

            if "Content-Type" in msg:
                n_type_error += 1
            elif msg != "OK":
                n_error += 1
            elif msg == "OK" and nr > 0:
                try:
                    AccI3, AccI4, ConI2, ConI3, ConI4, ConI5, UndI1 = (
                        accuracy_consistency_understandability(df, nr, nc, nl)
                    )
                    AvaD1, ComI1, ComI5 = availability_completeness(
                        df, nr, nc, num_available, num_accesses
                    )

                    db_update_quality_results(
                        db,
                        cursor,
                        id,
                        AccI3,
                        AccI4,
                        AvaD1,
                        ComI1,
                        ComI5,
                        ConI2,
                        ConI3,
                        ConI4,
                        ConI5,
                        UndI1,
                        execid,
                    )  # for ok cases
                    n_ok += 1
                except Exception as e:
                    n_error += 1
                    db_log_quality(db, cursor, id, str(e), execid)  # for error cases
    except Exception as e:
        db_log_execution(
            db,
            cursor,
            execid,
            "csv quality measures",
            f"error: {str(e)} ",
        )
    finally:
        db_log_execution(
            db,
            cursor,
            execid,
            "csv quality measures",
            f"finish: total processed: ok={n_ok} error={n_error} notype={n_type_error}",
        )
