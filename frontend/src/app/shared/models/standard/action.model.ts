import { Model } from './model.model';
import { ACTIONS, OPTIONTYPE } from '../constants';
// Basic rule for backend calls from a model. If it has something to do with the patietns data like documents then it should be done here,
// otherwise anything else like telemeds, notificaions should be retrieved using the apiService.

/**
 * @classdesc The patient model. This is what the whole grandcentral is about, this guy 8-) ...
 * @param data_ The data to initialize the class with.
 * @extends Model
 * @inheritdoc Model
 */
export class Action extends Model {
    /**
     * Fields for this model. These define the model, with the dbFields.
     */
    description: string = "";   // Describe what the test must do.
    action: string = "";        // The action that must be performed. 
    data: string = "";          // Data associated with the action.
    delay: string = "";         // Time to delay the action with.
    repeat: number = 1;         // Amount of times to repeat this action.

    actionOptions: Array<OPTIONTYPE> = ACTIONS; // List of actions that can be performed options.

    /**
     * Constructor of the Patient Class.
     * @param data Data to initialize the class with.
     */
    constructor(data_?) {
        super();

        // Set the dbFields.
        this.dbFields = [
            "description",
            "action",
            "data",
            "delay",
            "repeat"
        ];

        // Update the model with the data.
        this.update(data_);
    }
}

export default Action;