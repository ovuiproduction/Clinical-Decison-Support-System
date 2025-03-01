import React, { useState } from "react";
import "../static/css/diagnosis_detection.css";
import axios from "axios";

export default function DiagnosisCDSS() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    conditions: "",
    observations: "",
  });

  const [currentObs, setCurrentObs] = useState({ what: "", value: "" });
  const [suggestedActivities, setSuggestedActivities] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  const observationOptions = [
    "Hemoglobin A1c",
    "Body Height",
    "Body Weight",
    "Body Mass Index",
    "Glucose",
    "Urea Nitrogen",
    "Creatinine",
    "Calcium",
    "Sodium",
    "Potassium",
    "Chloride",
    "Carbon Dioxide",
    "Total Cholesterol",
    "Triglycerides",
    "Low Density Lipoprotein Cholesterol",
    "High Density Lipoprotein Cholesterol",
    "Oral Temperature",
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleObsChange = (e) => {
    setCurrentObs({ ...currentObs, [e.target.name]: e.target.value });
  };

  const addObservation = () => {
    if (currentObs.what && currentObs.value) {
      const newObservation = `${currentObs.what}:${currentObs.value}`;
      setFormData({
        ...formData,
        observations: formData.observations
          ? `${formData.observations}, ${newObservation}`
          : newObservation,
      });
      setCurrentObs({ what: "", value: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading animation
    try {
      const response = await axios.post(
        "http://localhost:5000/diagnosis-cdss",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      let responseData = response.data;
      console.log(responseData);
      setSuggestedActivities(responseData.diagnosis);
    } catch (error) {
      console.error("Error submitting symptoms:", error);
      alert("Failed to submit symptoms.");
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      gender: "",
      dob: "",
      conditions: "",
      observations: "",
    });
    setCurrentObs({ what: "", value: "" });
    setSuggestedActivities([]);
  };

  return (
    <div className="root-diagnosis-detection">
      <div className="Diagnosis_form-container">
        <h1 className="Diagnosis_who-header">
          <i className="fas fa-stethoscope"></i> Get Advanced Analysis of Health
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="Diagnosis_input-group">
            <label>
              <i className="fas fa-user"></i> Full Name:
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="Diagnosis_input-row">
            <div className="Diagnosis_input-group">
              <label>
                <i className="fas fa-venus-mars"></i> Gender:
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="Diagnosis_input-group">
              <label>
                <i className="fas fa-calendar-alt"></i> Date of Birth:
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="Diagnosis_input-group">
            <label>
              <i className="fas fa-notes-medical"></i> Medical Conditions:
            </label>
            <textarea
              name="conditions"
              value={formData.conditions}
              onChange={handleInputChange}
              rows="3"
              required
            />
          </div>

          <div className="Diagnosis_observations-section">
            <h3>
              <i className="fas fa-microscope"></i> Clinical Observations
            </h3>
            <div className="Diagnosis_obs-input-group">
              <select
                name="what"
                value={currentObs.what}
                onChange={handleObsChange}
              >
                <option value="">Select Observation</option>
                {observationOptions.map((obs, index) => (
                  <option key={index} value={obs}>
                    {obs}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="value"
                placeholder="Value (e.g., 13)"
                value={currentObs.value}
                onChange={handleObsChange}
              />

              <button
                type="button"
                onClick={addObservation}
                className="Diagnosis_add-btn"
              >
                <i className="fas fa-plus-circle"></i>
              </button>
            </div>

            {formData.observations && (
              <div className="Diagnosis_obs-preview">
                <strong>Current Observations:</strong> {formData.observations}
              </div>
            )}
          </div>

          <div className="Diagnosis_button-group">
            <button type="submit" className="Diagnosis_submit-btn">
              Analyze Now
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="Diagnosis_reset-btn"
            >
              <i className="fas fa-undo"></i>
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Analyzing data... Please wait.</p>
        </div>
      )}

      {suggestedActivities.length > 0 && (
        <div className="predictDisease_diagnosis-results">
          <h3>
            <i className="fas fa-tasks"></i> Suggested Activities
          </h3>
          <div className="predictDisease_disease-list">
            {suggestedActivities.map((disease, index) => (
              <div key={index} className="predictDisease_disease-card">
                <h4>
                  <i className="fas fa-clipboard-check"></i> Activities:
                </h4>
                {disease.activities ? (
                  <ul>
                    {disease.activities
                      .replace(/'/g, '"') // Replace single quotes with double quotes
                      .replace(/None/g, "null") // Handle 'None' values
                      .replace(/True/g, "true")
                      .replace(/False/g, "false") // Handle booleans
                      .match(/\[.*\]/) // Extract valid JSON array
                      ? JSON.parse(
                          disease.activities
                            .replace(/'/g, '"')
                            .replace(/None/g, "null")
                            .replace(/True/g, "true")
                            .replace(/False/g, "false")
                        ).map((activity, activityIndex) => (
                          <li key={activityIndex}>{activity}</li>
                        ))
                      : "No valid activities found"}
                  </ul>
                ) : (
                  <p>No activities available</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
