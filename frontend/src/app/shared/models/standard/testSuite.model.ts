import { Model } from './model.model';
import { SUITETEST } from '../constants';
// Basic rule for backend calls from a model. If it has something to do with the patietns data like documents then it should be done here,
// otherwise anything else like telemeds, notificaions should be retrieved using the apiService.

/**
 * @classdesc The patient model. This is what the whole grandcentral is about, this guy 8-) ...
 * @param data_ The data to initialize the class with.
 * @extends Model
 * @inheritdoc Model
 */
export class TestSuite extends Model {
    /**
     * Fields for this model. These define the model, with the dbFields.
     */
    description: string = "";        // Describe what the test must do.
    name: string = "";               // Name of the test.
    tests: Array<SUITETEST> = [];    // The action that must be performed.
    selected: boolean = false;       // Have the test been selected.

    /**
     * Constructor of the Patient Class.
     * @param data Data to initialize the class with.
     */
    constructor(data_?) {
        super();

        // Set the dbFields.
        this.dbFields = [
            "description",
            "tests",
            "name",
        ];

        // Update the model with the data.
        this.update(data_);
    }

    save() {
        this.serverPost('saveTestSuite', { model: this.values() });
    }

    addTest(testName) {
        this.tests.push({ type: 'test', name: testName, order: 1 })
    }

    addSuite(suiteName) {
        // let test = this.tests.sort((a: any, b: any) => {
        //     if (a.order < b.order) {
        //         return -1;
        //     } else if (a.order > b.order) {
        //         return 1;
        //     } else {
        //         return 0;
        //     }
        // });
        // let num = test.splice(-1)[0].order + 1;
        this.tests.push({ type: 'suite', name: suiteName, order: 1 });
    }

    load() {
        this.serverPost('loadTestSuite', { test_name: this.name }).then(data => {
            this.update(data.data);
        });
    }

    run() {
        setTimeout(() => this.serverPost('runTestSuite', { model: this.values() }), 3000);
    }
}
