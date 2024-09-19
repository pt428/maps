import { useAppDispatch, useAppSelector } from "../store/hooks";
import { RootState } from "../store/store";

function RangeSlider() {
  const dispatch = useAppDispatch();

  const value = useAppSelector((state: RootState) => state.rangeValue);
  const numberOfMarkers = useAppSelector((state: RootState) =>
    state.markersToShow ? state.markersToShow.length : 0
  );

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
