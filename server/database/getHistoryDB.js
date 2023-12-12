const pool = require("./dbConnection");
const insertHistory = require("./insertHistory");
const getHistory = async () => {
  try {
    insertHistory();
    console.log("쿼리시작");
    let [...historyQ] = await pool.query(
      "select txhistory.*, memo_body from txhistory left join memo on txhistory.txhistory_memo_id = memo.memo_id ORDER BY txhistory_date;"
    );

    // test
    // const lastArr = historyQ[historyQ.length - 1];
    // console.log(lastArr);
    // return lastArr;
    // test
    return historyQ;
  } catch (err) {
    console.log(err, "getHistory 에러");
  }
};
// getHistory();
module.exports = getHistory;
