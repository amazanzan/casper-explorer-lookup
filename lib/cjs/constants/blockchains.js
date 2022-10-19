"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTestChain = exports.BLOCKCHAINS = void 0;
const api_1 = require("./api");
const supported_chains_1 = require("./supported-chains");
const BLOCKCHAINS = {
    [supported_chains_1.SupportedChains.Bitcoin]: {
        code: supported_chains_1.SupportedChains.Bitcoin,
        name: 'Bitcoin',
        prefixes: ['6a20', 'OP_RETURN '],
        signatureValue: 'bitcoinMainnet',
        transactionTemplates: {
            full: `https://blockchain.info/tx/${api_1.TRANSACTION_ID_PLACEHOLDER}`,
            raw: `https://blockchain.info/rawtx/${api_1.TRANSACTION_ID_PLACEHOLDER}`
        }
    },
    [supported_chains_1.SupportedChains.Ethmain]: {
        code: supported_chains_1.SupportedChains.Ethmain,
        name: 'Ethereum',
        prefixes: ['0x'],
        signatureValue: 'ethereumMainnet',
        transactionTemplates: {
            full: `https://etherscan.io/tx/${api_1.TRANSACTION_ID_PLACEHOLDER}`,
            raw: `https://etherscan.io/tx/${api_1.TRANSACTION_ID_PLACEHOLDER}`
        }
    },
    [supported_chains_1.SupportedChains.Ethropst]: {
        code: supported_chains_1.SupportedChains.Ethropst,
        name: 'Ethereum Testnet',
        signatureValue: 'ethereumRopsten',
        transactionTemplates: {
            full: `https://ropsten.etherscan.io/tx/${api_1.TRANSACTION_ID_PLACEHOLDER}`,
            raw: `https://ropsten.etherscan.io/getRawTx?tx=${api_1.TRANSACTION_ID_PLACEHOLDER}`
        }
    },
    [supported_chains_1.SupportedChains.Ethrinkeby]: {
        code: supported_chains_1.SupportedChains.Ethrinkeby,
        name: 'Ethereum Testnet',
        signatureValue: 'ethereumRinkeby',
        transactionTemplates: {
            full: `https://rinkeby.etherscan.io/tx/${api_1.TRANSACTION_ID_PLACEHOLDER}`,
            raw: `https://rinkeby.etherscan.io/getRawTx?tx=${api_1.TRANSACTION_ID_PLACEHOLDER}`
        }
    },
    [supported_chains_1.SupportedChains.Ethgoerli]: {
        code: supported_chains_1.SupportedChains.Ethgoerli,
        name: 'Ethereum Testnet',
        signatureValue: 'ethereumGoerli',
        transactionTemplates: {
            full: `https://goerli.etherscan.io/tx/${api_1.TRANSACTION_ID_PLACEHOLDER}`,
            raw: `https://goerli.etherscan.io/getRawTx?tx=${api_1.TRANSACTION_ID_PLACEHOLDER}`
        }
    },
    [supported_chains_1.SupportedChains.Ethsepolia]: {
        code: supported_chains_1.SupportedChains.Ethsepolia,
        name: 'Ethereum Testnet',
        signatureValue: 'ethereumSepolia',
        transactionTemplates: {
            full: `https://sepolia.etherscan.io/tx/${api_1.TRANSACTION_ID_PLACEHOLDER}`,
            raw: `https://sepolia.etherscan.io/getRawTx?tx=${api_1.TRANSACTION_ID_PLACEHOLDER}`
        }
    },
    [supported_chains_1.SupportedChains.Csprmain]: {
        code: supported_chains_1.SupportedChains.Csprmain,
        name: 'Casper',
        signatureValue: 'casperMainnet',
        transactionTemplates: {
            full: `https://cspr.live/deploy/${api_1.TRANSACTION_ID_PLACEHOLDER}`,
            raw: `https://cspr.live/deploy/${api_1.TRANSACTION_ID_PLACEHOLDER}`
        }
    },
    [supported_chains_1.SupportedChains.Csprtest]: {
        code: supported_chains_1.SupportedChains.Csprtest,
        name: 'Casper Testnet',
        signatureValue: 'casperTestnet',
        transactionTemplates: {
            full: `https://testnet.cspr.live/deploy/${api_1.TRANSACTION_ID_PLACEHOLDER}`,
            raw: `https://testnet.cspr.live/deploy/${api_1.TRANSACTION_ID_PLACEHOLDER}`
        }
    },
    [supported_chains_1.SupportedChains.Mocknet]: {
        code: supported_chains_1.SupportedChains.Mocknet,
        name: 'Mocknet',
        test: true,
        signatureValue: 'mockchain',
        transactionTemplates: {
            full: '',
            raw: ''
        }
    },
    [supported_chains_1.SupportedChains.Regtest]: {
        code: supported_chains_1.SupportedChains.Regtest,
        name: 'Mocknet',
        test: true,
        signatureValue: 'bitcoinRegtest',
        transactionTemplates: {
            full: '',
            raw: ''
        }
    },
    [supported_chains_1.SupportedChains.Testnet]: {
        code: supported_chains_1.SupportedChains.Testnet,
        name: 'Bitcoin Testnet',
        signatureValue: 'bitcoinTestnet',
        transactionTemplates: {
            full: `https://testnet.blockchain.info/tx/${api_1.TRANSACTION_ID_PLACEHOLDER}`,
            raw: `https://testnet.blockchain.info/rawtx/${api_1.TRANSACTION_ID_PLACEHOLDER}`
        }
    }
};
exports.BLOCKCHAINS = BLOCKCHAINS;
// TODO: use test boolean from entry?
function isTestChain(chain) {
    return chain !== BLOCKCHAINS.bitcoin.code && chain !== BLOCKCHAINS.ethmain.code;
}
exports.isTestChain = isTestChain;
