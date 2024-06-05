function normalizeTransaction(tx, chainName, txType) {
  let Fees = tx.tx.value.fee.amount.map((a) => a.amount) / 1000000000000000000;
  // 기본 반환 객체 구조 설정
  const baseReturnObject = {
    chainName: chainName,
    height: tx.height,
    type: txType,
    hash: tx.txhash,
    Fee: Fees,
    timestamp: tx.timestamp,
  };

  // 타입이 'cosmos-sdk/MsgCreateValidator' 또는 'cosmos-sdk/MsgVote' 인 경우에는 sender, recipient, amount를 null로 설정
  if (txType.includes("MsgCreateValidator") || txType.includes("MsgVote")) {
    return {
      ...baseReturnObject,

      sender: null,
      recipient: null,
      amount: null,
      Fee: Fees,
    };
  }

  // 그 외의 경우에는 logs에서 해당 정보를 찾아서 반환
  if (tx.logs && tx.logs.length > 0 && tx.logs[0]) {
    const transferLog = tx.logs[0].events.find((e) => e.type === "transfer");
    if (transferLog) {
      const transferAttributes = transferLog.attributes.reduce((acc, attr) => {
        acc[attr.key] = attr.value;
        return acc;
      }, {});

      return {
        ...baseReturnObject,
        sender: transferAttributes.sender,
        recipient: transferAttributes.recipient,
        amount: transferAttributes.amount,
        Fee: Fees,
      };
    }
  }

  // transferLog를 찾지 못한 경우에는 sender, recipient, amount를 null로 설정
  return {
    ...baseReturnObject,
    sender: null,
    recipient: null,
    amount: null,
    Fee: Fees,
  };
}

module.exports = normalizeTransaction;
