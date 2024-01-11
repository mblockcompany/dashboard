const axios = require("axios");
const normalizeTransaction = require("../src/Normalizer");

const address = "xpla1yzrrphdt6kywv9dvp63735yat427g7cc36u3rg"; // XPLA 지갑주소
const apiUrl = "https://dimension-lcd.xpla.dev/"; // XPLA API
const valoper = "xplavaloper1yzrrphdt6kywv9dvp63735yat427g7ccq8ltv4";

const liveXplaTx = async () => {
  try {
    const XplaBalance = await axios.get(
      `${apiUrl}cosmos/bank/v1beta1/balances/${address}`
    );
    const XplaCommission = await axios.get(
      `${apiUrl}cosmos/distribution/v1beta1/validators/${valoper}/commission`
    );
    const filteredXplaBalance = XplaBalance.data.balances.map(
      (tx) => tx.amount / 1000000000000000000
    );
    const filteredXplaCommission =
      XplaCommission.data.commission.commission.map(
        (tx) => Number(tx.amount) / 1e18
      );
    // c;
    // console.log(filteredXplaCommission;)
    let totalXplaBalance = filteredXplaBalance[0] + filteredXplaCommission[0];
    // console.log([totalXplaBalance]);
    return [totalXplaBalance];
  } catch (err) {
    console.log("Xpla balance Check err", err);
  }
};
// liveXplaTx();
const xplaTx = async () => {
  try {
    const [latestBlock, chainInfo] = await Promise.all([
      axios.get(`${apiUrl}blocks/latest`),
      axios.get(`${apiUrl}node_info`),
    ]);
    let lastBlock = latestBlock.data.block.header.height;
    let plusHeight = lastBlock + 1;
    let chainName = chainInfo.data.application_version.name.toUpperCase();

    const [senderTx, recipientTx] = await Promise.all([
      axios.get(
        `${apiUrl}/txs?message.sender=${address}&limit=${plusHeight}&tx.maxheight=${lastBlock}`
      ),
      axios.get(
        `${apiUrl}/txs?transfer.recipient=${address}&limit=${plusHeight}&tx.maxheight=${lastBlock}`
      ),
    ]);
    const txs = [...senderTx.data.txs, ...recipientTx.data.txs];
    // const uniqTxs = txs.reduce((acc, current) => {
    //   const x = acc.find((i) => i.txhash === current.txhash);
    //   if (!x) {
    //     return acc.concat([current]);
    //   } else {
    //     return acc;
    //   }
    // }, []);

    const filteredTxs = txs.filter((tx) =>
      tx.tx.value.msg.some((msg) => msg.type === "cosmos-sdk/MsgSend")
    );

    // console.log(txs.map((tx) => tx.tx.value.msg));

    // console.log(filteredTxs.map((a) => a.tx.value.msg));
    const sortTxs = filteredTxs.sort((a, b) => {
      return a.height - b.height;
    });
    // console.log(sortTxs);
    const normalized = sortTxs.map((tx) => {
      let txType = tx.tx.value.msg.map((msg) => msg.type);
      let txFees = tx.tx.value.fee.amount[0].amount / 1000000000000000000;
      let txTime = tx.timestamp.split("T")[0];

      const basedObj = {
        chainName: "XPLA",
        timestamp: txTime,
        type: txType[0],
        fees: txFees,
        hash: tx.txhash,
        memo: null,
      };

      if (tx.logs && tx.logs.length > 0 && tx.logs[0]) {
        const transferLog = tx.logs[0].events.find(
          (e) => e.type === "transfer"
        );
        if (transferLog) {
          const transferAttributes = transferLog.attributes.reduce(
            (acc, attr) => {
              acc[attr.key] = attr.value;
              return acc;
            },
            {}
          );

          let veiwTxType =
            transferAttributes.sender === address ? "Send" : "Receive";
          // console.log(address);
          return {
            ...basedObj,
            type: veiwTxType,
            From: transferAttributes.sender,
            To: transferAttributes.recipient,
            amount:
              transferAttributes.amount.replace("axpla", "") /
              1000000000000000000,
          };
        }
      }

      return {
        ...basedObj,
        From: null,
        To: null,
        amount: null,
      };
    });
    // console.log(normalized);
    console.log("Complete Xpla");
    return normalized;

    // console.log(sortTxs[54].tx.value.msg);
    // console.log(senderTx, "보낸 티엑스");
    // console.log(recipientTx, "받느 티엑스");
    // console.log(lastBlock);
  } catch (err) {
    console.log(err, "xpla 에러");
  }
};
// xplaTx();
module.exports = { xplaTx, liveXplaTx };
