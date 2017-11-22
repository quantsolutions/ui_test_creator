import { Component } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { TestSuite } from '../../shared/models/models';
import { BackendService } from '../../shared/backend/backend.service';
import { LoggerService } from '../../shared/logger/logger.service';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    animations: [routerTransition()]
})
export class DashboardComponent {
    
}