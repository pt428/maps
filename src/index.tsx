import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store/store"; // import store
const rootElement = document.getElementById("root");

if (rootElement) {
  // Vytvoříme React root pouze v případě, že rootElement existuje
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <Provider store={store}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Provider>
  );
} else {
  console.error("Root element was not found.");
}
 

 
