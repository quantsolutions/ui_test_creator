import { Component } from '@angular/core';
import { BackendService } from '../../backend/backend.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    providers: [ BackendService ]
})
export class SidebarComponent {
    isActive = false;
    showMenu = '';

    constructor(private backend: BackendService) {}
    eventCalled() {
        this.isActive = !this.isActive;
    }

    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }
    onLogOut() {
        this.backend.logout();
    }
}
