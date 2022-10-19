"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSACTION_ID_PLACEHOLDER = exports.TRANSACTION_APIS = void 0;
var TRANSACTION_APIS;
(function (TRANSACTION_APIS) {
    TRANSACTION_APIS["blockcypher"] = "blockcypher";
    TRANSACTION_APIS["blockstream"] = "blockstream";
    TRANSACTION_APIS["etherscan"] = "etherscan";
})(TRANSACTION_APIS = exports.TRANSACTION_APIS || (exports.TRANSACTION_APIS = {}));
exports.TRANSACTION_ID_PLACEHOLDER = '{transaction_id}';
