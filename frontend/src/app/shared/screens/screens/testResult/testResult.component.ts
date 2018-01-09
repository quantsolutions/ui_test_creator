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
    results: Array<any> = [];  // The results of the tests.

    constructor(private backend: BackendService) {
        super();
        this.noModel = true;                // This Screen does not have a valid model.
        this.options.save = false;          // Dont show the save button.
        this.screenName = "Test Results";   // Name of the screen.
    }

    ngOnInit() {
        this.backend.runTestSuite(this.model).then(res => {
            this.results = this.traverseTests(res.data);          
        });
    }

    /**
     * From the actions array find the name of the action matching the value.
     * @param {string} action_value - The value of the action to find.
     * @returns {string}
     */
    getAction(action_value) {
        return ACTIONS.find(action => action.value === action_value).name;
    }

    /**
     * Recursive function that traverses a test/suite array and only returns the tests in a target array.
     * @param {array} test - The test/suites to traverse.
     * @param {array} target - The target array to put all the tests in, will recursive call the function with this array.
     * @returns {array} target array.
     */
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
