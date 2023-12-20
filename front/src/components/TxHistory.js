import styled from "styled-components";
import axios from "axios";
import { forwardRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

const MainDiv = styled.div`
  width: 90%;
  margin: auto;
`;
const TitleTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 25px;
`;
const LeftTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  & button {
    margin-left: 20px;
    background: none;
    color: white;
    font-size: calc(15px+1vmin);
    font-weight: 600;
    border-radius: 10px;
    border: 1px solid white;
    padding: 5px 10px;
    &:hover {
      cursor: pointer;
      color: gray;
    }
  }
`;
const RightTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  & button {
    padding: 8px 15px;
    border: 1px solid white;
    border-radius: 5px;
    color: white;
    background: none;
    &:hover {
      cursor: pointer;
    }
  }
`;
const RightBtn = styled.button`
  padding: 8px 15px;
  border: 1px solid white;
  border-radius: 5px;
  color: white;
  background: none;
  &:hover {
    cursor: pointer;
  }
`;
const BodyTotal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
const BodyTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  margin: auto;
  border-bottom: 1px solid white;
  padding: 10px 0;
`;
const BodyDetail = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  flex: 1;
  overflow-wrap: break-word; // 여기에도 같은 속성을 적용
  word-break: break-all; // 단어 단위가 아닌 임의의 위치에서 줄바꿈
  &.narrow {
    flex: 0.7;
  }
  &.widePadding {
    padding: 0 10px;
  }
`;
const BodyTxList = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const BodyTxDetail = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  padding: 10px 0;
`;
/* 
1. 캐시데이터 가져오기
2. 캐시데이터 보여주기
3. 캐시데이터 역순으로
*/
function TxHistory() {
  const [dateRange, setDateRange] = useState([]);
  const [startDate, endDate] = dateRange;
  const [data, setData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [selectedOption, setSelectedOption] = useState(null);

  // 데이터 가져오기
  useEffect(() => {
    const historyCache = async () => {
      try {
        const history = await axios.get("http://localhost:3001/txhistory");
        const sortHistory = history.data.sort((a, b) => {
          return new Date(b.txhistory_date) - new Date(a.txhistory_date);
        });

        setData(sortHistory);
        if (sortHistory.length > 0) {
          // const recentDate = new Date(sortHistory[0].txhistory_date);
          // const startDate = new Date(recentDate);
          // const endDate = new Date(startDate);
          // endDate.setDate(startDate.getDate() - 6);
          const endDate = new Date(sortHistory[29].txhistory_date);
          const startDate = new Date(sortHistory[0].txhistory_date);
          setDateRange([endDate, startDate]);
        }
      } catch (err) {
        console.log(err, "historyCache Err");
      }
    };
    historyCache();
  }, []);

  // filtered dropBox, Cal
  const handleSelectChange = (selectedOption) => {
    console.log("Selec options", selectedOption);
    setSelectedOption(selectedOption);
  };
  const getFilteredData = () => {
    // calender Logic
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    if (!selectedOption) {
      return data.filter((item) => {
        const itemDate = new Date(item.txhistory_date);
        return itemDate >= start && itemDate < end;
      });
    }

    return data.filter((item) => {
      const itemDate = new Date(item.txhistory_date);
      const isDateInRange = itemDate >= start && itemDate < end;

      let isOptionMatch = false;
      if (selectedOption && selectedOption.label === "위믹스") {
        isOptionMatch = item.txhistory_name === selectedOption.value;
      } else if (selectedOption && selectedOption.label === "MEDI") {
        isOptionMatch = item.txhistory_name === selectedOption.value;
      }
      return isDateInRange && isOptionMatch;

      // return data.filter((i) => {
      //   const itemDate = new Date(i.txhistory_date);
      //   return itemDate >= start && itemDate < end;

      ///////////////////
      // cal + dropBox Logic//
      ///////////////////

      // if (!startDate || !endDate || !selectedOption) return data;

      // const start = new Date(startDate);
      // const end = new Date(endDate);
      // end.setDate(end.getDate() + 1); // 날짜 범위 조정

      // return data.filter((item) => {
      //   const itemDate = new Date(item.txhistory_date);
      //   const isDateInRange = itemDate >= start && itemDate < end;
      //   let isOptionMatch = false;
      //   if (selectedOption.label === "Chain_Name") {
      //     isOptionMatch = item.txhistory_name === selectedOption.value;
      //   } else if (selectedOption.label === "Chain_Type") {
      //     isOptionMatch = item.txhistory_type === selectedOption.value;
      //   }

      //   return isDateInRange && isOptionMatch;
    });
  };

  useEffect(() => {
    const filteredData = getFilteredData();
    setHistoryData(filteredData);
  }, [dateRange, selectedOption, data]);

  // Calender 관련
  const CalCustomInput = forwardRef(({ value, onClick }, ref) => (
    <button className="example-custom-input" onClick={onClick} ref={ref}>
      {value}
    </button>
  ));

  //Select DropBox
  const options = [
    {
      label: "View All",
      options: [{ value: "전체보기", label: "전체보기" }],
    },
    {
      label: "Chain_Name",
      options: [
        { value: "MEDI", label: "MEDI" },
        { value: "무슨밸류일까용", label: "XPLA" },
        { value: "WEMIX", label: "위믹스" },
        { value: "Klay", label: "Klay" },
      ],
    },
    {
      label: "Chain_Type",
      options: [
        { value: "Send", label: "Send" },
        { value: "Receive", label: "Receive" },
      ],
    },
  ];

  // windowInner 관련
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const formatTxDate = (date) => {
    if (screenWidth <= 1350) {
      return new Date(date).toLocaleDateString("en-CA", {
        month: "2-digit",
        day: "2-digit",
      });
    } else {
      return new Date(date).toLocaleDateString("en-CA");
    }
  };
  /////////////////////////

  return (
    <MainDiv>
      <TitleTotal>
        <LeftTitle>
          <div>거래내역</div>
          <button>
            <Select options={options} onChange={handleSelectChange} />
          </button>
        </LeftTitle>
        <RightTitle>
          <div>
            <DatePicker
              dateFormat="yyyy/MM/dd"
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setDateRange(update);
              }}
              withPortal
              customInput={<CalCustomInput />}
            />
          </div>
        </RightTitle>
      </TitleTotal>
      <BodyTotal>
        <BodyTitle>
          <BodyDetail className="narrow">체인</BodyDetail>
          <BodyDetail className="narrow">일자</BodyDetail>
          <BodyDetail className="narrow">종류</BodyDetail>
          <BodyDetail className="narrow">수량</BodyDetail>
          <BodyDetail className="narrow">수수료</BodyDetail>
          <BodyDetail className="widePadding">Tx Hash</BodyDetail>
          <BodyDetail className="widePadding">From</BodyDetail>
          <BodyDetail className="widePadding">To</BodyDetail>
          <BodyDetail className="widePadding">Memo</BodyDetail>
        </BodyTitle>
        <BodyTxList>
          {historyData ? (
            historyData.map((item, index) => {
              const isLastTx = index === historyData.length - 1;
              return (
                <BodyTxDetail
                  key={index}
                  style={{
                    borderBottom: isLastTx ? "none" : "1px solid white",
                  }}
                >
                  <BodyDetail className="narrow">
                    {item.txhistory_name}
                  </BodyDetail>
                  <BodyDetail className="narrow">
                    {formatTxDate(item.txhistory_date)}
                  </BodyDetail>
                  <BodyDetail className="narrow">
                    {item.txhistory_type}
                  </BodyDetail>
                  <BodyDetail className="narrow">
                    {Number(item.txhistory_amounts).toFixed(2)}
                    <br />
                    {item.txhistory_name}
                  </BodyDetail>
                  <BodyDetail className="narrow">
                    {Number(item.txhistory_fees)}
                    <br />
                    {item.txhistory_name}
                  </BodyDetail>
                  <BodyDetail className="widePadding">
                    {item.txhistory_hash}
                  </BodyDetail>
                  <BodyDetail className="widePadding">
                    {item.txhistory_from}
                  </BodyDetail>
                  <BodyDetail className="widePadding">
                    {item.txhistory_to}
                  </BodyDetail>
                  <BodyDetail className="widePadding">
                    {item.txhistory_memo}
                  </BodyDetail>
                </BodyTxDetail>
              );
            })
          ) : (
            <div>loading...</div>
          )}
        </BodyTxList>
      </BodyTotal>
    </MainDiv>
  );
}

export default TxHistory;
