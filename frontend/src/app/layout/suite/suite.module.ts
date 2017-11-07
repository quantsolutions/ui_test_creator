import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuiteComponent } from './suite.component';
import { FormsModule } from '@angular/forms';
import { BackendService } from '../../shared/backend/backend.service';
import { ScreenModule } from '../screens/screen.module';
import { SuiteRoutingModule } from './suite-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SuiteRoutingModule,
        ScreenModule
    ],
    declarations: [
        SuiteComponent,
    ],
    providers: [ BackendService ]
})
export class SuiteModule { }
