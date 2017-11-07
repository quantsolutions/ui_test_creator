import { Injectable } from "@angular/core";
import { Headers, Http, RequestMethod, RequestOptions, Response } from "@angular/http";
import { Router } from "@angular/router";
import "rxjs/add/operator/toPromise";
import { Observable } from "rxjs";
import "rxjs/add/operator/map";
import { LoggerService } from "../logger/logger.service";

const headers = new Headers({ "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" });
const options = new RequestOptions({ headers: headers, withCredentials: true });

const url = "/goodxtest/"; // <-- This url will be used when posting it should be your server address.
                                              // <-- The /booking is the module which you wish to call.
                                              // <-- /booking/saveClient will call the saveClient function in the module booking.
                                              // ->  This is used by default, edit the proxy.conf.json file in order to let it run through another port and url if desired.
                                              // ng serve --proxy proxy.conf.json
// The format is as follows: http://URL:PORT/Module/Function?YourParamsURLSerialized
// This should be handled in the function calls bellow. Take for example getClients()

@Injectable()
export class BackendService {
    constructor(private http: Http, private router: Router, private logger: LoggerService) {
        // This is not working yet, need to find out why the service subscribe is not firing off ...
        this.logger.getLogged().subscribe(e => {
            console.log("xxxx HI FROM BACKEND SERVICE xxx");
            // This should work when the injection is correctly done in the dbModel.
            // this.router.navigate(["/login"]);
        })
    }

// ===========================================================================================
// ============================= SERVER BACKEND POSTING =====================================
// ==========================================================================================

    /**
     * Function that post the request and serializes the parameters to the backend.
     * @param request - The request that is going to be made to the backend. For example in the case of getClients > http://127.0.0.1:8080/booking/getClients
     * @param parameters - Parameters that should be sent to the backend , these are the positional arguments in the python code of the function your requesting.
     */
    serverPost (request: string, parameters: any = {}): Promise<any> {     
        // The parameters you are sending to the backend are stored in a object with a key parameters, this is to make it easy to unpack and load the parameters in the backend.
        let body = this.serializeObj({parameters: JSON.stringify(parameters)});
        return this.http.post(url+request, body, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    }

    /**
     * The same as the above function, accept it returns a observable on which you can subscribe and wait until data is returned (NON ASYNC).
     * @param request 
     * @param parameters 
     */
    serverObservePost(request: string, parameters: any={}): Observable<any> {
        let body = this.serializeObj({parameters: JSON.stringify(parameters)});
        return this.http.post(url+request, body, options)
            .map(this.extractData)
    }

    /**
     * Function that jsonifies your response received from the backend / server.
     * This function also processes the backend msg for when the user is not logged in and redirects the page back to the login page.
     * @param res - Response received from the server / backend.
     */
    extractData = (res: Response) => {
        let body = res.json();
        if (body.msg === "NOT LOGGED IN") {
            console.log("NOT LOGGED IN");
            this.deleteCookie("session_id");
            this.router.navigate(["/login"]);
        }
        return body || {};
    }

    /**
     * Function that handles any error that has happened in the backend, the backend already handles this so this should NEVER be executed, 
     * but just for piece of mind this is here.
     * @param error 
     */
    handleError (error: Response | any) {
        // TODO: Create global logging structure
        console.log("BACKEND SERVICE ERROR");
        console.log(error);
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || "";
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ""} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Promise.reject(errMsg);
    }
// ===========================================================================================
// ===========================================================================================

// ===========================================================================================
// ================================= BACKEND FUNCTIONS =======================================
// ===========================================================================================


    /**
     * Function that logs the user in with the supplied password and username, if the login is not successful it will be logged in the console.
     * @param username - Username to login with.
     * @param password - Password to login with.
     */
    login(username, password): Promise<any> {
        return new Promise(resolve => {
            this.serverPost("login", {username: username, password: password})
                .then(response => {
                    if (!response.result) {
                        // If the login was unsuccesful completely delete the cookie of session.
                        this.deleteCookie("session_id");
                    }
                    return resolve(response);
                })
                .catch(error => {
                    this.handleError(error);
                    resolve({ result: false, msg: error });
                })
        })
    }

    /**
     * Retrieves the information of the current logged in user. This would mainly be used for loggin checks , but login checks are already done in the backend.
     */
    getUser(): Promise<any> {
        return new Promise(resolve => {
            this.serverPost("getUser")
                .then(response => resolve(response))
                .catch(error => {
                    this.handleError(error);
                    resolve({ result: false, msg: error });
                })
        })
    }

    /**
     * Returns a boolean if the user is logged in or not.
     */
    getLoggedIn(): Promise<any> {
        return new Promise(resolve => {
            this.serverPost("getLoggedIn")
                .then(response => resolve(response))
                .catch(error => {
                    this.handleError(error);
                    resolve({ result: false, msg: error });
                })
        })
    }

    /**
     * Logs the current logged in user out.
     */
    logout(): Promise<any> {
        return new Promise(resolve => {
            this.serverPost("logout")
                .then(response => {
                    this.deleteCookie("session_id");
                    this.router.navigate(["/login"]);
                    return resolve(response);
                })
                .catch(error => {
                    this.handleError(error);
                    resolve({ result: false, msg: error });
                })
        })
    }

    searchTests(searchterm) {
        return this.post('searchTests');
    }

    getTests() {
        return this.post('getTests');
    }

    runTestSuite(model) {
        return this.post('runTestSuite', model);
    }

    post(func, params = {}): Promise<any> {
        return new Promise(resolve => {
            this.serverPost(func, params)
                .then(response => resolve(response))
                .catch(error => {
                    this.handleError(error);
                    resolve({ result: false, msg: error });
                })
        });
    }
// ===========================================================================================
// ===========================================================================================

// ===========================================================================================
// ==================================== EXSTRA TOOLS =========================================
// ===========================================================================================

    /**
     * Serializes a object for you and returns the serialized string.
     * @param obj - Object that needs to be serialized.
     */
    serializeObj(obj) {
        var result = [];
        for (var property in obj)
            result.push(encodeURIComponent(property) + "=" + encodeURIComponent(obj[property]));
        return result.join("&");
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

    /**
     * Delete a cookie from browser storage by the name provided.
     * @param name - Name of cookie to delete.
     */
    deleteCookie(name) {
        this.setCookie(name, "", -1);
    }

    /**
     * Sets a cookie in the browser storage. Store a cookiie.
     * @param name - Name of the cookie you want to store.
     * @param value - Value of the cookie you want to store.
     * @param expireDays - How long this cookie is valid.
     * @param path - Path to the cookie. Should probably not mess with this one kids.
     */
    setCookie(name: string, value: any, expireDays: number, path: string = "") {
        let d:Date = new Date();
        d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
        let expires:string = `expires=${d.toUTCString()}`;
        let cpath:string = path ? `; path=${path}` : "";
        document.cookie = `${name}=${value}; ${expires}${cpath}`;
    }

// ===========================================================================================
// ===========================================================================================
}
