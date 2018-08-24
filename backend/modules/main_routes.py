import errno
import asyncio
import json
import logging
import os
import sys
import time
from subprocess import call
import base64

logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO)

if sys.platform.startswith('linux'):
    logging.info("Linux OS Detected, running test will be disabled.")
    SAVE_FOLDER = os.path.normpath(os.getcwd() + '/TingusData' + '/save_files')
else:
    # import psycopg2
    SAVE_FOLDER = os.path.normpath(os.getenv("PROGRAMDATA") + '/TingusData' + '/save_files/')

try:
    with open(os.path.normpath(SAVE_FOLDER + '/settings.json')) as settings_file:
        SETTINGS_FILE = json.load(settings_file)
except:
    raise Exception("NO SETTINGS JSON FILE FOUND")

class Main_Routes:
    def __init__(self, web, server_state):
        self.web = web
        self.server_state = server_state
        self.FileHandling = FileHandling()

    def formatResponse(self, data):
        ret = {
            "result": 'HARDCODED VALUES RESULT',
            "msg": 'HARDCODED VALUES MSG',
            "data": data
        }

        return ret

    async def screenshotTool(self, request):
        payload = await request.json()
        delay = payload['delay']

        if delay >= 1:
            await asyncio.sleep(delay)

        if self.server_state['mode'] == 'development':
            if sys.platform == 'win32':
                call(['py', '-3', '../apps/Screenshot_Tool/main.py', '--save', os.path.normpath(SAVE_FOLDER + '/images/')])
        else:
            call(['./Screenshot_Tool/Screenshot_Tool.exe', '--save', os.path.normpath(SAVE_FOLDER + '/images/')])

        return self.web.json_response("Done")

    async def getTestsCount(self, request):
        return self.web.json_response(self.formatResponse(len(os.listdir(os.path.normpath(SAVE_FOLDER + '/tests/')))))

    async def getSuitesCount(self, request):
        return self.web.json_response(self.formatResponse(len(os.listdir(os.path.normpath(SAVE_FOLDER + '/suites/')))))

    async def getTests(self, request):
        return self.web.json_response(self.formatResponse(self._getTests()))
    
    def _getTests(self):
        tests = []
        for file in os.listdir(os.path.normpath(SAVE_FOLDER + '/tests/')):
            description = json.load(open(os.path.normpath(SAVE_FOLDER + '/tests/' + file)))['description']
            tests.append({ 'name' : file[:-5], 'description': description, 'type': 'test'})
        return tests

    async def getSuites(self, request):
        return self.web.json_response(self.formatResponse(self._getSuites()))

    def _getSuites(self):
        tests = []
        for file in os.listdir(os.path.normpath(SAVE_FOLDER + '/suites/')):
            description = json.load(open(os.path.normpath(SAVE_FOLDER + '/suites/' + file)))['description']
            tests.append({ 'name': file[:-5], 'description': description, 'type': 'suite'})
        return tests

    async def getImages(self, request):
        payload = await request.json()
        data = payload['get_method']
        method = data['method']
        value = data['value']
        images = []
        if method == 'last':
            for file in os.listdir(os.path.normpath(SAVE_FOLDER + '/images/')):
                if file.endswith('.png'):
                    with open(os.path.normpath(SAVE_FOLDER + '/images/' + file), 'rb') as image_file:
                        encoded_string = base64.b64encode(image_file.read())
                    images.append({"name": os.path.splitext(file)[0], "image_base64": "data:image/png;base64," + encoded_string.decode("utf-8")})
                    image_file.close()
        elif method == 'specific_name':
            pass
        elif method == 'specific':
            pass

        return self.web.json_response(self.formatResponse(images))

    async def getCommandActions(self, model):
        return self.web.json_response(self.formatResponse(self._getCommandActions()))

    def _getCommandActions(self):
        commandActions = []
        for file in os.listdir(os.path.normpath(SAVE_FOLDER + '/command_actions/')):
            commandActions.append(json.load(open(os.path.normpath(SAVE_FOLDER + '/command_actions/' + file))))

        return commandActions

    async def saveTest(self, model):
        payload = await model.json()
        payload = payload['model']
        with self.FileHandling.safe_open_w(os.path.normpath(SAVE_FOLDER + '/tests/' + payload['name'] + '.json')) as fp:
            payload['test_type'] = 'testcase'
            json.dump(payload, fp, indent=4)

        return self.web.json_response({'Status': 'Saved'})

    async def saveCommandAction(self, model):
        payload = await model.json()
        with self.FileHandling.safe_open_w(os.path.normpath(SAVE_FOLDER + '/command_actions/' + payload['name'] + '.json')) as fp:
            json.dump(payload, fp,  indent=4)

        return self.web.json_response({'Status': 'Saved'})

    async def saveTestSuite(self, model):
        payload = await model.json()
        payload = payload['model']
        with self.FileHandling.safe_open_w(os.path.normpath(SAVE_FOLDER + '/suites/' + payload['name'] + '.json')) as fp:
            payload['test_type'] = 'testsuite'
            json.dump(payload, fp, indent=4)

        return self.web.json_response({'Status': 'Saved'})

    async def loadTestSuite(self, test_name):
        payload = await test_name.json()
        payload = payload['test_name']
        return self.web.json_response(self.formatResponse(self._load_test_suite(payload)))

    def _load_test_suite(self, test_name):
        json_data = open(os.path.normpath(SAVE_FOLDER + '/suites/' + test_name + '.json'))
        return json.load(json_data)

    async def loadTest(self, test_name):
        payload = await test_name.json()
        payload = payload['test_name']
        return self.web.json_response(self.formatResponse(self._load_test(payload)))

    def _load_test(self, test_name):
        json_data = open(os.path.normpath(SAVE_FOLDER + '/tests/' + test_name + '.json'))
        return json.load(json_data)

    async def runTest(self, model):
        # sorted(list_to_be_sorted, key=lambda k: k['order'])
        # Load all the test before you begin to execute them. So that the tests are equally as fast.
        payload = await model.json()
        payload = payload['model']

        test_result = []

        for test in payload['tests']:
            log_name = time.strftime('%Y%m%d_%H%M_%S')
            print(test)
            if self.server_state['mode'] == 'development':
                if sys.platform == 'win32':
                    call(['py', '-3', '../apps/test_runner/main.py', '--log_name', log_name, test['name'], test['type']])
            else:
                call(['./test_runner/test_runner.exe', '--log_name', log_name, test['name'], test['type']])

            test_result.extend(json.load(open(os.path.normpath(SAVE_FOLDER + '/logs/' + log_name + '.json'))))

        return self.web.json_response(self.formatResponse(test_result))

    async def searchTests(self, search_term):
        payload = await search_term.json()
        payload = payload['search_term']
        tests = self._getTests()
        tests_ = []
        for test in tests:
            if test['name'].lower().find(payload.lower()) > -1 or test['description'].lower().find(payload.lower()) > -1:
                tests_.append(test)

        return self.web.json_response(self.formatResponse(tests_))

    async def searchSuites(self, search_term):
        payload = await search_term.json()
        payload = payload['search_term']
        suites = self._getSuites()
        suites_ = []
        for suite in suites:
            if suite['name'].lower().find(payload.lower()) > -1 or suite['description'].lower().find(payload.lower()) > -1:
                suites_.append(suite)

        return self.web.json_response(self.formatResponse(suites_))

    async def searchCommandActions(self, search_term):
        payload = await search_term.json()
        payload = payload['search_term']
        commandActions = self._getCommandActions()
        commands_ = []
        for cmd in commandActions:
            if cmd['name'].lower().find(payload.lower()) > -1 or cmd['description'].lower().find(payload.lower()) > -1:
                commands_.append(cmd)

        return self.web.json_response(self.formatResponse(commands_))

    def _runCommandAction(self, commandActionName):
        json_data = open(os.path.normpath(SAVE_FOLDER + '/command_actions/' + commandActionName + '.json'))
        data = json.load(json_data)
        if data['type'] == 'batch':
            os.system(data['data'])
        # elif data['type'] == 'pgsql':
        #     conn = psycopg2.connect('dbname={dbname} user={user} password={password} host={host} port={port}'.format(dbname=data['dbname'], user=data['user'], password=data['password'], host=['host'], port=['port']))
        #     cur = conn.cursor()
        #     cur.execute(data['data'])


class FileHandling:
    """Better why to handle files that needs to be saved etc.
    The function below safe_open() take a path and will check if path exist.
    If it doesn't, it will attempt to create the folders.
    EXAMPLE USAGE: with safe_open_w('/Users/bill/output/output-text.txt') as f:
                       f.write(stuff_to_file)
    """
    def _mkdir_p(self, path):
        try:
            os.makedirs(path)
        except OSError as exc:
            if exc.errno == errno.EEXIST and os.path.isdir(path):
                pass
            else:
                raise

    def safe_open_w(self, path):
        ''' Open "path" for writing, creating any parent directories as needed.
        '''
        self._mkdir_p(os.path.dirname(path))
        return open(path, 'w')

    def safe_create_path(self, path):
        '''Create Path give if doesn't exist
        '''
        self._mkdir_p(os.path.dirname(path))
        return path


class ImageJson:
    def __init__(self, image_name):
        self.image_meta = self._read_json(image_name)

    def _read_json(self, image_name):
        with open(os.path.normpath(SAVE_FOLDER + '/images/' + image_name + '.json')) as f:
            return json.load(f)

    def get_click_offset(self):
        return self.image_meta['clickOffset']
