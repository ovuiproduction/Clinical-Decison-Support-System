import os
import glob
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from xml.etree import ElementTree as ET

# Load a pre-trained embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Path to the folder containing XML files
data_folder = "data/pubmed_data"

# Ensure output directory exists
os.makedirs("data/embeddings", exist_ok=True)

def extract_texts_from_xml(file_path):
    """Extract abstracts from all papers in a PubMed XML file."""
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()

        articles = []
        for article in root.findall(".//PubmedArticle"):
            title = article.find(".//ArticleTitle")
            abstract = article.find(".//AbstractText")

            # Extract text safely
            title_text = title.text if title is not None else "No Title"
            abstract_text = abstract.text if abstract is not None else "No Abstract"

            # Append both title and abstract for better embedding results
            articles.append(f"{title_text}. {abstract_text}")

        return articles  # Returns a list of texts, not a single string

    except ET.ParseError:
        print(f"⚠️ Skipping corrupt XML file: {file_path}")
        return []

def generate_embeddings():
    """Generate embeddings for each research paper inside XML files."""
    xml_files = glob.glob(os.path.join(data_folder, "*.xml"))
    
    all_texts = []
    queries = []

    for file in xml_files:
        base_name = os.path.splitext(os.path.basename(file))[0]
        abstracts = extract_texts_from_xml(file)

        if abstracts:
            # Append each paper separately instead of grouping the entire file
            all_texts.extend(abstracts)
            queries.extend([f"{base_name}_paper_{i+1}" for i in range(len(abstracts))])

    if not all_texts:
        print("⚠️ No valid abstracts found. Exiting...")
        return

    # Process texts in batch mode
    embeddings = model.encode(all_texts, batch_size=32)

    # Store embeddings in a dictionary
    embeddings_dict = {queries[i]: embeddings[i].tolist() for i in range(len(queries))}

    # Save embeddings as JSON for easy access
    with open("data/embeddings/pubmed_embeddings.json", "w", encoding="utf-8") as f:
        json.dump(embeddings_dict, f, indent=4)

    print(f"✅ Processed {len(queries)} research papers and saved embeddings successfully!")

if __name__ == "__main__":
    generate_embeddings()
