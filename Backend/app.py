from flask import Flask,request, render_template,jsonify
from flask_cors import CORS
from langchain_community.vectorstores import FAISS 
from langchain.schema import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
import pandas as pd


app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


# Initialize BioBERT embeddings (same model used during saving)
embedding_model = "dmis-lab/biobert-base-cased-v1.1"
embeddings = HuggingFaceEmbeddings(model_name=embedding_model)

# Load the FAISS index from local storage
vector_store = FAISS.load_local("faiss_symptoms_store", embeddings,allow_dangerous_deserialization=True)

def search(query,k):
    results = vector_store.similarity_search(query, k)
    print(results)
    # for i, result in enumerate(results):
    #     print(f"Result {i+1}:")
    #     print("Symptoms:", result.page_content)
    #     print("Diagnosis:", result.metadata['diagnosis'])
    #     print("-" * 50)
    return results

@app.route('/')
def index():
    return ("Server running on localhost:5000")

@app.route('/diagnosis', methods=['POST'])
def diagnose():
    data = request.json
    symptoms = data.get("symptoms")
    diagnosis = search(symptoms,3)
    return jsonify({"diagnosis": diagnosis})

if __name__ == '__main__':
    app.run(debug=True, port=5000)