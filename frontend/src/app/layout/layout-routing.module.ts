import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
// import { AuthGuard } from '../shared/guard/auth.guard'
import { Component } from '@angular/core/src/metadata/directives';
import { TestComponent } from 'app/layout/test/test.component';
import { SuiteComponent } from 'app/layout/suite/suite.component';
import { DashboardComponent } from 'app/layout/dashboard/dashboard.component';
import { CommandActionComponent } from './commandAction/command-action.component';

const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent,
                // canActivate: [AuthGuard]
            },
            {
                path: 'test',
                component: TestComponent,
                // canActivate: [AuthGuard]
            },
            {
                path: 'suite',
                component: SuiteComponent,
                // canActivate: [AuthGuard]
            },
            {
                path: 'commandAction',
                component: CommandActionComponent,
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class LayoutRoutingModule { }
