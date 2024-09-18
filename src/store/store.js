import { createStore } from "redux";
import gpxJsonDemo from "../data/GpxDemoData.json";
import csvJsonDemo from "../data/CsvDemoData.json";
// Výchozí stav
const initialState = {
  stateOfMenu: false,
  forceUpdate: false,
  actualCid: "",
  showByOne: true,
  allCzBts: null,
  showHint: false,
  loadingBts: true,
  actualDate: "",
  rangeValue: 0,
  btsToShow: null,
  markers: [],
  markersReduceById: null,
  markersToShow: null,
  markersToShowRange: null,
  polylinePoints: null,
  gpxDemo: gpxJsonDemo.gpxData,
  csvDemo: csvJsonDemo.csvData,
  newMarkers: null,
  csvData: null,
  gpxData: null,
  showBtnDisabled:true
};

// Reducer pro správu stavu
function counterReducer(state = initialState, action) {
  switch (action.type) {
    case "MENU":
      console.log(state.stateOfMenu);
      return { ...state, stateOfMenu: action.payload };
    case "FORCEUPDATE":
      return { ...state, forceUpdate: !state.forceUpdate };
    case "SET_ACTUAL_CID":
      return { ...state, actualCid: action.payload };
    case "SET_SHOW_BY_ONE":
      return { ...state, showByOne: !state.showByOne };
    case "SET_ALL_CZ_BTS":
      return { ...state, allCzBts: action.payload };
    case "SET_SHOW_HINT":
      return { ...state, showHint: action.payload };
    case "SET_LOADING_BTS":
      return { ...state, loadingBts: action.payload };
    case "SET_ACTUAL_DATE":
      return { ...state, actualDate: action.payload };
    case "SET_RANGE_VALUE":
      return { ...state, rangeValue: action.payload };
    case "SET_BTS_TO_SHOW":
      return { ...state, btsToShow: action.payload };
    case "SET_MARKERS":
      return { ...state, markers: action.payload };
    case "SET_MARKERS_REDUCE_BY_ID":
      return { ...state, markersReduceById: action.payload };
    case "SET_MARKERS_TO_SHOW":
      return { ...state, markersToShow: action.payload };
    case "SET_MARKERS_TO_SHOW_RANGE":
      return { ...state, markersToShowRange: action.payload };
    case "SET_POLYLINEPOINTS":
      return { ...state, polylinePoints: action.payload };
    case "SET_NEW_MARKERS":
      return { ...state, newMarkers: action.payload };
    case "SET_CSV_DATA":
      return { ...state, csvData: action.payload };
    case "SET_GPX_DATA":
      return { ...state, gpxData: action.payload };
    case "SET_SHOW_BTN_DISABLE":
      return { ...state, showBtnDisabled: action.payload };
    default:
      return state;
  }
}

// Vytvoření store
const store = createStore(counterReducer);

export default store;
