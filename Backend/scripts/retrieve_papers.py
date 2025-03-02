from sentence_transformers import SentenceTransformer
import faiss
import json
import numpy as np

# Load processed papers
with open("data/processed_papers.json", "r", encoding="utf-8") as f:
    all_articles = json.load(f)

# Load FAISS index
index = faiss.read_index("data/embeddings/medical_research_embeddings.index")

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

def retrieve_research_papers(query, top_k=5):
    query_embedding = model.encode([query])
    D, I = index.search(np.array(query_embedding), top_k)
    
    results = [all_articles[i] for i in I[0]]
    return results