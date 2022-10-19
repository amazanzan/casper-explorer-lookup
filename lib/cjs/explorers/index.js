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
exports.prepareExplorerAPIs = exports.getRPCExplorers = exports.getDefaultExplorers = exports.overwriteDefaultExplorers = void 0;
const explorer_1 = require("./explorer");
const api_1 = require("../constants/api");
const ethereum_1 = require("./rpc/ethereum");
const bitcoin_1 = require("./rpc/bitcoin");
function cleanupExplorerAPIs(explorerAPIs, indexes) {
    indexes.forEach(index => explorerAPIs.splice(index, 1)); // remove modified explorer to avoid setting them in the custom option later
}
function validateOverwritingExplorer(explorerAPI) {
    if (explorerAPI.key && !explorerAPI.keyPropertyName) {
        throw new Error(`Property keyPropertyName is not set for ${explorerAPI.serviceName}. Cannot pass the key property to the service.`);
    }
    return true;
}
const overwrittenIndexes = [];
function overwriteDefaultExplorers(explorerAPIs = [], defaultExplorers = [], lastSetOfExplorers = false) {
    const userSetExplorerAPIsName = explorerAPIs
        .map(explorerAPI => explorerAPI.serviceName)
        .filter(name => !!name)
        .filter(name => !!api_1.TRANSACTION_APIS[name]);
    if (userSetExplorerAPIsName.length) {
        return defaultExplorers.reduce((overwrittenExplorers, defaultExplorerAPI) => {
            if (userSetExplorerAPIsName.includes(defaultExplorerAPI.serviceName)) {
                const immutableExplorerAPI = Object.assign({}, defaultExplorerAPI);
                const customSetExplorerAPI = explorerAPIs.find(customExplorerAPI => customExplorerAPI.serviceName === defaultExplorerAPI.serviceName);
                if (validateOverwritingExplorer(customSetExplorerAPI)) {
                    const overwrittenExplorerAPI = Object.assign(immutableExplorerAPI, customSetExplorerAPI);
                    overwrittenExplorers.push(overwrittenExplorerAPI);
                    const explorerAPIsIndex = explorerAPIs.findIndex(explorerAPI => explorerAPI.serviceName === overwrittenExplorerAPI.serviceName);
                    if (!overwrittenIndexes.includes(explorerAPIsIndex)) {
                        overwrittenIndexes.push(explorerAPIsIndex);
                    }
                }
            }
            else {
                overwrittenExplorers.push(defaultExplorerAPI);
            }
            if (lastSetOfExplorers) {
                cleanupExplorerAPIs(explorerAPIs, overwrittenIndexes);
            }
            return overwrittenExplorers;
        }, []);
    }
    return defaultExplorers;
}
exports.overwriteDefaultExplorers = overwriteDefaultExplorers;
function getDefaultExplorers(explorerAPIs) {
    return {
        bitcoin: (0, explorer_1.explorerFactory)(overwriteDefaultExplorers(explorerAPIs, explorer_1.BitcoinTransactionAPIArray)),
        ethereum: (0, explorer_1.explorerFactory)(overwriteDefaultExplorers(explorerAPIs, explorer_1.EthereumTransactionAPIArray))
    };
}
exports.getDefaultExplorers = getDefaultExplorers;
function rpcFactory(explorerAPIs) {
    return explorerAPIs.map(explorerAPI => {
        if (!explorerAPI.parsingFunction) {
            explorerAPI.parsingFunction = explorerAPI.chainType === 'btc' ? bitcoin_1.bitcoinRPCParsingFunction : ethereum_1.ethereumRPCParsingFunction;
        }
        return explorerAPI;
    }).map(explorerAPI => ({
        getTxData: (transactionId) => __awaiter(this, void 0, void 0, function* () {
            return yield explorerAPI.parsingFunction(Object.assign(Object.assign({}, explorerAPI), { transactionId }));
        }),
        priority: explorerAPI.priority
    }));
}
function getRPCExplorers(customExplorerAPIs) {
    return {
        custom: rpcFactory(customExplorerAPIs)
    };
}
exports.getRPCExplorers = getRPCExplorers;
function prepareExplorerAPIs(customExplorerAPIs) {
    const { bitcoin, ethereum } = getDefaultExplorers(customExplorerAPIs);
    const { custom: rpcCustomExplorers } = getRPCExplorers(customExplorerAPIs.filter(e => e.apiType === 'rpc'));
    const restCustomExplorers = (0, explorer_1.explorerFactory)(customExplorerAPIs.filter(e => e.apiType !== 'rpc'));
    return {
        bitcoin,
        ethereum,
        custom: [
            ...rpcCustomExplorers,
            ...restCustomExplorers
        ]
    };
}
exports.prepareExplorerAPIs = prepareExplorerAPIs;
