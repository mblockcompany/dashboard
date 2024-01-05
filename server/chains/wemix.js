const { default: axios } = require("axios");
const ethers = require("ethers");
require("dotenv").config();

const getContractCode = async (address) => {
  try {
    const response = await axios.get(
      `https://explorerapi.wemix.com/v1/contracts/${address}/code`,
      {
        headers: {
          "api-key": `${process.env.WEMIX_APIKEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return {
      codeAddress: address,
      codeCA: response.data.results.data.contract_code,
    };
  } catch (error) {
    console.error(
      `Error retrieving contract code for address ${address}:`,
      error
    );
  }
};

const liveWemixBalance = async () => {
  const address = "0x8eab8a3535b6c2715dcb3da026c2a1241f08b28d";
  const wemixApi = "https://explorerapi.wemix.com";
  try {
    const WemixBalance = await axios.post(
      `${wemixApi}/v1/accounts/balance`,
      {
        addresses: ["0x8eab8a3535b6c2715dcb3da026c2a1241f08b28d"],
      },
      {
        headers: {
          "api-key": `${process.env.WEMIX_APIKEY}`,
          "content-type": "application/json",
        },
      }
    );
    let filteredWemixBalance = WemixBalance.data.results.data.map(
      (tx) => tx.balance / 1000000000000000000
    );
    return filteredWemixBalance;
  } catch (err) {
    console.log(err, "위믹스 밸런스체크 에러");
  }
};

const wemixTx = async () => {
  const address = "0x8eab8a3535b6c2715dcb3da026c2a1241f08b28d";
  const wemixApi = "https://api.wemix.com";
  const provider = new ethers.providers.JsonRpcProvider(wemixApi);
  try {
    const resTx = await axios.get(
      `https://explorerapi.wemix.com/v1/accounts/${address}/transactions`,
      {
        headers: {
          "api-key": `${process.env.WEMIX_APIKEY}`,
        },
      }
    );

    const senderAddr = await resTx.data.results.data.map((tx) => tx.sender);
    const receiverAddr = await resTx.data.results.data.map((tx) => tx.receiver);

    const senderContractCodes = await Promise.all(
      senderAddr.map(getContractCode)
    );
    const receiverContractCodes = await Promise.all(
      receiverAddr.map(getContractCode)
    );

    const CAReceive = receiverContractCodes
      .filter((code) => code.codeCA !== "0x")
      .map((code) => code.codeAddress);
    const CASender = senderContractCodes
      .filter((code) => code && code.codeCA !== "0x")
      .map((code) => code.codeAddress);

    const filteredTxs = resTx.data.results.data
      .sort((a, b) => a.block_number - b.block_number)
      .filter(
        (tx) =>
          !CASender.includes(tx.sender) && !CAReceive.includes(tx.receiver)
      )
      .map((tx) => {
        let trasnferType = address === tx.sender ? "Send" : "Receive";
        let feeDot = (
          (tx.gas_used * tx.gas_price) /
          1000000000000000000
        ).toFixed(18);
        let txTime = tx.timestamp.split("T")[0];
        return {
          chainName: "WEMIX",
          timestamp: txTime,
          type: trasnferType,
          fees: feeDot,
          hash: tx.transaction_hash.substring(2),
          memo: null,
          From: tx.sender,
          To: tx.receiver,
          amount: tx.value / 1000000000000000000,
        };
      });
    console.log(filteredTxs);
    return filteredTxs;
  } catch (err) {
    console.log(err, "WEMIX API Error");
  }
};

wemixTx();
module.exports = { wemixTx, liveWemixBalance };
