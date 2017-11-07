import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestScreen } from './test/test.component';
import { FormsModule } from '@angular/forms';
import { BackendService } from '../../shared/backend/backend.service';
import { AutocompleteComponent } from '../../shared/utils/autocomplete.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        TestScreen,
        AutocompleteComponent
    ],
    providers: [
        BackendService
    ],
    exports: [
        TestScreen,
    ]
})
export class ScreenModule { }
