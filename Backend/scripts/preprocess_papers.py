import xml.etree.ElementTree as ET
import json
import os

# Paths
DATA_PATH = "data/pubmed_data/"
OUTPUT_FILE = "data/processed_papers.json"

def parse_pubmed_xml(xml_file):
    """Parses a PubMed XML file and extracts article details."""
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
    except ET.ParseError:
        print(f"⚠️ Skipping corrupt XML file: {xml_file}")
        return []

    articles = []
    
    for article in root.findall(".//PubmedArticle"):
        # Extract Title
        title = article.find(".//ArticleTitle").text if article.find(".//ArticleTitle") is not None else "No Title"
        
        # Extract Abstract (handle multiple sections)
        abstract_texts = article.findall(".//AbstractText")
        abstract = " ".join([abst.text for abst in abstract_texts if abst.text]) if abstract_texts else "No Abstract"
        
        # Extract Publication Year
        pub_year = article.find(".//PubDate/Year")
        pub_date = pub_year.text if pub_year is not None else "Unknown Year"

        # Extract Authors
        authors = []
        for author in article.findall(".//Author"):
            last_name = author.find("LastName")
            fore_name = author.find("ForeName")
            if last_name is not None and fore_name is not None:
                authors.append(f"{fore_name.text} {last_name.text}")

        # Extract Journal Name
        journal = article.find(".//Journal/Title")
        journal_name = journal.text if journal is not None else "Unknown Journal"

        # Extract DOI
        doi = article.find(".//ArticleId[@IdType='doi']")
        doi_text = doi.text if doi is not None else "No DOI"

        articles.append({
            "title": title,
            "abstract": abstract,
            "year": pub_date,
            "authors": authors,
            "journal": journal_name,
            "doi": doi_text
        })
    
    return articles

all_articles = []
for file in os.listdir(DATA_PATH):
    if file.endswith(".xml"):
        file_path = os.path.join(DATA_PATH, file)
        articles = parse_pubmed_xml(file_path)
        all_articles.extend(articles)

# Save processed data as JSON
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)  # Ensure output directory exists
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(all_articles, f, indent=4)

print(f"✅ Processed {len(all_articles)} research papers and saved to {OUTPUT_FILE}")
