"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripHashPrefix = void 0;
const string_1 = require("./string");
function stripHashPrefix(remoteHash, prefixes) {
    for (let i = 0; i < prefixes.length; i++) {
        const prefix = prefixes[i];
        if ((0, string_1.startsWith)(remoteHash, prefix)) {
            return remoteHash.slice(prefix.length);
        }
    }
    return remoteHash;
}
exports.stripHashPrefix = stripHashPrefix;
