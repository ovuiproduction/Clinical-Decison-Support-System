from flask import Flask,request,jsonify
from flask_cors import CORS
from langchain_community.vectorstores import FAISS 
from langchain.schema import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
import pandas as pd
import google.generativeai as genai
import os
from scripts.retrieve_papers import retrieve_research_papers  # Ensure this script retrieves papers with DOIs
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini API
genai.configure(api_key=API_KEY) 


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


if __name__ == '__main__':
    app.run(debug=True, port=5000)