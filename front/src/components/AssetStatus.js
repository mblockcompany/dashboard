import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { forwardRef, useEffect, useState } from "react";
import axios from "axios";

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  margin: 15px auto;
`;
const HeaderTitle = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: calc(12px+1vmin);
  font-weight: 550;
`;
const HeaderCalendar = styled.div`
  padding-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;

  & button {
    background: none;
    color: white;
    border: 1px solid white;
    border-radius: 5px;

    padding: 7px 20px;
    &:hover {
      cursor: pointer;
    }
  }
`;
const StatusBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 95%;
  margin: 10px auto;
`;
const BodyTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  width: 100%;
  font-size: 1vmax;
  padding-bottom: 10px;

  border-bottom: 1px solid white;
`;
const BodyList = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;
const WideBodyList = styled(BodyList)`
  flex: 1.5;
`;
const BodyLists = styled.div`
  font-size: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 auto;
`;
const DetailEach = styled.div`
  border-bottom: 1px solid white;
  display: flex;
  padding: 10px 0;
  flex: 1;
  &:last-child {
    border-bottom: none;
  }
`;

const ListsDetail = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #cacaca;
  align-items: center;
  width: 100%;
`;

const ListColoumn = styled.div`
  display: flex;
  flex-direction: column;

  width: 70%;
  padding: 0 5px;
`;

const WideDescList = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  width: 15%;
`;

function AssetStatus() {
  const currentDate = new Date();
  const startOfWeek = new Date(currentDate);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() - 6);

  const [dateRange, setDateRange] = useState([endOfWeek, startOfWeek]);
  const [startDate, endDate] = dateRange;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  //http://localhost:3001/
  //customInput
  const CalCustomInput = forwardRef(({ value, onClick }, ref) => (
    <button className="example-custom-input" onClick={onClick} ref={ref}>
      {value}
    </button>
  ));

  useEffect(() => {
    const getAllAsset = async () => {
      try {
        const res = await axios.get("http://localhost:3001/");
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.log(err, "자산현황 데이터가져오기 에러");
        setLoading(false);
      }
    };
    getAllAsset();
  }, []);

  const filteredRangeData = () => {
    if (!startDate || !endDate) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    return data.filter((i) => {
      const itemDate = new Date(i.assetstatus_date);
      return itemDate >= start && itemDate < end;
    });
  };

  const getGroupedData = () => {
    const groups = {};

    filteredRangeData().forEach((item) => {
      const dateKey = item.assetstatus_date.split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          listings: [],
          total: 0,
        };
      }
      groups[dateKey].listings.push(item);
      groups[dateKey].total += parseFloat(item.assetstatus_total);
    });
    console.log(groups, "groups");
    return Object.values(groups).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  };

  const groupedData = getGroupedData();
  console.log(groupedData, "groupData");

  return (
    <>
      <StatusHeader>
        <HeaderTitle>자산 현황</HeaderTitle>
        <HeaderCalendar>
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
        </HeaderCalendar>
      </StatusHeader>
      <StatusBody>
        <BodyTitle>
          <WideBodyList>일자</WideBodyList>
          <BodyList>자산명</BodyList>
          <BodyList>보유량</BodyList>
          <BodyList>사용분</BodyList>
          <BodyList>증가분</BodyList>
          <BodyList>가격</BodyList>
          <BodyList>자산 가치</BodyList>
          <WideBodyList>총 가치</WideBodyList>
        </BodyTitle>
        {loading ? (
          <h2>데이터 로딩중 ...</h2>
        ) : (
          <BodyLists>
            {groupedData.map((group, index) => {
              return (
                <ListsDetail key={index}>
                  <WideDescList>
                    <>{group.date}</>
                  </WideDescList>
                  <ListColoumn>
                    {group.listings.map((item, idx) => {
                      const isLastItem = idx === group.listings.length - 1;
                      return (
                        <div>
                          <DetailEach
                            key={idx}
                            style={{
                              borderBottom: isLastItem
                                ? "none"
                                : "1px solid #7d7d7d",
                            }}
                          >
                            <BodyList>{item.assetstatus_name}</BodyList>
                            <BodyList>
                              {parseFloat(item.assetstatus_balances).toFixed(2)}
                            </BodyList>
                            <BodyList>
                              {parseFloat(item.assetstatus_decrements).toFixed(
                                2
                              )}
                            </BodyList>
                            <BodyList>
                              {parseFloat(item.assetstatus_increments).toFixed(
                                2
                              )}
                            </BodyList>
                            <BodyList>{item.assetstatus_prices}</BodyList>
                            <BodyList>
                              ₩{" "}
                              {Math.round(
                                item.assetstatus_total
                              ).toLocaleString()}
                            </BodyList>
                          </DetailEach>
                        </div>
                      );
                    })}
                  </ListColoumn>
                  <WideDescList>
                    ₩ {Math.round(group.total).toLocaleString()}
                  </WideDescList>
                </ListsDetail>
              );
            })}
            {/*  */}
          </BodyLists>
        )}
      </StatusBody>
    </>
  );
}
export default AssetStatus;
