"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const xmlhttprequest_1 = require("xmlhttprequest");
function request(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise((resolve, reject) => {
            let { url } = obj;
            if (!url) {
                reject(new Error('URL is missing'));
            }
            if (url.substr(0, 7) === 'http://' && !obj.forceHttp) {
                console.warn(`Upgrading requested url ${url} to https protocol.`);
                url = url.replace('http://', 'https://');
            }
            // server
            const XHR = typeof XMLHttpRequest === 'undefined' ? xmlhttprequest_1.XMLHttpRequest : XMLHttpRequest;
            const request = new XHR();
            if (obj['bearer-token']) {
                request.setRequestHeader('Authorization', `Bearer ${obj['bearer-token']}`);
            }
            request.onload = () => {
                if (request.status >= 200 && request.status < 300) {
                    resolve(request.responseText);
                }
                else {
                    console.log(request.responseText);
                    const failureMessage = `Error fetching url:${url}; status code:${request.status}`;
                    reject(new Error(failureMessage));
                }
            };
            request.ontimeout = (e) => {
                console.log('ontimeout', e);
            };
            request.onreadystatechange = () => {
                if (request.status === 404) {
                    reject(new Error(`Error fetching url:${url}; status code:${request.status}`));
                }
            };
            request.onerror = () => {
                console.error(`Request failed with error ${request.responseText}`);
                reject(new Error(request.responseText));
            };
            request.open(obj.method || 'GET', url);
            if (obj.body) {
                request.send(JSON.stringify(obj.body));
            }
            else {
                request.send();
            }
        });
    });
}
exports.default = request;
