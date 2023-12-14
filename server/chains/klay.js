const { default: axios } = require("axios");
const { ethers } = require("ethers");
require("dotenv").config();

const klayTransferUrl = "https://th-api.klaytnapi.com/v2/transfer";
const klayBalanceUrl = "https://public-en-cypress.klaytn.net"; // public
const accKey = process.env.KAS_ACCID;
const secretKey = process.env.KAS_SECRET;
const klayAddress = "0x1c57ea31aadec219e6e8e5aa3d315f2066e6ec1f";
const presetId = "729";

const liveKlayTx = async () => {
  const liveKlay = await axios.get(klayBalanceUrl, {
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      jsonrpc: "2.0",
      method: "klay_getBalance",
      params: [klayAddress, "latest"],
      id: 1,
    },
  });
  const klayBalance = parseInt(liveKlay.data.result, 16) / 1000000000000000000;
  // console.log(klayBalance);
  return [klayBalance];
};
// liveKlayTx();

const klayTx = async () => {
  try {
    const [KlayTxHistory, klayTotalBalance] = await Promise.all([
      axios.get(klayTransferUrl, {
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
      }),
      axios.get(klayBalanceUrl, {
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          jsonrpc: "2.0",
          method: "klay_getBalance",
          params: [klayAddress, "latest"],
          id: 1,
        },
      }),
    ]);
    const itemKlay = KlayTxHistory.data.items;
    // console.log(itemKlay.sort((a, b) => a.blockNumber - b.blockNumber));

    const totalBalance =
      parseInt(klayTotalBalance.data.result, 16) / 1000000000000000000;

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

    // console.log(filteredKlay);

    return { filteredKlay, totalBalance };
  } catch (err) {
    console.log(err, "klay.tx 에러");
  }
};
// klayTx();
module.exports = { klayTx, liveKlayTx };

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
