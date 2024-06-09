import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import App from "./App";
import RecoilNexus from "./RecoilNexus";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <RecoilRoot>
    <RecoilNexus />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </RecoilRoot>
);
