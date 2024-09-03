# backend/utils/csv_parser.py

import csv
import io
from typing import List, Dict

def parse_csv(csv_content: str) -> List[Dict[str, str]]:
    """
    Parse CSV content and return a list of dictionaries.
    Each dictionary represents a row in the CSV, with column names as keys.
    """
    csv_file = io.StringIO(csv_content)
    csv_reader = csv.DictReader(csv_file)
    return [row for row in csv_reader]

def process_csv(csv_content: str) -> List[Dict[str, str]]:
    """
    Process the CSV content: parse and return the processed data.
    """
    return parse_csv(csv_content)