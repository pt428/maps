import { createStore } from "redux";
import gpxJsonDemo from "../data/GpxDemoData.json";
import csvJsonDemo from "../data/CsvDemoData.json";
 export type CsvRow = Array<string | number | boolean | null>;
 
interface AppState {
  stateOfMenu: boolean;//CLOSE/OPEN MENU
  forceUpdate: boolean;//FORCE UPDATE ACTUAL CID AND ACTUAL DATE
  actualCid: string;//SHOW ACTUAL CID OF CONNECTED BST
  showByOne: boolean;//SHOW MARKERS ALL/BY ONE
  allCzBts: BtsJson[] | null;  //ALL CZECH BTS FROM JSON FILE
  showHint: boolean;//SHOW HINT AFTER CLICK TO DEMO
  loadingBts: boolean;//SHOW LOADIN BTS WHILE APP STARTING
  actualDate: string;// ACTUALDATE OF ACTUAL MARKER
  rangeValue: number;// ACTUAL VALUE OF RANGE
  btsToShow: BTSI[] | null; //FILTRED BTS FOR SHOW ON THE MAP
  markers: MarkerI[];  //ALL MARKERS FROM LIST
  markersReduceById: MarkerI[] | null; //MARKER REDUCE BY IDs
  markersToShow: MarkerI[] | null;  //FILTRED MARKERS FOR SHOW ON THE MAP
  markersToShowRange: MarkerI[] | null;//MARKERS ONLY FOR TO ACTUAL RANGE VALUE
  polylinePoints: Coordinate[] | null;  //POLYLINES BETWEEN ACTUAL BTS AND MARKER
  gpxDemo: GpxDataI[];  //GPX DATA FROM DEMO JSON FILE
  csvDemo: CsvRow[] | null;  //CSV DATA FROM DEMO JSON FILE
  newMarkers: MarkerI[] | null;  //NEW MARKERS FROM THE FILE
  csvData: CsvRow[] | null;  //CSV DATA PICKED FROM THE LIST
  gpxData: GpxDataI[] | null; //GPX DATA PICKED FROM THE LIST
  showBtnDisabled: boolean;//ENABLE/DISABLE BUTTON MERGE FILES
}
export interface MarkerI { //TYPE FOR markers
 
  CID: string;
  LAC: string;
  MCC_MNC: string;
  RSRP: string;
  TYP: string;
  date: string;
  id: number;
  lat: number;
  lon: number;
  saved: number;
  _id: number;
}
 export interface BTSI {// TYPE FOR btsToShow
   
   gps: {
     lat: string;
     lon: string;
   };
   id: string;
   info: [MarkerI[]];
 }
//////////////// TYPE FOR BTS FROM JSON//////////////////////
export interface GpsCoordinates {
  lon: string;  
  lat: string;  
}
export interface BtsJson {
  id: string;  
  gps: GpsCoordinates;  
}
////////////////////////////////////////
type Coordinate = [number, number];
 
export interface CsvDemoJsonI {//TYPE FOR CSV DEMO JSON
  0: string;
  value1: number;
  value2: number;
  value3: number;
  value4: number;
  value5: number;
  value6: number;
  value7: number;
  value8: number;
  value9: number;
  value10: number | null;
  latitude: number;
  longitude: number;
  value11: number;
  value12: number;
  value13: number;
  value14: number;
  timestamp: string;
  networkType: string;
  isRoaming: boolean;
  deviceTimestamp: string;
  deviceModel: string;
  signalStrength1: number;
  signalStrength2: number;
  signalStrength3: number;
  signalStrength4: number;
  value15: number | null;
  value16: number | null;
  value17: number | null;
  value18: number | null;
  value19: number | null;
  value20: number | null;
  value21: number | null;
  value22: number | null;
  value23: number | null;
  value24: number | null;
  value25: number | null;
  value26: number | null;
  value27: number | null;
  value28: number | null;
  value29: number | null;
  value30: number | null;
  value31: number | null;
  value32: number | null;
  value33: number;
}

 export interface GpxDataI {//TYPE FOR GPX DATA
   lat: number;
   lon: number;
   ele: number;
   time: string;
 }
const csvJsonDemo2: CsvRow[] = csvJsonDemo as CsvRow[];//TYPE FOR CSV DEMO JSON FILE
 
const initialState: AppState = {
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
  gpxDemo: gpxJsonDemo,
  csvDemo: csvJsonDemo2,
  newMarkers: null,
  csvData: null,
  gpxData: null,
  showBtnDisabled: true,
};

 
interface Action {
  type: string;
  payload?: any;
}

// REDUCER *************************************  
function appReducer(state = initialState, action: Action): AppState {
  switch (action.type) {
    case "MENU":
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

// CREATE STORE
const store = createStore(appReducer);

export default store;

// ROOTSTATE
export type RootState = ReturnType<typeof store.getState>;

// TYPE FOR dispatch
export type AppDispatch = typeof store.dispatch;
