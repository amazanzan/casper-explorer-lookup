"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safelyAppendUrlParameter = void 0;
function safelyAppendUrlParameter(url, parameterKey, parameterValue) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${parameterKey}=${parameterValue}`;
}
exports.safelyAppendUrlParameter = safelyAppendUrlParameter;
