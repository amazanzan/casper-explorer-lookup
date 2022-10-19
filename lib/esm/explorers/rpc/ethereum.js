var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { stripHashPrefix } from '../../utils/stripHashPrefix';
import request from '../../services/request';
export function ethereumRPCParsingFunction({ serviceUrl, transactionId }) {
    return __awaiter(this, void 0, void 0, function* () {
        const transactionByHashParams = {
            method: 'eth_getTransactionByHash',
            jsonrpc: '2.0',
            id: 'getbyhash',
            params: [
                '0x' + transactionId
            ]
        };
        const resultTransactionByHash = yield request({
            url: serviceUrl,
            body: transactionByHashParams,
            method: 'POST'
        });
        const transactionByHash = JSON.parse(resultTransactionByHash);
        const blockByNumberParams = {
            method: 'eth_getBlockByNumber',
            jsonrpc: '2.0',
            id: 'blockbynumber',
            params: [
                transactionByHash.result.blockNumber,
                true
            ]
        };
        const resultBlockByNumber = yield request({
            url: serviceUrl,
            body: blockByNumberParams,
            method: 'POST'
        });
        // check confirm validity see cvjs etherscan
        const block = JSON.parse(resultBlockByNumber);
        const txData = transactionByHash.result;
        const blockData = block.result;
        const time = new Date(parseInt(blockData.timestamp, 16) * 1000);
        const issuingAddress = txData.from;
        const remoteHash = stripHashPrefix(txData.input, ['0x']); // remove '0x'
        return {
            remoteHash,
            issuingAddress,
            time,
            revokedAddresses: []
        };
    });
}
