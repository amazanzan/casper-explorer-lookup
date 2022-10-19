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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExplorersByChain = void 0;
const blockchains_1 = require("./constants/blockchains");
const config_1 = __importDefault(require("./constants/config"));
const promiseProperRace_1 = __importDefault(require("./helpers/promiseProperRace"));
const explorers_1 = require("./explorers");
const supported_chains_1 = require("./constants/supported-chains");
function getExplorersByChain(chain, explorerAPIs) {
    var _a;
    switch (chain) {
        case blockchains_1.BLOCKCHAINS[supported_chains_1.SupportedChains.Bitcoin].code:
        case blockchains_1.BLOCKCHAINS[supported_chains_1.SupportedChains.Regtest].code:
        case blockchains_1.BLOCKCHAINS[supported_chains_1.SupportedChains.Testnet].code:
        case blockchains_1.BLOCKCHAINS[supported_chains_1.SupportedChains.Mocknet].code:
            return explorerAPIs.bitcoin;
        case blockchains_1.BLOCKCHAINS[supported_chains_1.SupportedChains.Ethmain].code:
        case blockchains_1.BLOCKCHAINS[supported_chains_1.SupportedChains.Ethropst].code:
        case blockchains_1.BLOCKCHAINS[supported_chains_1.SupportedChains.Ethrinkeby].code:
        case blockchains_1.BLOCKCHAINS[supported_chains_1.SupportedChains.Ethgoerli].code:
        case blockchains_1.BLOCKCHAINS[supported_chains_1.SupportedChains.Ethsepolia].code:
            return explorerAPIs.ethereum;
        default:
            if (!((_a = explorerAPIs.custom) === null || _a === void 0 ? void 0 : _a.length)) {
                throw new Error('Chain is not natively supported. Use custom explorers to retrieve tx data.');
            }
            return explorerAPIs.custom;
    }
}
exports.getExplorersByChain = getExplorersByChain;
// eslint-disable-next-line @typescript-eslint/promise-function-async
function runPromiseRace(promises) {
    return __awaiter(this, void 0, void 0, function* () {
        let winners;
        try {
            winners = yield (0, promiseProperRace_1.default)(promises, config_1.default.MinimumBlockchainExplorers);
        }
        catch (err) {
            throw new Error(`Transaction lookup error: ${err.message}`);
        }
        if (!winners || winners.length === 0) {
            // eslint-disable-next-line @typescript-eslint/return-await
            throw new Error('Could not confirm transaction data.');
        }
        const firstResponse = winners[0];
        for (let i = 1; i < winners.length; i++) {
            const thisResponse = winners[i];
            if (firstResponse.issuingAddress !== thisResponse.issuingAddress) {
                throw new Error('Issuing addresses do not match consistently');
            }
            if (firstResponse.remoteHash !== thisResponse.remoteHash) {
                throw new Error('Remote hashes do not match consistently');
            }
        }
        return firstResponse;
    });
}
function buildQueuePromises(queue, transactionId, chain) {
    if (config_1.default.MinimumBlockchainExplorers < 0 || config_1.default.MinimumBlockchainExplorers > queue.length) {
        throw new Error('Invalid application configuration; check the CONFIG.MinimumBlockchainExplorers configuration value');
    }
    const promises = [];
    const limit = config_1.default.Race ? queue.length : config_1.default.MinimumBlockchainExplorers;
    for (let i = 0; i < limit; i++) {
        promises.push(queue[i].getTxData(transactionId, chain));
    }
    return promises;
}
function buildPromiseRacesQueue({ defaultAPIs, customAPIs }) {
    const promiseRaceQueue = [defaultAPIs];
    if (customAPIs === null || customAPIs === void 0 ? void 0 : customAPIs.length) {
        const priority = customAPIs[0].priority;
        promiseRaceQueue.splice(priority, 0, customAPIs);
    }
    const apisCount = defaultAPIs.concat(customAPIs).length;
    if (config_1.default.MinimumBlockchainExplorers < 0 || config_1.default.MinimumBlockchainExplorers > apisCount) {
        throw new Error('Invalid application configuration; check the CONFIG.MinimumBlockchainExplorers configuration value');
    }
    return promiseRaceQueue;
}
function runQueueByIndex(queues, index, transactionId, chain) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const race = buildQueuePromises(queues[index], transactionId, chain);
            return yield runPromiseRace(race);
        }
        catch (err) {
            if (index < queues.length - 1) {
                index++;
                return yield runQueueByIndex(queues, index, transactionId, chain);
            }
            throw err;
        }
    });
}
function lookForTx({ transactionId, chain, explorerAPIs = [] }) {
    return __awaiter(this, void 0, void 0, function* () {
        const preparedExplorerAPIs = (0, explorers_1.prepareExplorerAPIs)(explorerAPIs);
        const lookupQueues = buildPromiseRacesQueue({
            defaultAPIs: getExplorersByChain(chain, preparedExplorerAPIs),
            customAPIs: preparedExplorerAPIs.custom
        });
        // Run queue
        const currentQueueProcessedIndex = 0;
        return yield runQueueByIndex(lookupQueues, currentQueueProcessedIndex, transactionId, chain);
    });
}
exports.default = lookForTx;
