import { Component } from '@angular/core';
import { GlobalService } from '@global';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    providers: [GlobalService]
})
export class SidebarComponent {
    isActive = false;
    showMenu = '';

    constructor(private globalService: GlobalService) { }

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
        this.globalService.logout();
    }
}
