const xplaTx = require("./chains/xpla");
const pool = require("./database/dbConnection");

async function main() {
  let conn;

  try {
    conn = await pool.getConnection(); // 데이터베이스 연결을 얻음.
    console.log("디비연결성공");
    const xplaTxs = await xplaTx();

    for (const tx of xplaTxs) {
      const { chainName, timestamp, type, fees, hash, memo, From, To, amount } =
        tx;

      const [rows] = await conn.query(
        "SELECT * FROM txhistory WHERE txhistory_hash = ?",
        [hash]
      );
      console.log(rows);
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
      }
    }
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
  // pool.end()는 필요 없습니다. pool을 재사용하려면 프로세스가 종료될 때까지 열어 두세요.
}
main();
