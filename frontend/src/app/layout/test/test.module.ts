import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './test.component';
import { FormsModule } from '@angular/forms';
import { BackendService } from '../../shared/backend/backend.service';
import { ScreenModule } from '../screens/screen.module';
import { TestRoutingModule } from './test-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TestRoutingModule,
        ScreenModule
    ],
    declarations: [
        TestComponent,
    ],
    providers: [ BackendService ]
})
export class TestModule { }
