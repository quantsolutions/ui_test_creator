import { DBModel } from '@models';

export class User extends DBModel {

    username: string = '';
    user_id: number = null;
    name: string = '';
    user_groups: Array<string> = [];
    session_id: string = '';

    /**
     * @inheritdoc
     */
    constructor(data?) {
        super();

        this._name = 'User';

        this.dbFields = ['user_id', 'name', 'user_groups', 'session_id', 'username'];

        this.saveModel = false;

        this.init(data);
    }
}
