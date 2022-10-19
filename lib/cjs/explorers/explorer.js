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
exports.BlockchainExplorersWithSpentOutputInfo = exports.EthereumTransactionAPIArray = exports.BitcoinTransactionAPIArray = exports.getTransactionFromApi = exports.explorerFactory = void 0;
const transaction_apis_1 = require("../services/transaction-apis");
const request_1 = __importDefault(require("../services/request"));
const etherscan_1 = require("./ethereum/etherscan");
const blockcypher_1 = require("./ethereum/blockcypher");
const blockstream_1 = require("./bitcoin/blockstream");
const blockcypher_2 = require("./bitcoin/blockcypher");
function explorerFactory(TransactionAPIArray) {
    return TransactionAPIArray
        .map(explorerAPI => ({
        getTxData: (transactionId, chain) => __awaiter(this, void 0, void 0, function* () { return yield getTransactionFromApi(explorerAPI, transactionId, chain); }),
        priority: explorerAPI.priority
    }));
}
exports.explorerFactory = explorerFactory;
function getTransactionFromApi(explorerAPI, transactionId, chain) {
    return __awaiter(this, void 0, void 0, function* () {
        const requestUrl = (0, transaction_apis_1.buildTransactionServiceUrl)({
            explorerAPI,
            transactionId,
            chain
        });
        try {
            const response = yield (0, request_1.default)({ url: requestUrl });
            return yield explorerAPI.parsingFunction(Object.assign({ jsonResponse: JSON.parse(response), chain }, explorerAPI));
        }
        catch (err) {
            throw new Error('Unable to get remote hash');
        }
    });
}
exports.getTransactionFromApi = getTransactionFromApi;
const BitcoinTransactionAPIArray = [
    blockcypher_2.explorerApi,
    blockstream_1.explorerApi
];
exports.BitcoinTransactionAPIArray = BitcoinTransactionAPIArray;
const EthereumTransactionAPIArray = [
    etherscan_1.explorerApi,
    blockcypher_1.explorerApi
];
exports.EthereumTransactionAPIArray = EthereumTransactionAPIArray;
const BlockchainExplorersWithSpentOutputInfo = [
    blockcypher_2.explorerApi
];
exports.BlockchainExplorersWithSpentOutputInfo = BlockchainExplorersWithSpentOutputInfo;
