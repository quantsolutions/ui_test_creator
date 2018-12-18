# ======== IMPORTS ===================================================================================================================== 
import sys, getopt, json, os, argparse
import importlib.util
from lib import database_manager
import logging
# logging.basicConfig(filename="main_logfile.log", filemode="w", format="%(asctime)s %(message)s", level=logging.INFO)
logging.basicConfig(format="%(asctime)s %(message)s", level=logging.INFO)
from flask import Flask, request

# ======== GLOBAL VARS =================================================================================================================
SETTINGS_FILE = {}
ARGUMENTS = []
DATABASE = "client"
INSTANCES = []

# ======== GLOBAL FUNCTIONS ============================================================================================================
class customFlask(Flask):
    def __init__(self, *args, **kwags):
        super().__init__(*args, **kwags)
        self.module_dict = {}
        self.database_dict = {}
        self.build_modules()
        self.build_databases()

    def build_modules(self):
        for module in os.listdir(os.getcwd()+"/modules"):
            if module[-3:] == ".py":
                module_spec = importlib.util.spec_from_file_location(module[:-3], os.getcwd()+"/modules"+"/"+str(module))
                _module_ = importlib.util.module_from_spec(module_spec)
                module_spec.loader.exec_module(_module_)
                self.module_dict[module[:-3]] = getattr(_module_, module[:-3])(self, self.getDatabase)

    def build_databases(self):
        for database in SETTINGS_FILE.get("databases", []):
            self.database_dict[database["database_name"]] = database_manager.DatabaseConnection(database)

            # If you want to run the database checker just run python3 main.py init, the init param is needed to start this
            if ARGUMENTS.init:
                self.check_tables(database)

    def check_tables(self, database):
        db = self.database_dict[database["database_name"]] 
        for schema in database["schemas"]:
            schema_ = db.executeSQLWithResult("SELECT schema_name FROM information_schema.schemata WHERE schema_name = %s", (schema["name"],))
            if len(schema_) == 0:
                logging.info("------------------------ INIT SCHEMA %s ------------------------"%(schema["name"]))
                db.executeSQL(schema["sql"], ())
            for table in schema["tables"]:
                table_ = db.executeSQLWithResult("SELECT * FROM information_schema.tables WHERE table_name = %s", (table["name"],))
                if len(table_) == 0:
                    logging.info("------------------------ INIT TABLE %s ------------------------"%(table["name"]))
                    db.executeSQL(table["sql"], ())
                    for sql in table["defaults"]:
                        logging.info("------------------------ INIT DEFAULT SQL %s ----------------------"%(table["name"]))
                        db.executeSQL(sql, ())
            for view in schema["views"]:
                view_ = db.executeSQLWithResult("IF EXISTS(select * FROM sys.views where name = %s)", (view["name"],))
                if len(view_) == 0:
                    logging.info("------------------------ INIT VIEW %s ------------------------"%(view["name"]))
                    db.executeSQL(view["sql"], ())

    # def getUser(self):
    #     if cherrypy.session.get("user", None):
    #         return cherrypy.session["user"]
    #     else:
    #         raise Exception("NOT LOGGED IN")

    def callModule(self, module_name):
        return self.module_dict[module_name]

    def callModuleFunc(self, module_name, func_name, params):
        module = self.callModule(module_name)
        function = getattr(module, func_name)
        return function(**params)

    def getDatabase(self, database_name=None):
        if self.database_dict.get(database_name):
            return self.database_dict[database_name]
        else:
            raise Exception("Database %s is not in the database_dict"%(database_name))

    def doLogin(self, db=None, username=None, password=None):
        if db is None or db == "":
            raise Exception("LOGIN FAILED: No Database Provided")
        if username is None or username == "":
            raise Exception("LOGIN FAILED: No Username Provided")
        if password is None or password == "":
            raise Exception("LOGIN FAILED: No Password Provided")
        # Should implement the where_dict = {"username" :username, "password": hashlib.sha256(password.encode("utf-8")).hexdigest(), "disabled" : False}
        where_dict = {"username" : username, "password": password, "disabled" : False}
        user = self.getDatabase(db).select("global.user", where_dict)
        if len(user) == 1:
            try:
                self.getDatabase(db).executeSQL("UPDATE global.user set login_count = coalesce(login_count, 0)+1 where id=%s", (user[0]["id"],))
            except:
                pass
            cherrypy.session["user"] = {
                                         "username": user[0]["username"],
                                         "user_id": user[0]["id"],
                                         "name": user[0]["name"],
                                         "user_groups": user[0]["user_groups"],
                                         "session_id": cherrypy.session.id
                                       }
            logging.info("******************* LOGIN SUCCESSFUL **********************")
            logging.info("USERNAME: %s; \nUSER_ID: %s; \nNAME: %s; \nPASSWORD: %s"%(user[0]["username"], user[0]["id"], user[0]["name"], user[0]["password"]))
            logging.info("***********************************************************")
            return cherrypy.session["user"]
        else:
            logging.info("******************** LOGIN FAILED *************************")
            logging.info("USERNAME: %s; \nPASSWORD: %s"%(username, password))
            logging.info("***********************************************************")
            raise Exception("LOGIN FAILED: Password or Username Incorrect")

app = customFlask(__name__)

@app.route('/', defaults={'path': ''}, methods=['GET', 'POST'])
@app.route('/<path:path>', methods=['GET', 'POST'])
def default(path):
    """
    Function: Default function that parses and calls the correct module with the function and parameters. Then parses it and sends the result back to the
                url call from where it came.
    """
    path = path.split("/")
    try:
        module_, function_ = path[0], path[1]
    except Exception as ex:
        module_, function_ = None, None

    try:
        params_ = {}
        params_.update({**(request.get_json() or {}), **(request.values or {})})
    except:
        params_ = {}

    if app.module_dict.get(module_):
        try:
            # Check if the user is logged in, let it pass if the function call is login or logout.
            # if func_ not in ["login", "logout", "getUser"]:
            #     self.getUser()

            # Set the user of the session from the session_id cookie.
            params_["session"] = {}

            # logging.info to know what is happening
            logging.info("*************************** CALLING ****************************")
            logging.info("MODULE: %s; \nFUNCTION: %s; \nPARAMETERS: %s;"%(module_, function_, str(params_)))
            logging.info("****************************************************************")                

            # Call the module with the function
            data = app.callModuleFunc(module_, function_, params_)
            result = True
            message = "Success"
        except Exception as ex:
            logging.info("******************** EXCEPTION OCCURED *************************")
            logging.info("MODULE: %s; \nFUNCTION: %s; \nPARAMETERS: %s; \nEXCEPTION: %s;"%(module_, function_, str(params_), str(ex)))
            logging.info("****************************************************************")
            message = str(ex) if str(ex) != "'%s' object has no attribute '%s'"%(module_, function_) else "Function %s does not exist on module %s"%(function_, module_) 
            data = None
            result = False
    else:
        logging.info("******************** EXCEPTION OCCURED *************************")
        logging.info("EXCEPTION: Module %s was not found"%(str(module_)))
        logging.info("****************************************************************")
        message = "MODULE %s WAS NOT FOUND"%(str(module_))
        data = None
        result = False
    ret = {
        "result": result,
        "message": message,
        "data": data
    }
    return json.dumps(ret)

# ======== INIT FUNCTION =================================================================================================================
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--server_port", type=int)
    parser.add_argument("--server_host")
    parser.add_argument("--client_host")
    parser.add_argument("--init", type=bool)
    ARGUMENTS = parser.parse_args()
    if ARGUMENTS.server_port:
        logging.info("---------- Starting with PORT: %s ---------"%(ARGUMENTS.server_port))
    if ARGUMENTS.server_host:
        logging.info("---------- Starting with HOST: %s ---------"%(ARGUMENTS.server_host))
    if ARGUMENTS.client_host:
        logging.info("---------- Access-Control-Allow-Origin with HOST: %s ---------"%(ARGUMENTS.client_host))
    if ARGUMENTS.init:
        logging.info("---------- Init File will be run ----------")
    # Load settings out of the settings file
    try:
        with open("settings.json") as settings_file:
            SETTINGS_FILE = json.load(settings_file)
    except:
        raise Exception("NO SETTINGS JSON FILE FOUND")

    server_settings = SETTINGS_FILE.get("cherrypy", None) # Load settings for cherrypy

    # If the settings file or the 
    if server_settings is None:
        raise Exception("CHERRYPY SETTINGS ARE EMPTY")

    app.run(
        host=ARGUMENTS.server_host if ARGUMENTS.server_host else server_settings["host"], # If the host arugunemnt is present rather use that argument otherwise use the host in the settings file
        port=ARGUMENTS.server_port if ARGUMENTS.server_port else server_settings["port"], # If the port arugunemnt is present rather use that argument otherwise use the port in the settings file
    )
