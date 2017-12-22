import { ReflectiveInjector } from '@angular/core';
import {
    HttpModule, Http, RequestOptions, RequestMethod,
    Headers, Response, BrowserXhr, BaseRequestOptions,
    CookieXSRFStrategy, BaseResponseOptions, XSRFStrategy,
    XHRBackend, ConnectionBackend, ResponseOptions
} from '@angular/http';
import { extractData, handleError } from '@backend';
import { Observable } from 'rxjs';
import { URL } from '@constants';

const headers = new Headers({ 'Content-Type': 'application/json' });
const options = new RequestOptions({ headers: headers, withCredentials: true });

const url = URL; // <-- This url will be used when posting it should be your server address.
// <-- The /booking is the module which you wish to call.
// <-- /booking/saveClient will call the saveClient function in the module booking.
// <-- This is used by default, edit the proxy.conf.json file in order to let it run through another port and url if desired.
// ng serve --proxy proxy.conf.json
// The format is as follows: http://URL:PORT/Module/Function?YourParamsURLSerialized
// This should be handled in the function calls bellow. Take for example getClients()

// The design of these models use the propery approach where you defined the field on the model properties itself (I would recommend this model design). To access any field on the class you would use it as follows:
// data = {name: 'TestName'} -> Any field in here must be declared in the dbFields and also declared as a property in the model itself. Client model demostrates this.
// a = new YourClass(data);
// name = a.name -> this will return TestName.

// ===================================================================
// ======================= DEFAULT MODEL =============================
// ===================================================================

/**
 * @classdesc The base model of every model that can be saved to the backend.
 * @prop http -> The http module used for the backend calls, manually injected into model.
 * @prop modelFields -> Fields that are models also, this is used to convert fields to json before saving. Or to map fields from json.
 * @prop dbFields -> Fields that represent the model. These are used for update mappings and for saving on the .save call.
 */
export abstract class DBModel {

    /**
     * The name of this model. Used for saveFunc and loadFunc.
     */
    protected _name = 'DefaultModel';

    /**
     * The save function that is called in the backend.
     */
    protected _save_func = 'save' + this._name;

    /**
     * The load function that is called from the backend.
     */
    protected _load_func = 'load' + this._name;

    /**
     * Fields that are required to load this model.
     */
    protected loadFields: Array<string> = [];

    /**
     * Should this model be able to be saved.
     */
    protected saveModel: boolean = true;

    /**
     * Should this model be able to be loaded by defualt.
     */
    protected loadModel = true;

    /**
     * They key that is used to save this model to the backend.
     */
    protected saveKey = 'model';

    /**
     * Http Module manually injected into the model to do backend calls. This must not be accessed from outside
     */
    private http: Http;

    /**
     * Fields that are models also, this is used to convert fields to json before saving. Or to map fields from json.
     */
    protected modelFields: any = {};

    /**
     * Fields that represent the model. These are used for update mappings and for saving on the .save call.
     */
    protected dbFields: Array<string> = [];

    /**
     * Snapshot of the model each time before it's updated or saved. This is used to know if there has been changes on the model.
     */
    protected snapshot: string;

    /**
     * Snapshot of the model before it was updated.
     */
    protected snapshotBefore: string;

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
     * @param data {Object} - Data to update the class with.
     */
    protected _update(data) {
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
                }
            }
        }
    }

    /**
     * Update the model completely, you cannot restore the model from here anymore.
     * @param data {Object} - Data to update the class with.
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
     * @param data {Object} - The data to temporarily update the model with.
     */
    tempUpdate(data) {
        this._update(data);
    }

    /**
     * Has the model changes since the last update.
     * @returns {Boolean}.
     */
    hasChanged() {
        return !(this.toString() === this.snapshot);
    }

    /**
     * Restore this model to it's previous state using the snapshot that was taken before updating it.
     * @returns {String}.
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
                        case 'String': this[key] = '';
                            break;
                        case 'Number': this[key] = null;
                            break;
                        case 'Array': this[key] = [];
                            break;
                        case 'Boolean': this[key] = false;
                            break;
                        case 'Object': this[key] = {};
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
     * Post a request to the backend.
     * @param request {String} - The backend function you wish to call.
     * @param parameters {Object} - The parameters you wish to send to the backend.
     * @returns {Promise}.
     */
    protected serverPost(request: string, parameters: any = {}): Promise<any> {
        let body = JSON.stringify(parameters);
        return this.http.post(url + request, body, options)
            .toPromise()
            .then(extractData)
            .catch(res => console.log(res));
    }

    /**
     * Convert this model to JSON format for saving.
     * @returns {Object} - JSON format of this model.
     */
    values(return_null = false) {
        let data = {}
        this.dbFields.forEach(e => {
            if (this.modelFields.hasOwnProperty(e) && this[e] !== null) {
                if (this[e] instanceof Array) {
                    data[e] = this[e].map(i => i.values());
                } else {
                    data[e] = this[e].values();
                }
            } else if (this[e] !== null || return_null) {
                data[e] = this[e];
            }
        });
        return data;
    }

    /**
     * Get a string representation of this model.
     * @returns {String} - String representation of this model.
     */
    toString() {
        return JSON.stringify(this.values());
    }

    /**
     * WHEN YOU WANT TO SUBSCRIBE TO THE RESULT AND DO SOMETHING.
     * Function to save the model. Updates the model after the save and returns an observable that you can subscribe to.
     * @returns {observable} - Returns a observable of the response when done.
     */
    saveSubscribe(): Observable<any> {
        if (this.saveModel) {
            let model = {};
            let fields = this.values(true);
            model[this.saveKey] = fields;
            let body = JSON.stringify(model);
            // If you wish to update the model, need to wait for save to complete (non async).
            return this.http.post(url + this._save_func, body, options)
                .map(res => {
                    let response_data = extractData(res);
                    if (response_data.result) {
                        this.update(response_data.data);
                    }
                    return response_data;
                })
        } else {
            console.log('ERROR: ' + this._name + ' MODEL MAY NOT BE SAVED !');
        }
    }

    /**
     * WHEN YOU DO NOT CARE ABOUT THE SUBSCRIBTION, THIS IS DONE AUTOMATICALLY AND JUST UPDATED.
     * Function to save the model. Updates the model after the save.
     * @returns {object} - The repsonse data.
     */
    saveUpdate() {
        if (this.saveModel) {
            let model = {};
            let fields = this.values(true);
            model[this.saveKey] = fields;
            let body = JSON.stringify(model);
            // If you wish to update the model, need to wait for save to complete (non async).
            return this.saveSubscribe().subscribe();
        } else {
            console.log('ERROR: ' + this._name + ' MODEL MAY NOT BE SAVED !');
        }
    }

    /**
     * Function to save the model.
     * @returns {promise} - Returns a promise response if the update if false, returns a Observable that you can subscribe to if the update is true.
     */
    save(): Promise<any> {
        // If you would like the model to update itself after the save, just pass in the true on the save function. 
        if (this.saveModel) {
            let model = {};
            let fields = this.values(true);
            model[this.saveKey] = fields;
            let body = JSON.stringify(model);
            this.snapshot = this.toString();
            return this.http.post(url + this._save_func, body, options)
                .toPromise()
                .then(extractData)
                .catch(handleError);
        } else {
            console.log('ERROR: ' + this._name + ' MODEL MAY NOT BE SAVED !');
        }
    }

    /**
     * Function that initializes the data and is called upon construction.
     * @param {object} data - Data that the model fields must be initialized with.
     */
    init(data?) {
        if (data) {
            this.update(data);
        }
        this.snapshot = this.toString();
        this._save_func = 'save' + this._name;
        this._load_func = 'load' + this._name;
    }

    /**
     * Does this model contain every field nessasary to load it.
     * @returns {boolean}
     */
    loadable() {
        return this.loadFields.every(field => this[field]);
    }

    /**
     * Function that loads the model from the backend provided the correct parameters/fields needed to load the model.
    */
    load() {
        if (this.loadModel && this.loadable()) {
            let model = {};
            let fields = {};
            this.loadFields.forEach(e => {
                fields[e] = this[e];
            });
            model[this.saveKey] = fields;
            let body = JSON.stringify(model);
            return this.http.post(url + this._load_func, body, options)
                .toPromise()
                .then(res => {
                    let response_data = extractData(res);
                    if (response_data.result) {
                        this.update(response_data.data);
                    }
                    return response_data;
                })
                .catch(handleError);
        } else {
            console.log('ERROR: ' + this._name + ' MODEL MAY NOT BE LOADED !');
        }
    }
};

export default DBModel;
