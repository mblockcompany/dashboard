const axios = require("axios");
const normalizeTransaction = require("../src/Normalizer");

const xplaTx = async () => {
  const address = "xpla1yzrrphdt6kywv9dvp63735yat427g7cc36u3rg"; // XPLA 지갑주소
  const apiUrl = "https://dimension-lcd.xpla.dev/"; // XPLA API
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
    const uniqTxs = txs.reduce((acc, current) => {
      const x = acc.find((i) => i.txhash === current.txhash);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    const sortTxs = uniqTxs.sort((a, b) => {
      return a.height - b.height;
    });

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

      if (
        txType[0].includes("cosmos-sdk/MsgCreateValidator") ||
        txType[0].includes("cosmos-sdk/MsgVote")
      ) {
        return {
          ...basedObj,
          From: null,
          To: null,
          amount: null,
        };
      }
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

          return {
            ...basedObj,
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
    return normalized;
    // console.log(normalized);
    // console.log(sortTxs[54].tx.value.msg);
    // console.log(senderTx, "보낸 티엑스");
    // console.log(recipientTx, "받느 티엑스");
    // console.log(lastBlock);
  } catch (err) {
    console.log(err);
  }
};

module.exports = xplaTx;
