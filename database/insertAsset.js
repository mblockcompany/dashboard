const { liveKlayTx } = require("../chains/klay");
const pool = require("./dbConnection");
const { liveMediTx } = require("../chains/medi");
const { liveXplaTx } = require("../chains/xpla");
const { liveWemixBalance } = require("../chains/wemix");
const geckoPrice = require("../chains/livePrice");
require("dotenv").config();

const assetStatus = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("Asset DB 연결성공");

    const chainResults = await Promise.all([
      liveKlayTx(),
      liveMediTx(),
      liveXplaTx(),
      liveWemixBalance(),
    ]);
    const priceResults = await geckoPrice();

    const chainData = await Promise.all(
      chainResults.map(async (chain, index) => {
        const chainNames = ["Klay", "Medi", "Xpla", "Wemix"];
        const chainName = chainNames[index];

        const today = new Date();
        today.setHours(today.getHours() + 9); // KST (+9시간)으로 조정;
        const yesterday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 1
        );
        const todayStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 1
        );
        const todayEnd = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        const historySendQ = `
    SELECT * FROM txhistory 
    WHERE txhistory_name = ? 
    AND txhistory_type = 'Send' 
    AND txhistory_date >= ? 
    AND txhistory_date < ?`;
        const sendTransactions = await conn.query(historySendQ, [
          chainName,
          todayStart,
          todayEnd,
        ]);
        const filteredSendTx = sendTransactions
          .map((tx) => Number(tx.txhistory_amounts))
          .reduce((acc, amount) => acc + amount, 0);

        const prevBalance = `
    SELECT assetstatus_balances FROM assetstatus
    WHERE assetstatus_name = ? 
    AND assetstatus_date < ?
    ORDER BY assetstatus_date DESC, assetstatus_id DESC
    LIMIT 1`;

        const lastBalanceResult = await conn.query(prevBalance, [
          chainName,
          yesterday,
        ]);
        const lastBalance = lastBalanceResult[0].assetstatus_balances;
        let increase = chain[0] - lastBalance;
        const threshold = 0.000001;
        if (Math.abs(increase) < threshold) {
          increase = 0;
        }

        return {
          name: chainName,
          balance: chain[0],
          price: priceResults[`${chainNames[index].toLowerCase()}Price`],
          increase: increase,
          decrease: filteredSendTx,
        };
      })
    );

    console.log(chainData);

    const AssetInsertQ = `insert into assetstatus(assetstatus_name, assetstatus_balances, assetstatus_prices, assetstatus_increments, assetstatus_decrements) value(?,?,?,?,?)`;
    for (const data of chainData) {
      await conn.query(AssetInsertQ, [
        data.name,
        JSON.stringify(data.balance),
        data.price,
        data.increase,
        data.decrease,
      ]);
    }
    console.log("데이터 삽입완료");

    // const [
    //   { totalBalance: klayBalance },
    //   filteredMediBalance,
    //   filteredXplaBalance,
    //   filteredWemixBalance,
    //   { klayPrice, mediPrice, xplaPrice, wemixPrice },
    // ] = await Promise.all([
    //   klayTx(),
    //   liveMediTx(),
    //   liveXplaTx(),
    //   liveWemixBalance(),
    //   geckoPrice(),
    // ]);
    // const AssetInsertQ = `insert into assetstatus(assetstatus_balance, assetstatus_prices) values(?,?) `;
    // await conn.query(AssetInsertQ, [JSON.stringify([klayBalance])]);

    // console.log(klayPrice, " 위믹스가격");
    // console.log(mediPrice);
    // console.log(xplaPrice);
    // console.log(wemixPrice);
    // console.log(klayBalance, "클레이 토탈밸런스");
    // console.log(filteredMediBalance[0], "메디 토탈밸런스");
    // console.log(filteredXplaBalance[0], "엑스플라 토탈 밸런스");
    // console.log(filteredWemixBalance[0], "위믹스 토탈밸런스");
  } catch (err) {
    console.log(err, "Asset DB 에러 발생");
  } finally {
    if (conn) {
      await conn.end();
    }
  }
};
// assetStatus();
module.exports = assetStatus;
