import { NgModule, Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { BackendService } from '@backend';
import * as $ from 'jquery';
import { AutocompleteComponent, Confirm } from '@utils';
import { Test } from '@models';
import { Screen } from '@screens';

@Component({
    selector: 'test-screen',
    templateUrl: './test.component.html',
})

export class TestScreen extends Screen implements OnInit {
    @ViewChild('nameInput') nameInput: ElementRef;
    model: Test;

    constructor() {
        super();
    }

    ngOnInit() {
        this.nameInput.nativeElement.focus();
        console.log('OPEN !!!');
    }

    removeAction(action) {
        let popup = new Confirm("Are you sure you wish to remove this action ?", {
            header: "Remove action Confirmation"
        }, (res) => {
            if (res) {
                this.model.actions.splice(this.model.actions.indexOf(action), 1);
            }
        });
        popup.open();
    }

    filterTestName() {
        this.model.name = this.model.name.split(' ').map(x => x.toLowerCase()).join('_');
    }

    addAction() {
        this.model.addAction();
    }

    addScreenShot() {
        this.model.addScreenShot();
    }
}
