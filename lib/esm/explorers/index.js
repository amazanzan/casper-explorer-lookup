var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BitcoinTransactionAPIArray as BitcoinExplorers, EthereumTransactionAPIArray as EthereumExplorers, explorerFactory } from './explorer';
import { TRANSACTION_APIS } from '../constants/api';
import { ethereumRPCParsingFunction } from './rpc/ethereum';
import { bitcoinRPCParsingFunction } from './rpc/bitcoin';
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
export function overwriteDefaultExplorers(explorerAPIs = [], defaultExplorers = [], lastSetOfExplorers = false) {
    const userSetExplorerAPIsName = explorerAPIs
        .map(explorerAPI => explorerAPI.serviceName)
        .filter(name => !!name)
        .filter(name => !!TRANSACTION_APIS[name]);
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
export function getDefaultExplorers(explorerAPIs) {
    return {
        bitcoin: explorerFactory(overwriteDefaultExplorers(explorerAPIs, BitcoinExplorers)),
        ethereum: explorerFactory(overwriteDefaultExplorers(explorerAPIs, EthereumExplorers))
    };
}
function rpcFactory(explorerAPIs) {
    return explorerAPIs.map(explorerAPI => {
        if (!explorerAPI.parsingFunction) {
            explorerAPI.parsingFunction = explorerAPI.chainType === 'btc' ? bitcoinRPCParsingFunction : ethereumRPCParsingFunction;
        }
        return explorerAPI;
    }).map(explorerAPI => ({
        getTxData: (transactionId) => __awaiter(this, void 0, void 0, function* () {
            return yield explorerAPI.parsingFunction(Object.assign(Object.assign({}, explorerAPI), { transactionId }));
        }),
        priority: explorerAPI.priority
    }));
}
export function getRPCExplorers(customExplorerAPIs) {
    return {
        custom: rpcFactory(customExplorerAPIs)
    };
}
export function prepareExplorerAPIs(customExplorerAPIs) {
    const { bitcoin, ethereum } = getDefaultExplorers(customExplorerAPIs);
    const { custom: rpcCustomExplorers } = getRPCExplorers(customExplorerAPIs.filter(e => e.apiType === 'rpc'));
    const restCustomExplorers = explorerFactory(customExplorerAPIs.filter(e => e.apiType !== 'rpc'));
    return {
        bitcoin,
        ethereum,
        custom: [
            ...rpcCustomExplorers,
            ...restCustomExplorers
        ]
    };
}
