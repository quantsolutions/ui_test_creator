import { COMMANDTYPES } from '@constants';

export class CommandAction {
    name: string = '';
    description: string = '';
    type: string = '';
    data: string = '';

    commandTypes: Array<any> = COMMANDTYPES;

    constructor(data_?) {
        if (data_) {
            this.name = data_.name;
            this.description = data_.description;
            this.type = data_.type;
            this.data = data_.data;
        }
    }
}

export default CommandAction;
