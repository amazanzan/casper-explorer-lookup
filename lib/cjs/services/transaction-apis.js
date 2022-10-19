"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTransactionServiceUrl = void 0;
const api_1 = require("../constants/api");
const url_1 = require("../utils/url");
const blockchains_1 = require("../constants/blockchains");
function appendApiIdentifier(url, explorerAPI) {
    if (!explorerAPI.key) {
        return url;
    }
    if (explorerAPI.key && !explorerAPI.keyPropertyName) {
        throw new Error(`No keyPropertyName defined for explorerAPI ${explorerAPI.serviceName}`);
    }
    return (0, url_1.safelyAppendUrlParameter)(url, explorerAPI.keyPropertyName, explorerAPI.key);
}
function buildTransactionServiceUrl({ explorerAPI, transactionIdPlaceholder = api_1.TRANSACTION_ID_PLACEHOLDER, transactionId = '', chain }) {
    const { serviceURL } = explorerAPI;
    let apiUrl;
    if (typeof serviceURL === 'string') {
        apiUrl = serviceURL;
    }
    else if (typeof serviceURL === 'object') {
        const isTestApi = chain ? (0, blockchains_1.isTestChain)(chain) : false;
        apiUrl = isTestApi ? serviceURL.test : serviceURL.main;
    }
    else if (typeof serviceURL === 'function') {
        apiUrl = serviceURL(chain);
    }
    else {
        throw new Error(`serviceURL is an unexpected type for explorerAPI ${explorerAPI.serviceName}`);
    }
    apiUrl = apiUrl.replace(transactionIdPlaceholder, transactionId);
    apiUrl = appendApiIdentifier(apiUrl, explorerAPI);
    return apiUrl;
}
exports.buildTransactionServiceUrl = buildTransactionServiceUrl;
