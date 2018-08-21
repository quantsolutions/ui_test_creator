import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '@animations';
import { BackendService } from '@backend';
import { CommandAction } from '@models';
import { screenRender } from '@screens';

@Component({
    selector: 'app-command-action',
    templateUrl: './command-action.component.html',
    styleUrls: ['./command-action.component.scss'],
    animations: [routerTransition()]

})

export class CommandActionComponent implements OnInit {
    @ViewChild('commandActionScreen') commandActionScreen: screenRender;
    selectedCommandAction: CommandAction = null;
    commandActionList: Array<CommandAction> = [];

    constructor(private backend: BackendService) { }

    ngOnInit() {
        this.refreshCommandActions();
    }

    refreshCommandActions(): void {
        this.backend.getCommandActions().then(e => {
            if (e.result && e.data) {
                this.commandActionList = e.data.map(x => new CommandAction(x));
            }
        });
    }

    searchCommandActions(searchTerm) {
        if (searchTerm.length >= 3) {
            this.backend.searchTests(searchTerm)
                .then(res => {
                    if (res.result && res.data) {
                        this.commandActionList = res.data.map(x => new CommandAction(x));
                    }
                })
        } else {
            this.refreshCommandActions();
        }
    }

    newCommandAction() {
        this.selectedCommandAction = new CommandAction();
        this.commandActionScreen.open(this.selectedCommandAction);
        this.refreshCommandActions()
    }

    openCommandAction(command) {
        this.commandActionScreen.open(command);
        this.refreshCommandActions()
    }
}
