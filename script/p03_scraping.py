from p00_util import *
from p01_scraping_api import *
from p02_scraping_db import *
import time
import random

DEBUG = True


def scrape(db, cursor, execid, duration):

    api_datasets = api_get_catalog()  # read the list of datasets from api
    random.shuffle(api_datasets)
    db_datasets = db_get_datasets(cursor)  # read the datasets in the db
    db_resources = db_get_resources(cursor)  # read the resources in the db

    # log execution start
    db_log_execution(
        db,
        cursor,
        execid,
        "opendata scraping",
        f"start: totals api_ds:{len(api_datasets)} db_ds:{len(db_datasets)} db_rs:{len(db_resources)}",
    )

    # init log statistics counters
    action_set = ["none", "insert", "update", "equal"]
    ds_action = {obj: 0 for obj in action_set}
    rs_action = {obj: 0 for obj in action_set}

    try:
        start_time = time.time()
        for i, id in enumerate(
            api_datasets
        ):  # for every dataset in the list from the api

            if time.time() - start_time > duration * 60:
                print(datetime.now(), "scraping timeup")
                break

            # follow progress in debug mode
            if DEBUG and (i == 0 or (i + 1) % 10 == 0):
                print(datetime.now(), i + 1)

            # get the dataset and its resources from the api
            api_dataset, api_resources = api_get_dataset(id)
            # get the dataset from the database
            db_dataset = db_datasets.get(id)

            if len(api_dataset) == 12:  # if valid dataset tuple
                action = update_datasets(db, cursor, api_dataset, db_dataset)
                ds_action[action] += 1

            for key, value in api_resources.items():  # for every resource from the api
                # get the resource from the database
                db_resource = db_resources.get(key)
                if len(value) == 12:  # if valid dataset tuple
                    update_resources(db, cursor, value, db_resource)
                    rs_action[action] += 1
    except Exception as e:
        db_log_execution(
            db,
            cursor,
            execid,
            "opendata scraping",
            f"error: {str(e)} ",
        )
    finally:
        db_log_execution(
            db,
            cursor,
            execid,
            "opendata scraping",
            f"finish: datasets:{ds_action} resources:{rs_action} ",
        )


def update_datasets(db, cursor, api_dataset, db_dataset):
    action = "none"
    if db_dataset == None:
        # if not exist in db then insert
        db_insert_dataset(db, cursor, api_dataset)
        db_update_dataset_tags_and_groups(db, cursor, api_dataset)
        action = "insert"
    elif api_dataset[6] > db_dataset[6] or api_dataset[7] > db_dataset[7]:
        # if it exists in db then update only if metadata_modified or
        # dataset_modified are more recent then the value registered in db
        db_update_dataset(db, cursor, api_dataset)
        db_update_dataset_tags_and_groups(db, cursor, api_dataset)
        action = "update"
    else:
        action = "equal"
    return action


def update_resources(db, cursor, api_resource, db_resource):
    action = "none"
    if db_resource == None:
        # if not exist in db then insert
        db_insert_resource(db, cursor, api_resource)
        action = "insert"
    elif api_resource[6] > db_resource[6] or api_resource[8] > db_resource[8]:
        # if it exists in db then update only if metadata_modified or
        # resource_modified are more recent then the value registered in db
        db_update_resource(db, cursor, api_resource)
        action = "update"
    else:
        action = "equal"
    return action
