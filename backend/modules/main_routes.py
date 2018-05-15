import errno
import json
import logging
import os
import time

import pyautogui
from lackey import click as _click
from lackey import doubleClick as _doubleClick
from lackey import rightClick as _rightClick
from lackey import wait as _wait

logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO)
SAVE_FOLDER = os.path.normpath(os.getcwd() + '/save_files/')

try:
    with open("settings.json") as settings_file:
        SETTINGS_FILE = json.load(settings_file)
except:
    raise Exception("NO SETTINGS JSON FILE FOUND")

class Main_Routes:
    def __init__(self, web):
        self.web = web
        self.FileHandling = FileHandling()

    def formatResponse(self, data):
        ret = {
            "result": 'HARDCODED VALUES RESULT',
            "msg": 'HARDCED VALUES MSG',
            "data": data
        }

        return ret

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
        images = []
        for file in os.listdir(os.path.normpath(SAVE_FOLDER + '/images/')):
            images.append({"name": file[:-4]})
        return self.web.json_response(self.formatResponse(images))

    async def saveTest(self, model):
        payload = await model.json()
        payload = payload['model']
        with self.FileHandling.safe_open_w(os.path.normpath(SAVE_FOLDER + '/tests/' + payload['name'] + '.json')) as fp:
            json.dump(payload, fp, indent=4)

        return self.web.json_response({'Status': 'Saved'})

    async def saveTestSuite(self, model):
        payload = await model.json()
        payload = payload['model']
        with self.FileHandling.safe_open_w(os.path.normpath(SAVE_FOLDER + '/suites/' + payload['name'] + '.json')) as fp:
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

    async def runTestSuite(self, model):
        # sorted(list_to_be_sorted, key=lambda k: k['order'])
        # Load all the test before you begin to execute them. So that the tests are equally as fast.
        payload = await model.json()
        payload = payload['model']
        suite_results = []
        for index, test in enumerate(payload['tests']):
            if test['type'] == 'suite':
                test_suite = self._load_test_suite(test['name'])
                suite_results.append({
                    "name": test_suite["name"],
                    "index": index,
                    "type": "suite",
                    "results": self.runTestSuite(test_suite)
                })
            elif test['type'] == 'test':
                test_ = self._load_test(test['name'])
                suite_results.append({
                    "name": test_["name"],
                    "index": index,
                    "type": "test",
                    "results": self._run_test(test_)
                })
        return self.web.json_response(self.formatResponse(suite_results))

    async def runTest(self, model):
        self._run_test(model)

    def _run_test(self, model):
        test_result =  {
            "failed_actions": [],
            "success_actions": []
        }
        time.sleep(SETTINGS_FILE.get("testSettings", {}).get("runTestDelay", 5))
        for index, action in enumerate(model['actions']):
            try:
                if action['action'] == 'click':
                    for k in range(int(action.get('repeat', '1') or '1')):
                        _click(os.path.normpath(SAVE_FOLDER + '/images/' + action['data'] + '.png'))
                if action['action'] == 'r_click':
                    for k in range(int(action.get('repeat', '1') or '1')):
                        _rightClick(os.path.normpath(SAVE_FOLDER + '/images/' + action['data'] + '.png'))
                if action['action'] == 'doubleclick':
                    for k in range(int(action.get('repeat', '1') or '1')):
                        _doubleClick(os.path.normpath(SAVE_FOLDER + '/images/' + action['data'] + '.png'))
                if action['action'] == 'wait':
                    for k in range(int(action.get('repeat', '1') or '1')):
                        _wait(os.path.normpath(SAVE_FOLDER + '/images/' + action['data'] + '.png'), int(action['delay']))
                if action['action'] == 'clickwait':
                    for k in range(int(action.get('repeat', '1') or '1')):
                        _click(_wait(os.path.normpath(SAVE_FOLDER + '/images/' + action['data'] + '.png'), int(action['delay'])))
                if action['action'] == 'type':
                    for k in range(int(action.get('repeat', '1') or '1')):
                        pyautogui.typewrite(action['data'])
                if action['action'] == 'keycombo':
                    keys = action['data'].split('+')
                    for k in range(int(action.get('repeat', '1') or '1')):
                        pyautogui.hotkey(*keys)
                if action['action'] == 'keypress':
                    for k in range(int(action.get('repeat', '1') or '1')):
                        pyautogui.typewrite(action['data'])
                if action['action'] == 'close':
                    for k in range(int(action.get('repeat', '1') or '1')):
                        pyautogui.hotkey('alt', 'f4')
                test_result["success_actions"].append({
                    "index": index,
                    "action": action["action"],
                    "data": action["data"]
                })
            except Exception as ex:
                test_result["failed_actions"].append({
                    "index": index,
                    "action": action["action"],
                    "data": action["data"],
                    "error": str(ex.__doc__)
                })
        return test_result

    async def searchTests(self, search_term):
        payload = await search_term.json()
        payload = payload['search_term']
        tests = self._getTests()
        tests_ = []
        for test in tests:
            if test['name'].lower().find(payload.lower()) > -1:
                tests_.append(test)
        return self.web.json_response(self.formatResponse(tests_))

    async def searchSuites(self, search_term):
        payload = await search_term.json()
        payload = payload['search_term']
        suites = self._getSuites()
        suites_ = []
        for suite in suites:
            if suite['name'].lower().find(payload.lower()) > -1:
                suites_.append(suite)
        return self.web.json_response(self.formatResponse(suites_))


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
