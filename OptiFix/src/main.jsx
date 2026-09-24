import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { WorkshopProvider } from "./context/WorkshopContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WorkshopProvider>
          <App />
        </WorkshopProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);