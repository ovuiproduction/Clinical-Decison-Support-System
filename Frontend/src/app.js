// app.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Cover from "./components/Cover";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Cover />} />
      </Routes>
    </Router>
  );
}
