# Global variables
_modulename = 'goodxtest'
DATABASE = 'goodxtest'
import logging
import json
import os
import sys
from PyQt5 import QtWidgets, QtCore, QtGui
import tkinter as tk
from PIL import ImageGrab
import numpy as np
import cv2
from random import *
type_2 = type
from lackey import *
type_ = type
type = type_2

# logging.basicConfig(filename='booking_logfile.log', filemode='w', format='%(asctime)s %(message)s', level=logging.INFO)
logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO)

# Class
class goodxtest():
    def __init__(self, parent, getDatabase):
        self._parent = parent
        self.getDatabase = getDatabase

    def newScreenshot(self, session, file_name='NO_NAME'):
        try:
            app = QtWidgets.QApplication(sys.argv)
            screenSnipper = ScreenSnipper(file_name)
            screenSnipper.show()
            app.exec_()
        except Exception as ex:
            raise Exception(ex)

    def getTests(self, session):
        tests = []
        for file in os.listdir(os.path.normpath(os.getcwd() + '\\tests\\')):
            tests.append({ 'name' : file[:-5], 'type': 'test'})
        return tests

    def getSuites(self, session):
        tests = []
        for file in os.listdir(os.path.normpath(os.getcwd() + '\\suites\\')):
            tests.append({ 'name' : file[:-5], 'type': 'suite'})
        return tests

    def getImages(self, session):
        images = []
        for file in os.listdir(os.path.normpath(os.getcwd() + '\\images\\')):
            images.append(file[:-4])
        return images

    def saveTest(self, session, model):
        with open(os.path.normpath(os.getcwd() + '\\tests\\' + model['name'] + '.json'), 'w') as fp:
            json.dump(model, fp, indent=4)

    def saveTestSuite(self, session, model):
        with open(os.path.normpath(os.getcwd() + '\\suites\\' + model['name'] + '.json'), 'w') as fp:
            json.dump(model, fp, indent=4)

    def loadTestSuite(self, session, test_name):
        return self._load_test_suite(test_name)

    def _load_test_suite(self, test_name):
        json_data = open(os.path.normpath(os.getcwd() + '\\suites\\' + test_name + '.json')).read()
        return json.loads(json_data)

    def loadTest(self, session, test_name):
        return self._load_test(test_name)

    def _load_test(self, test_name):
        json_data = open(os.path.normpath(os.getcwd() + '\\tests\\' + test_name + '.json')).read()
        return json.loads(json_data)

    def runTestSuite(self, session, model):
        # sorted(list_to_be_sorted, key=lambda k: k['order'])
        # Load all the test before you begin to execute them. So that the tests are equally as fast.
        tests = []
        for test in model['tests']:
            if test['type'] == 'suite':
                test_suite = self._load_test_suite(test['name'])
                self.runTestSuite(test_suite)
            elif test['type'] == 'test':
                test_ = self._load_test(test['name'])
                self._run_test(test_)

    def runTest(self, session, model):
        self._run_test(model)

    def _run_test(self, model):
        for action in model['actions']:
            if action['action'] == 'click':
                for k in range(int(action.get('repeat', '1') or '1')):
                    click(os.path.normpath(os.getcwd() + '\\images\\' + action['data'] + '.png'))
            if action['action'] == 'rclick':
                for k in range(int(action.get('repeat', '1') or '1')):
                    rightClick(os.path.normpath(os.getcwd() + '\\images\\' + action['data'] + '.png'))
            if action['action'] == 'doubleclick':
                for k in range(int(action.get('repeat', '1') or '1')):
                    doubleClick(os.path.normpath(os.getcwd() + '\\images\\' + action['data'] + '.png'))
            if action['action'] == 'wait':
                for k in range(int(action.get('repeat', '1') or '1')):
                    wait(os.path.normpath(os.getcwd() + '\\images\\' + action['data'] + '.png'), int(action['delay']))
            if action['action'] == 'clickwait':
                for k in range(int(action.get('repeat', '1') or '1')):
                    click(wait(os.path.normpath(os.getcwd() + '\\images\\' + action['data'] + '.png'), int(action['delay'])))
            if action['action'] == 'type':
                for k in range(int(action.get('repeat', '1') or '1')):
                    type_(action['data'])
            if action['action'] == 'keycombo':
                keys = action['data'].split('+')
                for k in range(int(action.get('repeat', '1') or '1')):
                    type_(keys[-1], '+'.join(keys[:-1]))
            if action['action'] == 'keypress':
                for k in range(int(action.get('repeat', '1') or '1')):
                    type_(action['data'])
            if action['action'] == 'close':
                for k in range(int(action.get('repeat', '1') or '1')):
                    type_('{F4}', '{ALT}')

    def searchTests(self, session, search_term):
        tests = self.getTests(session)
        tests_ = []
        for test in tests:
            if test['name'].lower().find(search_term.lower()) > -1:
                tests_.append(test)
        return tests_

    def searchSuites(self, session, search_term):
        suites = self.getSuites(session)
        suites_ = []
        for suite in suites:
            if suite['name'].lower().find(search_term.lower()) > -1:
                suites_.append(test)
        return suites_

    def login(self, session, username, password):
        # Ensure the user is not logged in.
        if session is None:
            return self._parent.doLogin(DATABASE, username, password)

        # If the user is logged in , logout the user and login again with the new session id. This is 
        else:
            self._parent.doLogout()
            return self._parent.doLogin(DATABASE, username, password)

    def logout(self, session):
        if session is None:
            raise Exception('NOT LOGGED IN')
        else:
            return self._parent.doLogout()

    def getUser(self, session):
        return self._parent.getUser()

    def getLoggedIn(self, session):
        return self._parent.getLoggedIn()

class ScreenSnipper(QtWidgets.QWidget):
    def __init__(self, image_name):
        super().__init__()
        root = tk.Tk()
        self.image_name = image_name
        screen_width = root.winfo_screenwidth()
        screen_height = root.winfo_screenheight()
        self.setGeometry(0, 0, screen_width, screen_height)
        self.setWindowTitle(' ')
        self.begin = QtCore.QPoint()
        self.end = QtCore.QPoint()
        self.setWindowOpacity(0.3)
        QtWidgets.QApplication.setOverrideCursor(
            QtGui.QCursor(QtCore.Qt.CrossCursor)
        )
        # self.setWindowFlags(QtCore.Qt.WindowStaysOnTopHint)
        self.setWindowFlags(QtCore.Qt.FramelessWindowHint)
        self.show()

    def paintEvent(self, event):
        qp = QtGui.QPainter(self)
        qp.setPen(QtGui.QPen(QtGui.QColor('black'), 3))
        qp.setBrush(QtGui.QColor(128, 128, 255, 128))
        qp.drawRect(QtCore.QRect(self.begin, self.end))

    def mousePressEvent(self, event):
        self.begin = event.pos()
        self.end = self.begin
        self.update()

    def mouseMoveEvent(self, event):
        self.end = event.pos()
        self.update()

    def mouseReleaseEvent(self, event):
        self.close()
        try:
            x1 = min(self.begin.x(), self.end.x())
            y1 = min(self.begin.y(), self.end.y())
            x2 = max(self.begin.x(), self.end.x())
            y2 = max(self.begin.y(), self.end.y())

            img = ImageGrab.grab(bbox=(x1, y1, x2, y2))
            img.save(os.getcwd() + '\\images\\' + self.image_name + '.png')
        except:
            print('Failed to save the screen capture')

Module = goodxtest
