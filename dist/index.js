"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _WalletScan_network, _WalletScan_web3, _WalletScan_web3Utils, _WalletScan_web3Ether, _WalletScan_networkName;
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const discord_js_1 = __importStar(require("discord.js"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_1 = __importDefault(require("./contracts/data"));
const delay_1 = __importDefault(require("delay"));
dotenv_1.default.config();
const client = new discord_js_1.default.Client({
    intents: [discord_js_1.Intents.FLAGS.DIRECT_MESSAGES, discord_js_1.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES]
});
const server = (0, express_1.default)();
class WalletScan {
    constructor(network, networkName) {
        _WalletScan_network.set(this, void 0);
        _WalletScan_web3.set(this, void 0);
        _WalletScan_web3Utils.set(this, void 0);
        _WalletScan_web3Ether.set(this, void 0);
        _WalletScan_networkName.set(this, void 0);
        __classPrivateFieldSet(this, _WalletScan_network, network, "f");
        __classPrivateFieldSet(this, _WalletScan_web3, new web3_1.default(network), "f");
        __classPrivateFieldSet(this, _WalletScan_web3Utils, __classPrivateFieldGet(this, _WalletScan_web3, "f").utils, "f");
        __classPrivateFieldSet(this, _WalletScan_web3Ether, __classPrivateFieldGet(this, _WalletScan_web3, "f").eth, "f");
        __classPrivateFieldSet(this, _WalletScan_networkName, networkName, "f");
    }
    sendFriendlyMessageFromTransaction(transaction) {
        let message;
        const value = __classPrivateFieldGet(this, _WalletScan_web3Utils, "f").fromWei(transaction.value, "ether") + (__classPrivateFieldGet(this, _WalletScan_networkName, "f") === "BSC" ? " BNB " : " ETH ");
        message = `:sponge: ${transaction.from} transfered ${transaction.to} with ${value}\nTxHash: ${transaction.hash} :sponge:`;
        sendToBillionTransferInfoChannel(message);
        sendToBillionTransferAddressInfoChannel(transaction.from);
        if (transaction.to) {
            sendToBillionTransferAddressInfoChannel(transaction.to);
        }
    }
    sendFriendlyAssetInfoMessageFromAddress(address) {
    }
    scanWalletGreaterThan(assetAmount, convertFromUnit, whichEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            let assetAmountWei; //This will scan all asset, include contract Token
            assetAmountWei = __classPrivateFieldGet(this, _WalletScan_web3Utils, "f").toWei(__classPrivateFieldGet(this, _WalletScan_web3Utils, "f").toBN(assetAmount), "ether");
            if (whichEvent === "pendingTransactions") {
                try {
                    const subscription = __classPrivateFieldGet(this, _WalletScan_web3Ether, "f").subscribe("pendingTransactions");
                    subscription.on("data", (txHash) => {
                        try {
                            __classPrivateFieldGet(this, _WalletScan_web3Ether, "f").getTransaction(txHash, (err, transaction) => __awaiter(this, void 0, void 0, function* () {
                                console.log(err);
                                console.log(transaction);
                                if (err) {
                                    sendToBillionTransferInfoChannel(String(err));
                                }
                                else {
                                    if (transaction) {
                                        if (transaction.value) {
                                            yield (0, delay_1.default)(5000);
                                            sendToBillionTransferInfoChannel(JSON.stringify(transaction, null, "\t"));
                                        }
                                    }
                                }
                            }));
                        }
                        catch (err) {
                            sendToBillionTransferInfoChannel(String(err));
                            console.log(err);
                        }
                    });
                    this.pendingTxSubcription = subscription;
                }
                catch (err) {
                    sendToBillionTransferInfoChannel(String(err));
                }
            }
            else if (whichEvent === "logs") {
                try {
                }
                catch (err) {
                    sendToBillionTransferInfoChannel(String(err));
                }
            }
        });
    }
    scanWalletLessThan(assetAmount, convertFromUnit, whichEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (err) {
                sendToBillionTransferInfoChannel(String(err));
            }
        });
    }
    scanWalletGreaterThanFriendly(assetAmount, convertFromUnit, whichEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            let assetAmountWei; //This will scan all asset, include contract Token
            assetAmountWei = __classPrivateFieldGet(this, _WalletScan_web3Utils, "f").toWei(__classPrivateFieldGet(this, _WalletScan_web3Utils, "f").toBN(assetAmount), "ether");
            if (whichEvent === "pendingTransactions") {
                try {
                    const subscription = __classPrivateFieldGet(this, _WalletScan_web3Ether, "f").subscribe("pendingTransactions");
                    subscription.on("data", (txHash) => {
                        try {
                            __classPrivateFieldGet(this, _WalletScan_web3Ether, "f").getTransaction(txHash, (err, transaction) => __awaiter(this, void 0, void 0, function* () {
                                if (err) {
                                    sendToBillionTransferInfoChannel(String(err));
                                }
                                else {
                                    if (transaction) {
                                        if (transaction.value) {
                                            const minTransaction = __classPrivateFieldGet(this, _WalletScan_web3Utils, "f").toWei(__classPrivateFieldGet(this, _WalletScan_web3Utils, "f").toBN(assetAmount), "ether");
                                            if (__classPrivateFieldGet(this, _WalletScan_web3Utils, "f").toBN(transaction.value).cmp(minTransaction) >= 0) {
                                                yield (0, delay_1.default)(5000);
                                                this.sendFriendlyMessageFromTransaction(transaction);
                                            }
                                        }
                                    }
                                }
                            }));
                        }
                        catch (err) {
                            console.log(err);
                        }
                    });
                    this.pendingTxFriendlySubcription = subscription;
                }
                catch (err) {
                    sendToBillionTransferInfoChannel(String(err));
                    console.log(err);
                }
            }
            else if (whichEvent === "logs") {
                try {
                }
                catch (err) {
                    sendToBillionTransferInfoChannel(String(err));
                }
            }
        });
    }
    getWeb3() {
        return __classPrivateFieldGet(this, _WalletScan_web3, "f");
    }
    getContractBalance(contractInfo, addressToCheck) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = new (__classPrivateFieldGet(this, _WalletScan_web3, "f").eth.Contract)(contractInfo.ABI, contractInfo.contract_address);
            const balance = yield contract.methods.balanceOf(addressToCheck).call();
            return __classPrivateFieldGet(this, _WalletScan_web3Utils, "f").toBN(balance);
        });
    }
}
_WalletScan_network = new WeakMap(), _WalletScan_web3 = new WeakMap(), _WalletScan_web3Utils = new WeakMap(), _WalletScan_web3Ether = new WeakMap(), _WalletScan_networkName = new WeakMap();
const port = process.env.PORT || 3000;
const sendToBillionTransferInfoChannel = (msg) => {
    try {
        client.channels.fetch(process.env.TRANSFER_INFO_DISCORD_CHANNEL_ID).then((channel) => {
            if (channel) {
                channel.send(msg);
            }
        }).catch(err => {
            console.log(err);
        });
    }
    catch (err) {
        console.log(err);
    }
};
const sendToBillionTransferAddressInfoChannel = (msg) => {
    try {
        client.channels.fetch('937376057177280622').then((channel) => {
            if (channel) {
                channel.send(msg);
            }
        }).catch(err => {
            console.log(err);
        });
    }
    catch (err) {
        console.log(err);
    }
};
const sendToScanAssetByAdressChannel = (msg) => {
    try {
        client.channels.fetch(process.env.SCAN_ASSET_INFO_DISCORD_CHANNEL_ID).then((channel) => {
            if (channel) {
                channel.send(msg);
            }
        }).catch(err => {
            console.log(err);
        });
    }
    catch (err) {
        console.log(err);
    }
};
const scanBot = new WalletScan(process.env.BSC_WWS_ARCHIVE_MAINNET, "BSC");
client.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (message.channelId === process.env.TRANSFER_INFO_DISCORD_CHANNEL_ID) {
        // if(message.content?.toLowerCase().replace(" ","").indexOf("StartPenndingTXGT"?.toLowerCase()) >= 0){
        //     scanBot.scanWalletGreaterThan(200, "BNB", "pendingTransactions").then();
        // }
        // else if(message.content?.toLowerCase().replace(" ", "") === "StopPenndingTXGT"?.toLowerCase()){
        //     scanBot.pendingTxSubcription.unsubscribe();
        // }
        if (((_a = message.content) === null || _a === void 0 ? void 0 : _a.toLowerCase().replace(" ", "").indexOf("Start".toLowerCase())) >= 0) {
            const str = (_b = message.content) === null || _b === void 0 ? void 0 : _b.toLowerCase().replace(" ", "");
            const minTx = Number(str.replace(/^\D+/g, '')) === 0 ? "10" : Number(str.replace(/^\D+/g, ''));
            console.log(minTx);
            console.log(minTx);
            scanBot.scanWalletGreaterThanFriendly(minTx, "BNB", "pendingTransactions").then();
        }
        else if (((_c = message.content) === null || _c === void 0 ? void 0 : _c.toLowerCase().replace(" ", "")) === ("stop" === null || "stop" === void 0 ? void 0 : "stop".toLowerCase())) {
            scanBot.pendingTxFriendlySubcription.unsubscribe();
        }
        else if (message.content.toLowerCase().replace(" ", "") === "BillionAssetInfoAscending".toLowerCase()) {
        }
    }
    else if (message.channelId === process.env.SCAN_ASSET_INFO_DISCORD_CHANNEL_ID) {
        if (scanBot.getWeb3().utils.isAddress(message.content)) {
            try {
                let assets = [];
                const babalanceBN = scanBot.getWeb3().utils.toBN(yield scanBot.getWeb3().eth.getBalance(message.content));
                const balance = scanBot.getWeb3().utils.fromWei(babalanceBN, "ether");
                assets.push({ name: "BNB", balance: balance });
                for (let i = 0; i < data_1.default.length; i++) {
                    let contractData = data_1.default[i];
                    const balance = yield scanBot.getContractBalance(contractData, message.content);
                    assets.push({
                        name: contractData.name,
                        balance: scanBot.getWeb3().utils.fromWei(balance, "ether"),
                        addressContract: contractData.contract_address
                    });
                }
                let response = "";
                console.log(assets);
                assets.forEach((asset) => {
                    response += `${asset.name}: ${asset.balance}  :peach: :peach:  ${(asset === null || asset === void 0 ? void 0 : asset.addressContract) ? asset === null || asset === void 0 ? void 0 : asset.addressContract : ""}\n`;
                });
                message.reply(response);
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    else if (message.channelId === process.env.FOLLOW_SHARK_TRADING_DISCORD_CHANNEL_ID) {
        if (scanBot.getWeb3().utils.isAddress(message.content)) {
            message.reply("Subcribed event trade on this address.");
        }
        else {
            message.reply("Only type address on this channel.");
        }
    }
    else if (message.channelId === process.env.ADDRESS_TO_BSCSCAN_LINK) {
        if (scanBot.getWeb3().utils.isAddress(message.content)) {
            message.reply(`https://bscscan.com/address/` + message.content);
        }
    }
}));
client.on("ready", () => {
});
server.listen(port, () => {
    console.log("Listen at " + port);
});
server.get("*", (req, res, next) => {
    sendToBillionTransferInfoChannel("Hi");
    res.send("Hello World");
});
client.login(process.env.DISCORD_CLIENT_TOKEN).then(() => {
});
//# sourceMappingURL=index.js.map