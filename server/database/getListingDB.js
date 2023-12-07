const pool = require("./dbConnection");
// const insertAsset = require("./insertAsset");

const getListing = async () => {
  try {
    console.log("Listing Query START");
    let [...listingQ] = await pool.query(
      `SELECT 
    latest.assetstatus_id,
    latest.assetstatus_date,
    latest.assetstatus_name,
    latest.assetstatus_balances,
    latest.assetstatus_decrements,
    latest.assetstatus_increments,
    latest.assetstatus_prices,
    latest.assetstatus_total,
    prev.average_total AS prev_avg_total,
    prev.average_prices AS prev_avg_prices
FROM (
    SELECT 
        *,
        assetstatus_prices * assetstatus_balances AS assetstatus_total
    FROM 
        assetstatus
    WHERE 
        assetstatus_date = (SELECT MAX(assetstatus_date) FROM assetstatus)
) AS latest
LEFT JOIN (
    SELECT 
        assetstatus_name,
        AVG(assetstatus_balances * assetstatus_prices) AS average_total,
        AVG(assetstatus_prices) AS average_prices
    FROM 
        assetstatus
    WHERE 
        DATE(assetstatus_date) = DATE_SUB((SELECT DATE(MAX(assetstatus_date)) FROM assetstatus), INTERVAL 1 DAY)
    GROUP BY 
        assetstatus_name
) AS prev ON latest.assetstatus_name = prev.assetstatus_name
ORDER BY 
    latest.assetstatus_date DESC, latest.assetstatus_name;
`
    );
    // console.log("쿼리끝?");
    // console.log(listingQ);
    // return listingQ;
    const filteredListingQ = listingQ.map((tx) => {
      return {
        assetstatus_id: tx.assetstatus_id,
        assetstatus_date: tx.assetstatus_date,
        assetstatus_name: tx.assetstatus_name,
        assetstatus_balances: Math.round(tx.assetstatus_balances),
        assetstatus_prices: tx.assetstatus_prices,
        assetstatus_total: Math.round(tx.assetstatus_total),
        assetstatus_avg_total: Math.round(tx.prev_avg_total),
        assetstatus_avg_prices: Math.round(tx.prev_avg_prices * 100) / 100,
      };
    });
    // console.log(filteredListingQ);
    const totalAssetValue = filteredListingQ.reduce(
      (sum, item) => sum + item.assetstatus_total,
      0
    );
    const avgTotalAssets = filteredListingQ.reduce(
      (sum, item) => sum + item.assetstatus_avg_total,
      0
    );

    const sortListingQ = filteredListingQ.sort((a, b) => {
      return b.assetstatus_total - a.assetstatus_total;
    });
    const formattedSortedListingQ = sortListingQ.map((item) => {
      return {
        ...item,
        assetstatus_balances: item.assetstatus_balances.toLocaleString(),
        assetstatus_total: item.assetstatus_total.toLocaleString(),
      };
    });

    return {
      listing: formattedSortedListingQ,
      total: totalAssetValue,
      avgTotal: avgTotalAssets,
    };
  } catch (err) {
    console.log(err);
  }
};
// getListing();
module.exports = getListing;
