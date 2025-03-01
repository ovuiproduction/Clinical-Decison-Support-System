import faiss
import numpy as np
import os
import json

# Load embeddings
embeddings_file = "data/embeddings/pubmed_embeddings.json"
index_file = "data/embeddings/medical_research_embeddings.index"

if not os.path.exists(embeddings_file):
    raise FileNotFoundError(f"❌ Embeddings file not found: {embeddings_file}")

# Load JSON instead of .npy
with open(embeddings_file, "r", encoding="utf-8") as f:
    embeddings_dict = json.load(f)

# Convert dict values to NumPy array
queries = list(embeddings_dict.keys())  # Paper IDs
vectors = np.array(list(embeddings_dict.values()), dtype=np.float32)

# Debugging
print(f"📄 Total Papers Available in Embeddings: {len(vectors)}")

# Ensure embeddings are 2D (N, D)
if len(vectors.shape) != 2:
    raise ValueError(f"❌ Invalid shape: {vectors.shape}. Expected (num_docs, embedding_dim).")

# Create FAISS index
d = vectors.shape[1]  # Embedding dimension
index = faiss.IndexFlatL2(d)
index.add(vectors)

# Save FAISS index
os.makedirs("data/embeddings", exist_ok=True)
faiss.write_index(index, index_file)

print(f"📚 Total Papers Indexed in FAISS: {index.ntotal}")
print("✅ FAISS index created successfully!")
