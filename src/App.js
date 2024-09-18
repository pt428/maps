import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,  
} from "react-leaflet";
import { useEffect} from "react";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { Icon, divIcon, point } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import axios from "axios";
import InputFile from "./components/InputFile";
import btsAll from "./data/BTS_CZ_ALL.json";
import { Collapse} from "react-bootstrap";
import RangeSlider from "./components/RangeSlider";
import CheckBox from "./components/CheckBox";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

function App() {
  const polylineStyle = {
    color: "blue",
    weight: 3,
  };
 
  const dispatch = useDispatch();
  const stateOfMenu = useSelector((state) => state.stateOfMenu);
  const forceUpdate = useSelector((state) => state.forceUpdate); //FORCE UPDATE INFO ABOUT DATE AFTER CHANGE DATA FROM THE LIST
  const showByOne = useSelector((state) => state.showByOne); //SHOW ALL/ONE BY POINTS ON THE MAP
  const allCzBts = useSelector((state) => state.allCzBts); //ALL CZ BTS DATA
  const showHint = useSelector((state) => state.showHint); // SHOW HINT FOR DEMO
  const loading = useSelector((state) => state.loadingBts); // LOADING BTS
  const actualCid = useSelector((state) => state.actualCid); //INFO ABOUT BTS CID OF ACTUAL POINT ON MAP
  const actualDate = useSelector((state) => state.actualDate); //INFO ABOUT DATE OF ACTUAL POINT ON MAP
  const rangeValue = useSelector((state) => state.rangeValue); // RANGE FOR MOVING OBJECT ON THE MAP
  const btsToShow = useSelector((state) => state.btsToShow);
  const markers = useSelector((state) => state.markers); // ALL MARKERS FROM DATABASE
  const markersToShow = useSelector((state) => state.markersToShow); //MARKERS FOR SHOW ON THE MAP
  const markersToShowRange = useSelector((state) => state.markersToShowRange); //MARKERS FOR SHOW, ONLY IN ACTUAL RANGE
  const polylinePoints = useSelector((state) => state.polylinePoints);

  //*************  MAP POINT ICON ****************/
  const customIcon = new Icon({
    iconUrl: require("./images/pin-icon.png"),
    iconSize: [30, 30],
  });

  const btsIcon = new Icon({
    iconUrl: require("./images/antenna.png"),
    iconSize: [50, 50],
  });
  //*************  MAP CLUSTER ICON ****************/
  const createCustomerClusterIcon = (cluster) => {
    return new divIcon({
      html: `<div  class="cluster-icon">${cluster.getChildCount()}</div>`,
      iconSize: point(30, 30, true),
    });
  };
  const createBtsClusterIcon = (cluster) => {
    return new divIcon({
      html: `<div  class="cluster-bts-icon">${cluster.getChildCount()}x BTS</div>`,
      iconSize: point(50, 50, true),
    });
  };

  //*************  NEW MARKERS FROM FILE ****************/
  const handleNewMarkers = (newMarkers) => {
    const newMarkerFiltered = newMarkers.filter((marker) => marker.lat !== "0");
    const maxId = Math.max(...markers.map((mark) => mark._id), 0);
    const updatedMarkers = newMarkerFiltered.map((marker) => ({
      ...marker,
      _id: maxId + 1,
      saved: 0,
    }));
    dispatch({ type: "SET_MARKERS", payload: [...markers, ...updatedMarkers] });
  
    dispatch({
      type: "SET_MARKERS_TO_SHOW",
      payload: updatedMarkers,
    });
     
    const filteredBts = allCzBts
      .filter((bts) => {
        return newMarkerFiltered.some((marker) => marker.CID === bts.id);
      })
      .map((oneBts) => {
        // FIND THE MATCHING MARKER FOR THE CURRENT BTS
        const matchingMarker = newMarkerFiltered.filter(
          (marker) => marker.CID === oneBts.id
        );

        return {
          ...oneBts, //SPREAD THE EXISTING BTS
          info: [
            matchingMarker ? { ...matchingMarker } : null, //ADD matchingMarker AS NEW ENTRY IF IT EXIST
          ],
        };
      });

    if (rangeValue === 1) {
      dispatch({ type: "FORCEUPDATE" });
    } // FORCE UPDATE - DATE OF SELECTED MARKERS
   
    dispatch({ type: "SET_RANGE_VALUE", payload: 1 });    
    dispatch({ type: "SET_BTS_TO_SHOW", payload: filteredBts });
   
  };

  //************* DELETE, SHOW, SAVE MARKERS FROM LIST ****************/

  const handleChangeMarkers = (id, command) => {
    // ********* DELETE *****************
    if (command === "delete") {
      axios
        .delete(`https://pavel-tichy.cz/projects/maps/server/${id}`)
        .then((response) => {
          alert("Log úspěšně smazán.");
          dispatch({
            type: "SET_MARKERS_TO_SHOW",
            payload: null,
          });
          //setMarkersToShow(null);
        })
        .catch((error) => {
          console.error("There was an error!", error);
        });
      const updatedMarkers = markers.filter((marker) => marker._id !== id);
      dispatch({
        type: "SET_MARKERS",
        payload: updatedMarkers,
      });
     
      //setOpen(false); //CLOSE MENU

      // ********* SHOW *****************
    } else if (command === "show") {
      const toShow = markers.filter((markers) => markers._id === id);
      dispatch({
        type: "SET_MARKERS_TO_SHOW",
        payload: toShow,
      });
      

      const filteredBts = allCzBts
        .filter((bts) => {
          return toShow.some((marker) => marker.CID === bts.id);
        })
        .map((oneBts) => {
          // FIND THE MATCHING MARKER FOR THE CURRENT BTS
          const matchingMarker = toShow.filter(
            (marker) => marker.CID === oneBts.id
          );

          return {
            ...oneBts, // SPREAD THE EXISTING BTS
            info: [
              matchingMarker ? { ...matchingMarker } : null, //ADD matchingMarker AS NEW ENTRY IF IT EXIST
            ],
          };
        });
      if (rangeValue === 1) {
        dispatch({ type: "FORCEUPDATE" });
      }
      //setOpen(false);//CLOSE MENU
      dispatch({ type: "SET_RANGE_VALUE", payload: 1 });
            dispatch({ type: "SET_BTS_TO_SHOW", payload: filteredBts });
      

      // ********* SAVE *****************
    } else if (command === "save") {
      const markerToSave = markers.filter((marker) => marker._id === id);

      axios
        .post(
          "https://pavel-tichy.cz/projects/maps/server/index.php",
          markerToSave
        )
        .then((response) => {
          console.log(response.data);
          alert("Log úspěšně uložen.");
        })
        .catch((error) => {
          console.error("There was an error!", error);
          alert("Log úspěšně uložen.");
        });

      const updatedMarkers = markers.map((marker) => {
        if (marker._id === id) {
          // CHANGE STATUS OF MARKERS TO SAVE
          return { ...marker, saved: 1 };
        }
        // OR RETURN MARKERS WITHOUT CHANGES
        return marker;
      });
      dispatch({
        type: "SET_MARKERS",
        payload: updatedMarkers,
      });
    
    }
  };

  //*************  GET ALL MARKERS FROM DATABASE ****************/

  const getMarkers = () => {
    axios
      .get(
        "https://pavel-tichy.cz/projects/maps/server/index.php?action=getAll"
      )
      .then((response) => {
        if (Array.isArray(response.data)) {
          // CONVERT LAT AND LON TO NUMBER
          const markersWithNumbers = response.data.map((marker) => ({
            ...marker,
            lat: parseFloat(marker.lat),
            lon: parseFloat(marker.lon),
            id: -1,
          }));
          dispatch({
            type: "SET_MARKERS",
            payload: markersWithNumbers,
          });
       
        } else {
          console.error("Odpověď serveru není pole.");
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
        alert(`Chyba: ${error}`);
      });
  };

  //*************  USE EFFECTS ****************/

  useEffect(() => {
    //MAKE LIST OF IDs OF MARKERS FOR SHOW IDs ON THE LIST OF LOGS
    if (markers) {
      const filteredMarks = markers.reduce(
        (acc, mark) => {
          if (!acc.seenIds.has(mark._id)) {
            acc.seenIds.add(mark._id);
            acc.result.push(mark);
          }
          return acc;
        },
        { result: [], seenIds: new Set() }
      ).result;
      dispatch({
        type: "SET_MARKERS_REDUCE_BY_ID",
        payload: filteredMarks,
      });
     
    }
  }, [markers]);

  useEffect(() => {
    getMarkers(); // GET MARKERS FROM DATABASE
  }, []);

  useEffect(() => {
    // LOAD ALL BTS DATA FROM JSON
    const fetchData = async () => {
      dispatch({ type: "SET_LOADING_BTS", payload: true });    
      dispatch({ type: "SET_ALL_CZ_BTS", payload: btsAll.btsCz });     
      dispatch({ type: "SET_LOADING_BTS", payload: false });     
    };
    fetchData(); //
  }, []);

  useEffect(() => {
    //UPDATE ACTUAL DATA ON MAP
    let tempMarker =
      markersToShow && markersToShow.slice(rangeValue - 1, rangeValue); //SHOW POINTS BY ONE
    if (showByOne) {
    } else {
      tempMarker = markersToShow && markersToShow.slice(0, rangeValue); //SHOW ALL ACTUAL POINTS
    }
    const tempBts =
      btsToShow &&
      btsToShow.filter(
        (one) =>
          one.id ===
          (tempMarker && tempMarker.length > 0
            ? tempMarker[tempMarker.length - 1]["CID"]
            : "")
      );

    if (tempBts && tempBts.length > 0 && tempMarker.length > 0) {
      dispatch({
        type: "SET_POLYLINEPOINTS",
        payload: [
          //SET POLYLINES BTS-ACTUAL POINT
          [
            tempMarker[tempMarker.length - 1]["lat"],
            tempMarker[tempMarker.length - 1]["lon"],
          ],
          [tempBts[0].gps.lat, tempBts[0].gps.lon],
        ],
      });

      dispatch({
        type: "SET_ACTUAL_DATE",
        payload: tempMarker[tempMarker.length - 1]["date"],
      });
      dispatch({
        type: "SET_ACTUAL_CID",
        payload: "CID: " + tempMarker[tempMarker.length - 1]["CID"],
      });
    }
    dispatch({
      type: "SET_MARKERS_TO_SHOW_RANGE",
      payload: tempMarker,
    });
 
  }, [rangeValue, showByOne, forceUpdate]);

  useEffect(() => {}, [polylinePoints]);

  //*************  RETURN ****************/

  return (
    <div>
      {loading ? ( //SHOW LOADING WINDOW WHILE LOADING BTS DATA FROM JSON
        <div className="load-spinner d-flex justify-content-center align-items-center  ">
          <button className="btn btn-primary" type="button" disabled>
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
            <span role="status">
              <h4>Načítám BTS ...</h4>
            </span>
          </button>
        </div>
      ) : (
        // AFTER LOAD BTS DATA SHOW MAP
        <div className="mt-1 ms-1 ">
          <div className="d-flex my-2">
            <div className="col-sm-2 d-flex">
              <button
                className="btn btn-outline-secondary"
                onClick={() =>
                  dispatch({ type: "MENU", payload: !stateOfMenu })
                } // MENU OPEN/CLOSE
                aria-controls="collapse-menu"
                aria-expanded={stateOfMenu}
              >
                <i className="bi bi-list d-sm-none d-xs-block"></i>
                <span className="d-none d-sm-block">Menu</span>
              </button>
            </div>
            {/* RANGE FOR TIME LINE */}
            <div className="col-sm-10  p-0  border border-3  ">
              <div className="d-flex justify-content-center">
                <span>
                  {actualDate}, <b>{actualCid}</b>
                </span>
              </div>
              <div className="d-flex justify-content-center  ">
                <RangeSlider></RangeSlider>
              </div>
              {/* HINT FOR DEMO */}
              <div style={{ position: "relative" }}>
                {showHint && (
                  <div className="hintDiv"  >
                    <div className="d-flex justify-content-start">
                      <i
                        className="bi bi-x-square"
                        onClick={() =>
                          dispatch({ type: "SET_SHOW_HINT", payload: false })
                        }
                      ></i>
                    </div>

                    <p>Byly načteny demo data.</p>
                    <p>Posuvníkem posunujete objekt po časové ose.</p>
                    <p>
                      Je možné použít pro posun i klávesové šipky, ale nejpve
                      klikněte myší na posuvník.
                    </p>
                    <p>Kliknutím na BTS zobrazíte její základní hodnoty.</p>
                  </div>
                )}
              </div>
            </div>
            {/* /RANGE FOR TIME LINE */}
          </div>
          {/* ALL BUTTONS  */}
          <Collapse in={stateOfMenu}>
            <div id="collapse-menu">
              <div className="row justify-content-sm-center m-2  ">
                <div className="col-12 col-xxl-9">
                  <InputFile
                    handleMarkers={handleNewMarkers}
                    handlaChange={handleChangeMarkers}
                  ></InputFile>
                </div>
                <div className="col-sm-12 col-xs-6 col-xxl-3 ">
                  <CheckBox></CheckBox>
                </div>
              </div>
            </div>
          </Collapse>
          {/* /ALL BUTTONS  */}

          {/* MAP */}

          <MapContainer
            center={
              polylinePoints && polylinePoints.length > 0
                ? polylinePoints[0]
                : [49.57997121, 18.40505999]
            }
            zoom={12}
          >
            <TileLayer
              attribution='@copy; <a href="https://www.openstreetmap.org '
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {markersToShowRange &&
              markersToShowRange.map((marker) => (
                <>
                  <Marker position={[marker.lat, marker.lon]} icon={customIcon}>
                    <Popup>
                      <h6>Datum: {marker.date}</h6>
                      <h6>MCC: {String(marker.MCC_MNC).substring(0, 3)}</h6>
                      <h6>MNC: {String(marker.MCC_MNC).substring(3, 5)}</h6>
                      <h6>LAC: {marker.LAC}</h6>
                      <h6>CID: {marker.CID}</h6>
                      <h6>Typ: {marker.TYP}</h6>
                      <h6>RSRP: {marker.RSRP} dBm</h6>
                      <hr />
                      <h6>Lat: {marker.lat}</h6>
                      <h6>Lon: {marker.lon}</h6>
                    </Popup>
                  </Marker>
                </>
              ))}

            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createBtsClusterIcon}
            >
              {btsToShow &&
                btsToShow.map((bts) => (
                  <>
                    <Marker
                      position={[bts.gps.lat, bts.gps.lon]}
                      icon={btsIcon}
                    >
                      <Popup>
                        <div
                          style={{ maxHeight: "200px", overflowY: "scroll" }}
                        >
                          <h5>BTS</h5>
                          <h6>CID:{bts.id}</h6>
                          <h6>
                            MCC:{" "}
                            {String(bts.info[0][0]["MCC_MNC"]).substring(0, 3)}
                          </h6>
                          <h6>
                            MNC:{" "}
                            {String(bts.info[0][0]["MCC_MNC"]).substring(3, 5)}
                          </h6>
                          <h6>LAC: {bts.info[0][0]["LAC"]}</h6>
                          <h6>Typ: {bts.info[0][0]["TYP"]}</h6>
                          <h6>Lat: {bts.gps.lat}</h6>
                          <h6>Lon: {bts.gps.lon}</h6>
                          <hr />
                          <h5>Object data</h5>
                          {Object.values(bts.info[0]).map((info, index) => (
                            <div key={index}>
                              <h6>Date: {info.date}</h6>
                              <h6>Lat: {info.lat}</h6>
                              <h6>Lon: {info.lon}</h6>
                              <h6>RSRP: {info.RSRP} dBm</h6>
                              <hr />
                            </div>
                          ))}
                        </div>
                      </Popup>
                    </Marker>
                  </>
                ))}
            </MarkerClusterGroup>
            {polylinePoints && (
              <Polyline
                positions={polylinePoints}
                pathOptions={polylineStyle}
              />
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default App;
