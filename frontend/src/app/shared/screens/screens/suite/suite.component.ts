import { NgModule, Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { BackendService } from '@backend';
import * as $ from 'jquery';
import { AutocompleteComponent, Confirm } from '@utils';
import { TestSuite } from '@models';
import { Screen } from '@screens';

@Component({
    selector: 'suite-screen',
    templateUrl: './suite.component.html',
})

export class SuiteScreen extends Screen implements OnInit {
    @ViewChild('nameInput') nameInput: ElementRef;
    model: TestSuite;
    suites: Array<any> = [];
    tests: Array<any> = [];

    constructor(private backend: BackendService) {
        super();
        this.model = new TestSuite();
        this.screenName = 'Suite Screen';
    }

    ngOnInit() {
        this.backend.getSuites().then(x => {
            this.suites = x.data;
        });

        this.backend.getTests().then(x => {
            this.tests = x.data;
        });

        this.nameInput.nativeElement.focus();
    }

    filterSuiteName() {
        this.model.name = this.model.name.split(' ').map(x => x.toLowerCase()).join('_');
    }

    removeTest(test) {
            let popup = new Confirm("Are you sure you wish to remove this test ?", { header: "Remove test Confirmation" }, (res) => {
                if (res) {
                    this.model.tests.splice(this.model.tests.indexOf(test), 1);
                }
            });
            popup.open();
    }

    addTestOrSuite(testOrSuite) {
        this.model.addTestOrSuite(testOrSuite);
    }
}
