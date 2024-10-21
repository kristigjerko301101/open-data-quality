import pandas as pd
import urllib.request
import io
import csv
import chardet


def open_csv(url):
    try:
        response = urllib.request.urlopen(url, timeout=5)
        content = response.read()  # read response content

        content_type = response.getheader("Content-Type")
        content_type = "No-Content-Type" if content_type is None else content_type

        content_length = response.info().get("Content-Length")
        content_length = len(content) if content_length is None else int(content_length)

        if (
            "csv" in content_type or "plain" in content_type
        ) and content_length < 1 * 1024 * 1024:
            encoding = chardet.detect(content)["encoding"]  # detect encoding
            encoding = "latin-1" if encoding is None else encoding  # default encoding
            csv_content = content.decode(encoding, errors="replace")
            # characters that can't be decoded are replaced with "�"
            msg, avail = "OK", 1
        else:
            raise ValueError(
                f"Content-Type={content_type} Content-Length={content_length}"
            )
    except Exception as e:
        msg, avail = str(e), 0
        return msg, avail, None, None, None, -1, -1, -1
        # return msg, avail, df, enc, sep, nr, nc, nl

    # extract lines from csv
    lines = csv_content.splitlines()
    nl = len(lines)

    # use lines first 20 line as sample for delimiter
    # start from second line to get only data lines if header is present
    sample_csv_content = "\n".join(lines[1:21])

    if nl == 0 or len(sample_csv_content.strip()) == 0:
        return "empty file", avail, None, None, None, -1, -1, nl

    # use csv.Sniffer to detect the delimiter
    sniffer = csv.Sniffer()
    dialect = sniffer.sniff(sample_csv_content)
    delimiter = dialect.delimiter

    # clean lines from trailing delimiter and remove lines that dont contain the delimiter
    # because sometimes the csv header is not the first line of the file
    cleaned_lines = [
        line.rstrip(delimiter) for line in lines if line.strip() and delimiter in line
    ]
    nl = len(cleaned_lines)  # the lines that effectively represent the data
    cleaned_csv_content = "\n".join(cleaned_lines)

    try:
        # try to read the file with header
        df = pd.read_csv(
            io.StringIO(cleaned_csv_content),
            delimiter=dialect.delimiter,
            quotechar=dialect.quotechar,
            # doublequote=dialect.doublequote,
            # doublequote = True (default) is safer assumption, the sniffer uses a sample to calculate it which leads to false-negatives
            escapechar=dialect.escapechar,
            skipinitialspace=dialect.skipinitialspace,
            header=0,
            on_bad_lines="skip",
        )
        nl -= 1  # if the reading with header succeeds, decrement the data lines by 1, the header line
        # check if header is valid (all columns are unique and not NaN)
        if not df.columns.is_unique or df.columns.hasnans:
            raise ValueError("invalid header detected")
    except ValueError:
        # if header not valid, read without header
        df = pd.read_csv(
            io.StringIO(cleaned_csv_content),
            delimiter=dialect.delimiter,
            quotechar=dialect.quotechar,
            # doublequote=dialect.doublequote,
            # # doublequote = True (default) is safer assumption, the sniffer uses a sample to calculate it which leads to false-negatives
            escapechar=dialect.escapechar,
            skipinitialspace=dialect.skipinitialspace,
            header=None,
            on_bad_lines="skip",
        )

    return msg, avail, df, encoding, delimiter, df.shape[0], df.shape[1], nl
