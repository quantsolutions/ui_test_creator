# ======== IMPORTS ===================================================================================================================== 
import sys, getopt, cherrypy, json, os, argparse, simplejson
import importlib.util
from lib import database_manager
from cherrypy.lib import sessions
import logging
from ws4py.websocket import EchoWebSocket
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool

# logging.basicConfig(filename="main_logfile.log", filemode="w", format="%(asctime)s %(message)s", level=logging.INFO)
logging.basicConfig(format="%(asctime)s %(message)s", level=logging.INFO)

# ======== GLOBAL VARS =================================================================================================================
SETTINGS_FILE = None
ARGUMENTS = []
DATABASE = "client"

# ======== GLOBAL FUNCTIONS ============================================================================================================
def CORS():
    # This sets the response headers , anything you want in the headers to be returned must be done here.
    server_settings = SETTINGS_FILE.get("cherrypy", None) # Load settings for cherrypy
    cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
    # cherrypy.response.headers["Access-Control-Allow-Origin"] = ARGUMENTS.client_host if ARGUMENTS.client_host else server_settings.get("client_host", "http://127.0.0.1:4200")

# ======== CLASS =======================================================================================================================
# Custom webSocketPlugin that uses the WebSocketPlugin from ws4py as a base class.
class CustomWebSocketPlugin(WebSocketPlugin):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.sockets = {}

    def start(self):
        super().start()
        self.bus.subscribe("ws-opened", self.add_socket) # Add the socket to the list when opened.
        self.bus.subscribe("ws-closed", self.del_socket) # Remove the socket from the list when the socket connection is closed.
        self.bus.subscribe("get-client", self.get_client) # Returns a client that you want to send a message to.
        self.bus.subscribe("broadcast", self.broadcast_message) # Broadcasts a message to every client in the websocket (self.sockets) dictionary.

    def stop(self):
        super().stop()
        self.bus.unsubscribe("ws-opened", self.add_socket)
        self.bus.unsubscribe("ws-closed", self.del_socket)
        self.bus.subscribe("get-client", self.get_client)
        self.bus.unsubscribe("broadcast", self.broadcast_message)

    def add_socket(self, socket, user_id):
        self.sockets[user_id] = socket

    def del_socket(self, socket, user_id, code=0, reason="No Reason"):
        del self.sockets[user_id]

    def get_client(self, user_id):
        return self.sockets[user_id]
    
    def broadcast_message(self, message):
        for key, socket in self.sockets.items():
            logging.info('---------------- SENDING WEBSOCKET MESSAGE ----------------')
            logging.info('Message: ', message)
            logging.info('-----------------------------------------------------------')
            socket.send(message)

# Custom class that uses the base class EchoWebSocket of ws4py.
class CustomWebSocket(EchoWebSocket):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.session_id = None

    def opened(self):
        # This will have to change to the user_id of the user that is logged in, otherwise it can get confusing when sending to other users.
        self.session_id = cherrypy.session.id
        # self.session_id = cherrypy.session["user"]["user_id"]
        cherrypy.engine.publish("ws-opened", self, self.session_id)

    def closed(self, code, reason="No Reason"):
        cherrypy.engine.publish("ws-closed", self, self.session_id, code, reason)

    def received_message(self, msg):
        # Override the base class receive_message function in order to process this information.
        packet = json.loads(str(msg))
        # If the packet does not contain any user_ids to send the message to, then broadcast it to EVERY websocket connected.
        if packet.get("to", None) is None or packet.get("to", "") == "":
            cherrypy.engine.publish("broadcast", msg)
        else:
            # If its a list of user_ids iterate over them and send the message.
            if isinstance(packet["to"], list):
                for user_id in packet["to"]:
                    client = cherrypy.engine.publish("get-client", user_id)
                    client[0].send(packet["message"])
            # If its a single string (single user) then only send it to them.
            else:
                client = cherrypy.engine.publish("get-client", packet["to"])
                client[0].send(packet["message"])

class server(object):    
    def __init__(self):
        self.module_dict = {}
        self.database_dict = {}
        self.build_modules()
        self.build_databases()

    def build_modules(self):
        for module in os.listdir(os.getcwd()+"/modules"):
            if module[-3:] == ".py":
                self.module_dict[module[:-3]] = importlib.util.spec_from_file_location(module[:-3], os.getcwd()+"/modules"+"/"+str(module))

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

    @cherrypy.expose
    def ws(self, *args, **kwargs):
        logging.info(" -------- New Websocket Created for: %s ------------"%(cherrypy.session["user"]["user_id"]))

    @cherrypy.expose
    def default(self, *args):
        """
        Function: Default function that parses and calls the correct module with the function and parameters. Then parses it and sends the result back to the
                  url call from where it came.
        """
        # Get Module That should be called from the url example http://127.0.0.1/booking/getClient -> booking will be the module.
        module_ = args[0]
        valid_module = True if self.module_dict.get(module_, None) else False # Check if the module exists

        # Get Function that should be called from the url example http://127.0.0.1/booking/getClient -> getClient will be the function.
        func_ = args[1]
        # Get Parameters that was sent with the url request.
        try:
            params_ = simplejson.loads(cherrypy.request.body.read(int(cherrypy.request.headers['Content-Length'])))
        except:
            params_ = {}

        if valid_module:
            try:
                # Check if the user is logged in, let it pass if the function call is login or logout.
                if func_ not in ["login", "logout", "getUser"]:
                    self.getUser()

                params_["session"] = cherrypy.session.get("user", None)

                # logging.info to know what is happening
                logging.info("*************************** CALLING ****************************")
                logging.info("MODULE: %s; \nFUNCTION: %s; \nPARAMETERS: %s;"%(module_, func_, str(params_)))
                logging.info("****************************************************************")                

                # Call the module with the function
                data = self.callModuleFunc(module_, func_, params_)
                result = True
                msg = "Success"
            except Exception as ex:
                logging.info("******************** EXCEPTION OCCURED *************************")
                logging.info("MODULE: %s; \nFUNCTION: %s; \nPARAMETERS: %s; \nEXCEPTION: %s;"%(module_, func_, str(params_), str(ex)))
                logging.info("****************************************************************")
                msg = str(ex) if str(ex) != "'%s' object has no attribute '%s'"%(module_, func_) else "Function %s does not exist on module %s"%(func_, module_) 
                data = None
                result = False
        else:
            logging.info("******************** EXCEPTION OCCURED *************************")
            logging.info("EXCEPTION: Module %s was not found"%(module_))
            logging.info("****************************************************************")
            msg = "MODULE " + module_ + " WAS NOT FOUND"
            data = None
            result = False
        ret = {
            "result": result,
            "msg": msg,
            "data": data
        }
        return json.dumps(ret)

    def getUser(self):
        if cherrypy.session.get("user", None):
            return cherrypy.session["user"]
        else:
            raise Exception("NOT LOGGED IN")

    def callModule(self, module_name):
        _module_ = importlib.util.module_from_spec(self.module_dict[module_name])
        self.module_dict[module_name].loader.exec_module(_module_)
        return getattr(_module_, module_name)(self, self.getDatabase)
    
    def callModuleFunc(self, module_name, func_name, params):
        return getattr(self.callModule(module_name), func_name)(**params)

    def getDatabase(self, database_name=None):
        if self.database_dict.get(database_name, None):
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
    
    def getLoggedIn(self):
        return cherrypy.session.get("user", None)

    def doLogout(self):
        try:
            cherrypy.session.clear()
            return "LOGOUT SUCCESSFUL"
        except:
            raise Exception("LOGOUT FAILED: NOT LOGGED IN")

# ======== INIT FUNCTION =================================================================================================================

if __name__ == "__main__":
    # You can run the server on a specific host and port on startup
    # You can also let the db init run in the init mode.
    # In order to this use the following format : python3 main.py --port=8080 --host=0.0.0.0 --init=True

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

    cherrypy.tools.CORS = cherrypy.Tool("before_handler", CORS) # This MUST run before every request sent

    #Update cherrypy with the settings from the settings.json file
    cherrypy.config.update({
        "server.socket_host": ARGUMENTS.server_host if ARGUMENTS.server_host else server_settings["host"], # If the host arugunemnt is present rather use that argument otherwise use the host in the settings file
        "server.socket_port": ARGUMENTS.server_port if ARGUMENTS.server_port else server_settings["port"], # If the port arugunemnt is present rather use that argument otherwise use the port in the settings file
    })
    CustomWebSocketPlugin(cherrypy.engine).subscribe()
    cherrypy.tools.websocket = WebSocketTool()
    cherrypy.quickstart(server(), "", config={
        "/": {
            "tools.sessions.on": True,
            "tools.sessions.name": "session_id",
            "tools.sessions.locking": "explicit",
            "tools.sessions.timeout": 600,
            "tools.sessions.storage_type": "ram",
            "tools.CORS.on": True
            },
        "/ws" : {
            "tools.websocket.on": True,
            "tools.websocket.handler_cls": CustomWebSocket
            }
        })
