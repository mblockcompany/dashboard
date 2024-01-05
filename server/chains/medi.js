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
        `${apiUrl}cosmos/tx/v1beta1/txs?events=transfer.sender='${address}'&limit=${plusHeight}&tx.maxheight=${lastBlock}`
      ),
      axios.get(
        `${apiUrl}cosmos/tx/v1beta1/txs?events=transfer.recipient='${address}'&limit=${plusHeight}&tx.maxheight=${lastBlock}`
      ),
    ]);

    const txs = [
      ...senderTx.data.tx_responses,
      ...recipientTx.data.tx_responses,
    ];
    const normalized = txs
      .map((tx) => {
        let timestamp = tx.timestamp.split("T")[0];
        let height = tx.height;
        let txHash = tx.txhash;
        let fee = tx.tx.auth_info.fee.amount
          .map((fee) => fee.amount / 1000000)
          .reduce((a, b) => a + b, 0);

        const logs = tx.logs.flatMap((log) => {
          const messageEvent = log.events.find(
            (event) => event.type === "message"
          );

          const transferEvent = log.events.find(
            (event) => event.type === "transfer"
          );

          if (messageEvent && transferEvent) {
            const isMsgSend = messageEvent.attributes.some(
              (attr) => attr.value === "/cosmos.bank.v1beta1.MsgSend"
            );

            if (isMsgSend) {
              const fromAddress = transferEvent.attributes.find(
                (attr) => attr.key === "sender"
              )?.value;
              const toAddress = transferEvent.attributes.find(
                (attr) => attr.key === "recipient"
              )?.value;
              const amount = transferEvent.attributes.find(
                (attr) => attr.key === "amount"
              )?.value;
              let type = fromAddress === address ? "Send" : "Receive";

              return {
                chainName: "MEDI",
                timestamp,
                type: type,
                // height,
                fees: fee,
                hash: txHash,
                From: fromAddress,
                To: toAddress,
                amount: amount.replace("umed", "") / 1000000,
                memo: null,
              };
            }
          }
          return null;
        });

        return logs.filter((log) => log !== null);
      })
      .flatMap((log) => log)
      .filter((item) => item !== null);
    // console.log(normalized, "extracted");
    console.log("Complete medi");
    return normalized;
  } catch (err) {
    console.log(err, "에러가났어요");
  }
};
mediTx();
module.exports = { mediTx, liveMediTx };
