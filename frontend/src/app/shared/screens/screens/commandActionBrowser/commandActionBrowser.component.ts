import { Component, OnInit, Input } from '@angular/core';
import { Screen } from '@screens';
import { BackendService } from '@backend';

@Component({
    selector: 'command-action-browser-screen',
    templateUrl: './commandActionBrowser.component.html'
})

export class CommandActionBrowserScreen extends Screen implements OnInit {
    @Input() commandActionSelected: string;

    backendCommandActions: any;
    frontendCommandActions: any;
    selectedCommandAction: any = 'None';
    constructor(private backend: BackendService) {
        super();
        this.screenName = 'Command Action Browser Screen'
        this.noModel = true;
    }

    ngOnInit(): void {
        this.backend.getCommandActions().then(e => {
            if (e.result && e.data) {
                this.backendCommandActions = e.data;
                this.getSelectedCommandAction(this.model);
                this.frontendCommandActions = this.backendCommandActions;
            } else {
                console.error(e.result);
                console.error(e.data);
            }
        })
    }

    selectCommandAction(commandActoin) {
        this.model = String(commandActoin);
        this.getSelectedCommandAction(this.model);
    }

    getSelectedCommandAction(commandAction) {
        this.selectedCommandAction = this.backendCommandActions.filter(cmd => cmd.name === commandAction)[0];
    }

    searchCommandActions(searchTerm) {
        if (searchTerm.length >= 1) {
            this.frontendCommandActions = this.backendCommandActions.filter(cmd => cmd.name.includes(searchTerm));
        } else {
            this.frontendCommandActions = this.backendCommandActions;
        }
    }
}
