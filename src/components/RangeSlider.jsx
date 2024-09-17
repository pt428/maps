import React, { useState } from "react";

function RangeSlider({ numberOfMarkers, onValueChange, onClick,value }) {
  // Stav pro ukládání aktuální hodnoty range slideru

  // Funkce pro zpracování změny hodnoty
  const handleChange = (event) => {
    onValueChange(event.target.value);
  };
  const handleClick = () => {
    onClick(false);
  };
  return (
    <div className="row  w-100">
      <div className=" d-flex ">
        <span className="col-auto me-2">
          Posun po časové ose 
        </span>
        <input
          type="range"
          className="form-range  "
          id="customRange1"
          min="1"
          max={numberOfMarkers}
          value={value}
          onChange={handleChange}
          onClick={handleClick}
        ></input>
        <span className="ms-2  ">
          {value ? value : "1"}/{numberOfMarkers}
        </span>
      </div>
    </div>
  );
}

export default RangeSlider;
