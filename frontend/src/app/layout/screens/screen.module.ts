import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientScreen } from '../screens/client/client.component';
import { FormsModule } from '@angular/forms';
import { BackendService } from '../../shared/backend/backend.service';
import { AutocompleteComponent } from '../../shared/utils/autocomplete.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        ClientScreen,
        AutocompleteComponent
    ],
    providers: [
        BackendService
    ],
    exports: [
        ClientScreen,
    ]
})
export class ScreenModule { }
