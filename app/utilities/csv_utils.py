import csv
import os
import re

class CsvUtils:
    """
    Class for CSV Utilities.
    Manages reading and writing to a specific CSV file
    with a defined schema.
    """

    def __init__(self, file_path: str, data_schema: list):
        """
        Initializes the utility for a specific file path and data schema.

        Args:
            file_path (str): The absolute path to the CSV file.
            data_schema (list): A list of strings for the header/schema.
        """
        # 1. Validate the path format *before* assigning it
        # 2. Assign instance variables
        self.file_path = file_path
        self.data_schema = data_schema
        self.schema_length = len(data_schema)
        self.__validate_path_format__(file_path)

        print(f"CSV_Utils initialized for: {self.file_path}")

    @staticmethod
    def __validate_path_format__(file_path: str):
        """
        Checks if the file path format is valid and allowed.
        This does NOT check if the file exists, allowing for new file creation.
        """
        # Check 1: Allow to read/write in /data folder and its sub-folders
        # Note: This regex is very specific to a root /data directory
        if not re.search(r"/data(/|$)", file_path):
            raise Exception(f"File path {file_path} is not in the allowed /data directory")

        # Check 2: Ensure it's a .csv file
        if not file_path.lower().endswith(".csv"):
            raise Exception(f"File type {file_path} is not allowed. Must be .csv")

        return True

    def write_to_csv(self, data: list[list]):
        """
        Writes data to the CSV file specified in self.file_path.
        This will OVERWRITE the file.

        Args:
            data (list[list]): A list of rows to write. Each row is a list.
        """
        print(f"--- Writing to {self.file_path} (no header) ---")
        try:
            with open(self.file_path, mode='w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)

                # Write all the data rows
                writer.writerows(data)

            print(f"Successfully wrote {len(data)} rows to {self.file_path}")
            self.__print_file_content__()

        except IOError as e:
            print(f"Error writing to file {self.file_path}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during write: {e}")

    def read_from_csv(self) -> list[dict]:
        """
        Reads data from the CSV file specified in self.file_path.

        Assumes the file has NO header row.

        Returns:
            list[dict]: A list of dictionaries, where each dictionary
                        represents a row mapped by self.data_schema.

        Raises:
            FileNotFoundError: If self.file_path does not exist.
            Exception: If a row's column count doesn't match the schema.
        """
        print(f"\n--- Reading from {self.file_path} (no header) ---")

        if not os.path.isfile(self.file_path):
            raise FileNotFoundError(f"File path {self.file_path} not found")

        data_list_of_dicts = []
        try:
            with open(self.file_path, mode='r', newline='', encoding='utf-8') as file:
                reader = csv.reader(file)

                # We no longer read a header.
                # The first row is treated as data.
                print("Data Rows (as dicts):")
                for i, row in enumerate(reader):
                    if not row:  # Skip empty rows
                        continue

                    # Validate that the row matches the schema length
                    if len(row) != self.schema_length:
                        raise Exception(
                            f"Schema mismatch at row {i + 1}: "
                            f"Expected {self.schema_length} columns, but found {len(row)}."
                        )

                    # Zip the schema keys with the row values
                    row_dict = dict(zip(self.data_schema, row))
                    print(f"  {row_dict}")
                    data_list_of_dicts.append(row_dict)

                if not data_list_of_dicts:
                    print("File is empty.")

                return data_list_of_dicts

        except IOError as e:
            print(f"Error reading from file {self.file_path}: {e}")
            raise
        except Exception as e:
            print(f"An unexpected error occurred during read: {e}")
            raise

    def __print_file_content__(self):
        """Helper function to print the raw text content of the file."""
        print(f"\nRaw content of '{self.file_path}':")
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                print(f.read())
        except IOError as e:
            print(f"Could not read file: {e}")
