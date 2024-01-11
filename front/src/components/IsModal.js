import React from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;
const ModalBody = styled.div`
  background-color: gray;
  padding: 20px;
  width: 40%;
  height: 50%;
  border-radius: 8px;
  z-index: 1000;
`;
const ModalTitle = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  & h1 {
    font-size: 30px;
  }
  & button {
    margin: 0 5px;
    font-size: 15px;
    font-weight: 600;
  }
`;
const ModalInput = styled.div`
  display: flex;
  justify-content: center;
  margin: 10px 0;
  height: 25%;
  & textarea {
    width: 100%;
    border-radius: 10px;
    padding: 15px;
    background-color: #9c9c9c;
    border: none;
    font-weight: 600;
    resize: none;
    &:focus {
      /* outline: none; */
      border: none;
    }
  }
`;
const PrevMemo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: left;
  & div {
    margin: 10px 0;
    width: 100%;
    border: 1px solid orange;
    border-radius: 10px;
  }
`;

function IsModal({ toggleModal }) {
  return (
    <Overlay>
      <ModalBody>
        <ModalTitle>
          <h1>MEMO</h1>
        </ModalTitle>
        <ModalInput>
          <textarea placeholder="메모를 작성하세요." />
        </ModalInput>
        <PrevMemo>
          <div>
            <h2>2024-01-01</h2> <h3>현금화 담당자에게 전송</h3>
          </div>
          <div>
            <h3>title</h3> <text>desc</text>
          </div>
          <div>
            <h3>title</h3> <text>desc</text>
          </div>
        </PrevMemo>
        <div>
          <button onClick={toggleModal}>X</button>
        </div>
      </ModalBody>
    </Overlay>
  );
}

export default IsModal;
