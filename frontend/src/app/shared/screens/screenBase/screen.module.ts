import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestScreen, SuiteScreen, screenRender, TestResultScreen, ImagesScreen, CommandActionScreen } from '@screens';
import { FormsModule } from '@angular/forms';
import { BackendService } from '@backend';
import { AutocompleteComponent } from '@utils';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    declarations: [
        screenRender,
        TestScreen,
        SuiteScreen,
        TestResultScreen,
        AutocompleteComponent,
        ImagesScreen,
        CommandActionScreen,
    ],
    providers: [
        BackendService
    ],
    entryComponents: [
        TestScreen,
        SuiteScreen,
        TestResultScreen,
        ImagesScreen,
        CommandActionScreen,
    ],
    exports: [
        screenRender,
        TestScreen,
        SuiteScreen,
        TestResultScreen,
        AutocompleteComponent,
        ImagesScreen,
        CommandActionScreen,
    ]
})

export class ScreenModule { }
