import styled from "styled-components";
import LiveGraph from "./LiveGraph";
import { useEffect, useState } from "react";
import axios from "axios";
import LiveList from "./LiveList";
import AssetStatus from "./AssetStatus";
import { Route, Routes, Link, Navigate, useLocation } from "react-router-dom";
import TxHistory from "./TxHistory";

const MainDiv = styled.div`
  margin: 30px;
  padding: 10px 30px;
  border-radius: 25px;
  border: 1px solid white;
  background-color: #1e1e1e;
  width: 60vw;
  max-width: 1000px;
`;
const CateDiv = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
`;
const LinkStyle = styled(Link)`
  text-decoration: none;
  &:hover,
  &:active,
  &:visited {
    text-decoration: none;
  }
`;
const DetailCate = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: 0;
  font-size: 15px;
  font-weight: 600;
  color: #bebebe;
  padding: 15px 30px;
  text-decoration: none;
  outline: none;
  &:hover {
    color: #d6d6d6;
    cursor: pointer;
  }
  &:active,
  &:focus {
    color: white;
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

const BoundaryLine = styled.div`
  margin: 20px 10px;
  border: 1px solid #767676;
`;

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
        const res = await axios.get(`/api/live`);
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

        const categories = Object.keys(aggregatedData).slice(-7);
        const seriesData = categories.map((date) => aggregatedData[date]);
        // console.log(categories, "category data");
        // console.log(seriesData, "seriese data");

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
  const location = useLocation();
  const [clickStatus, setClickStatus] = useState(true);
  const [clickHistory, setClickHistory] = useState(false);
  const StatusClicked = () => {
    setClickStatus(true);
    setClickHistory(false);
  };
  const HistoryClicked = () => {
    setClickStatus(false);
    setClickHistory(true);
  };

  return (
    <MainDiv>
      <CateDiv>
        <LinkStyle to="/asset/status">
          <DetailCate
            style={{
              textDecoration: "none",
              color: clickStatus ? "white" : "#bebebe",
            }}
            onClick={StatusClicked}
          >
            {location.pathname === "/asset/status" ? (
              <u>보유 현황</u>
            ) : (
              <>보유 현황</>
            )}
          </DetailCate>
        </LinkStyle>
        <LinkStyle to="/asset/history">
          <DetailCate
            style={{
              textDecoration: "none",
              color: clickHistory ? "white" : "#bebebe",
            }}
            onClick={HistoryClicked}
          >
            {location.pathname === "/asset/history" ? (
              <u>거래 내역</u>
            ) : (
              <>거래 내역</>
            )}
          </DetailCate>
        </LinkStyle>
      </CateDiv>
      <Routes>
        <Route path="/" element={<Navigate replace to="status" />} />
        <Route path="*" element={<Navigate replace to="status" />} />
        <Route
          path="status"
          element={
            <>
              <LiveDiv>
                <LiveGraph chartData={chartData} roundData={roundData} />
                <LiveList />
              </LiveDiv>
              <BoundaryLine />
              <LiveDiv>
                <AssetStatus />
              </LiveDiv>
            </>
          }
        />
        <Route
          path="history"
          element={
            <>
              <LiveDiv>
                <TxHistory />
              </LiveDiv>
            </>
          }
        />
      </Routes>
    </MainDiv>
  );
}

export default LiveDashboard;
