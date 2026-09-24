import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { WorkshopProvider } from "./context/WorkshopContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <WorkshopProvider>
        <App />
      </WorkshopProvider>
    </BrowserRouter>
  </React.StrictMode>
);