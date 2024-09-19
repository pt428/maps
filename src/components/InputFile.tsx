import React, {   useEffect } from "react";
import Papa from "papaparse";
import { format } from "date-fns";
 import GPXParser from "gpxparser";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { RootState,  GpxDataI,MarkerI,  CsvRow} from "../store/store";
 
type HandlaChangeType = (id: number, command: string) => void;
type HandleMarkersType = (markers: MarkerI[]) => void;
type InputFileProps = {
  handlaChange: HandlaChangeType;
  handleMarkers: HandleMarkersType; // Add handleMarkers here
};
function InputFile({
  handlaChange,
  handleMarkers, // Include handleMarkers in the destructured props
}: InputFileProps) {
  
  const dispatch = useAppDispatch();
  const gpxDemo = useAppSelector((state: RootState) => state.gpxDemo);
  const csvDemo = useAppSelector((state: RootState) => state.csvDemo);
  const newMarkers = useAppSelector((state: RootState) => state.newMarkers);
  const csvData = useAppSelector((state: RootState) => state.csvData); //CSV DATA FROM FILE OR DATABASE
  const gpxData = useAppSelector((state: RootState) => state.gpxData); //GPX DATA FROM FILE OR DATABASE
  const showBtnDisabled = useAppSelector(
    (state: RootState) => state.showBtnDisabled
  ); // BTN FOR MERGE DATA ACTIVE/DEACTIVE
  const markersData = useAppSelector(
    (state: RootState) => state.markersReduceById
  ); //IDs OF ALL MARKERS
  //*************  HANDLE DATA BUTTON CLICK FROM LIST ****************/

  const handleDataClick = (id: number, command: string) => {
    return handlaChange(id, command);
  };
  

  //************* CONVERT CSV FILE TO CSVDATA ****************/
  type RowData = (string | number | Date)[];
  const handleFileUploadCsv = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files; // Uložíme files do proměnné
    if (files && files.length > 0) {
      const file = files[0];

      if (file) {
        Papa.parse<RowData>(file, {
          header: false,
          dynamicTyping: true,
          complete: (result) => {
            const filteredData = result.data
              .filter((row, index) => index !== 0)
              .map((row) => {
                const date = new Date(row[16]);
                const formattedDate = dayjs(date).format("D. M. YYYY HH:mm:ss");
                return [formattedDate, ...row.slice(0)];
              });
            dispatch({ type: "SET_CSV_DATA", payload: filteredData });
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
          },
        });
      }
    }
  };

  //************* CONVERT GPX FILE TO GPXDATA ****************/

  const handleFileUploadGpx = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files; // Uložíme files do proměnné
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        dispatch({ type: "SET_SHOW_BTN_DISABLE", payload: false });

        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target && (e.target.result as string);
          if (text) {
            const parser = new GPXParser();
            parser.parse(text);
            const tracks = parser.tracks;

            if (tracks.length > 0) {
              const trackPoints = tracks[0].points;
              const formattedData = trackPoints.map((point) => {
                const date = new Date(point.time);
                const formattedDate = format(date, "d. M. yyyy HH:mm:ss"); //, {locale: cs}
                return {
                  ...point,
                  time: formattedDate.toLocaleString(),
                };
              });
              dispatch({ type: "SET_GPX_DATA", payload: formattedData });
            } else {
              console.log("No track data found in the file");
            }
          } else {
            console.error("Error reading the file content.");
          }
        };
        reader.readAsText(file);
      }
    }
  };
  //************* MERGE GPX AND CSV DATA ****************/

  const mergeData = (id: number, gpxData: GpxDataI[], csvData: CsvRow[]) => {
    const merged = gpxData
      .map((gpxPoint) => {
        // Find the last BTS with a time less than or equal to the GPX time

        const matchingCsvPoint = csvData.filter((csvPoint) => {
          if (csvPoint[0]) {
            return csvPoint[0] <= gpxPoint.time;
          } else {
            return false;
          }
        });

        if (matchingCsvPoint) {
          return {
            ...gpxPoint,
            btsInfo: matchingCsvPoint[matchingCsvPoint.length - 1], //CHOOSE LAST ROW FROM LIST OF BTS
          };
        }
        return null; // If BTS not exist return null
      })
      .filter(Boolean);

    const markers = merged.map((data) => ({
      _id: id,
      CID: data && data.btsInfo[5] + ":" + data.btsInfo[6],
      LAC: data && data.btsInfo[3],
      MCC_MNC: data && data.btsInfo[1] + "" + data.btsInfo[2],
      RSRP: data && data.btsInfo[22],
      TYP: data && data.btsInfo[18],
      date: data && data.time,
      id: -1,
      lat: (data && data.lat) || 0,
      lon: (data && data.lon) || 0,
    }));
    dispatch({ type: "SET_NEW_MARKERS", payload: markers });
    dispatch({ type: "SET_SHOW_BTN_DISABLE", payload: true });
  };
  //************* HANDLE CLICK BUTTON FROM FILE INPUT ****************/

  const handleClick = () => {
    if (gpxData && csvData) {
      mergeData(-1, gpxData, csvData);
    } else {
      alert("Vložte oba soubory");
    }
  };

  //************* HANDLE CLICK BUTTON DEMO ****************/

  const handleClickDemo = () => {
    if (gpxDemo && csvDemo) {
      mergeData(-1, gpxDemo, csvDemo);

      dispatch({ type: "MENU", payload: false });
      dispatch({ type: "SET_SHOW_HINT", payload: true });
    }
  };

  //************* USEEFFECTS ****************/

  useEffect(() => {
    if (gpxData) {
    }
    // console.log("gpxData");
    // console.log(gpxData);
  }, [gpxData]);

  useEffect(() => {
    if (csvData) {
    }
    // console.log("csvData");
    // console.log(csvData);
  }, [csvData]);

  useEffect(() => {
    if (newMarkers ) {
      return handleMarkers(newMarkers);
    }
  }, [newMarkers]);

  //************* RETURN ****************/

  return (
    <div className="row   ">
      {/* START LIST OF LOGS */}
      <div className="col-md-4  ">
        {/* BUTTON SHOW LIST OF LOGS */}
        <button
          className=" btn  btn-dark dropdown-toggle me-1 w-100"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Zobrazit Seznam logů ({markersData && markersData.length})
        </button>
        {/* /BUTTON SHOW LIST OF LOGS */}

        {/* LIST OF LOGS */}
        <ul className="dropdown-menu p-2 ">
          {markersData && (
            <div>
              {markersData.map((marker) => {
                return (
                  <li key={marker["_id"]}>
                    <h6>ID: {marker["_id"] + ", Datum: " + marker["date"]}</h6>

                    {/* SHOW BUTTON FROM LIST*/}
                    <button
                      className="btn btn-success"
                      id="show"
                      onClick={() => handleDataClick(marker["_id"], "show")}
                    >
                      Zobrazit
                    </button>

                    {/* SAVE BUTTON FROM LIST */}
                    <button
                      className="btn btn-warning"
                      id="save"
                      onClick={() => handleDataClick(marker["_id"], "save")}
                      disabled={marker["saved"] === 1}
                    >
                      {marker["saved"] === 1 ? "Uloženo" : "Uložit...."}
                    </button>

                    {/* DELETE BUTTON FROM LIST */}
                    <button
                      className="btn btn-danger"
                      id="delete"
                      onClick={() => handleDataClick(marker["_id"], "delete")}
                      disabled={marker["saved"] === 0}
                    >
                      {marker["saved"] === 1 ? "Smazat" : "--------"}
                    </button>

                    <hr />
                  </li>
                );
              })}
            </div>
          )}
        </ul>
        {/* /LIST OF LOGS */}
      </div>

      {/* INPUT EXTERNAL FILES */}
      <div className="dropdown col-md-4">
        <button
          className="btn btn-secondary dropdown-toggle w-100"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Vybrat soubory
        </button>
        <ul className="dropdown-menu ">
          {/* INPUT FOR CSV FILE */}
          <li>
            <div className=" p-1 border border-secondary   rounded-1">
              <label htmlFor="csv" className="form-label">
                Vložit .csv soubor z aplikace Tower Collector
              </label>

              <input
                className="form-control me-2"
                type="file"
                placeholder=""
                key={1}
                onChange={handleFileUploadCsv}
                accept=".csv"
                name="csv"
                id="csv"
              />
            </div>
          </li>
          {/* /INPUT FOR CSV FILE */}
          {/* INPUT FOR GPX FILE */}
          <li>
            <div className=" p-1 border border-secondary  rounded-1">
              <label htmlFor="csv" className="form-label">
                Vložit .gpx soubor z aplikace Geo Tracker
              </label>
              <input
                className="form-control me-2"
                type="file"
                key={2}
                onChange={handleFileUploadGpx}
                accept=".gpx"
                name="gpx"
                id="gpx"
                placeholder="Vyberte .gpx soubor"
              />
            </div>
          </li>
          {/* /INPUT FOR GPX FILE */}

          {/* BUTTON FOR MERGE GPX AND CSV DATA */}
          <li>
            <button
              disabled={showBtnDisabled}
              className="btn btn-success mt-1 w-100"
              onClick={handleClick}
            >
              Sloučit soubory
            </button>
          </li>
          {/* /BUTTON FOR MERGE GPX AND CSV DATA */}
        </ul>
      </div>
      {/* /INPUT EXTERNAL FILES */}

      {/*  SHOW DEMO*/}
      <div className="col-md-4">
        <button className="btn btn-warning  w-100" onClick={handleClickDemo}>
          UKÁZKA - klikni
        </button>
      </div>
      {/* /SHOW DEMO*/}
    </div>
  );
}

export default InputFile;
