import { DBModel } from '@models';
import { Action } from '@models';
import { ACTIONS, OPTIONTYPE } from '@constants';
import { Input_ } from '@utils';

// Basic rule for backend calls from a model. If it has something to do with the patietns data like documents then it should be done here,
// otherwise anything else like telemeds, notificaions should be retrieved using the apiService.

/**
 * @classdesc The patient model. This is what the whole grandcentral is about, this guy 8-) ...
 * @param data_ The data to initialize the class with.
 * @extends Model
 * @inheritdoc Model
 */
export class Test extends DBModel {
    /**
     * Fields for this model. These define the model, with the dbFields.
     */
    description: string = '';       // Describe what the test must do.
    name: string = '';              // Name of the test.
    actions: Array<Action> = [];    // The action that must be performed.
    selected: boolean = false;      // Have the test been selected.


    /**
     * Constructor of the Patient Class.
     * @param data Data to initialize the class with.
     */
    constructor(data_?) {
        super();

        this._name = 'Test';

        // Set the dbFields.
        this.dbFields = [
            'description',
            'actions',
            'name',
        ];

        // Set the modelFields
        this.modelFields = {
            actions: Action
        }

        // Update the model with the data.
        this.init(data_);
    }

    save() {
        this.snapshot = this.toString();
        return this.serverPost('saveTest', { model: this.values() });
    }

    addAction() {
        this.actions.push(new Action());
    }

    load() {
        this.serverPost('loadTest', { test_name: this.name }).then(data => {
            this.update(data.data);
        });
    }

    run() {
        setTimeout(() => this.serverPost('runTest', { model: this.values() }), 3000);
    }
}
