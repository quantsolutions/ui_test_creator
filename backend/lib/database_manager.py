import psycopg2
import psycopg2.extras
"""
This module is a wrapper for psycopg2.
"""
class DatabaseConnection():
    def __init__(self, settings):
        self.settings = settings
        self._db = None
        self.createConnection()

    def createConnection(self):
        self._db = psycopg2.connect(host=self.settings["host"], 
                                    database=self.settings["database_name"], 
                                    user=self.settings["username"], 
                                    password=self.settings["password"],
                                    port=self.settings["port"])

        if self.settings["config_type"] == "default_db":
            self._db.autocommit = True

        return self._db

    def getDatabase(self):
        return self._db

    def getCursor(self):
        db = self.getDatabase()
        try:
            curr = db.cursor() # Get cursor to test the connection.
            curr.execute('SELECT 1') # If select 1 fails / errors , then the connection is closed.
        except:
            # If the connection is closed log it and then retry to establish the connection.
            logger.info("Database connection closed. Trying to reconnect ...")
            try:
                db = self.createConnection() # Create the db Connection again.
            except Exception as ex:
                raise Exception("Failed to reconnect to the database. Error: " + str(ex)) # If the connection fails raise exception.

        if db != None:
            # The dict cursors allow to access to the retrieved records using an interface similar to the Python dictionaries instead of the tuples.
            return db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        else:
            return None

    def insert(self, table_name, column_data_dict, return_key=None):
        """
        Function: Insert the dictionary provided in column_data_dict into the table provided in the table_name
        Example: model = { 'name': 'TestName', 'surname' : 'TestSurname' }
                 DATABASE = 'booking'
                 result = self.getDatabase(DATABASE).insert('client.client', model, 'id') -> Will return the id of the insert field after insert successful
                 self.getDatabase(DATABASE).insert('client.client', model, 'id') -> Will not return anything
        """
        value_str = ", ".join(map(str, ["%s"]*len(column_data_dict)))
        column_str = ", ".join(map(str, list(column_data_dict.keys())))
        value_tuple = tuple(column_data_dict.values())
        if return_key and isinstance(return_key, str):
            return_str = "RETURNING %s"%(return_key)
        else:
            return_str = ""
        query_insert = "INSERT INTO %s (%s) VALUES (%s) %s"%(table_name, column_str, value_str, return_str)
        return self._execute(query_insert, value_tuple, return_key=return_key)

    def executeSQL(self, sql_statement, params_tuple=None):
        """
        Function: Execute the sql provided in sql_statement with the params provided in params_tuple, this is recommended for create tables, deletes etc..
        Example: SQL = 'SELECT * FROM client.client WHERE name = %s AND surname = %s LIMIT 10;'
                 DATABASE = 'booking'
                 result = self.getDatabase(DATABASE).executeSQL(sql, ('TestName', 'testSurname')) <-- This will return None.
        """
        return self._execute(sql_statement, params_tuple, False)

    def executeSQLWithResult(self, sql_statement, params_tuple):
        """
        Function: Execute the sql provided in sql_statement with the params provided in params_tuple, this is recommended for ilike selects AND selects.
        Example: SQL = 'SELECT * FROM client.client WHERE name = %s AND surname = %s LIMIT 10;'
                 DATABASE = 'booking'
                 result = self.getDatabase(DATABASE).executeSQLWithResult(sql, ('TestName', 'testSurname')) <-- This will return a result of the select.
        """
        return self._execute(sql_statement, params_tuple, True)

    def select(self, table_name, where_dict={}, select_fields=[], lower_fields=False, order_by="", order="ASC"):
        """
        Function: Select the fields provided or all fields from the table provided that matches the where criteria passed in through the where_dict.
        Params: table_name -> String -> 'client.client' Table from which you wish to select.
                where_dict -> Dictionary -> {'name': 'Client', 'surname': 'ClientSurname'} Dictionary used for the where field, the keys must match the column names in the table.
                select_fields -> List -> ['name'] Fields which to return in the select, if it not specified * will be returned
                lower_fields -> boolean -> True/False Should the query match the fields all in lowercase to increase matching results 
        Example: DATABASE = 'booking'
                 result = self.getDatabase(DATABASE).select('client.client', {'name': 'TestName', 'surname' : 'TestSurname'}) <- This will return all the columns in the table client with the name TestName and surname TestSurname
                 result = self.getDatabase(DATABASE).select('client.client', {'name': 'TestName', 'surname' : 'TestSurname'}, ['name']) <- This will return only the name column in the table client with the name TestName and surname TestSurname
                 result = self.getDatabase(DATABASE).select('client.client', {'name': 'TestName', 'surname' : 'TestSurname'}, ['name'], True) <- This will return only the name column in the table client with the name TestName and surname TestSurname matching lowercase
                 result = self.getDatabase(DATABASE).select('client.client', {'name': 'TestName', 'surname' : 'TestSurname'}, lower_fields=True, select_fields=['name']) <- Params can be mixed and left out if you wish to omit some of the params
        """
        SQL = "SELECT "
        if len(select_fields) > 0:
            for column in select_fields: 
                SQL += column
                if select_fields.index(column) + 1 != len(select_fields):
                    SQL += ', '
                else:
                    SQL += " "
        else:
            SQL += "* "
        SQL += "FROM %s"%(table_name)
        if where_dict != {}:
            if lower_fields:
                operator = " AND "
                where_statement = "".join([operator+"lower("+key+")=lower(%s)" for key in where_dict if isinstance(str, where[dict])])[len(operator):]
            else:
                operator = " AND "
                where_statement = "".join([operator+key+"=%s" for key in where_dict])[len(operator):]
            where_statement = " WHERE " + where_statement
            params_tuple = tuple(where_dict.values())
            sql_statement = SQL + where_statement
        else:
            params_tuple = tuple()
            sql_statement = SQL
        if order_by:
            sql_statement += " ORDER BY %s %s"%(order_by, order)
        return self._execute(sql_statement, params_tuple, True)

    def update(self, table_name, column_data_dict, where_field=None):
        """
        Function: Updates the table with the columns provided in the column_data_dict , with the conditions of the where field where_field.
        Example: model = { 'id': 100, 'name': 'TestName', 'surname' : 'TestSurname' }
                 DATABASE = 'booking'
                 result = self.getDatabase(DATABASE).update('client.client', model, 'id') -> Will update all the fields with the following values where the id = 100
                 self.getDatabase(DATABASE).update('client.client', model) -> Will update all the fields, this is NOT NOT NOT recommended
        """
        set_str = ", ".join([k + "=%s" for k in list(column_data_dict.keys())])
        where_str = where_field + "=%s"
        value_tuple = tuple(column_data_dict.values()) + (column_data_dict[where_field],)
        query_insert = "UPDATE %s set %s WHERE %s"%(table_name, set_str, where_str)
        return self._execute(query_insert, value_tuple, False)

    def _execute(self, sql, values=None, return_=False, return_key=None):

        cursor = self.getCursor()
        retval = None
        try:
            if values is not None:
                cursor.execute(sql, values)
            else:
                cursor.execute(sql)
            self._commit()

            if return_key and isinstance(return_key, str):
                retval = cursor.fetchone()[return_key]

            elif return_:
                retval = cursor.fetchall()
            return retval
        except Exception as ex:
            self._db.rollback()
            raise Exception(" ".join([str(x) for x in ["EXCEPTION in: _execute", sql, values, ex]]) )

    def _commit(self):
        self.getDatabase().commit()
