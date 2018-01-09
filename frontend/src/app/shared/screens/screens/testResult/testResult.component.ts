import { NgModule, Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { BackendService } from '@backend';
import * as $ from 'jquery';
import { AutocompleteComponent, Confirm } from '@utils';
import { Test } from '@models';
import { Screen } from '@screens';
import { wsURL, ACTIONS } from '@constants';

@Component({
    selector: 'testResult-screen',
    templateUrl: './testResult.component.html',
})

export class TestResultScreen extends Screen implements OnInit {
    results: Array<any> = [];
    ws: WebSocket;
    model: any;

    constructor(private backend: BackendService) {
        super();
        this.noModel = true;
        this.options.save = false;
        this.screenName = "Test Results"
    }

    ngOnInit() {
        this.backend.runTestSuite(this.model).then(res => {
            this.results = this.traverseTests(res.data);
            console.log('xxxxxxxxxxxxxxxxxxxx');
            console.log(res.data);
            console.log(this.results);
            console.log('xxxxxxxxxxxxxxxxxxxx');            
        });
    }

    getAction(action_value) {
        return ACTIONS.find(action => action.value === action_value).name;
    }

    traverseTests(test, target=[]) {
        test.forEach(t => {
            if(t.type === 'suite') {
                this.traverseTests(t.results, target);
            } else if (t.type === 'test') {
                target.push(t);
            }
        })
        return target;
    }
}
