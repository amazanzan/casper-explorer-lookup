"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prependHashPrefix = void 0;
const string_1 = require("./string");
function prependHashPrefix(remoteHash, prefixes) {
    for (let i = 0; i < prefixes.length; i++) {
        const prefix = prefixes[i];
        if (!(0, string_1.startsWith)(remoteHash, prefix)) {
            return `${prefix}${remoteHash}`;
        }
    }
    return remoteHash;
}
exports.prependHashPrefix = prependHashPrefix;
