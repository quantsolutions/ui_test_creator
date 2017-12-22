/**
 * Retrieves a cookie stored in the browsers storage for you by name. If no cookie is found , null is returned.
 * @param {string} name - Name of the cookie to retrieve.
 */
export function getCookie(name: string) {
    let ca: Array<string> = document.cookie.split(';');
    let caLen: number = ca.length;
    let cookieName = `${name}=`;
    let c: string;

    for (let i: number = 0; i < caLen; i += 1) {
        c = ca[i].replace(/^\s+/g, '');
        if (c.indexOf(cookieName) == 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return null;
}

/**
 * Delete a cookie from browser storage by the name provided.
 * @param {string} name - Name of cookie to delete.
 */
export function deleteCookie(name: string) {
    setCookie(name, '', -1);
}

/**
 * Sets a cookie in the browser storage. Store a cookiie.
 * @param {string} name - Name of the cookie you want to store.
 * @param {any} value - Value of the cookie you want to store.
 * @param {number} expireDays - How long this cookie is valid.
 * @param {string} path - Path to the cookie. Should probably not mess with this one kids.
 */
export function setCookie(name: string, value: any, expireDays: number, path: string = '') {
    let d: Date = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
    let expires: string = `expires=${d.toUTCString()}`;
    let cpath: string = path ? `; path=${path}` : '';
    document.cookie = `${name}=${value}; ${expires}${cpath}`;
}

/**
 * Function that jsonifies your response received from the backend / server.
 * This function also processes the backend msg for when the user is not logged in and redirects the page back to the login page.
 * @param {response} res - Response received from the server / backend.
 */
export function extractData(res) {
    let body = res.json();
    if (body.msg === 'NOT LOGGED IN') {
        deleteCookie('session_id');
        let current_addr = document.location.href
        current_addr = current_addr.slice(current_addr.indexOf('https://') || current_addr.indexOf('http://') || 0, current_addr.indexOf('/'))
        if (current_addr.indexOf('https://') > -1) {
            window.location.href = 'https://' + current_addr + '/login' // This is here for now since the loggerService is not working and I am having trouble injecting the routerService ...
        } else if (current_addr.indexOf('http://') > -1) {
            window.location.href = 'http://' + current_addr + '/login' // This is here for now since the loggerService is not working and I am having trouble injecting the routerService ...
        } else {
            window.location.href = current_addr + '/login' // This is here for now since the loggerService is not working and I am having trouble injecting the routerService ...
        }
    }
    return body || {};
}

/**
 * Function that handles any error that has happened in the backend, the backend already handles this so this should NEVER be executed, 
 * but just for piece of mind this is here.
 * @param {response|any} error - Error that has occured.
 */
export function handleError(error) {
    // TODO: Create global logging structure
    console.log('BACKEND SERVICE ERROR', error);
    let errMsg: string;
    if (error instanceof Response) {
        let body: any = error.json();
        let err = body.error || JSON.stringify(body);
        errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
        errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Promise.reject(errMsg);
}
