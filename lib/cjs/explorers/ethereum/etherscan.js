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
exports.explorerApi = void 0;
const request_1 = __importDefault(require("../../services/request"));
const stripHashPrefix_1 = require("../../utils/stripHashPrefix");
const transaction_apis_1 = require("../../services/transaction-apis");
const blockchains_1 = require("../../constants/blockchains");
const api_1 = require("../../constants/api");
const config_1 = __importDefault(require("../../constants/config"));
const supported_chains_1 = require("../../constants/supported-chains");
const MAIN_API_BASE_URL = 'https://api.etherscan.io/api?module=proxy';
function getApiBaseURL(chain) {
    const testnetNameMap = {
        [supported_chains_1.SupportedChains.Ethropst]: 'ropsten',
        [supported_chains_1.SupportedChains.Ethrinkeby]: 'rinkeby',
        [supported_chains_1.SupportedChains.Ethgoerli]: 'goerli',
        [supported_chains_1.SupportedChains.Ethsepolia]: 'sepolia'
    };
    if (!testnetNameMap[chain]) {
        return MAIN_API_BASE_URL;
    }
    const testnetName = testnetNameMap[chain];
    return `https://api-${testnetName}.etherscan.io/api?module=proxy`;
}
function getTransactionServiceURL(chain) {
    const baseUrl = getApiBaseURL(chain);
    return `${baseUrl}&action=eth_getTransactionByHash&txhash=${api_1.TRANSACTION_ID_PLACEHOLDER}`;
}
// TODO: use tests/explorers/mocks/mockEtherscanResponse as type
function parsingFunction({ jsonResponse, chain, key, keyPropertyName }) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseUrl = getApiBaseURL(chain);
        const getBlockByNumberServiceUrls = {
            serviceURL: {
                main: `${baseUrl}&action=eth_getBlockByNumber&boolean=true&tag=${api_1.TRANSACTION_ID_PLACEHOLDER}`,
                test: `${baseUrl}&action=eth_getBlockByNumber&boolean=true&tag=${api_1.TRANSACTION_ID_PLACEHOLDER}`
            }
        };
        const getBlockNumberServiceUrls = {
            serviceURL: {
                main: `${baseUrl}&action=eth_blockNumber`,
                test: `${baseUrl}&action=eth_blockNumber`
            }
        };
        function parseEtherScanResponse(jsonResponse, block) {
            const data = jsonResponse.result;
            const time = new Date(parseInt(block.timestamp, 16) * 1000);
            const issuingAddress = data.from;
            const remoteHash = (0, stripHashPrefix_1.stripHashPrefix)(data.input, blockchains_1.BLOCKCHAINS.ethmain.prefixes); // remove '0x'
            // The method of checking revocations by output spent do not work with Ethereum.
            // There are no input/outputs, only balances.
            return {
                remoteHash,
                issuingAddress,
                time,
                revokedAddresses: []
            };
        }
        function getEtherScanBlock(jsonResponse, chain) {
            return __awaiter(this, void 0, void 0, function* () {
                const data = jsonResponse.result;
                const blockNumber = data.blockNumber;
                const requestUrl = (0, transaction_apis_1.buildTransactionServiceUrl)({
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    explorerAPI: Object.assign(Object.assign({}, getBlockByNumberServiceUrls), { key,
                        keyPropertyName }),
                    transactionId: blockNumber,
                    chain
                });
                try {
                    const response = yield (0, request_1.default)({ url: requestUrl });
                    const responseData = JSON.parse(response);
                    const blockData = responseData.result;
                    yield checkEtherScanConfirmations(chain, blockNumber);
                    return blockData;
                }
                catch (err) {
                    throw new Error('Unable to get remote hash');
                }
            });
        }
        function checkEtherScanConfirmations(chain, blockNumber) {
            return __awaiter(this, void 0, void 0, function* () {
                const requestUrl = (0, transaction_apis_1.buildTransactionServiceUrl)({
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    explorerAPI: Object.assign(Object.assign({}, getBlockNumberServiceUrls), { key,
                        keyPropertyName }),
                    chain
                });
                let response;
                try {
                    response = yield (0, request_1.default)({ url: requestUrl });
                }
                catch (err) {
                    // TODO: not tested?
                    throw new Error('Unable to get remote hash');
                }
                const responseData = JSON.parse(response);
                const currentBlockCount = responseData.result;
                if (currentBlockCount - blockNumber < config_1.default.MininumConfirmations) {
                    // TODO: not tested
                    throw new Error('Not enough');
                }
                return currentBlockCount;
            });
        }
        // Parse block to get timestamp first, then create TransactionData
        const blockResponse = yield getEtherScanBlock(jsonResponse, chain);
        return parseEtherScanResponse(jsonResponse, blockResponse);
    });
}
exports.explorerApi = {
    serviceURL: getTransactionServiceURL,
    serviceName: api_1.TRANSACTION_APIS.etherscan,
    parsingFunction,
    priority: -1
};
