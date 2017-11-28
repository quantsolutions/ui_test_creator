========================================

This project is a integration between angular and python3 cherrypy.
This includes a postgres-sql 9.5 database handler wrapper around psycoPg2.
User authentication is also added in the default backend calls.
There is also functionality to init the database you wish to create on defualt.

=======================================

======= HOW TO RUN THIS PROJECT ========

--- Install dependencies to run main.py ---
* sudo apt-get install python3-cherrypy3
* sudo apt-get install python3-psycopg2
* sudo apt-get install python3-ws4py 
* sudo apt-get install python3-pip
* sudo apt-get install postgresql-9.5
* sudo apt-get install python3-pyqt5
* sudo pip3 install pyscreenshot
* sudo apt-get install python3-pil.imagetk

--- Edit postgresql config file ---
* sudo nano /etc/postgresql/9.5/main/pg_hba.conf
* Add the following lines where "# IPv4 local connections:" is located in the file
    host    all             all             127.0.0.1/32            trust
    host    all             all               0.0.0.0/0             trust
* Save the file
* sudo service postgresql restart
* psql -h 127.0.0.1 -U postgres
    \password
     masterkey
     masterkey
    CREATE DATABASE booking WITH OWNER = postgres;
    \q

--- In the case the above mentioned does not work try the following ---
* sudo su postgres
* psql -d template1
* template1=# ALTER USER postgres WITH PASSWORD 'masterkey';

--- Install dependencies for Angular Project ---
* sudo apt-get install python-software-properties
* curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
* sudo apt-get install nodejs
* sudo npm install -g @angular/cli@latest
* npm install --> Must be in /frontend folder for this

---- To run server ----
* cd angular-cherrypy/backend/
* python3 main.py [Will run the normal server without initing your db (NORMAL MODE)]
* Please note: The server is automatically started on host 0.0.0.0 and port 8080. These can be changed in the settings.json file
        OR
* python3 main.py --init=True [Will init your database with the settings.json file (INIT MODE)]
        OR 
* You have the following parameters to start the server with 
* --server_host=http://127.0.0.1 --> Host to start the cherrypy server with
* --sever_port=8080 --> The port to start the cherrypy server on
* --client_host=http://192.168.1.100 --> The host:port of the client (frontend) started on

---- To run angular project ----
* cd angular-cherrypy/frontend/
* ng serve --proxy proxy.conf.json

========== SOME NOTES ==============
* All the connection, cherrypy, database etc. settings are in the settings.json file, this also includes the tables, schemas and default data to init the tables with.
* By default on the web side you will be able to login with Username: admin , Password: admin. (This is if you run the init mode of the main.py)
* Read carefully through the documentation in the main.py and booking.py, this is a very modular system. Everything is explained thoroughly with more than enough examples and if you are not sure play around with some of the functions. 
* If you require anything else or have some questions send me a email at wilco@keyboardninjas.co.za or wilcobreedt@gmail.com