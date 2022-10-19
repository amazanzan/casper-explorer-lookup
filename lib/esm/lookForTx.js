var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BLOCKCHAINS } from './constants/blockchains';
import CONFIG from './constants/config';
import PromiseProperRace from './helpers/promiseProperRace';
import { prepareExplorerAPIs } from './explorers';
import { SupportedChains } from './constants/supported-chains';
export function getExplorersByChain(chain, explorerAPIs) {
    var _a;
    switch (chain) {
        case BLOCKCHAINS[SupportedChains.Bitcoin].code:
        case BLOCKCHAINS[SupportedChains.Regtest].code:
        case BLOCKCHAINS[SupportedChains.Testnet].code:
        case BLOCKCHAINS[SupportedChains.Mocknet].code:
            return explorerAPIs.bitcoin;
        case BLOCKCHAINS[SupportedChains.Ethmain].code:
        case BLOCKCHAINS[SupportedChains.Ethropst].code:
        case BLOCKCHAINS[SupportedChains.Ethrinkeby].code:
        case BLOCKCHAINS[SupportedChains.Ethgoerli].code:
        case BLOCKCHAINS[SupportedChains.Ethsepolia].code:
            return explorerAPIs.ethereum;
        default:
            if (!((_a = explorerAPIs.custom) === null || _a === void 0 ? void 0 : _a.length)) {
                throw new Error('Chain is not natively supported. Use custom explorers to retrieve tx data.');
            }
            return explorerAPIs.custom;
    }
}
// eslint-disable-next-line @typescript-eslint/promise-function-async
function runPromiseRace(promises) {
    return __awaiter(this, void 0, void 0, function* () {
        let winners;
        try {
            winners = yield PromiseProperRace(promises, CONFIG.MinimumBlockchainExplorers);
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
    if (CONFIG.MinimumBlockchainExplorers < 0 || CONFIG.MinimumBlockchainExplorers > queue.length) {
        throw new Error('Invalid application configuration; check the CONFIG.MinimumBlockchainExplorers configuration value');
    }
    const promises = [];
    const limit = CONFIG.Race ? queue.length : CONFIG.MinimumBlockchainExplorers;
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
    if (CONFIG.MinimumBlockchainExplorers < 0 || CONFIG.MinimumBlockchainExplorers > apisCount) {
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
export default function lookForTx({ transactionId, chain, explorerAPIs = [] }) {
    return __awaiter(this, void 0, void 0, function* () {
        const preparedExplorerAPIs = prepareExplorerAPIs(explorerAPIs);
        const lookupQueues = buildPromiseRacesQueue({
            defaultAPIs: getExplorersByChain(chain, preparedExplorerAPIs),
            customAPIs: preparedExplorerAPIs.custom
        });
        // Run queue
        const currentQueueProcessedIndex = 0;
        return yield runQueueByIndex(lookupQueues, currentQueueProcessedIndex, transactionId, chain);
    });
}
