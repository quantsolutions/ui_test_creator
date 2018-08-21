import { Component, OnInit } from '@angular/core';
import { Screen } from '@screens';
import { BackendService } from '@backend';
import { CommandAction } from '@models';

@Component({
    selector: 'command-action-screen',
    templateUrl: 'commandAction.componet.html'
})

export class CommandActionScreen extends Screen implements OnInit {
    model: CommandAction;
    constructor(private backend: BackendService) {
        super();
        this.screenName = 'Command Action - Edit Screen';
        this.options.closeConfirm = false;
    }

    ngOnInit(): void {
        console.log(this.model)
    }

    filterCommandActionName() {
        this.model.name = this.model.name.split(' ').map(x => x.toLowerCase()).join('_');
    }

}
