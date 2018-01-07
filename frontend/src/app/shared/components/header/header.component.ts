import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BackendService } from '@backend';
import { GlobalService } from '@global';
import { User } from '@models';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    providers: [ BackendService, GlobalService ]
})

export class HeaderComponent implements OnInit {
    user: User;

    constructor(public router: Router, private backend: BackendService, private globalSerivce: GlobalService) {
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd && window.innerWidth <= 992) {
                this.toggleSidebar();
            }
        });
        this.globalSerivce.registerSub('HeaderComponent', 'user', this.globalSerivce.user.subscribe(user => this.user = user));
    }

    ngOnInit() { }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('push-right');
    }

    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    onLogOut() {
        this.globalSerivce.logout();
    }

    openKeyboardNinjas() {
        window.open("https://www.keyboardninjas.co.za")
    }
}
