import React, { useState } from "react";
import "../static/css/ResearchInsights.css";

const ResearchInsights = ({ insights }) => {
  const [selectedStudy, setSelectedStudy] = useState(null);

  if (!insights || typeof insights !== "string") return null;

  const studies = insights.split("\n\n").filter((study) => {
    return study.includes("**Title:**") || study.includes("**DOI:**");
  });

  const openModal = (study) => setSelectedStudy(study);

  const closeModal = () => setSelectedStudy(null);

  return (
    <div className="insights-container">
      <h2>Research Insights</h2>

      <div className="study-grid">
        {studies.map((study, index) => (
          <div
            key={index}
            className="study-card"
            onClick={() => openModal(study)}
          >
            <h3>Study {index + 1}</h3>
            <p>
              {study
                .split("\n")
                .find((line) => line.includes("**Title:**"))
                ?.replace("**Title:**", "")
                .trim() || "No Title Available"}
            </p>
          </div>
        ))}
      </div>

      {selectedStudy && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>
              &times;
            </button>
            <h2>Study Details</h2>
            {selectedStudy.split("\n").map((line, idx) => {
              if (line.startsWith("- **")) {
                return (
                  <p key={idx} className="bold-text">
                    {line.replace("- **", "").replace("**", "")}
                  </p>
                );
              } else if (line.startsWith("- ")) {
                return (
                  <ul key={idx}>
                    <li>{line.replace("- ", "")}</li>
                  </ul>
                );
              }
              return <p key={idx}>{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchInsights;
