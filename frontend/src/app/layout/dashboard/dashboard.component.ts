import { Component } from '@angular/core';
import { BackendService } from '../../shared/backend/backend.service';
import { FormControl } from '@angular/forms';
import { routerTransition } from '@animations';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    animations: [routerTransition()]
})

export class DashboardComponent { }