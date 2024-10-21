import psycopg2
from p00_util import *


def db_get_datasets(cursor):
    try:
        cursor.execute("SELECT * FROM opendata.datasets;")
        rows = cursor.fetchall()
        datasets = {row[0]: row for row in rows}
        return datasets
    except psycopg2.Error as e:
        print(f"error: {e}")


def db_insert_dataset(db, cursor, dataset):
    try:
        query = """
        INSERT INTO opendata.datasets (
	        id, name, description, organization, frequency, metadata_created, 
            metadata_modified, dataset_modified, row_registered, row_modified	
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """
        cursor.execute(
            query,
            (
                dataset[0],
                dataset[1],
                dataset[2],
                dataset[3],
                dataset[4],
                dataset[5],
                dataset[6],
                dataset[7],
                dataset[8],
                dataset[9],
            ),
        )
        db.commit()
    except psycopg2.Error as e:
        print(f"error: {e}")
        db.rollback()


def db_update_dataset(db, cursor, dataset):
    try:
        query = """
        UPDATE opendata.datasets 
        SET name=%s, description=%s, organization=%s, frequency=%s,
            metadata_created=%s, metadata_modified=%s, dataset_modified=%s, row_modified=%s
        WHERE id=%s;
        """
        cursor.execute(
            query,
            (
                dataset[1],
                dataset[2],
                dataset[3],
                dataset[4],
                dataset[5],
                dataset[6],
                dataset[7],
                dataset[9],
                dataset[0],
            ),
        )
        db.commit()
    except psycopg2.Error as e:
        print(f"error: {e}")
        db.rollback()


def db_update_dataset_tags_and_groups(db, cursor, dataset):
    try:
        query = """
        DELETE FROM opendata.datasets_tags
        WHERE dataset = %s;
        DELETE FROM opendata.datasets_groups
        WHERE dataset = %s;
        """
        cursor.execute(
            query,
            (dataset[0], dataset[0]),
        )

        tags = [(dataset[0], tag) for tag in dataset[10]]
        tags_query = """
            INSERT INTO opendata.datasets_tags (dataset, tag)
            VALUES (%s, %s)
        """
        cursor.executemany(tags_query, tags)

        groups = [(dataset[0], gr) for gr in dataset[11]]
        groups_query = """
            INSERT INTO opendata.datasets_groups (dataset, grp)
            VALUES (%s, %s)
        """
        cursor.executemany(groups_query, groups)

        db.commit()
    except psycopg2.Error as e:
        print(f"error: {e}")
        db.rollback()


def db_get_resources(cursor):
    try:
        cursor.execute("SELECT * FROM opendata.resources;")
        rows = cursor.fetchall()
        resources = {row[0]: row for row in rows}
        return resources
    except psycopg2.Error as e:
        print(f"error: {e}")


def db_insert_resource(db, cursor, resource):
    try:
        query = """
        INSERT INTO opendata.resources (
	        id, name, description, format, dataset, url, metadata_modified, resource_created, 
            resource_modified, num_available, num_accesses, row_registered, row_modified, row_processed
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """
        cursor.execute(
            query,
            (
                resource[0],
                resource[1],
                resource[2],
                resource[3],
                resource[4],
                resource[5],
                resource[6],
                resource[7],
                resource[8],
                0,
                0,
                resource[9],
                resource[10],
                resource[11],
            ),
        )
        db.commit()
    except psycopg2.Error as e:
        print(f"error: {e}")
        db.rollback()


def db_update_resource(db, cursor, resource):
    try:
        query = """
        UPDATE opendata.resources
        SET name=%s, description=%s, format=%s, dataset=%s, url=%s, metadata_modified=%s, 
            resource_created=%s, resource_modified=%s, row_modified=%s	
        WHERE id=%s;
        """
        cursor.execute(
            query,
            (
                resource[1],
                resource[2],
                resource[3],
                resource[4],
                resource[5],
                resource[6],
                resource[7],
                resource[8],
                resource[10],
                resource[0],
            ),
        )
        db.commit()
    except psycopg2.Error as e:
        print(f"error: {e}")
        db.rollback()


def db_log_execution(db, cursor, execid, type, msg):
    try:
        query = """
        INSERT INTO opendata.log_exec(id, type, msg, tscreation)
	    VALUES (%s, %s, %s, now());
        """
        cursor.execute(
            query,
            (execid, type, msg),
        )
        db.commit()
    except psycopg2.Error as e:
        print(f"error: {e}")
