import { Component, ViewChild } from '@angular/core';
import { routerTransition } from '@animations';
import { Test } from '@models';
import { BackendService } from '@backend';
import { FormControl } from '@angular/forms';
import { screenRender } from '@screens';

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss'],
    animations: [routerTransition()]
})

export class TestComponent {
    tests: Array<Test> = [];
    ws: WebSocket;
    session_id: string = null;
    selectedTest: Test = null;
    selectedTests: Array<Test> = [];
    openTest: boolean = false;
    @ViewChild("testScreen") testScreen: screenRender;

    constructor(private backend: BackendService) { }

    ngOnInit() {
        this.refreshTests();
        this.testScreen.closed.subscribe(() => this.refreshTests());
        this.testScreen.saved.subscribe(() => this.refreshTests());
    }

    refreshTests(): void {
        this.backend.getTests().then(e => {
            if (e.result && e.data) {
                this.tests = e.data.map(x => new Test(x));
            }
        });
    }

    runTestSuite() {
        let test = this.selectedTests.map(x => {
            return { name: x.name, type: 'test' };
        })
        this.backend.runTestSuite({ model: { tests: test } })
    }

    newTest() {
        this.selectedTest = new Test();
        this.testScreen.open(this.selectedTest);
    }

    searchTests(searchTerm) {
        if (searchTerm.length >= 3) {
            this.backend.searchTests(searchTerm)
                .then(res => {
                    if (res.result && res.data) {
                        this.tests = res.data.map(x => new Test(x));
                    }
                })
        } else {
            this.refreshTests();
        }
    }

    testClicked(test: Test): void {
        if (test === this.selectedTest) {
            this.selectedTest.load();
            this.testScreen.open(this.selectedTest);
        } else {
            this.selectedTest = test;
        }
    }
}
