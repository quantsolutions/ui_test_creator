import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestScreen, SuiteScreen, screenRender } from '@screens';
import { FormsModule } from '@angular/forms';
import { BackendService } from '@backend';
import { AutocompleteComponent } from '@utils';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        screenRender,
        TestScreen,
        SuiteScreen,
        AutocompleteComponent
    ],
    providers: [
        BackendService
    ],
    entryComponents: [
        TestScreen,
        SuiteScreen,
    ],
    exports: [
        screenRender,
        TestScreen,
        SuiteScreen,
        AutocompleteComponent        
    ]
})

export class ScreenModule { }
