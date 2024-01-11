import { useState } from "react";
import styled from "styled-components";
import IsModal from "./IsModal.js";

const MainDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  & button {
    background: none;
    color: #cacaca;
    border: 1px solid #b3b3b3;
    width: 100%;
    border-radius: 5px;
    padding: 5px;

    &:hover {
      cursor: pointer;
      color: #ffffff;
      border: 1px solid #ffffff;
    }
  }
`;

function InsertMemo({ memo }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <MainDiv>
      <button onClick={toggleModal}>메모작성</button>
      {isModalOpen ? <IsModal toggleModal={toggleModal} /> : <></>}
    </MainDiv>
  );
}

export default InsertMemo;
