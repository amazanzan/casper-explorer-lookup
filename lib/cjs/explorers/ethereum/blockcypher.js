"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.explorerApi = void 0;
const stripHashPrefix_1 = require("../../utils/stripHashPrefix");
const blockchains_1 = require("../../constants/blockchains");
const api_1 = require("../../constants/api");
const config_1 = __importDefault(require("../../constants/config"));
const date_1 = require("../../utils/date");
const prependHashPrefix_1 = require("../../utils/prependHashPrefix");
const serviceURL = {
    main: `https://api.blockcypher.com/v1/eth/main/txs/${api_1.TRANSACTION_ID_PLACEHOLDER}?limit=500`,
    test: `https://api.blockcypher.com/v1/beth/test/txs/${api_1.TRANSACTION_ID_PLACEHOLDER}?limit=500`
};
// TODO: use tests/explorers/mocks/mockBlockcypherResponse as type
function parsingFunction({ jsonResponse }) {
    if (jsonResponse.confirmations < config_1.default.MininumConfirmations) {
        // TODO: not tested
        throw new Error('Not enough');
    }
    const time = (0, date_1.dateToUnixTimestamp)(jsonResponse.received);
    const outputs = jsonResponse.outputs;
    const lastOutput = outputs[outputs.length - 1];
    let issuingAddress = jsonResponse.inputs[0].addresses[0];
    const remoteHash = (0, stripHashPrefix_1.stripHashPrefix)(lastOutput.script, blockchains_1.BLOCKCHAINS.ethmain.prefixes);
    issuingAddress = (0, prependHashPrefix_1.prependHashPrefix)(issuingAddress, blockchains_1.BLOCKCHAINS.ethmain.prefixes);
    const revokedAddresses = outputs
        .filter(output => !!output.spent_by)
        .map(output => output.addresses[0]);
    return {
        remoteHash,
        issuingAddress,
        time,
        revokedAddresses
    };
}
exports.explorerApi = {
    serviceURL,
    serviceName: api_1.TRANSACTION_APIS.blockcypher,
    parsingFunction,
    priority: -1
};
