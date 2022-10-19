"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explorerApi = void 0;
const stripHashPrefix_1 = require("../../utils/stripHashPrefix");
const date_1 = require("../../utils/date");
const api_1 = require("../../constants/api");
const blockchains_1 = require("../../constants/blockchains");
// TODO: use tests/explorers/mocks/mockBlockstreamResponse as type
function parsingFunction({ jsonResponse }) {
    if (!jsonResponse.status.confirmed) {
        throw new Error('Number of transaction confirmations were less than the minimum required, according to Blockstream API');
    }
    const time = (0, date_1.timestampToDateObject)(jsonResponse.status.block_time);
    const outputs = jsonResponse.vout;
    const lastOutput = outputs[outputs.length - 1];
    const issuingAddress = jsonResponse.vin[0].prevout.scriptpubkey_address;
    const remoteHash = (0, stripHashPrefix_1.stripHashPrefix)(lastOutput.scriptpubkey, blockchains_1.BLOCKCHAINS.bitcoin.prefixes);
    const revokedAddresses = outputs
        .filter(output => !!output.scriptpubkey_address)
        .map(output => output.scriptpubkey_address);
    return {
        remoteHash,
        issuingAddress,
        time,
        revokedAddresses
    };
}
const serviceURL = {
    main: `https://blockstream.info/api/tx/${api_1.TRANSACTION_ID_PLACEHOLDER}`,
    test: `https://blockstream.info/testnet/api/tx/${api_1.TRANSACTION_ID_PLACEHOLDER}`
};
exports.explorerApi = {
    serviceURL,
    serviceName: api_1.TRANSACTION_APIS.blockstream,
    parsingFunction,
    priority: -1
};
