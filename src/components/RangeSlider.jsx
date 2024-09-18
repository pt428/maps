import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
function RangeSlider() {
  const dispatch = useDispatch();
  const value= useSelector((state) => state.rangeValue);
const numberOfMarkers = useSelector( (state) =>(state.markersToShow? state.markersToShow.length:0) );
 
  return (
    <div className="row  w-100">
      <div className=" d-flex ">
        <span className="col-auto me-2">Posun po časové ose</span>
        <input
          type="range"
          className="form-range  "
          id="customRange1"
          min="1"
          max={numberOfMarkers}
          value={value}
          onChange={(event) =>
            dispatch({ type: "SET_RANGE_VALUE", payload: event.target.value })
          }
          onClick={() => dispatch({ type: "MENU", payload: false })}
        ></input>
        <span className="ms-2  ">
          {value ? value : "1"}/{numberOfMarkers}
        </span>
      </div>
    </div>
  );
}

export default RangeSlider;
