import logging
import sys
import json

#print ('VERSION '+sys.version )


logging.basicConfig(format='%(levelname)s: %(asctime)s %(message)s', level=logging.INFO)
logging.info('Starting...')

if sys.platform.startswith('linux'):
    logging.error('Cannot run on non Windows env :\'-(. Linux OS Detected.')
    exit()
else:
    import argparse
    import os
    logging.info('Importing modules...')
    import runner

    # Setup APP Settings and data. Save Folder and Settings File paths are default paths from Tingus GUI app
    APP = {
        'status': 'Starting',
        'save_folder': os.path.normpath(os.getenv("PROGRAMDATA") + '/TingusData' + '/save_files/'),
        'settings_file': os.path.normpath('C:/ProgramData/TingusData/save_files/settings.json'),
        
    }
    


    parser = argparse.ArgumentParser(description='Tingus Start Options.')
    parser.add_argument('run_test', help='Name of the Test Case or Test Suite to run', type=str)
    parser.add_argument('test_type', help='Test type. test or suite', type=str)
    #parser.add_argument('pg_connection_str', help='postgres connection string (optional)', type=str)

    parser.add_argument('--settings', help='Settings file path', type=str)
    parser.add_argument('--save', help='Save directory path of Tingus data', type=str)
    parser.add_argument('--log_name', help='Define the name of the log', type=str)
    parser.add_argument('--save_folder', help='Define the name of the log', type=str)
    
    


    
    
    logging.info('Reading command line input...')
    if not len(sys.argv) > 1:
        parser.print_help()
        parser.exit()
        
    args = parser.parse_args()
    
    ## -------------------- find the settings file
    i = 1
    while i < 3:
        if i == 1:
           if args.settings != None: 
               _settings_file = args.settings+'/settings.json'            
           else:    
               i = 2
               continue
               #_settings_file = os.getcwd()+ '/settings.json'
        elif i == 2:  
           _settings_file = APP['settings_file']
        _settings_file = os.path.normpath( _settings_file  )               
        #print( 'Settings file: '+_settings_file ) 
        if os.path.isfile( _settings_file ):
            APP['settings_file'] = _settings_file            
            break
        else:
            i = i + 1
            if i == 3:
               print( 'CONFIG ISSUE:  Settings file not found. ') 
               os.system("pause")
               sys.exit(-1)
    

    
    
    #print( 'Settings file: '+_settings_file ) 
    APP['run_test'] = args.run_test
    APP['test_type'] = args.test_type         
    #if args.settings:
    #    APP['settings_file'] = args.settings
    #if args.save:
    #    APP['save_folder'] = args.save

    if args.test_type not in ['test', 'suite']:
        logging.error('Test type should be testcase or testsuite you entered: {}'.format(args.test_type))
        parser.exit()
       
    
    #_hndl = open( _settings_file )
    #print( 'after '+ _settings_file )
    #APP['settings'] = json.load(_hndl)     
    #print( APP['settings_file' ] )
     
    _hndl = open(APP['settings_file'], 'r')
    APP['settings'] = json.load(_hndl)    

    logging.info('Running test engine...')
    runner.Runner(APP)
