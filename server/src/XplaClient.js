// const BlockchainClient = require("./BlockchainClient");
// const axios = require("axios");
// const normalizeTransaction = require("./Normalizer");

// class XplaClient extends BlockchainClient {
//   constructor(rpcUrl) {
//     super();
//     this.rpcUrl = "https://dimension-lcd.xpla.dev​​";
//   }
//   async getTxByAddress(address) {
//     try {
//       const [chainHeight, chainInfo] = await Promise.all([
//         axios.get(`${this.rpcUrl}/blocks/latest`),
//         axios.get(`${this.rpcUrl}/node_info`),
//       ]);
//       let chainName = chainInfo.data.application_version.name.toUpperCase();
//       let curHeight = chainHeight.data.block.header.height;
//       let plusHeight = curHeight + 1;

//       const [senderTx, recipientTx] = await Promise.all([
//         axios.get(
//           `${this.rpcUrl}/txs?message.sender=${address}&limit=${plusHeight}&tx.maxheight=${curHeight}`
//         ),
//         axios.get(
//           `${this.rpcUrl}/txs?transfer.recipient=${address}&limit=${plusHeight}&tx.maxheight=${curHeight}`
//         ),
//       ]);

//       const transactions = [...senderTx.data.txs, ...recipientTx.data.txs];
//       const uniqueTxs = transactions.reduce((acc, current) => {
//         const x = acc.find((i) => i.txhash === current.txhash);
//         if (!x) {
//           return acc.concat([current]);
//         } else {
//           return acc;
//         }
//       }, []);

//       const sortTxs = uniqueTxs.sort((a, b) => {
//         return parseInt(a.height) - parseInt(b.height);
//       });

//       const normalizedTxs = sortTxs.map((tx) => {
//         const txType = tx.tx.value.msg.map((msg) => msg.type);
//         return normalizeTransaction(tx, chainName, txType);
//       });
//       console.log(normalizedTxs);
//       return normalizedTxs;
//     } catch (err) {
//       console.error("error tx", err);
//       throw err;
//     }
//   }
// }

// module.exports = XplaClient;
