import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AuthGuard } from '../shared/guard/auth.guard'

const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            {
                path: 'test',
                loadChildren: './test/test.module#TestModule',
                canActivate: [AuthGuard]
            },
            {
                path: 'suite',
                loadChildren: './suite/suite.module#SuiteModule',
                canActivate: [AuthGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
