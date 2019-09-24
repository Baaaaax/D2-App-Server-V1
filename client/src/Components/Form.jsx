import React, { Component, useState } from "react";
import HunterLogo from "../img/pngkey.com-destiny-hunter-png-443266.png";
import TitanLogo from "../img/kisspng-destiny-2-destiny-rise-of-iron-symbol-battlefield-destiny-5ad1f4e20d9978.4587373015237091540557.png";
import WarlockLogo from "../img/ttbKXabjPKbLv2bW98v6U6VC5.png";

const Form = props => {
  const {
    firstInputValue,
    onFInputChange,
    onSInputChange,
    secondInputValue,
    handleClickFetch,
    isLoading,
    onCharacterChange,
    onIsPrivateChange
  } = props;

  const [charSelected, setCharSelected] = useState(0);
  const [isPri, setIsPri] = useState(0);

  const onRadioBtnChange = e => {
    setCharSelected(e.target.value);
    onCharacterChange(e);
  };

  const onIsPrivChange = e => {
    setIsPri(e.target.checked);
    onIsPrivateChange(e);
  };

  return (
    <React.Fragment>
      <form>
        <div className="input-container container">
          <div className="row">
            <div className="col-6">
              <input
                type="text"
                placeholder="First Username.."
                value={firstInputValue}
                onChange={onFInputChange}
              />
            </div>
            <div className="col-6">
              <input
                type="text"
                placeholder="Second Username.."
                onChange={onSInputChange}
                value={secondInputValue}
              />
            </div>
          </div>
          <div className="row justify-content-around">
            <div className="col-4 char-cont">
              <div className="row">
                <div className="col-4">
                  <label className="logo-label">
                    <input
                      name="switch"
                      className="inputRadio"
                      id="three"
                      type="radio"
                      value="0"
                      onChange={onRadioBtnChange}
                      checked={charSelected === "0"}
                    />
                    <img src={TitanLogo} id="titanImg" className="logo-image" />
                  </label>
                </div>
                <div className="col-4">
                  <label className="logo-label">
                    <input
                      name="switch"
                      className="inputRadio"
                      id="one"
                      type="radio"
                      value="1"
                      onChange={onRadioBtnChange}
                      checked={charSelected === "1"}
                    />
                    <img src={HunterLogo} className="logo-image" />
                  </label>
                </div>
                <div className="col-4">
                  <label className="logo-label">
                    <input
                      name="switch"
                      id="two"
                      type="radio"
                      className="inputRadio"
                      value="2"
                      onChange={onRadioBtnChange}
                      checked={charSelected === "2"}
                    />
                    <img src={WarlockLogo} className="logo-image" />
                  </label>
                </div>
              </div>
            </div>
            <div className="col-4" style={{ paddingTop: "2%" }}>
              <input
                type="checkbox"
                id="cbx"
                style={{ display: "none" }}
                onChange={onIsPrivChange}
                checked={isPri}
              />
              <label for="cbx" class="check">
                <svg width="18px" height="18px" viewBox="0 0 18 18">
                  <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>
                  <polyline points="1 9 7 14 15 4"></polyline>
                </svg>
              </label>
              <span style={{ marginLeft: "10%" }}>Private Matches</span>
            </div>
          </div>
        </div>
        <div className="btn-container container">
          <button
            type="button"
            id="submitBtn"
            className="btn btn-success btn-md"
            onClick={handleClickFetch}
            disabled={isLoading}
          >
            {isLoading && <span>Loading..</span>}
            {!isLoading && <span>Go!</span>}
          </button>
        </div>
      </form>
      <div className="container char-cont"></div>
    </React.Fragment>
  );
};

export default Form;
