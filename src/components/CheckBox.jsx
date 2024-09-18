import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
function CheckBox( ) {
  const dispatch = useDispatch();
  const value =  useSelector((state) => state.showByOne);
  
 
  return (
    <div className="justify-content-center">
      <input
        hidden
        className="form-check-input"
        type="checkbox"
        role="switch"
        id="flexSwitchCheckChecked"
        checked={value}
        onChange={  () => dispatch({ type: "SET_SHOW_BY_ONE" })}
        onClick={() => dispatch({ type: "MENU", payload: false })}
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