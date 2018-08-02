import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { BackendService } from '@backend';
import * as $ from 'jquery';
import { Confirm } from '@utils';
import { Test } from '@models';
import { Screen, ImagesScreen, screenRender } from '@screens';

@Component({
    selector: 'test-screen',
    templateUrl: './test.component.html',
})

export class TestScreen extends Screen implements OnInit {
    @ViewChild('nameInput') nameInput: ElementRef;
    @ViewChild('imagesScreen') imagesScreen: screenRender;

    model: Test;
    imageList: Array<{ name: string }> = [];
    delay = 0;

    constructor(private backend: BackendService) {
        super();
        this.screenName = 'Test Case Screen';
    }

    ngOnInit() {
        this.nameInput.nativeElement.focus();
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
            this.model.actions.splice(previousActionIndex, 2, action, this.model.actions[previousActionIndex]);
        } else if (type === 'increase') {
            const nextActionIndex = this.model.actions.indexOf(action) + 1;
            this.model.actions.splice(currentActionIndex, 2, this.model.actions[nextActionIndex], action);
        }
    }

    newImage() {
        this.backend.screenshotTool(this.delay);
    }

    filterTestName() {
        this.model.name = this.model.name.split(' ').map(x => x.toLowerCase()).join('_');
    }

    addAction() {
        this.model.addAction();
    }

    Images(action) {
        this.imagesScreen.open(action.data, {
            save: model => {
                if (model !== null) {
                    action.data = model;
                }
            }
        })
    }
}
