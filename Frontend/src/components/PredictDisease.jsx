import React, { useState } from "react";
import "../static/css/PredictDisease.css";
import axios from "axios";

export default function PredictDisease() {
  const [patientName, setPatientName] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [availableSymptoms, setAvailableSymptoms] = useState([
    "itching",
    "skin_rash",
    "joint_pain",
    "stomach_pain",
    "headache",
    "vomiting",
    "fatigue",
    "cough",
    "high_fever",
    "dizziness",
    "weight_loss",
    "nausea",
    "abdominal_pain",
    "indigestion",
    "dehydration",
    "muscle_pain",
    "chills",
    "breathlessness",
    "swelling_joints",
    "diarrhoea",
    "loss_of_balance",
    "blurred_and_distorted_vision",
    "irregular_sugar_level",
    "mood_swings",
  ]);
  const [probableDiseases, setProbableDiseases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSymptomSelect = (symptom) => {
    setSelectedSymptoms([...selectedSymptoms, symptom]);
    setAvailableSymptoms(availableSymptoms.filter((s) => s !== symptom));
  };

  const handleSymptomRemove = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    setAvailableSymptoms([...availableSymptoms, symptom]);
  };

  const resetForm = () => {
    setPatientName("");
    setSelectedSymptoms([]);
    setAvailableSymptoms([...availableSymptoms, ...selectedSymptoms]);
    setProbableDiseases([]);
    setSearchTerm("");
  };

  const predictDiseases = async () => {
    if (!selectedSymptoms.length) return alert("Please select symptoms.");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/diagnosis", {
        symptoms: selectedSymptoms.join(","),
      });
      setProbableDiseases(response.data.diagnosis);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze symptoms. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSymptoms = availableSymptoms.filter((symptom) =>
    symptom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="root-predict-disease">
      <div className="predictDisease_diagnosis-container">
        <div className="predictDisease_diagnosis-header">
          <h1>Clinical Diagnosis Assistant</h1>
          <p>Advanced Symptom Analysis System</p>
        </div>

        {/* Patient Name Input */}
        <div className="predictDisease_input-group">
          <label>
            <i className="fas fa-user-injured"></i> Patient Name
          </label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Enter patient name..."
          />
        </div>

        {/* Symptom Search */}
        <div className="predictDisease_search-box">
          <input
            type="text"
            placeholder="Search symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Available Symptoms */}
        <div className="predictDisease_symptom-grid">
          {filteredSymptoms.map((symptom) => (
            <button
              key={symptom}
              className="predictDisease_symptom-card"
              onClick={() => handleSymptomSelect(symptom)}
            >
              {symptom.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Selected Symptoms */}
        <div className="predictDisease_selected-list">
          {selectedSymptoms.map((symptom) => (
            <div key={symptom} className="predictDisease_selected-item">
              {symptom.replace(/_/g, " ")}
              <button onClick={() => handleSymptomRemove(symptom)}>✕</button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="predictDisease_diagnosis-actions">
          <button
            onClick={predictDiseases}
            disabled={!selectedSymptoms.length || loading}
          >
            {loading ? "Analyzing..." : "Analyze Symptoms"}
          </button>
          <button onClick={resetForm}>Reset</button>
        </div>

        {/* Loading Animation */}
        {loading && (
          <div className="predictDisease_loader">
            <div className="loader"></div>
            <p>Analyzing symptoms...</p>
          </div>
        )}

        {/* Diagnosis Results */}
        {probableDiseases.length > 0 && (
          <div className="predictDisease_diagnosis-results">
            <h3>Probable Conditions:</h3>
            {probableDiseases.map((disease, index) => (
              <div key={index} className="predictDisease_disease-card">
                {disease.diagnosis}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
