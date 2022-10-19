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
import { timestampToDateObject } from '../../utils/date';
import request from '../../services/request';
export function bitcoinRPCParsingFunction({ serviceUrl, transactionId }) {
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
        const resultRawTransaction = yield request({
            url: serviceUrl,
            body: getRawTransactionParams,
            method: 'POST'
        });
        const transaction = JSON.parse(resultRawTransaction).result;
        const issuingAddress = transaction.vout[0].scriptPubKey.addresses[0];
        const remoteHash = stripHashPrefix(transaction.vout[1].scriptPubKey.asm, ['6a20', 'OP_RETURN ']);
        const time = timestampToDateObject(transaction.blocktime);
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
