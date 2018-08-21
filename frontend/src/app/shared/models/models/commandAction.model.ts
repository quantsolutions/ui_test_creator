import { COMMANDTYPES } from '@constants';
import { BackendService } from '@backend';
import { DBModel } from '@models';

export class CommandAction extends DBModel {
    name: string = '';
    description: string = '';
    type: string = '';
    data: string = '';


    commandTypes: Array<any> = COMMANDTYPES;

    constructor(data_?) {
        super()
        if (data_) {
            this.name = data_.name;
            this.description = data_.description;
            this.type = data_.type;
            this.data = data_.data;
        }
    }

    save() {
        return this.serverPost('saveCommandAction', {name: this.name, description: this.description, type: this.type, data: this.data})
    }
}

export default CommandAction;
