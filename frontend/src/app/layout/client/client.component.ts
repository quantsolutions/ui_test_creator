import { Component } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { Test } from '../../shared/models/models';
import { BackendService } from '../../shared/backend/backend.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-client',
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.scss'],
    animations: [routerTransition()]
})
export class ClientComponent {
    tests: Array<Test> = [];
    ws: WebSocket;
    session_id: string = null;
    selectedTest: Test = null;
    openTest: boolean = false;
    constructor(private backend: BackendService) { }

    ngOnInit() {
        this.refreshTests();
    }

    refreshTests(): void {
        this.backend.getTests().then(e => {
            if (e.result && e.data) {
                this.tests = e.data.map(x => new Test(x));
            }
        });
    }

    testClose(refresh) {
        if (refresh) {
            this.refreshTests();
        }
        this.openTest = false;
    }

    print(a) {
        console.log(a);
    }

    newTest() {
        this.selectedTest = null;
        this.openTest = true;
    }

    searchTests(searchTerm) {
        if (searchTerm.length >= 3 || searchTerm.length === 0) {
            this.backend.searchTests(searchTerm)
                .then(res => {
                    console.log(res);
                    if (res.result && res.data) {
                        this.tests = res.data.map(x => new Test(x));
                    }
                })
        }
    }

    testClicked(test: Test): void {
        if (test === this.selectedTest) {
            this.openTest = true;
        } else {
            this.selectedTest = test;
        }
    }
}
