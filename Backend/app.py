from flask import Flask,request,jsonify,send_file
from flask_cors import CORS
from langchain_community.vectorstores import FAISS 
from langchain.schema import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
import pandas as pd
import google.generativeai as genai
import os
from scripts.retrieve_papers import retrieve_research_papers  
from dotenv import load_dotenv
import pdfplumber
from googletrans import Translator
from langdetect import detect
from gtts import gTTS
import speech_recognition as sr
from concurrent.futures import ThreadPoolExecutor
import re

load_dotenv()
app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini API
genai.configure(api_key=API_KEY) 

translator = Translator()
recognizer = sr.Recognizer()
executor = ThreadPoolExecutor(max_workers=3)  # Run tasks in parallel

# Initialize BioBERT embeddings (same model used during saving)
embedding_model = "dmis-lab/biobert-base-cased-v1.1"
embeddings = HuggingFaceEmbeddings(model_name=embedding_model)


vector_store = FAISS.load_local("faiss_symptoms_store", embeddings,allow_dangerous_deserialization=True)
vector_store_cdss = FAISS.load_local("faiss_cdss_store", embeddings,allow_dangerous_deserialization=True)



def search(query,k):
    results = vector_store.similarity_search(query, k)
    return [
        {
            "symptoms": doc.page_content,
            "diagnosis": doc.metadata.get("diagnosis", "Unknown Diagnosis")
        }
        for doc in results
    ]

def search_cdss(birth_date, gender, conditions, observations, top_k=3):
    query = f"Birth Date: {birth_date}\nGender: {gender}\nConditions: {conditions}\nObservations: {observations}"
    results = vector_store_cdss.similarity_search(query, k=top_k)
    return [
        {
            "activities": doc.metadata.get("activities", []),
        }
        for doc in results
    ]



def analyze_papers(papers, query):
    """Generate AI insights by extracting key questions, findings, and solutions from research papers using Gemini Pro."""
    formatted_papers = []
    
    for paper in papers:
        doi = paper.get("doi", "N/A")
        formatted_papers.append(f"Title: {paper['title']}\nDOI: {doi}")

    papers_text = "\n\n".join(formatted_papers)

    prompt = f"""
    The user is searching for research insights on: {query}.
    
    Below are some research papers related to this topic. Using the given DOI, extract structured insights that can help doctors make informed decisions:

    {papers_text}

    **Instructions:**
    - Retrieve and analyze each research paper using its DOI.
    - Extract and list **key research questions** that the paper attempts to answer.
    - Summarize **major findings** relevant to medical professionals.
    - Identify **proposed solutions or recommendations** from the paper.
    - Present the information in a structured format with proper citations (using DOIs).
    - Focus on practical takeaways for healthcare decision-making.

    **Output Format:**
    - **Title:** [Paper Title]
    - **DOI:** [DOI]
    - **Key Research Questions:**
        - Question 1
        - Question 2
    - **Major Findings:**
        - Finding 1
        - Finding 2
    - **Proposed Solutions:**
        - Solution 1
        - Solution 2
    """

    model = genai.GenerativeModel("gemini-1.5-pro")
    response = model.generate_content(prompt)
    
    return response.text




def extract_text_from_pdf(pdf_file):
    try:
        with pdfplumber.open(pdf_file) as pdf:
            text = "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())
        return text if text else "No readable text found in the PDF."
    except Exception as e:
        return f"Error extracting text: {str(e)}"

def analyze_with_gemini(text):
    try:
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content(f"Analyze this blood report and provide key medical insights:\n{text}")
        return response.text if response else "No insights found."
    except Exception as e:
        return f"Error with Gemini AI: {str(e)}"




def get_ai_response(prompt):
    """Fetch response from Gemini AI and handle errors."""
    try:
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content(prompt)

        if not response or not response.text:
            raise ValueError("Empty response from Gemini API")

        return response.text.strip()
    except Exception as e:
        print(f"Error fetching AI response: {e}")
        return "AI system is currently unavailable. Please try again later."

def generate_tts(text, lang, audio_file):
    """Convert text to speech and save as an audio file."""
    tts = gTTS(text=text, lang=lang)
    tts.save(audio_file)




@app.route('/')
def index():
    return ("Server running on localhost:5000")

@app.route('/diagnosis', methods=['POST'])
def diagnose():
    print("Request Arrived")
    data = request.get_json()
    symptoms = data.get("symptoms")
    diagnosis = search(symptoms,1)
    return jsonify({"diagnosis": diagnosis})


@app.route('/diagnosis-cdss', methods=['POST'])
def diagnose_cdss():
    print("Request Arrived")
    data = request.get_json()
    name = data.get('name'),
    gender = data.get('gender'),
    dob = data.get('dob'),
    conditions = data.get('conditions'),
    observations = data.get('observations'),
    diagnosis = search_cdss(dob, gender, conditions, observations, 1)
    print(diagnosis)
    return jsonify({"diagnosis": diagnosis})


@app.route("/research-search", methods=["POST"])
def search_papers():
    data = request.get_json()
    query = data.get("query", "")

    if not query:
        return jsonify({"error": "Query is required"}), 400

    papers = retrieve_research_papers(query)
    
    if "error" in papers:
        return jsonify(papers)

    insights = analyze_papers(papers, query)

    return jsonify({"papers": papers, "insights": insights})


@app.route("/upload-blood-report", methods=["POST"])
def upload_pdf():
    print("Request Arrived")
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty file uploaded"}), 400

    try:
        extracted_text = extract_text_from_pdf(file)
        insights = analyze_with_gemini(extracted_text)
        return jsonify({"insights": insights})
    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500



@app.route("/ask", methods=["POST"])
def ask_gemini():
    data = request.json
    query = data.get("query", "")
    detailed = data.get("detailed", False)

    if not query:
        return jsonify({"error": "No query provided"}), 400

    try:
        detected_lang = detect(query)

        # Translate to English if required
        translated_query = (
            translator.translate(query, src=detected_lang, dest="en").text
            if detected_lang != "en"
            else query
        )

        prompt = (
            f"You are a medical assistant. Provide a detailed response: {translated_query}"
            if detailed
            else f"You are a medical assistant. Answer briefly: {translated_query}"
        )

       
        ai_future = executor.submit(get_ai_response, prompt)
        ai_response = ai_future.result() 

        ai_response = re.sub(r"\*+", "", ai_response).strip()
    
        final_response = (
            translator.translate(ai_response, src="en", dest=detected_lang).text
            if detected_lang != "en"
            else ai_response
        )

        audio_file = "response.mp3"
        tts_future = executor.submit(generate_tts, final_response, detected_lang, audio_file)
        tts_future.result()  # Ensure TTS finishes before returning response

        return jsonify({"response": final_response, "audio": "/audio"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/audio", methods=["GET"])
def get_audio():
    audio_file = "response.mp3"
    if os.path.exists(audio_file):
        return send_file(audio_file, as_attachment=True)
    else:
        return jsonify({"error": "Audio file not found"}), 404


@app.route("/voice-input", methods=["POST"])
def voice_input():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    audio_path = "user_audio.wav"
    audio_file.save(audio_path)

    try:
        with sr.AudioFile(audio_path) as source:
            audio = recognizer.record(source)
            detected_text = recognizer.recognize_google(audio)

        detected_lang = detect(detected_text)

        return jsonify({"transcribed_text": detected_text, "language": detected_lang}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True, port=5000)