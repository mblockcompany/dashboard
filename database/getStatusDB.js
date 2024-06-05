const pool = require("./dbConnection");
// const insertAsset = require("./insertAsset");

// 자산현황
// 하루 3번 데이터 요청 후 저장한 데이터를
// 해당 일자에 prices 와 total 값의 평균값을 반환함.

const getStatus = async () => {
  try {
    console.log("쿼리시작");
    let [...assetQ] = await pool.query(
      `SELECT 
        subquery.assetstatus_id,
        CONVERT_TZ(subquery.assetstatus_date, '+00:00', '+09:00') as assetstatus_date,
        subquery.assetstatus_name,
        subquery.assetstatus_balances,
        subquery.assetstatus_decrements,
        subquery.assetstatus_increments,
        subquery.assetstatus_prices,
        subquery.assetstatus_total
      FROM (
        SELECT
          *,
          assetstatus_prices * assetstatus_balances AS assetstatus_total,
          ROW_NUMBER() OVER (PARTITION BY assetstatus_name, DATE(assetstatus_date) ORDER BY assetstatus_date DESC) as rn
        FROM 
          assetstatus
      ) AS subquery
      WHERE rn = 1
      ORDER BY subquery.assetstatus_date, subquery.assetstatus_name`
    );
    // console.log("쿼리끝?");
    // console.log(assetQ);
    return assetQ;
  } catch (err) {
    console.log(err, "getStatus Error");
  }
};
// getStatus();
module.exports = getStatus;
