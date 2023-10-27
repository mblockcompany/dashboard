const axios = require("axios");

const getAtomTxs = async () => {
  const txs = await axios.get(
    "https://dimension-lcd.xpla.dev​​/txs?message.sender=xpla1yzrrphdt6kywv9dvp63735yat427g7cc36u3rg&limit=500&tx.maxheight=99999999"
  );
  let txSeq = parseInt(txs.data.total_count);
  let txEach = txs.data.txs;
  //   console.log(txEach.map((a) => a.logs));

  // 1. txs 를 통해 해당 월렛의 시퀀스와 전체 txhash 를 가져온다.
  // 2. 시퀀스와 txhash 갯수 체크하고, 맞으면 각 tx hash 를 /txs/{hash} api에 get요청. (hash 갯수만큼 for)
  // 3. 각 get 요청 한것의 msg 를 확인하고 디비에 담는다 .
  let arrTx = txEach.map((a) => a.txhash);

  if (arrTx.length == txSeq) {
    for (let v of arrTx) {
      let getTx = await axios.get(`https://dimension-lcd.xpla.dev/txs/${v}`);
      console.log(getTx.data.tx.value.msg);
    }
  }

  let arrLog = txEach.map((a) => a.logs);
  for (let v of arrLog) {
    if (v) {
      for (let item of v) {
        const eventsArr = item.events;
        // console.log(eventsArr);
      }
    }
  }
};
getAtomTxs();
