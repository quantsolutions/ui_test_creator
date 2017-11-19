import { NgModule, Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { BackendService } from '../../../shared/backend/backend.service';
import { Popup } from '../../../shared/utils/ui';
import * as $ from 'jquery';
import { AutocompleteComponent } from '../../../shared/utils/autocomplete.component';
import { Test } from '../../../shared/models/models';

@Component({
    selector: 'test-screen',
    templateUrl: './test.component.html',
    animations: [routerTransition()],
})

export class TestScreen implements OnInit {
    @ViewChild('nameInput') nameInput: ElementRef;
    @Output() close: EventEmitter<any> = new EventEmitter();
    @Input() test_ : Test = null;
    test: Test;

    ngOnInit() {
        if (this.test_) {
            this.test = this.test_ ;
            this.test.load();
        } else {
            this.test = new Test();
        }
        this.nameInput.nativeElement.focus();
    }

    closeScreen(update=false) {
        if (this.test.hasChanged()) {
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
                    this.test.update(this.test.snapshot);
                    setTimeout(() => this.close.emit(update), 500);
                }
            });
            popup.open();
        } else {
            this.fadeOut();
            setTimeout(() => this.close.emit(update), 500);
        }
    }

    removeAction(action) {
            let popup = new Popup("Are you sure you wish to remove this action ?", {
                header: "Remove action Confirmation", buttons: [
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
                    this.test.actions.splice(this.test.actions.indexOf(action), 1);
                }
            });
            popup.open();
    }

    filterTestName() {
        this.test.name = this.test.name.split(' ').map(x => x[0].toUpperCase() + x.slice(1, x.length)).join('');
    }

    addAction() {
        this.test.addAction();
    }

    addScreenShot() {
        this.test.addScreenShot();
    }

    fadeOut() {
        $(".card").removeClass("fadeIn2");
        $(".backdrop").removeClass("fadeIn1");
        $(".card").addClass("fadeOut2");
        $(".backdrop").addClass("fadeOut1");
    }

    saveTest() {
        this.test.save().then(() => this.closeScreen());
    }
}
