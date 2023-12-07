const pool = require("./dbConnection");
// const insertAsset = require("./insertAsset");

const getStatus = async () => {
  try {
    console.log("쿼리시작");
    let [...assetQ] = await pool.query(
      `SELECT 
        subquery.assetstatus_id,
        subquery.assetstatus_date,
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
    console.log(err);
  }
};
// getStatus();
module.exports = getStatus;
