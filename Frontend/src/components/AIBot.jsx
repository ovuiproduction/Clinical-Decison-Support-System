import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";


const AIBot = () => {
   const [query, setQuery] = useState("");
   const [response, setResponse] = useState("");
   const [detailed, setDetailed] = useState(false);
   const [audioUrl, setAudioUrl] = useState(null);
   const [loading, setLoading] = useState(false);
   const [recording, setRecording] = useState(false);
   const [recognition, setRecognition] = useState(null);

   const handleInputChange = (e) => {
      setQuery(e.target.value);
   };

   // Function to fetch AI response
   const fetchResponse = async (isDetailed = false) => {
      if (!query.trim()) return;

      setLoading(true);
      setResponse("");
      setAudioUrl(null);
      setDetailed(isDetailed);

      try {
         const res = await axios.post("http://localhost:5000/ask", { query, detailed: isDetailed });
         setResponse(res.data.response);
         setAudioUrl("http://localhost:5000/audio");
      } catch (error) {
         setResponse("Error fetching response. Please try again.");
      }
      setLoading(false);
   };

   const startRecording = () => {
      if (!("webkitSpeechRecognition" in window)) {
         alert("Speech Recognition not supported in your browser.");
         return;
      }

      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.lang = "en-US";
      speechRecognition.start();
      setRecording(true);
      setRecognition(speechRecognition);

      speechRecognition.onresult = (event) => {
         const transcript = event.results[0][0].transcript;
         setQuery(transcript);
         setRecording(false);
      };

      speechRecognition.onerror = () => {
         setRecording(false);
      };
   };

   return (
      <div style={styles.container}>
         <h1 style={styles.heading}>AI Medical Bot</h1>

         {/* Input Field */}
         <textarea
            style={styles.input}
            rows="3"
            value={query}
            onChange={handleInputChange}
            placeholder="Type your medical query..."
         />

         {/* Buttons */}
         <div style={styles.buttonContainer}>
            <button style={styles.button} onClick={() => fetchResponse(false)} disabled={loading}>
               {loading ? "Processing..." : "Ask AI"}
            </button>
            <button style={styles.micButton} onClick={startRecording} disabled={recording}>
               {recording ? "Listening..." : "🎤 Voice Input"}
            </button>
         </div>

         {/* AI Response */}
         {/* AI Response */}
         {response && (
            <div style={styles.responseContainer}>
               <h3 style={styles.responseHeading}>AI Response:</h3>
               <ReactMarkdown style={styles.responseText}>{response}</ReactMarkdown>
               


               {/* "Get More Details" Button */}
               {/* {!detailed && (
                  <button style={styles.detailedButton} onClick={() => fetchResponse(true)}>
                     Get More Detailed Answer
                  </button>
               )}

               {audioUrl && (
                  <audio controls>
                     <source src={audioUrl} type="audio/mpeg" />
                     Your browser does not support the audio element.
                  </audio>
               )} */}



               {/* Wrapper for detailed answer button and audio */}
               <div style={styles.audioAndButtonContainer}>
                  {/* AI-generated speech */}
                  {audioUrl && (
                     <audio controls>
                        <source src={audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                     </audio>
                  )}

                  {/* "Get More Detailed Answer" Button */}
                  {!detailed && (
                     <button style={styles.detailedButton} onClick={() => fetchResponse(true)}>
                        Get More Detailed Answer
                     </button>
                  )}
               </div>


            </div>
         )}

      </div>
   );
};

// Styles
const styles = {
   container: {
      textAlign: "center",
      padding: "30px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh",
   },
   audioAndButtonContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      marginTop: "10px",
   },
   heading: {
      color: "#2c3e50",
      fontSize: "28px",
      marginBottom: "20px",
   },
   input: {
      width: "80%",
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontSize: "16px",
      resize: "none",
   },
   buttonContainer: {
      marginTop: "15px",
   },
   button: {
      backgroundColor: "#3498db",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      marginRight: "10px",
   },
   micButton: {
      backgroundColor: "#e74c3c",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
   },
   detailedButton: {
      backgroundColor: "#27ae60",
      color: "white",
      padding: "10px 15px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "14px",
      marginLeft: "auto", // Pushes button to extreme right
   },
   responseContainer: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      marginTop: "20px",
      maxWidth: "800px",
      marginLeft: "auto",
      marginRight: "auto",
      textAlign: "left",
   },
   responseHeading: {
      color: "#2980b9",
      fontSize: "20px",
      marginBottom: "10px",
   },
   responseText: {
      color: "#333",
      fontSize: "16px",
      lineHeight: "1.6",
   },
};

export default AIBot;
