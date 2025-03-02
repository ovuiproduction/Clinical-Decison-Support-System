import React from "react";
import { Link } from "react-router-dom";
import "../static/css/cover.css";
import {
  FaStethoscope,
  FaHeartbeat,
  FaSearch,
  FaNotesMedical,
  FaMicroscope
} from "react-icons/fa";

export default function Cover() {
  return (
    <div className="cover-container">
      {/* Header Section */}
      <header className="cover-header">
        <div className="logo">
          <FaStethoscope className="logo-icon" />
          <span className="logo-text">CDSS</span>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="cover-content">
        <h1>Clinical Decision Support System</h1>
        <p>Empowering healthcare with intelligent diagnosis and insights.</p>

        {/* Feature Blocks */}
        <div className="feature-blocks">
          <div className="feature-card">
            <FaHeartbeat className="feature-icon" />
            <h2>Diagnosis Disease</h2>
            <p>Analyze symptoms to predict potential conditions accurately.</p>
            <Link to="/diagnosis-disease" className="feature-link">
              Explore Diagnosis
            </Link>
          </div>

          <div className="feature-card">
            <FaNotesMedical className="feature-icon" />
            <h2>Diagnosis CDSS</h2>
            <p>
              Advanced decision-making with patient data and medical records.
            </p>
            <Link to="/diagnosis-cdss" className="feature-link">
              Explore CDSS
            </Link>
          </div>


          <div className="feature-card">
            <FaMicroscope className="feature-icon" />
            <h2>Blood Analyzer</h2>
            <p>
            Unlock insights from blood reports with advanced diagnostics.
            </p>
            <Link to="/diagnosis-blood-report" className="feature-link">
            Explore Report
            </Link>
          </div>

          <div className="feature-card">
            <FaSearch className="feature-icon" />
            <h2>Research Insights</h2>
            <p>
              Access in-depth medical research and insights to enhance care.
            </p>
            <Link to="/research-insights" className="feature-link">
              Explore Insights
            </Link>
          </div>
        </div>
      </main>
      <footer className="cover-footer">
        <p>&copy; {new Date().getFullYear()} CDSS - All Rights Reserved.</p>
      </footer>
    </div>
  );
}
