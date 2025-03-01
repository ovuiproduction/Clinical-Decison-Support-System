# import os
# from Bio import Entrez

# # Set your email for NCBI API
# Entrez.email = "shripadwattamwar19@gmail.com"

# # List of medical topics
# medical_topics = ["Diabetes", "Hypertension", "Cancer Treatment", "COVID-19"]

# # Ensure the directory exists
# os.makedirs("data/pubmed_data", exist_ok=True)

# def fetch_pubmed_articles(query, total_results=1000, batch_size=200):  
#     article_ids = []  
#     for start in range(0, total_results, batch_size):  
#         handle = Entrez.esearch(db="pubmed", term=query, retstart=start, retmax=batch_size)  
#         record = Entrez.read(handle)  
#         handle.close()  
        
#         new_ids = record["IdList"]
#         article_ids.extend(new_ids)  # Append new IDs  
#         print(f"Fetched {len(article_ids)} articles so far for: {query}")  

#     total_fetched = len(article_ids)
    
#     if total_fetched == 0:
#         print(f"⚠️ No articles found for: {query}")
#         return None
    
#     # Fetch full articles  
#     handle = Entrez.efetch(db="pubmed", id=article_ids, retmode="xml")  
#     articles = handle.read()  
#     handle.close()  

#     # Save XML data
#     file_path = f"data/pubmed_data/{query.replace(' ', '_')}.xml"
#     with open(file_path, "w", encoding="utf-8") as f:
#         f.write(articles)
    
#     print(f"✅ Successfully fetched and saved {total_fetched} articles for: {query} at {file_path}")
#     return articles  

# # Fetch articles for each topic
# for topic in medical_topics:
#     fetch_pubmed_articles(topic, total_results=1000, batch_size=200)





import os
from Bio import Entrez

# Set your email for NCBI API
Entrez.email = "shripadwattamwar19@gmail.com"

# List of initial medical topics
medical_topics = ["Diabetes", "Hypertension", "Cancer Treatment", "COVID-19", 
                  "Heart Disease", "Alzheimer's", "Asthma", "Obesity", "Stroke", 
                  "Tuberculosis", "Malaria", "HIV/AIDS", "Lung Cancer"]

# Ensure the directory exists
os.makedirs("data/pubmed_data", exist_ok=True)

def get_paper_count(query):
    """Returns the total number of papers available for a topic in PubMed."""
    handle = Entrez.esearch(db="pubmed", term=query, retmax=1)  
    record = Entrez.read(handle)  
    handle.close()  
    return int(record["Count"]) if "Count" in record else 0

def fetch_pubmed_articles(query, total_results=1000, batch_size=200):  
    """Fetch articles from PubMed in batches."""  
    article_ids = []  
    for start in range(0, total_results, batch_size):  
        handle = Entrez.esearch(db="pubmed", term=query, retstart=start, retmax=batch_size)  
        record = Entrez.read(handle)  
        handle.close()  

        if "IdList" in record:
            article_ids.extend(record["IdList"])  
        
        print(f"Fetched {len(article_ids)} articles so far for: {query}")  

        if len(record["IdList"]) < batch_size:
            break  

    if not article_ids:
        print(f"⚠️ No articles found for: {query}")
        return 0

    # Fetch full articles  
    handle = Entrez.efetch(db="pubmed", id=article_ids, retmode="xml")  
    articles = handle.read().decode("utf-8")  # Convert bytes to string  
    handle.close() 

    # Save articles
    file_path = f"data/pubmed_data/{query.replace(' ', '_')}.xml"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(articles)  # Now it correctly writes as string

    print(f"✅ Successfully fetched and saved {len(article_ids)} articles for: {query} at {file_path}")
    
    return len(article_ids)


# Step 1: Get paper counts for all topics
print("🔍 Checking available papers for each disease...")

topic_paper_counts = {topic: get_paper_count(topic) for topic in medical_topics}

# Step 2: Sort topics by availability (highest first)
sorted_topics = sorted(topic_paper_counts.items(), key=lambda x: x[1], reverse=True)

# Step 3: Select top diseases with most papers
top_topics = [topic for topic, count in sorted_topics[:5]]  # Choose top 5 diseases

# Display the selection
print("\n📊 Top diseases with most papers:")
for topic, count in sorted_topics[:5]:
    print(f"   🔹 {topic}: {count} papers available")

# Step 4: Fetch articles for selected topics
total_papers = 0

print(f"\n📢 Fetching PubMed papers for {len(top_topics)} high-availability diseases...")

for topic in top_topics:
    count = fetch_pubmed_articles(topic, total_results=1000, batch_size=200)
    total_papers += count

print(f"\n✅ Completed fetching papers for high-availability diseases. Total papers fetched: {total_papers}")
