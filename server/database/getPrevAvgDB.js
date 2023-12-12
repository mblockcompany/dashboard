const pool = require("./dbConnection");
// const insertAsset = require("./insertAsset");

const getPrevAvg = async () => {
  try {
    console.log("Average Query START");
    let [...avgQ] = await pool.query(
      `SELECT 
    subquery.assetstatus_name,
    AVG(subquery.assetstatus_total) as average_total,
    AVG(subquery.assetstatus_prices) as average_prices
FROM (
    SELECT 
        assetstatus_name,
        assetstatus_balances * assetstatus_prices AS assetstatus_total,
        assetstatus_prices,
        ROW_NUMBER() OVER (PARTITION BY assetstatus_name ORDER BY assetstatus_date DESC) as row_num
    FROM 
        assetstatus
) AS subquery
WHERE 
    subquery.row_num = 2
GROUP BY 
    subquery.assetstatus_name;
`
    );
    // console.log(avgQ.map((tx) => (tx.total += tx.average_total)));
    return avgQ;
  } catch (err) {
    console.log(err);
  }
};
// getPrevAvg();
module.exports = getPrevAvg;
