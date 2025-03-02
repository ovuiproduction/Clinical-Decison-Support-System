// import React, { useState } from "react";
// import axios from "axios";
// import "../static/css/BloodAnalyzer.css";

// const BloodAnalyzer = () => {
//     const [file, setFile] = useState(null);
//     const [insights, setInsights] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const handleFileChange = (e) => {
//         setFile(e.target.files[0]);
//     };

//     const handleUpload = async () => {
//         if (!file) {
//             setError("⚠️ Please select a PDF file.");
//             return;
//         }

//         setLoading(true);
//         setError("");
//         setInsights("");

//         const formData = new FormData();
//         formData.append("file", file);

//         try {
//             const response = await axios.post("http://localhost:5000/upload-blood-report", formData, {
//                 headers: { "Content-Type": "multipart/form-data" },
//             });

//             setInsights(formatInsights(response.data.insights));
//         } catch (err) {
//             setError("❌ Error processing the file. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatInsights = (text) => {
//         return text
//             .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") 
//             .replace(/\* (.*?)\n/g, "<li>$1</li>") 
//             .replace(/(\r\n|\n|\r)/gm, "<br>"); 
//     };

//     return (
//         <div className="root-blood-analyzer">
//         <div className="blood-analyzer-container">
//             <div className="analyzer-card">
//                 <h1 className="main-heading">🩸 Blood Report Analyzer</h1>
//                 <p className="sub-heading">Upload a blood report PDF to analyze key parameters and get valuable insights.</p>

//                 <div className="file-upload-section">
//                     <input type="file" accept=".pdf" id="fileInput" onChange={handleFileChange} />
//                     <label htmlFor="fileInput" className="file-label">
//                         📄 Choose PDF File
//                     </label>
//                 </div>

//                 <button onClick={handleUpload} className={`upload-btn ${loading ? "loading" : ""}`} disabled={loading}>
//                     {loading ? "Analyzing..." : "Upload & Analyze"}
//                 </button>

//                 {error && <p className="error-message">{error}</p>}

//                 {loading && <div className="loader"></div>}

//                 {insights && (
//                     <div className="insights-section">
//                         <h2>🧬 Report Insights:</h2>
//                         <p dangerouslySetInnerHTML={{ __html: insights }} />
//                     </div>
//                 )}
//             </div>
//         </div>
//         </div>
//     );
// };

// export default BloodAnalyzer;

import React, { useState } from "react";
import axios from "axios";
import "../static/css/BloodAnalyzer.css";

const BloodAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState(""); // New state for file name
    const [insights, setInsights] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        // Display the file name if it exists
        if (selectedFile) {
            setFileName(selectedFile.name);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("⚠️ Please select a PDF file.");
            return;
        }

        setLoading(true);
        setError("");
        setInsights("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:5000/upload-blood-report", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setInsights(formatInsights(response.data.insights));
        } catch (err) {
            setError("❌ Error processing the file. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatInsights = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
            .replace(/\* (.*?)\n/g, "<li>$1</li>")
            .replace(/(\r\n|\n|\r)/gm, "<br>");
    };

    return (
        <div className="root-blood-analyzer">
            <div className="blood-analyzer-container">
                <div className="analyzer-card">
                    <h1 className="main-heading">🩸 Blood Report Analyzer</h1>
                    <p className="sub-heading">Upload a blood report PDF to analyze key parameters and get valuable insights.</p>

                    {/* File Upload Section */}
                    <div className="file-upload-section">
                        <input type="file" accept=".pdf" id="fileInput" onChange={handleFileChange} />
                        <label htmlFor="fileInput" className="file-label">
                            📄 Choose PDF File
                        </label>

                        {/* Display the selected file name */}
                        {fileName && <p className="file-name">📑 Selected: {fileName}</p>}
                    </div>

                    <button onClick={handleUpload} className={`upload-btn ${loading ? "loading" : ""}`} disabled={loading}>
                        {loading ? "Analyzing..." : "Upload & Analyze"}
                    </button>

                    {error && <p className="error-message">{error}</p>}

                    {loading && <div className="loader-blood-report"></div>}

                    {/* Insights Section */}
                    {insights && (
                        <div className="insights-section">
                            <h2>🧬 Report Insights:</h2>
                            <p dangerouslySetInnerHTML={{ __html: insights }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BloodAnalyzer;
