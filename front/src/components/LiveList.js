import { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";

const ListMain = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const ListHeader = styled.div`
  display: flex;
  border-top: 1px solid white;
  justify-content: left;
  width: 85%;
  padding: 20px 20px;
  align-items: center;
  font-size: calc(13px+2vw);
  font-weight: 700;
`;
const TotalBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 85%;
`;
const LeftBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  flex: 2;
`;
const RightBody = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;
const ListTitle = styled.div`
  display: flex;
  font-size: 11px;
  width: 100%;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 10px;
`;
const ListBody = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: center;
`;
const ListItem = styled.div`
  flex: 1;
`;
const WideListItem = styled(ListItem)`
  flex: 2;
  font-size: 15px;
`;
const ListRow = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 11px;
  margin-bottom: 10px;
`;

function LiveList() {
  const [assetList, setAssetList] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [prevAvgTotal, setPrevAvgTotal] = useState(0);
  useEffect(() => {
    const listingData = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/livelisting");
        console.log(res.data);
        setAssetList(res.data.listing);
        setTotalPrice(res.data.total);
        setPrevAvgTotal(res.data.avgTotal);
      } catch (err) {
        console.log(err, "listingdata Err");
      }
    };
    listingData();
  }, []);

  const calculatePriceChange = (currentPrice, averagePrice) => {
    return ((currentPrice - averagePrice) / averagePrice) * 100;
  };
  return (
    <ListMain>
      <ListHeader>
        <div>가상자산 목록</div>
      </ListHeader>
      <TotalBody>
        <ListTitle>
          <ListItem>가상자산</ListItem>
          <ListItem>보유량</ListItem>
          <ListItem>가격</ListItem>
          <ListItem>자산 가치</ListItem>
          <WideListItem>총 가치</WideListItem>
        </ListTitle>
        <ListBody>
          <LeftBody>
            {assetList.map((item, index) => {
              const priceChange = calculatePriceChange(
                item.assetstatus_prices,
                item.assetstatus_avg_prices
              );
              return (
                <ListRow key={index}>
                  <ListItem>{item.assetstatus_name}</ListItem>
                  <ListItem>{item.assetstatus_balances}</ListItem>
                  <ListItem>
                    ₩ {item.assetstatus_prices}
                    {item.assetstatus_prices && item.assetstatus_avg_prices ? (
                      calculatePriceChange(
                        item.assetstatus_prices,
                        item.assetstatus_avg_prices
                      ) > 0 ? (
                        <div
                          style={{
                            color: "#0ecb81",
                          }}
                        >
                          + {priceChange.toFixed(2)}%
                        </div>
                      ) : (
                        <div style={{ color: "#f6465d" }}>
                          - {priceChange.toFixed(2)}%
                        </div>
                      )
                    ) : (
                      <>Loading...</>
                    )}
                  </ListItem>
                  <ListItem>₩ {item.assetstatus_total}</ListItem>
                </ListRow>
              );
            })}
          </LeftBody>
          <RightBody>
            <WideListItem>
              ₩ {totalPrice.toLocaleString()}
              {totalPrice && prevAvgTotal ? (
                totalPrice - prevAvgTotal > 0 ? (
                  <div
                    style={{
                      color: "#0ecb81",
                    }}
                  >
                    + ₩ {(totalPrice - prevAvgTotal).toLocaleString()}
                  </div>
                ) : (
                  <div style={{ color: "#f6465d" }}>
                    - ₩ {(totalPrice - prevAvgTotal).toLocaleString()}
                  </div>
                )
              ) : (
                <>Loading...</>
              )}
            </WideListItem>
          </RightBody>
        </ListBody>
      </TotalBody>
    </ListMain>
  );
}

export default LiveList;
