import React from "react";

function ComboBox({ data ,handlaChange }) {
  const handleClick = (id,command) => {
 
      return handlaChange(id,command)
  };
  return (
    <div>
      {data.length > 0 && (
        <>
          {data.map((one, index) => {
            return (
              <div key={index}>
                <h6>Data - {one}</h6>
                <button
                  className="btn btn-success"
                  id="show"
                  onClick={() => handleClick(one, "show")}
                >
                  zobrazit
                </button>
                <button
                  className="btn btn-danger"
                  id="delete"
                  onClick={() => handleClick(one, "delete")}
                >
                  smazat
                </button>
                <button
                  className="btn btn-warning"
                  id="save"
                  onClick={() => handleClick(one, "save")}
                >
                  smazat
                </button>
                <hr />
              </div>
            );
          })}
        </>
      )}
      {data.length === 0 && <p>Nejsou data</p>}
    </div>
  );
}

export default ComboBox;
