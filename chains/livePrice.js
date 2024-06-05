const { default: axios } = require("axios");

require("dotenv").config();

const apiUrl = "https://api.coingecko.com/api/v3/simple/price";
const wemixId = "wemix-token";
const mediId = "medibloc";
const xplaId = "xpla";
const klayId = "klay-token";

const geckoPrice = async () => {
  try {
    const [resWemix, resKlay, resXpla, resMedi] = await Promise.all([
      axios.get(apiUrl, {
        params: {
          ids: wemixId,
          vs_currencies: "krw",
        },
      }),
      axios.get(apiUrl, {
        params: {
          ids: klayId,
          vs_currencies: "krw",
        },
      }),
      axios.get(apiUrl, {
        params: {
          ids: xplaId,
          vs_currencies: "krw",
        },
      }),
      axios.get(apiUrl, {
        params: {
          ids: mediId,
          vs_currencies: "krw",
        },
      }),
    ]);
    const wemixPrice = resWemix.data[wemixId].krw;
    const klayPrice = resKlay.data[klayId].krw;
    const mediPrice = resMedi.data[mediId].krw;
    const xplaPrice = resXpla.data[xplaId].krw;

    // console.log(
    //   wemixPrice,
    //   `위믹스\n`,
    //   klayPrice,
    //   `클레이튼\n`,
    //   mediPrice,
    //   `메디블록\n`,
    //   xplaPrice,
    //   `엑스플라\n`
    // );
    return { klayPrice, mediPrice, xplaPrice, wemixPrice };
  } catch (err) {
    console.log(err, "현재 가격 가져오기 에러");
  }
};

module.exports = geckoPrice;
