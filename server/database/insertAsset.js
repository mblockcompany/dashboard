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

    const chainData = chainResults.map((chain, index) => {
      const chainNames = ["Klay", "Medi", "Xpla", "Wemix"];
      return {
        name: chainNames[index],
        balance: chain[0],
        price: priceResults[`${chainNames[index].toLowerCase()}Price`],
      };
    });
    // console.log(chainData);
    const AssetInsertQ = `insert into assetstatus(assetstatus_name, assetstatus_balances, assetstatus_prices) value(?,?,?)`;
    for (const data of chainData) {
      await conn.query(AssetInsertQ, [
        data.name,
        JSON.stringify(data.balance),
        data.price,
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
