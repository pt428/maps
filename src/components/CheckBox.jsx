import React, { useState, useEffect } from "react";

function CheckBox({ value, onValueChange, onClick }) {
  const handleOnChange = (event) => {
    onValueChange(event.target.checked);
  };
  const handleClick =()=>{
    onClick(false);
  }
  return (
    <div className="justify-content-center">
      <input
        hidden
        className="form-check-input"
        type="checkbox"
        role="switch"
        id="flexSwitchCheckChecked"
        checked={value}
        onChange={handleOnChange}
        onClick={handleClick}
      ></input>
      <label
        className="btn-success btn form-check-label w-100"
        htmlFor="flexSwitchCheckChecked"
      >
        {value ? "Vícebodové zobr." : "Jednobové zobr."}
      </label>
    </div>
  );
} export default CheckBox