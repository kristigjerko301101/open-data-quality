import urllib.request
import json
from datetime import datetime
from p00_util import *


def api_get_catalog():
    url = "https://dati.gov.it/opendata/api/3/action/package_list"
    catalog = []
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                if data["success"]:
                    catalog = data["result"]
                else:
                    raise Exception(f'data["succes"]=false @ catalog')
            else:
                raise Exception(f"status={response.status_code} @ catalog")
    except Exception as e:
        print(f"error: {e}")

    return catalog


def api_get_dataset(id):
    url = f"https://dati.gov.it/opendata/api/3/action/package_show?id={id}"
    dataset = ()
    resources = {}
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                if data["success"]:
                    ds = data["result"]
                    dataset = (
                        id,  # "id":
                        ds.get("title") or "",  # "name":
                        ds.get("notes") or "",  # "description":
                        (ds.get("organization") or {}).get("title") or "",  # "org":
                        ds.get("frequency") or "",  # "frequency":
                        convert_datetime(
                            ds.get("metadata_created") or "1900-01-01"
                        ),  # "metadata_created":
                        convert_datetime(
                            ds.get("metadata_modified") or "1900-01-01"
                        ),  # "metadata_modified":
                        convert_datetime(
                            ds.get("modified") or "1900-01-01"
                        ),  # "dataset_modified":
                        datetime.now(),  # "row_registered":
                        datetime.now(),  # "row_modified":
                        (
                            (t.get("name") or "") for t in (ds.get("tags") or [])
                        ),  # "tags":
                        (
                            (t.get("description") or "")
                            for t in (ds.get("groups") or [])
                        ),  # "groups":
                    )
                    rs = ds.get("resources") or []
                    for r in rs:
                        res_id = r.get("id") or None
                        if res_id != None:
                            resources[res_id] = (
                                res_id,  # "id":
                                r.get("name") or "",  # "name":
                                r.get("description") or "",  # "description":
                                r.get("format") or "",  # "format":
                                id,  # "dataset":
                                r.get("url") or "",  # "url":
                                convert_datetime(
                                    r.get("metadata_modified") or "1900-01-01"
                                ),  # "metadata_modified":
                                convert_datetime(
                                    r.get("created") or "1900-01-01"
                                ),  # "resource_created":
                                convert_datetime(
                                    r.get("last_modified") or "1900-01-01"
                                ),  # "resource_modified":
                                datetime.now(),  # "row_registered":
                                datetime.now(),  # "row_modified":
                                "1900-01-01",  # "row_processed":
                            )
                else:
                    raise Exception(f'data["succes"]=false @ id={id}')
            else:
                raise Exception(f"status={response.status_code} @ id={id}")
    except Exception as e:
        print(f"error: {e}")

    return dataset, resources
