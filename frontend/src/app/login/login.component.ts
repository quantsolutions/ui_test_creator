import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { BackendService } from '../shared/backend/backend.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
    username: string;
    password: string;
    error: boolean = false;
    errorMessage: string = "";

    constructor(public router: Router, public backend: BackendService) {
    }

    ngOnInit() {
    }

    onLoggedin() {
        this.backend.login(this.username, this.password)
        .then(response => {
            if (response.result) {
                this.router.navigate(['/client']);
            } else {
                this.error = true;
                this.errorMessage = response.msg;
            }
        })
    }

    processKey(key) {
        if (key.keyCode === 13 && this.username && this.password) {
            this.onLoggedin();
        }
    }
}
