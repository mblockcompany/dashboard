const { default: axios } = require("axios");
const { ethers } = require("ethers");
require("dotenv").config();

const klayTxUrl = "https://th-api.klaytnapi.com/v2/transfer";
const accKey = process.env.KAS_ACCID;
const secretKey = process.env.KAS_SECRET;
const klayAddress = "0x1c57ea31aadec219e6e8e5aa3d315f2066e6ec1f";
const presetId = "729";

const klayTx = async () => {
  try {
    const KlayTxHistory = await axios.get(klayTxUrl, {
      auth: {
        username: accKey,
        password: secretKey,
      },
      headers: {
        "x-chain-id": "8217",
        "Content-Type": "application/json",
      },
      params: {
        kind: "klay",
        presets: presetId,
      },
    });
    const itemKlay = KlayTxHistory.data.items;
    console.log(itemKlay.sort((a, b) => a.blockNumber - b.blockNumber));

    const filteredKlay = itemKlay
      .sort((a, b) => a.blockNumber - b.blockNumber)
      .filter((tx) => {
        if (tx.blockNumber > 134000000) {
          return tx;
        }
      })
      .map((tx) => {
        let transferType = tx.from === klayAddress ? "Send" : "Receive";
        let unixToDate = (unixTimestamp) => {
          let date = new Date(unixTimestamp * 1000);
          date.setHours(date.getHours() + 9);
          return date;
        };
        return {
          height: tx.blockNumber,
          chainName: "Klay",
          timestamp: unixToDate(tx.timestamp),
          type: transferType,
          fees: parseInt(tx.fee, 16) / 1000000000000000000,
          hash: tx.transactionHash,
          memo: null,
          From: tx.from,
          To: tx.to,
          amount: parseFloat(
            (parseInt(tx.value, 16) / 1000000000000000000).toFixed(6)
          ),
          value: tx.value,
        };
      });

    console.log(filteredKlay);

    return filteredKlay;
  } catch (err) {
    console.log(err);
  }
};
klayTx();
module.exports = klayTx;

/*
return
name : klay
timestamp : unix-Date(timestamp)
type : to === 'address' ? Receive : Send
fees : 16-10(fee)
hash : transactionHash
memo:null
From : from
To : to
amount : 16-10(value) 

return 
name : 'klay'
timestamp : unix-date(timestamp)
type : to === 'address' ? receive : send
fees : 16-10(fee)
hash : txHash
memo:null
From : from
To : to
amount : 16-10(value)
*/
