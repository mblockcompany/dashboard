const axios = require("axios");

const address = "panacea1x3q6mzpfx2gc3czppkh9hfeduqrtnfj5r7zz9a"; // Medi 지갑주소
const apiUrl = "https://api.gopanacea.org/"; // Medi API

const liveMediTx = async () => {
  try {
    const mediBalance = await axios.get(
      `${apiUrl}cosmos/bank/v1beta1/balances/${address}`
    );
    const filteredMediBalance = mediBalance.data.balances.map(
      (tx) => tx.amount / 1000000
    );

    return filteredMediBalance;
  } catch (err) {
    console.log("medibloc balance Check err", err);
  }
};
// liveMediTx();

const mediTx = async () => {
  try {
    const [latestBlock, chainInfo] = await Promise.all([
      axios.get(`${apiUrl}blocks/latest`),
      axios.get(`${apiUrl}node_info`),
    ]);
    let lastBlock = parseInt(latestBlock.data.block.header.height);
    let plusHeight = parseInt(lastBlock) + 1;
    let chainName = chainInfo.data.application_version.name.toUpperCase();

    const [senderTx, recipientTx] = await Promise.all([
      axios.get(
        `${apiUrl}txs?message.sender=${address}&limit=${plusHeight}&tx.maxheight=${lastBlock}`
      ),
      axios.get(
        `${apiUrl}cosmos/tx/v1beta1/txs?transfer.recipient=${address}&limit=${plusHeight}&tx.maxheight=${lastBlock}`
      ),
    ]);
    const txs = [...senderTx.data.txs, ...recipientTx.data.txs];
    const filteredTxs = txs.filter((tx) =>
      tx.tx.value.msg.some((msg) => msg.type === "cosmos-sdk/MsgSend")
    );
    const sortTxs = filteredTxs.sort((a, b) => {
      return a.height - b.height;
    });
    // console.log(sortTxs.length);
    const normalized = sortTxs.map((tx) => {
      let txType = tx.tx.value.msg.map((msg) => msg.type);
      let txFees = tx.tx.value.fee.amount[0].amount / 1000000;
      let txTime = tx.timestamp.split("T")[0];

      const basedObj = {
        chainName: "MEDI",
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
        // console.log(tx.logs[0].events.find((e) => e.type === "transfer"));
        if (transferLog) {
          const transferAttributes = transferLog.attributes.reduce(
            (acc, attr) => {
              acc[attr.key] = attr.value;

              return acc;
            },
            {}
          );
          let viewTxType =
            transferAttributes.sender === address ? "Send" : "Receive";

          return {
            ...basedObj,
            type: viewTxType,
            From: transferAttributes.sender,
            To: transferAttributes.recipient,
            amount: transferAttributes.amount.replace("umed", "") / 1000000,
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
    return normalized;
  } catch (err) {
    console.log(err, "에러가났어요");
  }
};
// mediTx();
module.exports = { mediTx, liveMediTx };
