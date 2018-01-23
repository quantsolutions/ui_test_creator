import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../shared/backend/backend.service';
import { FormControl } from '@angular/forms';
import { routerTransition } from '@animations';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})

export class DashboardComponent implements OnInit {
    testSuiteCount: string = '0'
    testCaseCount: string = '0'

    constructor(private backend: BackendService) { }

    ngOnInit() {
        this.backend.getTestsCount().then(res => this.testCaseCount = res.data);
        this.backend.getSuitesCount().then(res => this.testSuiteCount = res.data);
    }
}