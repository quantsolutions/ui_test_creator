import os
import sys
import logging
import json
import time
import errno
import subprocess
import pyautogui

class Runner:
    """Class Runner main task is to handle running of tests.
    """
    def __init__(self, app_data):
        self.data = app_data
        _logfilename = self.data['settings'].get("testSettings", {}).get("logName", "")
        #print( 'logfilename %s '% (_logfilename ) )
        if _logfilename != "":
            logging.info('Progress will be logged in file %s'%(_logfilename )  )       
            logid = logging.getLogger()
            for hndl in logid.handlers[:]:
                logid.removeHandler( hndl )
            logging.basicConfig(filename=_logfilename,format='%(levelname)s: %(asctime)s %(message)s', level=logging.INFO)           
        else:    
            logging.basicConfig(format='%(levelname)s: %(asctime)s %(message)s', level=logging.INFO)           
                
        logging.info( '------------------')
        
        self.__data_init__()
        self.FileHandling = FileHandling()
        self.run_test(self.data['run_test'], self.data['test_type'])

    def __data_init__(self):
        self.log_name = time.strftime('%Y%m%d_%H%M_%S')
        if 'log_name' in self.data:
            self.log_name = self.data['log_name']

    def run_test(self, test_name, test_type):
        time.sleep(self.data['settings'].get("testSettings", {}).get("runTestDelay", 5))
        result = self._run_test(test_name, test_type)
        with self.FileHandling.safe_open_w(os.path.normpath(self.data['save_folder'] + '/logs/' + self.log_name + '.json')) as fp:
            json.dump(result, fp, indent=4)
    
    
    def _test_name( self,  default_folder , sub_directory, test_name ):
        _testname = os.path.normpath(test_name)
        _name, _ext  = os.path.splitext( _testname )
        if _ext != '.json':
            _testname = '%s%s'%(_name,'.json' )
        if os.path.isfile( _testname ):
            return _testname
        else:    
            _testname= os.path.normpath( default_folder + sub_directory + _testname  )       
            if os.path.isfile( _testname ):
                return _testname
            else:
                logging.error(  'Test file not found %s ',_testname  )
                raise FileNotFoundError
          
       

    def _run_test(self, test_name, test_type):
        results = []
        if test_type == 'suite':
            try:
                json_data = json.load(open(os.path.normpath(self.data['save_folder'] + '/suites/' + test_name + '.json')))
            except FileNotFoundError:
                logging.error('The suite does not exist or the defined test type is incorrect or the save_folder path is not correct.')
                exit()
            except:
                raise

            for index, item in enumerate(json_data['tests']):
                results.append({
                    'name': test_name,
                    'index': index,
                    'type': 'suite',
                    'results': self._run_test(item['name'], item['type'])
                })

        elif test_type == 'test':
            try:
                json_data = json.load(open( self._test_name(self.data['save_folder'], '/tests/',test_name) ))
            except FileNotFoundError:
                logging.error('The test does not exist or the defined test type is incorrect or the save_folder path is not correct.')
                exit()
            except:
                raise
            results.append({
                'name': json_data['name'],
                'index': 0,
                'type': 'test',
                'results': self.test_case_run(json_data)
            })
        
        return results

    def test_case_run(self, model):
        test_result = {
            'failed_actions': [],
            'success_actions': []
        }
        _found = 0    
        _confidence = 0.9
        for index, action in enumerate(model['actions']):
            _found = 1
            if action['action'] in ['click', 'rclick', 'doubleclick', 'wait', 'clickwait', 'waitvanish']:
                image_meta = ImageJson(action['data'], self.data['save_folder'])
                action_delay = int(action['delay']) + self.data['settings'].get("testSettings", {}).get('actionDelayOffset', 0)
            try:
                if action['action'] == 'click':
                    _image_path =  os.path.normpath(self.data['save_folder'] + '/images/' + action['data'] + '.png' ) 
                    logging.info( 'Looking for pattern %s delay %s' % ( _image_path, action_delay ))
                    for _ in range(int(action.get('repeat', '1'))):
                        time.sleep( action_delay)
                        place = pyautogui.locateOnScreen( _image_path, confidence = _confidence,grayscale=True )  # grayscale a bit faster.
                        _my_confidence = _confidence
                        while ( place == None ) and ( _my_confidence > 0.5 ):                            
                            logging.info( ' !!!!!! Reducing confidence level for %s .  Confidence level %s '%(_image_path,_my_confidence) )
                            place = pyautogui.locateOnScreen( _image_path, confidence = _my_confidence, grayscale = False )
                            _my_confidence = _my_confidence- 0.1
                        
                        if place == None:
                            _errmess = "Cannot locate image %s. Please check that your application is located on the primary screen.\nYour image file might also be out of date." % (_image_path)                                
                            raise NameError( _errmess )
                        else:    
                            logging.info( 'clicking image %s.  Confidence level %s. '%(_image_path,_my_confidence) )
                        pyautogui.click( pyautogui.center( place ) )
                        
                elif action['action'] == 'rclick':
                    for _ in range(int(action.get('repeat', '1'))):
                        _image_path =  os.path.normpath(self.data['save_folder'] + '/images/' + action['data'] + '.png' ) 
                        _wait(_image_path, action_delay)
                        place = pyautogui.locateCenterOnScreen( _image_path, confidence = _confidence )
                        pyautogui.rightClick( place )
                elif action['action'] == 'doubleclick':
                    for _ in range(int(action.get('repeat', '1'))):
                        _image_path =  os.path.normpath(self.data['save_folder'] + '/images/' + action['data'] + '.png' ) 
                        _wait(_image_path, action_delay)
                        place = pyautogui.locateCenterOnScreen( _image_path, confidence = _confidence )
                        pyautogui.doubleClick( place )                    
                elif action['action'] == 'wait':
                    for _ in range(int(action.get('repeat', '1'))):
                        _wait(os.path.normpath(self.data['save_folder'] + '/images/' + action['data'] + '.png'), action_delay)
                elif action['action'] == 'clickwait':
                    for _ in range(int(action.get('repeat', '1'))):
                        _image_path =  os.path.normpath(self.data['save_folder'] + '/images/' + action['data'] + '.png' ) 
                        _wait(_image_path, action_delay)                        
                        place = pyautogui.locateCenterOnScreen( _image_path, confidence = _confidence )
                        pyautogui.click( place )                              
                elif action['action'] == 'type':
                    for _ in range(int(action.get('repeat', '1'))):
                        pyautogui.typewrite(action['data'])
                elif action['action'] == 'keycombo':
                    keys = action['data'].split('+')
                    for _ in range(int(action.get('repeat', '1'))):
                        pyautogui.hotkey(*keys)
                elif action['action'] == 'keypress':
                    for _ in range(int(action.get('repeat', '1'))):
                        pyautogui.typewrite(action['data'])
                elif action['action'] == 'typetab':
                    for _ in range(int(action.get('repeat', '1'))):
                        pyautogui.typewrite(action['data'])
                        pyautogui.hotkey('tab')
                elif action['action'] == 'sleep':
                    for _ in range(int(action.get('repeat', '1'))):
                        time.sleep(int(action['data']))
                elif action['action'] == 'close':
                    for _ in range(int(action.get('repeat', '1'))):
                        pyautogui.hotkey('alt', 'f4')
                elif action['action'] == 'command':
                    for _ in range(int(action.get('repeat', '1'))):
                        self._runCommandAction(action['data'])
                test_result['success_actions'].append({
                    'index': index,
                    'action': action['action'],
                    'data': action['data'],
                })
            except Exception as ex:
                logging.error(ex)
                test_result['failed_actions'].append({
                    'index': index,
                    'action': action['action'],
                    'data': action['data'],
                    'error': str(ex.__doc__)
                })
                sys.exit( -1 )
                return 
        #self.sema.update_status( 0, '{ "exit_code": "0"}' ) 
        
        if _found == 0:
            logging.error( 'Unknown action % '%(model['actions']))
        sys.exit( 0 )
        return test_result

    def _runCommandAction(self, commandActionName):
        json_data = open(os.path.normpath(self.data['save_folder'] + '/command_actions/' + commandActionName + '.json'))
        data = json.load(json_data)
        if data['type'] == 'batch':
            subprocess.run(data['data'])


class ImageJson:
    """Class ImageJson makes it easier to get a image and its metadata.
    """
    def __init__(self, image_name, save_path):
        self.save_path = save_path
        self.image_meta = self._read_json(image_name)

    def _read_json(self, image_name):
        with open(os.path.normpath(self.save_path + '/images/' + image_name + '.json')) as f:
            return json.load(f)

    def get_click_offset(self):
        return self.image_meta['clickOffset']


class FileHandling:
    """Better why to handle files that needs to be saved etc.
    The function below safe_open_w() take a path and will check if path exist.
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
        """Open "path" for writing, creating any parent directories as needed.
        """
        self._mkdir_p(os.path.dirname(path))
        return open(path, 'w')

    def safe_create_path(self, path):
        """Create Path give if doesn't exist
        """
        self._mkdir_p(os.path.dirname(path))
        return path
