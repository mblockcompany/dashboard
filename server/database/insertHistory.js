const { klayTx } = require("../chains/klay");
const { mediTx } = require("../chains/medi");
const { wemixTx } = require("../chains/wemix");
const { xplaTx } = require("../chains/xpla");

const pool = require("./dbConnection");

async function insertHistory() {
  let conn;

  try {
    conn = await pool.getConnection(); // 데이터베이스 연결을 얻음.
    console.log("디비연결성공");
    // const xplaTxs = await xplaTx();
    // const mediTxs = await mediTx();
    const [xplaTxs, mediTxs, wemixTxs, klayResult] = await Promise.all([
      xplaTx(),
      mediTx(),
      wemixTx(),
      klayTx(),
    ]);
    const klayTxs = klayResult.filteredKlay;
    const allTxs = [...xplaTxs, ...mediTxs, ...wemixTxs, ...klayTxs];
    console.log(allTxs, "allTxs");
    for (const tx of allTxs) {
      const { chainName, timestamp, type, fees, hash, memo, From, To, amount } =
        tx;

      const [rows] = await conn.query(
        "SELECT * FROM txhistory WHERE txhistory_hash = ?",
        [hash]
      );
      // console.log(rows, "디비콘솔 rows");
      if (rows === undefined) {
        const insertQuery = `
        INSERT INTO txhistory (
          txhistory_name, txhistory_date, txhistory_type, txhistory_amounts,
          txhistory_fees, txhistory_hash, txhistory_from, txhistory_to
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

        await conn.query(insertQuery, [
          chainName,
          timestamp,
          type,
          amount,
          fees,
          hash,
          From,
          To,
        ]);
        console.log(`새로운데이터 삽입 : ${hash}`);
      } else {
        console.log(`중복데이터 ${hash}`);
        // console.log("중복");
      }
    }
    // console.log(totalBalance, "totalbalance");
    //Asset Status Logic
    // for (const assetTx of allTxs) {
    //   const { totalBalance } = assetTx;
    //   console.log(totalBalance);
    // }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    if (conn) {
      try {
        await conn.end();
      } catch (relErr) {
        console.log(relErr);
      }
    }
  }
}
// insertHistory();
module.exports = insertHistory;
