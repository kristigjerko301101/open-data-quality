# open-data-quality

This project is a massive analysis of the quality of Italian open data, leveraging data from [dati.gov.it](https://www.dati.gov.it/). It includes several components for discovering, normalizing, assessing quality, and visualizing data.

## ARCHITECTURE

```mermaid
graph LR;
    datasource  --> script;
    script      --> database;
    database    --> backend;
    backend     --> frontend;
```

### datasource
   - dati.gov.it API
   - it is the national catalog of metadata related to open data released by the public administration
   - it serves as a search tool and the access point to data made available according to the open data paradigm

### script
- python scripts used to discover, process, and evaluate the quality of the data
- **scraping:** it is used in the discovery phase to extract metadata of datasets and resources from the API
- **normalizing:** it transforms the discovered resources from their original format into dataframes
- **quality:** it calculates the data quality measures as described by the ISO 25012 and ISO 25024 standards

### database
- postgres database used to store the discovered metadata, the output of the data quality and the logs of all the processes

### backend
   - node.js server component exposing APIs to query the data and metadata
  
### frontend
   - react client interface displaying data, metadata, and data quality results in tabular and graphical formats


## SETUP

To run the services for the first time and ensure the images are built correctly execute in the root folder of the project the cmd:

    docker-compose up -d --build

To run the services successively execute in the root folder of the project the cmd:
    
    docker-compose up -d

The start, duration and end times for the execution of the scripts are configurable in the **docker-compose.yml** file.

Suggested (and current default) configuration for the first run in order to have some data to navigate the frontend within 2 minutes:

    SCRIPT_SCRAPING_DURATION_MINUTES: 1
    SCRIPT_QUALITY_DURATION_MINUTES: 30

Suggested configuration for future deployment:

    SCRIPT_SCRAPING_DURATION_MINUTES: 300
    SCRIPT_QUALITY_DURATION_MINUTES: 900