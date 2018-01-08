import { NgModule, Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { BackendService } from '@backend';
import * as $ from 'jquery';
import { AutocompleteComponent, Confirm } from '@utils';
import { Test } from '@models';
import { Screen } from '@screens';
import { wsURL } from '@constants';

@Component({
    selector: 'testResult-screen',
    templateUrl: './testResult.component.html',
})

export class TestResultScreen extends Screen implements OnInit {
    results: Array<any> = [];
    ws: WebSocket;

    constructor() {
        super();
        this.noModel = true;
    }

    ngOnInit() {
        this.ws = new WebSocket(wsURL);
        this.ws.onopen = () => console.info('Connection Successful for test Result ...');
        this.ws.onmessage = (msg) => console.log(msg);
        this.ws.onclose = () => console.info('Connection Closed for test Result ...');
    }
}
