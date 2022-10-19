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
exports.bitcoinRPCParsingFunction = void 0;
const stripHashPrefix_1 = require("../../utils/stripHashPrefix");
const date_1 = require("../../utils/date");
const request_1 = __importDefault(require("../../services/request"));
function bitcoinRPCParsingFunction({ serviceUrl, transactionId }) {
    return __awaiter(this, void 0, void 0, function* () {
        const getRawTransactionParams = {
            method: 'getrawtransaction',
            jsonrpc: '2.0',
            id: 'rpctest',
            params: [
                transactionId,
                true
            ]
        };
        const resultRawTransaction = yield (0, request_1.default)({
            url: serviceUrl,
            body: getRawTransactionParams,
            method: 'POST'
        });
        const transaction = JSON.parse(resultRawTransaction).result;
        const issuingAddress = transaction.vout[0].scriptPubKey.addresses[0];
        const remoteHash = (0, stripHashPrefix_1.stripHashPrefix)(transaction.vout[1].scriptPubKey.asm, ['6a20', 'OP_RETURN ']);
        const time = (0, date_1.timestampToDateObject)(transaction.blocktime);
        // after research, this only seems to be used in v1.2 of blockcerts.
        const revokedAddresses = transaction.vout
            .filter(output => !!output.scriptPubKey.addresses)
            .map(output => output.scriptPubKey.addresses)
            .flat();
        return {
            issuingAddress,
            remoteHash,
            time,
            revokedAddresses
        };
    });
}
exports.bitcoinRPCParsingFunction = bitcoinRPCParsingFunction;
