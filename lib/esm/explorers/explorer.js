var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { buildTransactionServiceUrl } from '../services/transaction-apis';
import request from '../services/request';
import { explorerApi as EtherscanApi } from './ethereum/etherscan';
import { explorerApi as BlockCypherETHApi } from './ethereum/blockcypher';
import { explorerApi as BlockstreamApi } from './bitcoin/blockstream';
import { explorerApi as BlockCypherBTCApi } from './bitcoin/blockcypher';
export function explorerFactory(TransactionAPIArray) {
    return TransactionAPIArray
        .map(explorerAPI => ({
        getTxData: (transactionId, chain) => __awaiter(this, void 0, void 0, function* () { return yield getTransactionFromApi(explorerAPI, transactionId, chain); }),
        priority: explorerAPI.priority
    }));
}
export function getTransactionFromApi(explorerAPI, transactionId, chain) {
    return __awaiter(this, void 0, void 0, function* () {
        const requestUrl = buildTransactionServiceUrl({
            explorerAPI,
            transactionId,
            chain
        });
        try {
            const response = yield request({ url: requestUrl });
            return yield explorerAPI.parsingFunction(Object.assign({ jsonResponse: JSON.parse(response), chain }, explorerAPI));
        }
        catch (err) {
            throw new Error('Unable to get remote hash');
        }
    });
}
const BitcoinTransactionAPIArray = [
    BlockCypherBTCApi,
    BlockstreamApi
];
const EthereumTransactionAPIArray = [
    EtherscanApi,
    BlockCypherETHApi
];
const BlockchainExplorersWithSpentOutputInfo = [
    BlockCypherBTCApi
];
export { BitcoinTransactionAPIArray, EthereumTransactionAPIArray, BlockchainExplorersWithSpentOutputInfo };
