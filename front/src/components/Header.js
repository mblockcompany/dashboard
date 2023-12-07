import styled from "styled-components";
import { useState } from "react";

function Header2() {
  let [menuClick, setMenuClick] = useState(false);
  const clicked = () => {
    setMenuClick(true);
  };

  const TotalDiv = styled.div`
    border: 2px solid orange;
    display: flex;
    align-items: center;
  `;
  const ImgDiv = styled.div`
    justify-content: left;
    border-right: 1px solid red;
    color: hotpink;
    padding: 10px 20px;
    & img {
      max-width: 12vw;
      max-height: 12vh; // 이미지의 최대 너비 지정
      width: auto; // 이미지의 원래 비율을 유지하면서 너비 조정
      height: auto; // 이미지의 원래 비율을 유지하면서 높이 조정
    }
  `;

  const HiDiv = styled.div`
    flex: 1;
    padding: 0 25px;
    display: flex;
    justify-content: left;
    align-items: center;
  `;
  const StyelBtn = styled.button`
    color: hotpink;
    color: ${(props) => (props.menuClick ? "orange" : "black")};
    font-size: 2vw;
    font-weight: 200;
    background: none;
    border: none;
    &:hover {
      cursor: pointer;
      color: gray;
    }
    @media (min-width: 1000px) {
      font-size: 16px+2vw;
    }
  `;

  return (
    <TotalDiv>
      {/* <img src="img/mBlockLogo.jpeg" alt="mainLogo" /> */}
      <ImgDiv>
        <img src="img/mblock_logo1.png" alt="mainLogo" />
      </ImgDiv>
      <HiDiv>
        <StyelBtn onClick={clicked} menuClick={menuClick}>
          Asset
        </StyelBtn>
      </HiDiv>
    </TotalDiv>
  );
}

export default Header2;
 