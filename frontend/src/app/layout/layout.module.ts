import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { HeaderComponent, SidebarComponent } from '../shared';
import { TestComponent } from 'app/layout/test/test.component';
import { ScreenModule } from 'app/layout/screens/screen.module';
import { SuiteComponent } from 'app/layout/suite/suite.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from 'app/layout/dashboard/dashboard.component';

@NgModule({
    imports: [
        CommonModule,
        NgbDropdownModule.forRoot(),
        LayoutRoutingModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        ScreenModule
    ],
    declarations: [
        LayoutComponent,
        HeaderComponent,
        SidebarComponent,
        TestComponent,
        SuiteComponent,
        DashboardComponent
    ]
})
export class LayoutModule { }
