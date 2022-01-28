import Web3 from 'web3';
import Discord, {AnyChannel, Client, Intents, Message, TextChannel} from "discord.js";
import express from 'express';
import { Transaction } from 'web3-core';
import { Subscription } from 'web3-core-subscriptions'
import dotenv from 'dotenv';
import contractDatas from './contracts/data';
import delay from 'delay';
dotenv.config();
const client = new Discord.Client({
    intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const server = express();


class WalletScan{
    #network;
    #web3;
    #web3Utils;
    #web3Ether;
    #networkName;
    pendingTxSubcription : any;
    pendingTxFriendlySubcription: any;
    constructor(network: string, networkName: "Ether" | "BSC"){ //Please choose Arivche Network
        this.#network = network;
        this.#web3 = new Web3(network);
        this.#web3Utils = this.#web3.utils;
        this.#web3Ether = this.#web3.eth;
        this.#networkName = networkName;
    }
    sendFriendlyMessageFromTransaction(transaction: Transaction){
        let message;
        const value = this.#web3Utils.fromWei(transaction.value, "ether") + (this.#networkName ==="BSC" ? " BNB " : " ETH ");
        message = `:sponge: ${transaction.from} transfered ${transaction.to} with ${value}\nTxHash: ${transaction.hash} :sponge:`;
        sendToBillionTransferInfoChannel(message);
    }
    sendFriendlyAssetInfoMessageFromAddress(address: string){
       
    }
    async scanWalletGreaterThan(assetAmount: string | number, convertFromUnit : "BNB" | "Ether" , whichEvent: string){
      let assetAmountWei; //This will scan all asset, include contract Token
      
      assetAmountWei = this.#web3Utils.toWei(this.#web3Utils.toBN(assetAmount), "ether");
      
      if(whichEvent === "pendingTransactions"){
       
            
            try{
                const subscription = this.#web3Ether.subscribe("pendingTransactions")
                subscription.on("data", (txHash: string) => {
                    
                        try{
                            this.#web3Ether.getTransaction(txHash, async (err, transaction) => {
                                console.log(err);
                                console.log(transaction);
                                if(err){
                                    sendToBillionTransferInfoChannel(String(err));
                                }
                                else{
                                   if(transaction){
                                        if(transaction.value){
                                            await delay(5000);
                                            sendToBillionTransferInfoChannel(JSON.stringify(transaction,null,"\t"));
                                        }
                                   }
                                }
                            })
                        }catch(err){
                            sendToBillionTransferInfoChannel(String(err));
                            console.log(err);
                        }
                    
                })
                this.pendingTxSubcription = subscription;
            }catch(err){
                sendToBillionTransferInfoChannel(String(err));
            }
               
                    
               
          
            
         
      }
      else if(whichEvent === "logs"){
          try{

          }catch(err){
            sendToBillionTransferInfoChannel(String(err));
          }
      }
      
      
    }
    async scanWalletLessThan(assetAmount: string | number, convertFromUnit : "BNB" | "Ether" , whichEvent: string){
      try{

      }catch(err){
          sendToBillionTransferInfoChannel(String(err));
      }
    }
    async scanWalletGreaterThanFriendly(assetAmount: string | number, convertFromUnit : "BNB" | "Ether" , whichEvent: string){
        let assetAmountWei; //This will scan all asset, include contract Token
      
        assetAmountWei = this.#web3Utils.toWei(this.#web3Utils.toBN(assetAmount), "ether");
        
        if(whichEvent === "pendingTransactions"){
          try{
              
                  
                      const subscription = this.#web3Ether.subscribe("pendingTransactions")
                      subscription.on("data", (txHash: string) => {
                          
                                try{
                                    this.#web3Ether.getTransaction(txHash, async (err, transaction) => {
                                        
                                        if(err){
                                        sendToBillionTransferInfoChannel(String(err));
                                        }
                                    else{
                                        if(transaction){
                                            if(transaction.value){
                                                const minTransaction = this.#web3Utils.toWei(this.#web3Utils.toBN(assetAmount), "ether"); 
                                                if(this.#web3Utils.toBN(transaction.value).cmp(minTransaction) >= 0){
                                                    await delay(5000);
                                                    this.sendFriendlyMessageFromTransaction(transaction);
                                                    
                                                }

                                                
                                            }
                                            
                                        }
                                        
                                    }
                                    })
                                }catch(err){
                                    console.log(err);
                                }
                          
                      })
                  
                 
                      
                 
  
          
              this.pendingTxFriendlySubcription = subscription;
            }catch(err){
                sendToBillionTransferInfoChannel(String(err));
                console.log(err);
            }
        }
        else if(whichEvent === "logs"){
            try{
  
            }catch(err){
              sendToBillionTransferInfoChannel(String(err));
            }
        }
        
    }
    getWeb3(){
        return this.#web3;
    }

    async getContractBalance(contractInfo: {name: string, contract_address: string, ABI: any}, addressToCheck : string){
        const contract = new this.#web3.eth.Contract(contractInfo.ABI, contractInfo.contract_address as string);
        const balance =  await contract.methods.balanceOf(addressToCheck).call();
        return this.#web3Utils.toBN(balance);
    }
}



const port = process.env.PORT || 3000;
const sendToBillionTransferInfoChannel = (msg: string) => {
    try{
        client.channels.fetch(process.env.TRANSFER_INFO_DISCORD_CHANNEL_ID as string).then((channel: AnyChannel | null) => {
            if(channel){
                (channel as TextChannel).send(msg);
            }
        }).catch(err=>{
            console.log(err);
        })
    }catch(err){
        console.log(err);
    }
}
const sendToScanAssetByAdressChannel = (msg: string) => {
    try{
        client.channels.fetch(process.env.SCAN_ASSET_INFO_DISCORD_CHANNEL_ID as string).then((channel: AnyChannel | null) => {
            if(channel){
                (channel as TextChannel).send(msg);
            }
        }).catch(err=>{
            console.log(err);
        })
    }catch(err){
        console.log(err);
    }
    
}
const scanBot = new WalletScan(process.env.BSC_WWS_ARCHIVE_MAINNET as string, "BSC");
client.on("message", async (message: Message)=>{
    
    if(message.channelId === process.env.TRANSFER_INFO_DISCORD_CHANNEL_ID){
        // if(message.content?.toLowerCase().replace(" ","").indexOf("StartPenndingTXGT"?.toLowerCase()) >= 0){
        //     scanBot.scanWalletGreaterThan(200, "BNB", "pendingTransactions").then();
        // }
        // else if(message.content?.toLowerCase().replace(" ", "") === "StopPenndingTXGT"?.toLowerCase()){
        //     scanBot.pendingTxSubcription.unsubscribe();
        // }
        if(message.content?.toLowerCase().replace(" ", "").indexOf("Start".toLowerCase()) >=0){
            const str = message.content?.toLowerCase().replace(" ", "");
            const minTx = Number(str.replace( /^\D+/g, '')) === 0 ? "10" : Number(str.replace( /^\D+/g, ''));
            console.log(minTx)
            console.log(minTx);
            scanBot.scanWalletGreaterThanFriendly(minTx, "BNB", "pendingTransactions").then();
        }
        else if(message.content?.toLowerCase().replace(" ", "") === "stop"?.toLowerCase()){
            scanBot.pendingTxFriendlySubcription.unsubscribe();
        }
        else if(message.content.toLowerCase().replace(" ","") === "BillionAssetInfoAscending".toLowerCase()){
    
        }
    }

    else if(message.channelId === process.env.SCAN_ASSET_INFO_DISCORD_CHANNEL_ID){
        if(scanBot.getWeb3().utils.isAddress(message.content)){
            try{
            let assets : Array<{name: string, balance: string, addressContract?: string}> = [];
            const babalanceBN = scanBot.getWeb3().utils.toBN(await scanBot.getWeb3().eth.getBalance(message.content));
            const balance = scanBot.getWeb3().utils.fromWei(babalanceBN, "ether");
            assets.push({name: "BNB", balance: balance})

            for(let i = 0; i < contractDatas.length ; i++){
                let contractData = contractDatas[i];
                const balance = await scanBot.getContractBalance(contractData, message.content);
                assets.push({
                    name: contractData.name,
                    balance: scanBot.getWeb3().utils.fromWei(balance, "ether"),
                    addressContract: contractData.contract_address
                })
            }
            
            
            let response = "";
            console.log(assets);
            assets.forEach((asset) => {
                response+= `${asset.name}: ${asset.balance}  :peach: :peach:  ${asset?.addressContract ? asset?.addressContract : "" }\n`;
            })

            message.reply(response);
            }
         catch(err){
             console.log(err);
         }   
        }
    }


})
client.on("ready", () => {
    
})
server.listen(port, () => {
    console.log("Listen at "+port);
})

server.get("*", (req, res, next) => {
    sendToBillionTransferInfoChannel("Hi");
    res.send("Hello World");
})

client.login(process.env.DISCORD_CLIENT_TOKEN).then(() => {
    
});