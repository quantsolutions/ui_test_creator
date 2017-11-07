import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SuiteComponent } from './suite.component';

const routes: Routes = [
    { path: '', component: SuiteComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuiteRoutingModule { }
