import { Injectable } from '@angular/core';
import { Headers, Http, RequestMethod, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';
// import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs';
// import 'rxjs/add/operator/map';
import { handleError, extractData, deleteCookie } from '@backend';
import { URL } from '@constants';

const headers = new Headers({ 'Content-Type': 'application/json' });
const options = new RequestOptions({ headers: headers});

const url = URL; // <-- This url will be used when posting it should be your server address.
// <-- The /booking is the module which you wish to call.
// <-- /booking/saveClient will call the saveClient function in the module booking.
// ->  This is used by default, edit the proxy.conf.json file in order to let it run through another port and url if desired.
// ng serve --proxy proxy.conf.json
// The format is as follows: http://URL:PORT/Module/Function?YourParamsURLSerialized
// This should be handled in the function calls bellow. Take for example getClients()

@Injectable()
export class BackendService {
    constructor(private http: Http, private router: Router) { }

    // ===========================================================================================
    // ============================= SERVER BACKEND POSTING =====================================
    // ==========================================================================================

    /**
     * Function that post the request and serializes the parameters to the backend.
     * @param request - The request that is going to be made to the backend. For example in the case of getClients > http://127.0.0.1:8080/booking/getClients
     * @param parameters - Parameters that should be sent to the backend , these are the positional arguments in the python code of the function your requesting.
     */
    protected serverPost(request: string, parameters: any = {}): Promise<any> {
        const body = JSON.stringify(parameters);
        return this.http.post(url + request, body, options)
            .toPromise()
            .then(extractData.bind(this))
            .catch(handleError);
    }

    // /**
    //  * The same as the above function, accept it returns a observable on which you can subscribe and wait until data is returned (NON ASYNC).
    //  * @param request 
    //  * @param parameters 
    //  */
    // protected serverObservePost(request: string, parameters: any = {}): Observable<any> {
    //     let body = JSON.stringify(parameters);
    //     return this.http.post(url + request, body, options)
    //         .map(extractData.bind(this));
    // }

    protected post(func, params = {}): Promise<any> {
        return new Promise(resolve => {
            this.serverPost(func, params)
                .then(response => resolve(response))
                .catch(error => {
                    handleError(error);
                    resolve({ result: false, msg: error });
                })
        });
    }

    // protected observePost(func, params = {}): Observable<any> {
    //     return this.serverObservePost(func, params);
    // }


    // ===========================================================================================
    // ===========================================================================================

    // ===========================================================================================
    // ================================= BACKEND FUNCTIONS =======================================
    // ===========================================================================================

    searchTests(searchterm) {
        return this.post('searchTests', {search_term: searchterm});
    }

    searchSuites(searchterm) {
        return this.post('searchSuites', {search_term: searchterm});
    }

    getImages() {
        return this.post('getImages');
    }

    getTests() {
        return this.post('getTests');
    }

    // Backend function to get the test cases count
    getTestsCount() {
        return this.post('getTestsCount');
    }

    // Backend function to get the test suites count
    getSuitesCount() {
        return this.post('getSuitesCount')
    }

    getSuites() {
        return this.post('getSuites');
    }

    runTestSuite(model) {
        return this.post('runTestSuite', model);
    }

    /**
     * Function that logs the user in with the supplied password and username, if the login is not successful it will be logged in the console.
     * @param username - Username to login with.
     * @param password - Password to login with.
     */
    login(username, password): Promise<any> {
        return new Promise(resolve => {
            this.serverPost('login', { username: username, password: password })
                .then(response => {
                    if (!response.result) {
                        // If the login was unsuccesful completely delete the cookie of session.
                        deleteCookie('session_id');
                    }
                    return resolve(response);
                })
                .catch(error => {
                    handleError(error);
                    resolve({ result: false, msg: error });
                })
        })
    }

    /**
     * Retrieves the information of the current logged in user. This would mainly be used for loggin checks , but login checks are already done in the backend.
     */
    getUser(): Promise<any> {
        return this.post('getUser');
    }

    /**
     * Returns a boolean if the user is logged in or not.
     */
    getLoggedIn(): Promise<any> {
        return this.post('getLoggedIn');
    }

    /**
     * Logs the current logged in user out.
     */
    logout(): Promise<any> {
        return new Promise(resolve => {
            this.serverPost('logout')
                .then(response => {
                    deleteCookie('session_id');
                    this.router.navigate(['/login']);
                    return resolve(response);
                })
                .catch(error => {
                    handleError(error);
                    resolve({ result: false, msg: error });
                })
        })
    }
    // ===========================================================================================
    // ===========================================================================================
}
