import styled from "styled-components";
import logo from "../logo.svg";
import ApexChart from "react-apexcharts";
import { useEffect, useState } from "react";

const MainDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleDiv = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  color: white;
  font-weight: 700;
  padding: 20px 40px;
  font-size: calc(14px+1vmin);
`;
const LiveDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
const PaddingDiv = styled.div`
  margin: 50px 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 2 1;

  @media (max-width: 1000px) {
    flex-direction: column;
  }
`;
// 실시간 보유현황 좌 그래프 시작 ---------------------
const GraphDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  @media (max-width: 1000px) {
    border-right: none;
    border-bottom: 1px solid white;
  }
`;
const GraphTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const GraphDesc = styled.div`
  font-size: 14px;
  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: flex-start;
  margin: 20px;
`;
const ChartDiv = styled.div`
  width: 100%;

  min-width: 300px;
  @media (max-width: 1000px) {
    width: 50vw;
  }
`;
// 실시간 보유현황 좌 그래프 끝 ----------------------
// 실시간 보유현황 우 원형그래프 시작 ------------------
const RoundDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  @media (max-width: 1000px) {
    display: flex;
  }
`;
const RountTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-size: 13px+2vmin;
  font-weight: 500;
  margin: 25px 0;
  @media (min-width: 1000px) {
    font-size: calc(14px);
  }
`;
const RoundDescDiv = styled.div`
  display: flex;
  justify-content: center;
  /* margin-top: 40px; */
  align-items: center;
`;
const RoundDesc = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
// const RoundDescChain = styled.div`
//   display: flex;
//   font-size: 12px;
//   justify-content: center;
//   align-items: center;
//   & h2 {
//     padding-right: 7px;
//   }
// `;
//   console.log(chartData.series[0].data, "series data");
//     console.log(chartData.categories);

// 실시간 보유현황 우 원형그래프 끝 -------------------

function LiveGraph({ chartData, roundData }) {
  const [chartingData, setChartingData] = useState(null);
  const [beforeRatio, setBeforeRatio] = useState(0);
  const [totalRatio, setTotalRatio] = useState(0);
  const [latestBalances, setLatestBalances] = useState({});
  useEffect(() => {
    try {
      let livePrices =
        chartData.series[0].data[chartData.series[0].data.length - 1];
      setChartingData(livePrices);

      let secOldPrice =
        chartData.series[0].data[chartData.series[0].data.length - 2];
      setBeforeRatio(secOldPrice);

      let totalRatio = ((livePrices - secOldPrice) / secOldPrice) * 100;
      setTotalRatio(totalRatio.toFixed(2));
    } catch (err) {
      console.log(err);
    }
  }, [chartData]);

  useEffect(() => {
    try {
      setLatestBalances({
        Klay:
          roundData.Klay?.assetstatus_balances *
            roundData.Klay?.assetstatus_prices || 0,
        Wemix:
          roundData.Wemix?.assetstatus_balances *
            roundData.Wemix?.assetstatus_prices || 0,
        Xpla:
          roundData.Xpla?.assetstatus_balances *
            roundData.Xpla?.assetstatus_prices || 0,
        Medi:
          roundData.Medi?.assetstatus_balances *
            roundData.Medi?.assetstatus_prices || 0,
      });
    } catch (err) {
      console.log(err, "donutData Err");
    }
  }, [roundData]);

  let labels = Object.keys(latestBalances);
  let donutSeries = labels.map((label) => parseFloat(latestBalances[label]));

  const donutOptions = {
    chart: {
      type: "donut",
    },
    labels: labels,
    legend: { labels: { colors: "#ffffff" }, position: "bottom" },

    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            type: "donut",
            width: 200,
          },
        },
      },
    ],
  };

  const chartOptions = {
    tooltip: {
      style: {
        colors: ["#000000"],
      },
      theme: "dark",
    },
    colors: ["#000000"],
    stroke: {
      curve: "smooth",
    },
    chart: {
      type: "line",
      toolbar: { show: false },
    },
    xaxis: {
      categories: chartData.categories,
    },
    yaxis: {
      labels: { show: false },
    },
  };
  return (
    <MainDiv>
      <TitleDiv>실시간 보유현황</TitleDiv>
      <LiveDiv>
        <PaddingDiv>
          <GraphDiv>
            <GraphTitle>
              <GraphDesc>
                <div>자산 총 가치</div>
                {chartingData ? (
                  <div> ₩ {Math.round(chartingData).toLocaleString()}</div>
                ) : (
                  <div>Loading...</div>
                )}
              </GraphDesc>
              <GraphDesc>
                <div>전일 대비 변동률</div>
                {totalRatio ? (
                  chartingData - beforeRatio > 0 ? (
                    <div
                      style={{
                        color: "#0ecb81",
                      }}
                    >
                      + {Math.abs(totalRatio)}%
                    </div>
                  ) : (
                    <div style={{ color: "#f6465d" }}>
                      {" "}
                      - {Math.abs(totalRatio)}%
                    </div>
                  )
                ) : (
                  <>Loading...</>
                )}
              </GraphDesc>
            </GraphTitle>
            <ChartDiv>
              {/* <img src={logo} className="App-logo" alt="logo" /> */}

              {chartData && chartData.series && (
                <ApexChart
                  width="100%"
                  options={chartOptions}
                  series={chartData.series}
                  type="line"
                />
              )}
            </ChartDiv>
          </GraphDiv>

          <RoundDiv>
            <RountTitle>자산 비율</RountTitle>
            <RoundDescDiv>
              <RoundDesc>
                <div>
                  {/* <img src={logo} className="App-logo" alt="logo" /> */}

                  <ApexChart
                    width="100%"
                    options={donutOptions}
                    series={donutSeries}
                    type="donut"
                  />
                </div>
                <div>
                  {/* <RoundDescChain>
                      <h2>hi</h2>
                      <h4>13.05%</h4>
                    </RoundDescChain>
                    <RoundDescChain>
                      <h2>hi</h2>
                      <h4>13.05%</h4>
                    </RoundDescChain>
                    <RoundDescChain>
                      <h2>hi</h2>
                      <h4>13.05%</h4>
                    </RoundDescChain>
                    <RoundDescChain>
                      <h2>hi</h2>
                      <h4>13.05%</h4>
                    </RoundDescChain>
                    <RoundDescChain>
                      <h2>hi</h2>
                      <h4>13.05%</h4>
                    </RoundDescChain> */}
                </div>
              </RoundDesc>
            </RoundDescDiv>
          </RoundDiv>
        </PaddingDiv>
      </LiveDiv>
    </MainDiv>
  );
}

export default LiveGraph;
