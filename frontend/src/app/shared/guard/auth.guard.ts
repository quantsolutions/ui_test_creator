import { Injectable, Component } from "@angular/core";
import { CanActivate } from "@angular/router";
import { Router } from "@angular/router";
import { CanActivateChild } from "@angular/router/src/interfaces";

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(private router: Router) { }

    canActivate() {
        let logged_in = this.getCookie("session_id");
        if (logged_in) {
            return true;
        } else {
            this.router.navigate(["/login"]);
            return false;
        }
    }

    canActivateChild() {
        let logged_in = this.getCookie("session_id");
        if (logged_in) {
            return true;
        } else {
            this.router.navigate(["/login"]);
            return false;
        }
    }

    /**
     * Retrieves a cookie stored in the browsers storage for you by name. If no cookie is found , null is returned.
     * @param name - Name of the cookie to retrieve.
     */
    getCookie(name: string) {
        let ca: Array<string> = document.cookie.split(";");
        let caLen: number = ca.length;
        let cookieName = `${name}=`;
        let c: string;

        for (let i: number = 0; i < caLen; i += 1) {
            c = ca[i].replace(/^\s+/g, "");
            if (c.indexOf(cookieName) == 0) {
                return c.substring(cookieName.length, c.length);
            }
        }
        return null;
    }

}
