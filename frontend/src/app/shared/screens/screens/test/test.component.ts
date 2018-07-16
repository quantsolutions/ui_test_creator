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
    imageList: Array<{ name: string }> = [];
    delay = 0;

    constructor(private backend: BackendService) {
        super();
        this.screenName = 'Test Cases';
    }

    ngOnInit() {
        this.nameInput.nativeElement.focus();
        this.backend.getImages().then(res => this.imageList = res.data);
    }

    removeAction(action) {
        const popup = new Confirm('Are you sure you wish to remove this action ?', {
            header: 'Remove action Confirmation'
        }, (res) => {
            if (res) {
                this.model.actions.splice(this.model.actions.indexOf(action), 1);
            }
        });
        popup.open();
    }

    moveActionIndex(action, type) {
        const currentActionIndex = this.model.actions.indexOf(action);
        console.log(currentActionIndex)
        if (type === 'decrease') {
            const previousActionIndex = this.model.actions.indexOf(action) - 1;
            this.model.actions.splice(previousActionIndex, 2, action, this.model.actions[previousActionIndex])
        } else if (type === 'increase') {
            const nextActionIndex = this.model.actions.indexOf(action) + 1;
            this.model.actions.splice(currentActionIndex, 2, this.model.actions[nextActionIndex], action)
        }
    }

    newImage(delay) {
        this.backend.screenshotTool(delay);
    }

    filterTestName() {
        this.model.name = this.model.name.split(' ').map(x => x.toLowerCase()).join('_');
    }

    addAction() {
        this.model.addAction();
    }
}
