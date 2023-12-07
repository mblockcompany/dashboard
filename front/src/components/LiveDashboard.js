import styled from "styled-components";
import LiveGraph from "./LiveGraph";
import { useEffect, useState } from "react";
import axios from "axios";
import LiveList from "./LiveList";

const MainDiv = styled.div`
  margin: 30px;
  padding: 10px 30px;
  border-radius: 25px;
  border: 1px solid white;
  background-color: #1e1e1e;
`;
const CateDiv = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
`;
const DetailCate = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 600;
  color: white;
  padding: 15px 30px;
  &:hover {
    cursor: pointer;
    color: gray;
  }
`;
const LiveDiv = styled.div`
  background-color: #5e5e5e;
  border-radius: 25px;
  padding: 10px 0;
  margin-top: 10px;
  border: 1px solid white;
`;
//
//

function LiveDashboard() {
  const [chartData, setChartData] = useState({
    categories: [],
    series: [],
  });
  const [livePrices, setLivePrices] = useState(null);
  const [roundData, setRoundData] = useState(null);
  useEffect(() => {
    const forApex = async () => {
      try {
        const res = await axios.get(`http://localhost:3001`);
        const data = res.data;
        // 날짜별 데이터
        // 날짜와 체인 이름을 키로 사용하여 데이터를 그룹화합니다.
        const groupedData = data.reduce((acc, item) => {
          const date = item.assetstatus_date.split(" ")[0]; // '월-일'만 추출
          const key = date + "-" + item.assetstatus_name;
          if (
            !acc[key] ||
            new Date(item.assetstatus_date) >
              new Date(acc[key].assetstatus_date)
          ) {
            acc[key] = item; // 가장 최근의 데이터 저장
          }
          return acc;
        }, {});

        // 그룹화된 데이터를 날짜별로 집계합니다.
        const aggregatedData = Object.values(groupedData).reduce(
          (acc, item) => {
            const date = item.assetstatus_date.split("T")[0];
            if (!acc[date]) {
              acc[date] = 0;
            }
            acc[date] += item.assetstatus_balances * item.assetstatus_prices;
            return acc;
          },
          {}
        );

        const categories = Object.keys(aggregatedData);
        const seriesData = categories.map((date) => aggregatedData[date]);
        console.log(categories, "category data");
        console.log(seriesData, "seriese data");
        // const groupedData = data.reduce((acc, item) => {
        //   const date = item.assetstatus_date.split(" ")[0]; // '월-일'만 추출
        //   if (!acc[date]) {
        //     acc[date] = new Set(); // 중복을 방지하기 위해 Set을 사용
        //   }
        //   acc[date].add(item.assetstatus_name + item.assetstatus_date.split(" ")[1]); // '시-분-초'를 포함한 이름을 추가
        //   return acc;
        // }, {});

        // const seriesData = Object.keys(groupedData).map((date) => {
        //   const entries = data.filter((item) => item.assetstatus_date.startsWith(date));
        //   const total = entries.reduce(
        //     (sum, entry) => sum + entry.assetstatus_balances * entry.assetstatus_prices,
        //     0
        //   );
        //   const average = total / groupedData[date].size; // 유니크한 항목의 수로 나누어 평균을 구함
        //   return average;
        // });

        // 각 밸런스 (원형그래프)
        const latestData = data
          .filter((asset) =>
            ["Klay", "Wemix", "Xpla", "Medi"].includes(asset.assetstatus_name)
          )
          .reduce((accc, asset) => {
            const current = accc[asset.assetstatus_name];
            if (
              !current ||
              new Date(asset.assetstatus_date) >
                new Date(current.assetstatus_date)
            ) {
              accc[asset.assetstatus_name] = asset;
            }
            return accc;
          });
        setRoundData(latestData);

        setChartData({
          categories,
          series: [
            {
              name: "Total",
              data: seriesData.map((v) => parseFloat(v.toFixed(2))),
            },
          ],
        });
      } catch (err) {
        console.log(err, "Live DashBoard Err");
      }
    };
    forApex();
  }, []);

  return (
    <MainDiv>
      <CateDiv>
        <DetailCate>보유 현황</DetailCate>
        <DetailCate>거래 내역</DetailCate>
      </CateDiv>
      <LiveDiv>
        <LiveGraph chartData={chartData} roundData={roundData} />
        <LiveList />
      </LiveDiv>
    </MainDiv>
  );
}

export default LiveDashboard;
