import psycopg2


def db_get_csv_resources_to_process(cursor):
    try:
        cursor.execute(
            """SELECT * FROM opendata.resources 
               WHERE format='CSV' AND (metadata_modified > row_processed OR resource_modified > row_processed);"""
        )
        rows = cursor.fetchall()
        return rows
    except psycopg2.Error as e:
        print(f"error: {e}")
        return []


def db_update_resource_avail(db, cursor, id_res, num_available, num_accesses):
    try:
        query = """
        UPDATE opendata.resources
        SET num_available = %s, num_accesses = %s
        WHERE id=%s;
        """
        cursor.execute(
            query,
            (num_available, num_accesses, id_res),
        )
        db.commit()
    except psycopg2.Error as e:
        print(f"error: {e}")


def db_log_csv_resources(db, cursor, id, log, execid):
    try:
        query = """
        INSERT INTO opendata.log_csv(id, msg, encoding, delimiter, nr, nc, nl, tscreation, execid)
	    VALUES (%s, %s, %s, %s, %s, %s, %s, now(), %s);
        """
        cursor.execute(
            query,
            (id, log[0], log[1], log[2], log[3], log[4], log[5], execid),
        )
        db.commit()
    except psycopg2.Error as e:
        print(f"error: {e}")


def db_log_quality(db, cursor, id, msg, execid):
    try:
        query = """
        INSERT INTO opendata.log_quality(id, msg, tscreation, execid)
	    VALUES (%s, %s, now(), %s);
        """
        cursor.execute(
            query,
            (id, msg, execid),
        )
        db.commit()
    except psycopg2.Error as e:
        print(f"error: {e}")


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


def db_update_quality_results(
    db,
    cursor,
    id,
    AccI3,
    AccI4,
    Avad2,
    ComI1,
    ComI5,
    ConI2,
    ConI3,
    ConI4,
    ConI5,
    UndI1,
    execid,
):
    try:
        query = """
        DELETE FROM opendata.quality
        WHERE id = %s;

        INSERT INTO opendata.quality(id, AccI3, AccI4, Avad2, ComI1, ComI5, ConI2, ConI3, ConI4, ConI5, UndI1, tscreation, execid)
	    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now(), %s);

        UPDATE opendata.resources
        SET row_processed = now()
        WHERE id = %s;
        """
        cursor.execute(
            query,
            (
                id,
                id,
                AccI3,
                AccI4,
                Avad2,
                ComI1,
                ComI5,
                ConI2,
                ConI3,
                ConI4,
                ConI5,
                UndI1,
                execid,
                id,
            ),
        )
        db.commit()
    except psycopg2.Error as e:
        print(f"error: {e}")


def db_get_json_resources(cursor):
    try:
        cursor.execute("SELECT * FROM opendata.resources WHERE format='JSON';")
        rows = cursor.fetchall()
        return rows
    except psycopg2.Error as e:
        print(f"error: {e}")
        return []
