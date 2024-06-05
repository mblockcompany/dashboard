const pool = require("./dbConnection");
const util = require("util");

const indeInsert = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("인디 디비연결됨");
    const transactions = await conn.query(
      `SELECT txhistory_name, txhistory_date, txhistory_type, txhistory_amounts FROM txhistory;`
    );

    // 체인 이름과 날짜별로 트랜잭션 합계 계산
    const summary = transactions.reduce((acc, tx) => {
      // 날짜와 이름을 기준으로 객체 초기화
      const date = tx.txhistory_date.toISOString().split("T")[0]; // 날짜만 추출
      const key = `${tx.txhistory_name}_${date}`;

      if (!acc[key]) {
        acc[key] = {
          name: tx.txhistory_name,
          date,
          increase_amount: 0,
          decrease_amount: 0,
        };
      }

      // 'Send'일 경우 감소 금액, 'Receive'일 경우 증가 금액에 합산
      if (tx.txhistory_type === "Send") {
        acc[key].decrease_amount += parseFloat(tx.txhistory_amounts);
      } else if (tx.txhistory_type === "Receive") {
        acc[key].increase_amount += parseFloat(tx.txhistory_amounts);
      }

      return acc;
    }, {});

    const resultArray = Object.values(summary);

    console.log(
      "결과 배열:",
      util.inspect(resultArray, { maxArrayLength: null })
    );
  } catch (err) {
    console.log("인디 디비연결안됨", err);
  }
};
indeInsert();
