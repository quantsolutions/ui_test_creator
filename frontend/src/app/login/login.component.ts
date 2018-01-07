import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '@animations';
import { GlobalService } from '@global';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent {
    username: string;
    password: string;
    error: boolean = false;
    errorMessage: string = '';

    constructor(public router: Router, public globalService: GlobalService) { }

    onLoggedin() {
        this.globalService.login(this.username, this.password, '/dashboard').then(res => {
            if (res.result) {
                this.error = false;
                this.errorMessage = '';
            } else {
                this.error = true;
                this.errorMessage = res.msg;
            }
        });
    }

    processKey(key) {
        if (key.keyCode === 13 && this.username && this.password) {
            this.onLoggedin();
        }
    }
}
