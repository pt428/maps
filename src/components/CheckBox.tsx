import { useSelector } from "react-redux";
import { useAppDispatch } from "../store/hooks";
import { RootState } from "../store/store";
function CheckBox() {
  const value = useSelector((state: RootState) => state.showByOne);
  const dispatch = useAppDispatch();

  return (
    <div className="justify-content-center">
      <input
        hidden
        className="form-check-input"
        type="checkbox"
        role="switch"
        id="flexSwitchCheckChecked"
        checked={value}
        onChange={() => dispatch({ type: "SET_SHOW_BY_ONE" })}
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
}
export default CheckBox;
