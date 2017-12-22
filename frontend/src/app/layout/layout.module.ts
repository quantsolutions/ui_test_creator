import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { HeaderComponent, SidebarComponent } from '@components';
import { TestComponent } from './test/test.component';
import { SuiteComponent } from './suite/suite.component';
import { DashboardComponent } from 'app/layout/dashboard/dashboard.component';
import { ScreenModule } from '@screens';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackendService } from '@backend';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        ScreenModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        LayoutComponent,
        HeaderComponent,
        SidebarComponent,
        TestComponent,
        SuiteComponent,
        DashboardComponent    
    ],
    providers: [ BackendService ]
})

export class LayoutModule { }
