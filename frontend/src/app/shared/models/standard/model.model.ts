import { ReflectiveInjector } from "@angular/core";
import { HttpModule, Http, RequestOptions, RequestMethod, Headers, Response, BrowserXhr, BaseRequestOptions, CookieXSRFStrategy, BaseResponseOptions, XSRFStrategy, XHRBackend, ConnectionBackend, ResponseOptions } from "@angular/http";

const headers = new Headers({ "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" });
const options = new RequestOptions({ headers: headers, withCredentials: true });
const url = "/goodxtest/"; // <-- This url will be used when posting it should be your server address.

/**
 * @classdesc The base model of every model that can be saved to the backend.
 * @prop http -> The http module used for the backend calls, manually injected into model.
 * @prop modelFields -> Fields that are models also, this is used to convert fields to json before saving. Or to map fields from json.
 * @prop dbFields -> Fields that represent the model. These are used for update mappings and for saving on the .save call.
 */
export abstract class Model {
    /**
     * Http Module manually injected into the model to do backend calls.
     */
    http: Http;

    /**
     * Fields that are models also, this is used to convert fields to json before saving. Or to map fields from json.
     */
    modelFields: any = {};

    /**
     * Fields that represent the model. These are used for update mappings and for saving on the .save call.
     */
    dbFields: Array<string> = [];

    /**
     * Snapshot of the model each time before it's updated or saved. This is used to know if there has been changes on the model.
     */
    snapshot: string;

    /**
     * Snapshot of the model before it was updated.
     */
    snapshotBefore: string;

    constructor() {
        // Do not worry too much about it someone very smart figured this out :) (Wilco).
        // This is the manual injection and creation of the http module inside this model ...
        this.http = ReflectiveInjector.resolveAndCreate([
            Http,
            BrowserXhr,
            { provide: RequestOptions, useClass: BaseRequestOptions },
            { provide: ResponseOptions, useClass: BaseResponseOptions },
            { provide: ConnectionBackend, useClass: XHRBackend },
            { provide: XSRFStrategy, useFactory: () => new CookieXSRFStrategy() },
        ]).get(Http);
    }

    /**
     * Update the values within this class with the values supplied.
     * @param data [Object] - Data to update the class with.
     */
    _update(data) {
        for (let key in data) {
            if (this.hasOwnProperty(key)) {
                if (this.modelFields.hasOwnProperty(key)) {
                    if (this[key] instanceof Array && data[key] instanceof Array && data[key]) {
                        this[key] = data[key].map(e => new this.modelFields[key](e));
                    } else if (data[key]) {
                        this[key].update(data[key]);
                    } else {
                        this[key] = new this.modelFields[key](data[key]);
                    }
                } else if (data[key]) {
                    this[key] = data[key];
                } else {
                    switch (this[key].constructor.name) {
                        case "String": this[key] = "";
                            break;
                        case "Number": this[key] = null;
                            break;
                        case "Array": this[key] = [];
                            break;
                        case "Boolean": this[key] = false;
                            break;
                        case "Object": this[key] = {};
                            break;
                        default: this[key] = null;
                            break;
                    }
                }
            }
        }
    }

    /**
     * Update the model completely, you cannot restore the model from here anymore.
     * @param data [Object] - Data to update the class with.
     */
    update(data) {
        this.snapshotBefore = this.toString();
        this._update(data);
        this.snapshot = this.toString();
    }

    /**
     * Temporarily update the model, this means you can still restore the model to it's old state using .restoreFromSnapshot.
     * This will be usefull when you want to update this model and compare it to see if anything has changed from the update. Or incase someome changes their
     * minds after making changes to this model.
     * @param data - The data to temporarily update the model with.
     */
    tempUpdate(data) {
        this._update(data);
    }

    /**
     * Has the model changes since the last update.
     */
    hasChanged() {
        return !(this.toString() === this.snapshot);
    }

    /**
     * Restore this model to it's previous state using the snapshot that was taken before updating it.
     */
    restoreFromBeforeSnapshot() {
        this.update(JSON.parse(this.snapshotBefore));
    }

    /**
     * Restore this model to it's previous state using the snapshot that was taken after updating it.
     */
    restoreFromSnapshot() {
        this.update(JSON.parse(this.snapshot));
    }

    /**
     * Update the values within this class to the defualt values.
     */
    clearFields() {
        for (let key of this.dbFields) {
            if (this.hasOwnProperty(key)) {
                if (this.modelFields.hasOwnProperty(key)) {
                    if (this[key] instanceof Array) {
                        this[key] = [];
                    } else {
                        this[key] = new this.modelFields[key]();
                    }
                } else {
                    switch (this[key].constructor.name) {
                        case "String": this[key] = "";
                            break;
                        case "Number": this[key] = null;
                            break;
                        case "Array": this[key] = [];
                            break;
                        case "Boolean": this[key] = false;
                            break;
                        case "Object": this[key] = {};
                            break;
                        default: this[key] = null;
                            break;
                    }
                }
            }
        }
        this.snapshot = this.toString();
    }

    /**
     * Save this model. THIS METHOD MUST BE OVERRIDDEN.
     */
    save() {
        // This should be overrided or extended by the new class.
        this.snapshot = this.toString();
    }

    /**
     * Post a request to the backend.
     * @param request [string] - The backend function you wish to call.
     * @param parameters [object] - The parameters you wish to send to the backend.
     */
    serverPost (request: string, parameters: any = {}): Promise<any> {     
        // The parameters you are sending to the backend are stored in a object with a key parameters, this is to make it easy to unpack and load the parameters in the backend.
        let body = this.serializeObj({parameters: JSON.stringify(parameters)});
        return this.http.post(url+request, body, options)
            .toPromise()
            .then(this.extractData);
    }

    serializeObj(obj) {
        var result = [];
        for (var property in obj)
            result.push(encodeURIComponent(property) + "=" + encodeURIComponent(obj[property]));
        return result.join("&");
    }

    /**
     * Extract the data from the backend response received.
     * @param res [Response] - The response data to extract.
     * @returns [object] - Returns the extracted body / json from the backend.
     */
    extractData(res: Response) {
        let body = res.json();
        return body || {};
    }

    /**
     * Convert this model to JSON format for saving.
     * @returns [object] - JSON format of this model.
     */
    values() {
        let data = {}
        this.dbFields.forEach(e => {
            if (this.modelFields.hasOwnProperty(e) && this[e] !== null) {
                if (this[e] instanceof Array) {
                    data[e] = this[e].map(i => i.values());
                } else {
                    data[e] = this[e].values();
                }
            } else if (this[e] !== null) {
                data[e] = this[e];
            }
        });
        console.log(data);
        return data;
    }

    /**
     * Get a string representation of this model.
     * @returns [string] - String representation of this model.
     */
    toString() {
        return JSON.stringify(this.values());
    }
};

export default Model;
