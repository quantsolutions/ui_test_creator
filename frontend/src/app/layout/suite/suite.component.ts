import { Component } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { TestSuite } from '../../shared/models/models';
import { BackendService } from '../../shared/backend/backend.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-suite',
    templateUrl: './suite.component.html',
    styleUrls: ['./suite.component.scss'],
    animations: [routerTransition()]
})
export class SuiteComponent {
    suites: Array<TestSuite> = [];
    session_id: string = null;
    selectedSuite: TestSuite = null;
    selectedSuites: Array<TestSuite> = [];
    openSuite: boolean = false;
    constructor(private backend: BackendService) { }

    ngOnInit() {
        this.refreshSuites();
    }

    refreshSuites(): void {
        this.backend.getSuites().then(e => {
            if (e.result && e.data) {
                this.suites = e.data.map(x => new TestSuite(x));
            }
        });
    }

    runTestSuite() {
        let suite = this.selectedSuites.map(x => {
            return {name: x.name, type: 'suite'};
        })
        this.backend.runTestSuite({ model: { tests: suite } });
    }

    suiteClose(refresh) {
        this.refreshSuites();
        this.openSuite = false;
    }

    print(a) {
        console.log(a);
    }

    newTest() {
        this.selectedSuite = null;
        this.openSuite = true;
    }

    searchSuites(searchTerm) {
        if (searchTerm.length >= 3 || searchTerm.length === 0) {
            this.backend.searchTests(searchTerm)
                .then(res => {
                    console.log(res);
                    if (res.result && res.data) {
                        this.suites = res.data.map(x => new TestSuite(x));
                    }
                })
        }
    }

    testClicked(suite: TestSuite): void {
        if (suite === this.selectedSuite) {
            this.openSuite = true;
        } else {
            this.selectedSuite = suite;
        }
    }
}
