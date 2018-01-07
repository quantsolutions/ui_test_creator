/**
 * This is used to render workflow events with their functions, models and html.
 */

import { Component, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { screenTypes } from './screenModels';
import { Screen } from './screen.model';
import { Confirm } from '@utils';
import * as $ from 'jquery';

@Component({
    selector: 'screen-render',
    templateUrl: './screenRender.component.html'
})

export class screenRender {
    @Input('type') type: any;                                                    // The type of screen, must be defined in screenModels.
    @ViewChild('layout', { read: ViewContainerRef }) layout: ViewContainerRef;   // The layout where the screen layout should be applied.
    @Output() saved: EventEmitter<string> = new EventEmitter();                  // Emit the saved event once saved for any screen that is subscribed.
    @Output() closed: EventEmitter<string> = new EventEmitter();                 // Emit the closed event once closed for any screen that is subscribed.
    screenName: string = "Renderer";                                             // Name that should be displayed on the screen header.
    component: Screen;                                                           // Basically the screen.
    screens: any = screenTypes;                                                  // Object containing all the screen and their types.
    openScreen: boolean = false;                                                 // Should the screen be opened and displayed.
    options: any = {};                                                           // The options on the component.
    rendered: boolean = false;                                                   // Once the html has been injected into the layout this will be true and everything may be dislpayed.
    callbacks: any = {};                                                         // Any callbacks that should be run on close, save.

    constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

    /**
     * 
     * @param model - The model to open the screen with.
     * @param callbacks - Optional. Callbacks that should be called upon close and save.
     */
    open(model, callbacks?) {
        this.openScreen = true;
        setTimeout(() => {
            const childComponent = this.componentFactoryResolver.resolveComponentFactory(this.screens[this.type]);
            let componentRef = this.layout.createComponent(childComponent);
            this.rendered = true;
            this.component = <any>componentRef.instance;
            this.screenName = this.component.screenName;
            this.options = this.component.options;
            this.component.model = model;
            if (this.callbacks.rendered) {
                this.callbacks.rendered();
            }
            this.fadeIn();
        }, 1);
    }

    /**
     * When the save button is clicked, save the model and emit and call the open callback.
     */
    save() {
        this.fadeOut();
        this.openScreen = false;
        this.rendered = false;
        if (this.options.save) {
            this.component.model.save();
            setTimeout(() => {
                this.saved.emit(this.component.model.values())
                if (this.callbacks.save) {
                    this.callbacks.save(this.component.model.values());
                }
            }, 500);
        }
    }

    /**
     * When the close button is clicked, emit the closed action and call the close callback.
     */
    close() {
        if (this.component.model.hasChanged()) {
            let confirm = new Confirm("You may have unsaved changes, do you still want to exit ?", {
                header: "Unsaved Changes"
            }, (res) => {
                if (res) {
                    this.fadeOut();
                    this.openScreen = false;
                    this.rendered = false;
                    this.component.model.restoreFromSnapshot();
                    setTimeout(() => {
                        this.closed.emit(this.component.model.values());
                        if (this.callbacks.close) {
                            this.callbacks.close(this.component.model.values());
                        }
                    }, 500);
                }
            });
            confirm.open();
        } else {
            this.fadeOut();
            setTimeout(() => {
                this.closed.emit(this.component.model.values());
                this.openScreen = false;
                this.rendered = false;
                if (this.callbacks.close) {
                    this.callbacks.close(this.component.model.values());
                }
            }, 500);
        }
    }

    /**
     * Let the screen fade out by applying the classes.
     */
    fadeOut() {
        $(".card-screen").removeClass("fadeIn2");
        $(".backdrop-screen").removeClass("fadeIn1");
        $(".card-screen").addClass("fadeOut2");
        $(".backdrop-screen").addClass("fadeOut1");
    }

    /**
     * Let the screen fade in by applying the classes.
     */
    fadeIn() {
        $(".card-screen").removeClass("fadeOut2");
        $(".backdrop-screen").removeClass("fadeOut1");
        $(".card-screen").addClass("fadeIn2");
        $(".backdrop-screen").addClass("fadeIn1");
    }

}
