// app.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Cover from "./components/Cover";
import MainResearchInsights from "./components/MainResearchInsights"; 
import DiagnosisCDSS from "./components/DiagnosisCDSS";
import PredictDisease from "./components/PredictDisease"
import BloodAnalyzer from "./components/BloodAnalyzer";

export default function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Cover />} />
        <Route path="/research-insights" element={<MainResearchInsights />} />
        <Route path="/diagnosis-disease" element={<PredictDisease />} />
        <Route path="/diagnosis-cdss" element={<DiagnosisCDSS />} />
        <Route path="/diagnosis-blood-report" element={<BloodAnalyzer />} />
      </Routes>
    </Router>
  );
}
