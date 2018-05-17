import argparse
import errno
import logging
import os

import aiohttp
import aiohttp_cors

from modules import main_routes

logging.basicConfig(format="%(asctime)s %(message)s")

def setup():
    logging.info('Setup started...')
    # Create Save Folders
    save_folder_path = os.path.normpath(os.getcwd() + '/save_files/')
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

parser = argparse.ArgumentParser(description='Tingus Start Options.')
parser.add_argument('--dev', action='store_true', help='If you are going to develop and want to make things easier.')
parser.add_argument('--setup', action='store_true', help='If you want to run the setup of Tingus.')

args = parser.parse_args()

if args.setup:
    setup()
    if args.dev:
    # Should start server and not try to serve page.
        pass
    # Do setup procedure, normally for first start
    # TODO: In config or in commandline change save path.
    # TODO: Add method to check if setup have been done.
    #       If it was done stop everything and tell the user.
    #       Add then a --force option to force update everything.
    #       Maybe also tell the user old settings etc.
if args.dev:
    # Should start server and not try to serve page.
    pass

logging.info('Starting Web Server...')
# Call the Class with all the Routes
main_routes_class = main_routes.Main_Routes(aiohttp.web)
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
                aiohttp.web.post('/searchSuites', main_routes_class.searchSuites)])

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
