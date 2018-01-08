import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestScreen, SuiteScreen, screenRender, TestResultScreen } from '@screens';
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
        TestResultScreen,
        AutocompleteComponent
    ],
    providers: [
        BackendService
    ],
    entryComponents: [
        TestScreen,
        SuiteScreen,
        TestResultScreen,
    ],
    exports: [
        screenRender,
        TestScreen,
        SuiteScreen,
        TestResultScreen,
        AutocompleteComponent
    ]
})

export class ScreenModule { }
