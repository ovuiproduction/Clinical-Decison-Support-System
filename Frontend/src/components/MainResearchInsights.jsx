import React, { useState } from "react";
import ResearchInsights from "./ResearchInsights";
import "../static/css/MainResearchInsights.css";

export default function MainResearchInsights() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPapers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/research-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setResult(data.insights);
      setQuery("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="research-container">
      <h2>PubMed Research Search</h2>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your query"
        rows="2"
        className="research-textarea"
      />

      <br />

      <button onClick={searchPapers} className="research-button">
        {loading ? "Searching..." : "Search"}
      </button>

      {error && <p className="research-error">Error: {error}</p>}

      {result && <ResearchInsights insights={result} />}
    </div>
  );
}
