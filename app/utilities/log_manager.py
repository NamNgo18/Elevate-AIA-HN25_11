import os
import logging
import logging.config
import threading

# Define all publicly accessible functions within the module
__all__ = ["LoggingManager"]

class LoggingManager:
    # Class variable to store the singleton instance
    _instance   = None
    _init_lock  = threading.Lock()
    _setup_lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        # Ensure only one instance of the logger exists
        if cls._instance is None:
            with cls._init_lock:
                if cls._instance is None:
                    cls._instance = super(LoggingManager, cls).__new__(cls)
                    cls._instance.loggers = {}  # Explicitly initialize the logger as empty
                else:
                    cls._instance.loggers["root"].info(f"The logger instance has been initialized!")
        return cls._instance

    def setup_logger(self, conf_name: str = "log.conf", log_name: str = "app.log") -> None:
        # Is there logger instance created?
        with self._setup_lock:
            if getattr(self, 'loggers', None):
                self.loggers["root"].info(f"The logger instance has been initialized!")
                return  

        # Ensure 'app/logs/' directory exists
        log_file_path = os.path.join(
                            os.path.abspath(os.path.join(os.path.dirname(__file__), '../logs')),
                            log_name)
        os.makedirs(os.path.dirname(log_file_path), exist_ok = True)
        conf_path: str = os.path.join(
                            os.path.dirname(__file__),
                            conf_name)
        if not os.path.exists(conf_path):
            raise FileNotFoundError(f"Logging configuration file not found: {conf_path}")

        logging.config.fileConfig(conf_path, disable_existing_loggers = False, defaults={'logfile': log_file_path})
        # Collect all logger - root included
        self.loggers["root"] = logging.getLogger()
        for key_nm in logging.root.manager.loggerDict.keys():
                self.loggers[key_nm] = logging.getLogger(key_nm)
                self.loggers["root"].info(f"\t{key_nm} has been loaded!")
        self.loggers["root"].info(f"The configuration file has loaded from: {conf_path}\n\tand the logs will be saved at: {log_file_path}")

    def get_logger(self, logger_nm: str = "root") -> logging:
        if not getattr(self, 'loggers', None):
            raise RuntimeError("Log Manager not initialized. Call setup_logger(..) first")

        if logger_nm not in self.loggers:
            self.loggers[logger_nm].debug(f"The logger name {logger_nm} doesn't available to retrieve")
            return None

        return self.loggers[logger_nm]

if __name__ == "__main__":
    logging_mgr = LoggingManager()
    logging_mgr.setup_logger()
    root_logger = logging_mgr.get_logger()
    root_logger.info("All the log levels are supported at the moment..")
    root_logger.debug   ( "\t\t Level 1")
    root_logger.info    ( "\t\t Level 2")
    root_logger.warning ( "\t Level 3")
    root_logger.error   ( "\t\t Level 4")
    root_logger.critical( "\t Level 5")