import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { Icon, divIcon, point } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import axios from "axios";
import InputFile from "./components/InputFile";
import btsAll from "./data/BTS_CZ_ALL.json";
import { Collapse, Button, Card } from "react-bootstrap";
import RangeSlider from "./components/RangeSlider";
import CheckBox from "./components/CheckBox";

function App() {
  const polylineStyle = {
    color: "blue",
    weight: 3,
  };
  const [open, setOpen] = useState(false); // STATE OF MENU OPEN/CLOSE
  const [allCzBts, setAllCzBts] = useState(null); //ALL CZ BTS DATA
  const [forceUpdate, setForceUpdate] = useState(false); //FORCE UPDATE INFO ABOUT DATE AFTER CHANGE DATA FROM THE LIST
  const [showByOne, setShowByOne] = useState(false); //SHOW ALL/ONE BY POINTS ON THE MAP
  const [showHint, setShowHint] = useState(false); // SHOW HINT FOR DEMO
  const [loading, setLoading] = useState(true); // LOADING BTS

  const [actualDate, setActualDate] = useState(""); //INFO ABOUT DATE OF ACTUAL POINT ON MAP
  const [actualCid, setActualCid] = useState(""); //INFO ABOUT BTS CID OF ACTUAL POINT ON MAP
  const [rangeValue, setRangeValue] = useState(0); // RANGE FOR MOVING OBJECT ON THE MAP
  const [btsToShow, setBtsToShow] = useState(null);
  const [markers, setMarkers] = useState([]); // ALL MARKERS FROM DATABASE
  const [markersReduceById, setMarkersReduceById] = useState();
  const [markersToShow, setMarkersToShow] = useState(null); //MARKERS FOR SHOW ON THE MAP
  const [markersToShowRange, setMarkersToShowRange] = useState();//MARKERS FOR SHOW, ONLY IN ACTUAL RANGE
  const [polylinePoints, setPolylinePoints] = useState();


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
    
    setMarkers([...markers, ...updatedMarkers]);
    setMarkersToShow(updatedMarkers);
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
    if (rangeValue == 1) {
      setForceUpdate((prev) => !prev);
    } // FORCE UPDATE - DATE OF SELECTED MARKERS
    //setOpen(false);
    setRangeValue(1);
    setBtsToShow(filteredBts);
  };

  //************* DELETE, SHOW, SAVE MARKERS FROM LIST ****************/

  const handleChangeMarkers = (id, command) => {
    // ********* DELETE *****************
    if (command === "delete") {
      axios
        .delete(`https://pavel-tichy.cz/projects/maps/server/${id}`)
        .then((response) => {
          alert("Log úspěšně smazán.");
          setMarkersToShow(null);
        })
        .catch((error) => {
          console.error("There was an error!", error);
        });
      const updatedMarkers = markers.filter((marker) => marker._id !== id);
     
      setMarkers(updatedMarkers);
       
      //setOpen(false); //CLOSE MENU

      // ********* SHOW *****************
    } else if (command === "show") {
      const toShow = markers.filter((markers) => markers._id === id);
      setMarkersToShow(toShow);

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
        setForceUpdate((prev) => !prev);
      }
      //setOpen(false);//CLOSE MENU
      setRangeValue(1);//RESET RANGE
      setBtsToShow(filteredBts);

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
      setMarkers(updatedMarkers);
      //setOpen(false); //CLOSE MENU
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
          setMarkers(markersWithNumbers);
          
         
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

  useEffect(() => {//MAKE LIST OF IDs OF MARKERS FOR SHOW IDs ON THE LIST OF LOGS
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

      setMarkersReduceById(filteredMarks);
    }
  }, [markers]);

 

  useEffect(() => {
    getMarkers();// GET MARKERS FROM DATABASE
  }, []);

  useEffect(() => {
     
    // LOAD ALL BTS DATA FROM JSON
    const fetchData = async () => {
      setLoading(true); //  SHOW LOADING WINDOW
      setAllCzBts(btsAll.btsCz); //  
      setLoading(false); //  CLOSE LOADING
    };

    fetchData(); //  
  }, []);

  useEffect(() => {//UPDATE ACTUAL DATA ON MAP
    let tempMarker =markersToShow && markersToShow.slice(rangeValue - 1, rangeValue);//SHOW POINTS BY ONE
    if (showByOne) {
    } else {
      tempMarker = markersToShow && markersToShow.slice(0, rangeValue);//SHOW ALL ACTUAL POINTS
    }

    const tempBts = btsToShow &&
      btsToShow.filter(
      (one) =>
        one.id ===
        (tempMarker && tempMarker.length > 0 ? tempMarker[tempMarker.length - 1]["CID"] : "")
    );
 

    if ( tempBts && tempBts.length > 0 && tempMarker.length > 0) {
      setPolylinePoints([//SET POLYLINES BTS-ACTUAL POINT
        [
          tempMarker[tempMarker.length - 1]["lat"],
          tempMarker[tempMarker.length - 1]["lon"],
        ],
        [tempBts[0].gps.lat, tempBts[0].gps.lon],
      ]);
      setActualDate(tempMarker[tempMarker.length - 1]["date"]);
      setActualCid("CID: " + tempMarker[tempMarker.length - 1]["CID"]);
    } 

    setMarkersToShowRange(tempMarker);
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
                onClick={() => setOpen(!open)} // MENU OPEN/CLOSE
                aria-controls="collapse-menu"
                aria-expanded={open}
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
                <RangeSlider
                  numberOfMarkers={markersToShow ? markersToShow.length : 0}
                  onValueChange={(value) => setRangeValue(value)}
                  onClick={(value) => setShowHint(value)}
                  value={rangeValue}
                ></RangeSlider>
              </div>
              {/* HINT FOR DEMO */}
              <div style={{ position: "relative" }}>
                {showHint && (
                  <div
                    style={{
                      position: "absolute",
                      top: "0px",
                      left: "0",
                      right: "0",
                      padding: "10px",
                      backgroundColor: "lightyellow",
                      border: "1px solid #ccc",
                      zIndex: 1000,
                      textAlign: "center",
                      width: "20rem",
                    }}
                  >
                    <div className="d-flex justify-content-start">
                      <i
                        className="bi bi-x-square"
                        onClick={() => setShowHint(false)}
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
          <Collapse in={open}>
            <div id="collapse-menu">
              <div className="row justify-content-sm-center m-2  ">
                <div className="col-12 col-xxl-9">
                  <InputFile
                    handleMarkers={handleNewMarkers}
                    markersData={markersReduceById}
                    handlaChange={handleChangeMarkers}
                    handleClickHint={(value) => setShowHint(value)}
                  ></InputFile>
                </div>
                <div className="col-sm-12 col-xs-6 col-xxl-3 ">
                  <CheckBox
                    onValueChange={(value) => setShowByOne(value)}
                    value={showByOne}
                    onClick={(value) => setOpen(value)}
                  ></CheckBox>
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
