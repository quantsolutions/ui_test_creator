import { NgModule, Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { BackendService } from '../../../shared/backend/backend.service';
import { Popup } from '../../../shared/utils/ui';
import * as $ from 'jquery';
import { AutocompleteComponent } from '../../../shared/utils/autocomplete.component';
import { TestSuite } from '../../../shared/models/models';

@Component({
    selector: 'suite-screen',
    templateUrl: './suite.component.html',
    animations: [routerTransition()],
})

export class SuiteScreen implements OnInit {
    @ViewChild('nameInput') nameInput: ElementRef;
    @Output() close: EventEmitter<any> = new EventEmitter();
    @Input() suite_ : TestSuite = null;
    suite: TestSuite;
    suites: Array<any> = [];
    tests: Array<any> = [];

    constructor(private backend: BackendService) { }

    ngOnInit() {
        if (this.suite_) {
            this.suite = this.suite_ ;
            this.suite.load();
        } else {
            this.suite = new TestSuite();
        }

        this.backend.getSuites().then(x => {
            this.suites = x.data;
        });

        this.backend.getTests().then(x => {
            this.tests = x.data;
        });

        this.nameInput.nativeElement.focus();
    }

    closeScreen(update=false) {
        if (this.suite.hasChanged()) {
            let popup = new Popup("You may have unsaved changes, do you still want to exit ?", {
                header: "Unsaved Changes", buttons: [
                    {
                        name: "Yes",
                        close: true,
                        return: true,
                        class: "btn btn-success pull-left"
                    },
                    {
                        name: "No",
                        close: true,
                        return: false,
                        class: "btn btn-danger pull-right"
                    }
                ]
            }, (res) => {
                if (res) {
                    this.fadeOut();
                    this.suite.update(this.suite.snapshot);
                    setTimeout(() => this.close.emit(update), 500);
                }
            });
            popup.open();
        } else {
            this.fadeOut();
            setTimeout(() => this.close.emit(update), 500);
        }
    }

    filterSuiteName() {
        this.suite.name = this.suite.name.split(' ').map(x => x[0].toUpperCase() + x.slice(1, x.length)).join('');
    }

    addTestOrSuite(testOrSuite) {
        this.suite.addTestOrSuite(testOrSuite);
    }

    fadeOut() {
        $(".card").removeClass("fadeIn2");
        $(".backdrop").removeClass("fadeIn1");
        $(".card").addClass("fadeOut2");
        $(".backdrop").addClass("fadeOut1");
    }

    saveSuite() {
        this.suite.save().then(() => this.closeScreen());
    }
}
