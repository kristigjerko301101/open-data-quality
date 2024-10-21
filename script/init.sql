CREATE SCHEMA IF NOT EXISTS opendata;

-- Table: opendata.datasets

-- DROP TABLE IF EXISTS opendata.datasets;

CREATE TABLE IF NOT EXISTS opendata.datasets
(
    id text COLLATE pg_catalog."default" NOT NULL,
    name text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    organization text COLLATE pg_catalog."default",
    frequency text COLLATE pg_catalog."default",
    metadata_created timestamp(0) without time zone,
    metadata_modified timestamp(0) without time zone,
    dataset_modified timestamp(0) without time zone,
    row_registered timestamp(0) without time zone,
    row_modified timestamp(0) without time zone,
    CONSTRAINT datasets_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS opendata.datasets
    OWNER to postgres;


-- Table: opendata.datasets_groups

-- DROP TABLE IF EXISTS opendata.datasets_groups;

CREATE TABLE IF NOT EXISTS opendata.datasets_groups
(
    dataset text COLLATE pg_catalog."default" NOT NULL,
    grp text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS opendata.datasets_groups
    OWNER to postgres;


-- Table: opendata.datasets_tags

-- DROP TABLE IF EXISTS opendata.datasets_tags;

CREATE TABLE IF NOT EXISTS opendata.datasets_tags
(
    dataset text COLLATE pg_catalog."default" NOT NULL,
    tag text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS opendata.datasets_tags
    OWNER to postgres;


-- Table: opendata.log_csv

-- DROP TABLE IF EXISTS opendata.log_csv;

CREATE TABLE IF NOT EXISTS opendata.log_csv
(
    id text COLLATE pg_catalog."default",
    msg text COLLATE pg_catalog."default",
    encoding text COLLATE pg_catalog."default",
    delimiter text COLLATE pg_catalog."default",
    nr integer,
    nc integer,
    nl integer,
    tscreation timestamp without time zone,
    execid text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS opendata.log_csv
    OWNER to postgres;



-- Table: opendata.log_exec

-- DROP TABLE IF EXISTS opendata.log_exec;

CREATE TABLE IF NOT EXISTS opendata.log_exec
(
    id text COLLATE pg_catalog."default",
    type text COLLATE pg_catalog."default",
    msg text COLLATE pg_catalog."default",
    tscreation timestamp without time zone
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS opendata.log_exec
    OWNER to postgres;


-- Table: opendata.log_quality

-- DROP TABLE IF EXISTS opendata.log_quality;

CREATE TABLE IF NOT EXISTS opendata.log_quality
(
    id text COLLATE pg_catalog."default",
    msg text COLLATE pg_catalog."default",
    tscreation timestamp without time zone,
    execid text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS opendata.log_quality
    OWNER to postgres;


-- Table: opendata.quality

-- DROP TABLE IF EXISTS opendata.quality;

CREATE TABLE IF NOT EXISTS opendata.quality
(
    id text COLLATE pg_catalog."default",
    acci3 numeric,
    acci4 numeric,
    avad1 numeric,
    comi1 numeric,
    comi5 numeric,
    coni2 numeric,
    coni3 numeric,
    coni4 numeric,
    coni5 numeric,
    undi1 numeric,
    tscreation timestamp without time zone,
    execid text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS opendata.quality
    OWNER to postgres;


-- Table: opendata.resources

-- DROP TABLE IF EXISTS opendata.resources;

CREATE TABLE IF NOT EXISTS opendata.resources
(
    id text COLLATE pg_catalog."default" NOT NULL,
    name text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    format text COLLATE pg_catalog."default",
    dataset text COLLATE pg_catalog."default",
    url text COLLATE pg_catalog."default",
    metadata_modified timestamp(0) without time zone,
    resource_created timestamp(0) without time zone,
    resource_modified timestamp(0) without time zone,
    num_available integer,
    num_accesses integer,
    row_registered timestamp(0) without time zone,
    row_modified timestamp(0) without time zone,
    row_processed timestamp(0) without time zone,
    CONSTRAINT resources_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS opendata.resources
    OWNER to postgres;