/**
 * A service that manages all the global stuff in this project. Stuff like the patient profile, debtor etc. The subscriptions on screens
 * and the websockets are all handled here.
 */

import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { BackendService } from '@backend';

import { User } from '@models';
import { BehaviorSubject } from "rxjs";
import { wsURL } from '@constants';

@Injectable()
export class GlobalService {
    /**
     * Centralize the patient data, makes it a lot easier to maintain and move data around. All of these are observables.
     */
    user: BehaviorSubject<User> = new BehaviorSubject(new User());  // User object of current logged in user.

    /**
     * Subscriptions for the screens, these are the subscriptions to the observables like the user, websockets etc.
     */
    subs: any = {};

    /**
     * The websocket.
     */
    wsMessage: BehaviorSubject<any> = new BehaviorSubject({}); // Observable which you can subscribe to, to receive websocket messages.
    ws: WebSocket;                                             // The websocket connection itself.

    /**
     * Keep track of the last time the profile has last updated to ensure not constant updating of the patient.
     */
    userLastUpdated: Date;

    constructor(private backend: BackendService, private router: Router) {
        this.getUser(true); // Force the updating of the userProfile the first time the globalService starts.
    }

    /**
     * Send a message over the websocket.
     * @param data - The message you wish to send over the websocket, must be an object.
     */
    sendWsMessage(data) {
        this.ws.send(JSON.stringify(data));
    }

    /**
     * Initialize the creation of the websocket.
     */
    createWebsocket() {
        this.ws = new WebSocket(wsURL);                                               // Create the websocket connection.
        this.ws.onopen = () => console.info('Websocket Connection Successful ...');   // Log when connection is successful.
        this.ws.onmessage = (msg) => this.wsMessage.next(msg.data);                   // Update the observable when the websocket receives a message.
        this.ws.onclose = () => console.info('Websocket Connection Closed ...');      // Log when the connection closes.
    }

    /**
     * Logout the user, clear the profile and also navigate to login.
     */
    logout(navigateTo = '/pages/login', params = {}) {
        this.backend.logout();
        this.router.navigate([navigateTo, params]);
        this.clearUser();
    }

    /**
     * Resets all the models linked to a patient, this ensures no data is accidently leaked to some other user.
     */
    clearUser() {
        this.user.next(new User()); // this.user.value.clearFields();
        this.userLastUpdated = null;
        if (this.ws) {
            this.ws.close();
        }
    }

    /**
     * Login the user and then retrieve the profile for the logged in user and update all the models linked to the user.
     * @param username - The username of the patient.
     * @param password - The password of the user.
     * @param navigateTo - The page which to navigate to after login was successful.
     * @param params - The params to send with the navigateTo params (These will be queryParams).
     */
    login(username, password, navigateTo = '', params = {}): Promise<any> {
        return new Promise(resolve => this.backend.login(username, password).then(res => {
            if (res.result) {
                this.router.navigate([navigateTo, params]);
                this.getUser(true);
                this.createWebsocket();
            };
            resolve(res);
        }));
    }

    /**
     * Refresh the user profile from the backend.
     */
    getUser(force = false) {
        // Check if the user is still logged in.
        return new Promise(resolve => () => {
            this.backend.getLoggedIn().then(res => {
                if (!res.result) {
                    this.clearUser();
                    this.router.navigate(['/pages/login']);
                    resolve(false);
                };
            });

            // Get the time since the last update.
            let date = new Date();
            let minutes = this.userLastUpdated ? ((date.getTime() - this.userLastUpdated.getTime()) / 60000) : 1;

            // If it has been 1 minute since the last update, update the profile again. Unless if the update is forced or the patient has not been set yet.
            if (minutes >= 1 || force) {
                this.backend.getUser()
                    .then(response => {
                        if (response.result && response.data) {
                            // Update user.
                            this.user.value.update(response.data);

                            // Set the time the profile was updated.
                            this.userLastUpdated = date;
                        }
                    })
                    .catch(error => console.log('ERROR: ', error))
            }
            resolve(true);
        });
    }

    /**
     * Register a subscription on the subsription list.
     * @param screen - The screen on which the subscription exists.
     * @param subname - The name of the subscription.
     * @param sub - The subscription object.
     * @returns [boolean] - If the register was successfull.
     */
    registerSub(screen, subname, sub) {
        let success = false;
        if (this.subs.hasOwnProperty(screen)) {
            if (!this.subs[screen].some(e => e.name === subname)) {
                this.subs[screen].push({ name: subname, sub: sub });
                success = true;
            } else {
                // If the subscription already exists, unregister from the one passed in.
                sub.unsubscribe();
            }
        } else {
            this.subs[screen] = [];
            this.subs[screen].push({ name: subname, sub: sub });
            success = true;
        }
        return success;
    }

    /**
     * Unregister a subscription on the subscription list.
     * @param screen - The screen on which the subscription exists.
     * @param subname - The name of the subscription.
     * @returns [boolean] - If the unregister was successfull.
     */
    unregisterSub(screen, subname) {
        let success = false;
        if (this.subs.hasOwnProperty(screen)) {
            let sub = this.subs[screen].find(e => e.name === subname);
            if (sub) {
                sub[sub].unsubscribe();
                this.subs[screen].splice(this.subs[screen].indexOf(sub), 1);
                success = true;
            }
        }
        return success;
    }
}
