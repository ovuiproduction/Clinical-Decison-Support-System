import React, { useState } from "react";
import axios from "axios";
import "../static/css/cover.css";

export default function Cover() {
  const [symptom, setSymptom] = useState("");
  const [symptomsList, setSymptomsList] = useState([]);

  // Add symptom to the list on "Enter" key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && symptom.trim()) {
      setSymptomsList([...symptomsList, symptom.trim()]);
      setSymptom("");
    }
  };

  // Submit symptoms to Flask server
  const handleSubmit = async () => {
    if (symptomsList.length === 0) {
      alert("Please add at least one symptom.");
      return;
    }

    // Convert symptomsList array to a string joined by " and "
    const symptomsString = symptomsList.join(" and ");

    try {
      const response = await axios.post(
        "http://localhost:5000/diagnosis",
        { symptoms: symptomsString },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      let responseData = response.data;
      
      alert(`Diagnosis: ${response.data.diagnosis}`); // Display the diagnosis
    } catch (error) {
      console.error("Error submitting symptoms:", error);
      alert("Failed to submit symptoms.");
    }
  };

  return (
    <div className="cover-container">
      {/* Display the list of symptoms */}
      <div className="symptoms-list">
        {symptomsList.map((s, index) => (
          <div key={index} className="symptom-item">
            {s}
          </div>
        ))}
      </div>

      {/* Input field for symptoms */}
      <input
        type="text"
        value={symptom}
        onChange={(e) => setSymptom(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter symptom and press Enter"
      />

      {/* Submit button */}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
