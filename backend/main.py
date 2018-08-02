import argparse
import errno
import logging
import os
import sys
import io
import json

import aiohttp
import aiohttp_cors


logging.basicConfig(format="%(asctime)s %(message)s")

SERVER_STATE = {
    'mode': 'production'
}

logging.info('Check if save folders exist started...')
# Create Save Folders
if sys.platform == "linux" or sys.platform == "linux2":
    save_folder_path = os.path.normpath(os.getcwd() + '/TingusData' +'/save_files/')
else:
    save_folder_path = os.path.normpath(os.getenv("PROGRAMDATA") + '/TingusData' +'/save_files/')

folder_names = ['images', 'tests', 'suites']
for folder_name in folder_names:
    path = os.path.normpath(save_folder_path + '/' + folder_name + '/')
    try:
        os.makedirs(path)
    except OSError as exc:
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise

if os.path.isfile(os.path.normpath(save_folder_path + '/settings.json')) and os.access(os.path.normpath(save_folder_path + '/settings.json'), os.R_OK):
        # checks if file exists
        logging.info("settings.json file exists and is readable")
else:
    logging.info("settings.json file is missing or is not readable, creating file...")
    with io.open(os.path.normpath(save_folder_path + '/settings.json'), 'w') as setting_file:
        setting_file.write(json.dumps({
            "testSettings": {
                "runTestDelay": 2,
                "actionDelayOffset": 0
                }
            }, indent=4))
    setting_file.close()

parser = argparse.ArgumentParser(description='Tingus Start Options.')
parser.add_argument('--dev', action='store_true', help='If you are going to develop and want to make things easier.')

args = parser.parse_args()

if args.dev:
    SERVER_STATE['mode'] = 'development'
    logging.info('Server State: Mode - Development')

from modules import main_routes

logging.info('Starting Web Server...')
# Call the Class with all the Routes
main_routes_class = main_routes.Main_Routes(aiohttp.web, SERVER_STATE)
app = aiohttp.web.Application()
app.add_routes([aiohttp.web.post('/getTestsCount', main_routes_class.getTestsCount),
                aiohttp.web.post('/getSuitesCount', main_routes_class.getSuitesCount),
                aiohttp.web.post('/getTests', main_routes_class.getTests),
                aiohttp.web.post('/getSuites', main_routes_class.getSuites),
                aiohttp.web.post('/getImages', main_routes_class.getImages),
                aiohttp.web.post('/saveTest', main_routes_class.saveTest),
                aiohttp.web.post('/saveTestSuite', main_routes_class.saveTestSuite),
                aiohttp.web.post('/loadTestSuite', main_routes_class.loadTestSuite),
                aiohttp.web.post('/loadTest', main_routes_class.loadTest),
                aiohttp.web.post('/runTestSuite', main_routes_class.runTestSuite),
                aiohttp.web.post('/runTest', main_routes_class.runTest),
                aiohttp.web.post('/searchTests', main_routes_class.searchTests),
                aiohttp.web.post('/searchSuites', main_routes_class.searchSuites),
                aiohttp.web.post('/screenshotTool', main_routes_class.screenshotTool)
                ])

cors = aiohttp_cors.setup(app, defaults={
"*": aiohttp_cors.ResourceOptions(
     allow_credentials=True,
     expose_headers="*",
     allow_headers="*")
})

# Configure CORS on all routes.
for route in list(app.router.routes()):
    cors.add(route)

aiohttp.web.run_app(app, port=9000)
logging.info('Program closing...')
