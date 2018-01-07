import { Popup } from '@utils'

var ALREADY_OPEN = false;

export class Alert extends Popup {
    constructor(msg = "", options = {}, callback = null) {
        super(msg, options, callback);
        this.options.buttons = [
            {
                name: "Ok",
                class: "btn btn-success pull-right",
                callback: null,
                return: true,
                close: true
            }
        ]
    }
}

export default Alert;
