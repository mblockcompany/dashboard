const { default: axios } = require("axios");

require("dotenv").config();

const metaTx = async () => {
  const addresses = "0xd8f5272EF21a50c5adB0fCEf31eb9E91aC4eB2f5";

  try {
    const balances = await axios.post(
      "https://api.metadium.com/v1/accounts/balance",

      { addresses: addresses },
      {
        headers: {
          "api-key": process.env.META_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(balances.data);
    return balances.data;
  } catch (err) {
    console.log(err);
  }
};
metaTx();
module.exports = metaTx;
