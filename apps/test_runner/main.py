import logging
import sys
import json


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
        'settings_file': os.path.normpath('C:/ProgramData/TingusData/save_files/settings.json')
    }

    parser = argparse.ArgumentParser(description='Tingus Start Options.')
    parser.add_argument('run_test', help='Name of the Test Case or Test Suite to run', type=str)
    parser.add_argument('test_type', help='Test type. test or suite', type=str)
    #parser.add_argument('pg_connection_str', help='postgres connection string (optional)', type=str)

    parser.add_argument('--settings', help='Settings file path', type=str)
    parser.add_argument('--save', help='Save directory path of Tingus data', type=str)
    parser.add_argument('--log_name', help='Define the name of the log', type=str)

    logging.info('Reading command line input...')
    if not len(sys.argv) > 1:
        parser.print_help()
        parser.exit()

    args = parser.parse_args()
    APP['run_test'] = args.run_test
    APP['test_type'] = args.test_type
    if args.settings:
        APP['settings_file'] = args.settings
    if args.save:
        APP['save_folder'] = args.save
    if args.log_name:
        APP['log_name'] = args.log_name
    if args.test_type not in ['test', 'suite']:
        logging.error('Test type should be testcase or testsuite you entered: {}'.format(args.test_type))
        parser.exit()

    APP['settings'] = json.load(open(APP['settings_file']))

    logging.info('Running test engine...')
    runner.Runner(APP)
