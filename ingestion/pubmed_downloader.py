from Bio import Entrez
import json
import os


# ============================================================
# NCBI CONFIGURATION
# ============================================================

# Replace this with your email
Entrez.email = "manojkumarxoffical@gmail.com"


# ============================================================
# SEARCH PUBMED
# ============================================================

def search_pubmed(query, max_results=10):

    print("\n========================================")
    print("          SEARCHING PUBMED")
    print("========================================")

    print("Query:", query)

    handle = Entrez.esearch(
        db="pubmed",
        term=query,
        retmax=max_results,
        sort="relevance"
    )

    results = Entrez.read(handle)

    handle.close()

    pmids = results["IdList"]

    print("\nTotal matching articles:", results["Count"])
    print("Articles retrieved:", len(pmids))

    return pmids


# ============================================================
# FETCH ARTICLES
# ============================================================

def fetch_articles(pmids):

    print("\n========================================")
    print("          FETCHING ARTICLES")
    print("========================================")

    if not pmids:
        print("No articles found.")
        return []

    handle = Entrez.efetch(
        db="pubmed",
        id=pmids,
        rettype="abstract",
        retmode="xml"
    )

    records = Entrez.read(handle)

    handle.close()

    return records["PubmedArticle"]


# ============================================================
# EXTRACT ARTICLE INFORMATION
# ============================================================

def extract_article_data(records):

    articles = []

    for article in records:

        medline = article["MedlineCitation"]

        article_data = medline["Article"]

        # ----------------------------------------------------
        # PMID
        # ----------------------------------------------------

        pmid = str(medline["PMID"])

        # ----------------------------------------------------
        # TITLE
        # ----------------------------------------------------

        title = str(article_data.get("ArticleTitle", ""))

        # ----------------------------------------------------
        # ABSTRACT
        # ----------------------------------------------------

        abstract_parts = []

        if "Abstract" in article_data:

            abstract_text = article_data["Abstract"]["AbstractText"]

            for section in abstract_text:

                abstract_parts.append(str(section))

        abstract = " ".join(abstract_parts)

        # ----------------------------------------------------
        # JOURNAL
        # ----------------------------------------------------

        journal = ""

        if "Journal" in article_data:

            journal = str(
                article_data["Journal"].get("Title", "")
            )

        # ----------------------------------------------------
        # AUTHORS
        # ----------------------------------------------------

        authors = []

        if "AuthorList" in article_data:

            for author in article_data["AuthorList"]:

                if "LastName" in author:

                    last_name = str(author["LastName"])

                    first_name = ""

                    if "ForeName" in author:

                        first_name = str(
                            author["ForeName"]
                        )

                    full_name = (
                        first_name + " " + last_name
                    ).strip()

                    authors.append(full_name)

        # ----------------------------------------------------
        # PUBLICATION YEAR
        # ----------------------------------------------------

        year = ""

        if "Journal" in article_data:

            journal_info = article_data["Journal"]

            if "JournalIssue" in journal_info:

                issue = journal_info["JournalIssue"]

                if "PubDate" in issue:

                    pub_date = issue["PubDate"]

                    if "Year" in pub_date:

                        year = str(
                            pub_date["Year"]
                        )

        # ----------------------------------------------------
        # DOI
        # ----------------------------------------------------

        doi = ""

        if "PubmedData" in article:

            pubmed_data = article["PubmedData"]

            if "ArticleIdList" in pubmed_data:

                for article_id in pubmed_data["ArticleIdList"]:

                    id_type = article_id.attributes.get(
                        "IdType"
                    )

                    if id_type == "doi":

                        doi = str(article_id)

                        break

        # ----------------------------------------------------
        # PUBMED URL
        # ----------------------------------------------------

        pubmed_url = (
            f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
        )

        # ----------------------------------------------------
        # CREATE ARTICLE OBJECT
        # ----------------------------------------------------

        article_info = {

            "pmid": pmid,

            "title": title,

            "abstract": abstract,

            "authors": authors,

            "journal": journal,

            "year": year,

            "doi": doi,

            "pubmed_url": pubmed_url
        }

        articles.append(article_info)

    return articles


# ============================================================
# SAVE ARTICLES AS JSON
# ============================================================

def save_articles(articles):

    # Create data/corpus directory
    output_directory = os.path.join(
        "data",
        "corpus"
    )

    os.makedirs(
        output_directory,
        exist_ok=True
    )

    output_file = os.path.join(
        output_directory,
        "pubmed_articles.json"
    )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            articles,
            file,
            indent=4,
            ensure_ascii=False
        )

    print("\n========================================")
    print("          DATA SAVED")
    print("========================================")

    print("Articles saved:", len(articles))

    print("File:", output_file)


# ============================================================
# MAIN PROGRAM
# ============================================================

if __name__ == "__main__":

    # --------------------------------------------------------
    # User question
    # --------------------------------------------------------

    question = input(
        "\nEnter your wound-related question: "
    )

    # --------------------------------------------------------
    # Search PubMed
    # --------------------------------------------------------

    pmids = search_pubmed(
        question,
        max_results=10
    )

    # --------------------------------------------------------
    # Fetch article records
    # --------------------------------------------------------

    records = fetch_articles(pmids)

    # --------------------------------------------------------
    # Convert PubMed records into clean dictionaries
    # --------------------------------------------------------

    articles = extract_article_data(
        records
    )

    # --------------------------------------------------------
    # Display results
    # --------------------------------------------------------

    print("\n========================================")
    print("          RETRIEVED ARTICLES")
    print("========================================")

    for index, article in enumerate(
        articles,
        start=1
    ):

        print(
            f"\n[{index}] {article['title']}"
        )

        print(
            "PMID:",
            article["pmid"]
        )

        print(
            "Year:",
            article["year"]
        )

        print(
            "Journal:",
            article["journal"]
        )

        print(
            "DOI:",
            article["doi"]
        )

        print(
            "PubMed:",
            article["pubmed_url"]
        )

        print(
            "Abstract:",
            article["abstract"][:500],
            "..."
        )

    # --------------------------------------------------------
    # Save results
    # --------------------------------------------------------

    save_articles(
        articles
    )

    print("\nPubMed retrieval completed successfully! 🚀")