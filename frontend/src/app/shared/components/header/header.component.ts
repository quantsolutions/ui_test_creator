import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../backend/backend.service';
import { UserService } from '../../backend/user.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    providers: [ BackendService, UserService ]
})

export class HeaderComponent implements OnInit {
    user: any;

    constructor(private translate: TranslateService, public router: Router, private backend: BackendService, private userSerivce: UserService) {
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd && window.innerWidth <= 992) {
                this.toggleSidebar();
            }
        });
        this.userSerivce.user.subscribe(e => this.user = e);
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
        this.backend.logout();
    }

    changeLang(language: string) {
        this.translate.use(language);
    }
    openKeyboardNinjas() {
        window.open("http://www.keyboardninjas.co.za")
    }
}
