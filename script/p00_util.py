import os
import psycopg2
from dotenv import load_dotenv
from dateutil import parser

load_dotenv()  # load variables from .env file


db_params = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
}


def db_open():
    try:
        db = psycopg2.connect(**db_params)
        cursor = db.cursor()

        cursor.execute("SELECT version();")
        db_version = cursor.fetchone()
        # print(f"PostgreSQL version: {db_version}")

        return db, cursor
    except psycopg2.Error as e:
        print(f"error: {e}")


def db_close(db, cursor):
    try:
        cursor.close()
        db.close()
    except psycopg2.Error as e:
        print(f"error: {e}")


def convert_datetime(datetime_str):
    try:
        datetime_obj = (
            parser.parse(datetime_str).replace(microsecond=0).replace(tzinfo=None)
        )
    except:
        datetime_obj = None
    return datetime_obj
