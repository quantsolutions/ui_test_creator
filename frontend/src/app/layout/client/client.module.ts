import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientRoutingModule } from './client-routing.module';
import { ClientComponent } from './client.component';
import { FormsModule } from '@angular/forms';
import { BackendService } from '../../shared/backend/backend.service';
import { ScreenModule } from '../screens/screen.module';

@NgModule({
    imports: [
        CommonModule,
        ClientRoutingModule,
        FormsModule,
        ScreenModule
    ],
    declarations: [
        ClientComponent,
    ],
    providers: [ BackendService ]
})
export class ClientModule { }
