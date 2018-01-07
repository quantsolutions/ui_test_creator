import { Popup } from '@utils'

var ALREADY_OPEN = false;

export class Confirm extends Popup {
    constructor(msg = "", options = {}, callback = null) {
        super(msg, options, callback);
        this.options.buttons = [
            {
                name: "Ok",
                class: "btn btn-success pull-right",
                callback: null,
                return: true,
                close: true
            },
            {
                name: "Cancel",
                class: "btn btn-danger pull-left",
                callback: null,
                return: false,
                close: true
            }
        ]
        this.options.input_type = "text";
    }
}

export default Confirm;