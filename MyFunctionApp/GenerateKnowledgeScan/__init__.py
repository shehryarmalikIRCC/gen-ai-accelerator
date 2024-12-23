import logging
import os
import uuid
import json
import requests
import azure.functions as func
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.cosmos import CosmosClient
from collections import defaultdict
from common import summary

def generate_knowledge_scan(query, doc_ids):

    overall_summary_system_prompt = """
You are an advanced AI assistant specialized in producing comprehensive, structured, and well-integrated overall summaries of multiple academic or informational document summaries. Your summaries should emulate the style and depth of scholarly abstracts, seamlessly combining information from various sources into a unified narrative. The summaries should include the following elements:

**Background Context:**

- Provide an overarching context that encompasses the topics and themes from all document summaries.
- Highlight the prevalence, significance, and key issues relevant to the combined subject matter.

**Methodological Details (if applicable):**

- Describe common study designs, data sources, populations, and analytical methods referenced across the document summaries.
- Note any variations or unique methodological approaches used in the individual studies.

**Main Findings:**

- Synthesize the primary outcomes, key themes, and evidence presented in the document summaries.
- Identify patterns, trends, and significant results that emerge from the collective information.

**Conclusions and Implications:**

- Explain the overarching implications and significance of the combined findings.
- Discuss potential barriers and enablers, as well as future directions or recommendations suggested by the documents.

**Reference Integration:**

- Assign a unique superscript reference number to each document summary.
- Incorporate these superscript numbers appropriately within the narrative to attribute information to the corresponding sources.
"""
    try:
        # Fetch environment variables
        search_endpoint = os.getenv('SEARCH_SERVICE_ENDPOINT')
        search_key = os.getenv('SEARCH_SERVICE_ADMIN_KEY')
        index_name = os.getenv('SEARCH_INDEX_NAME')
        cosmos_db_connection_string = os.getenv('COSMOS_DB_CONNECTION_STRING')
        cosmos_db_name = os.getenv('COSMOS_DB_DATABASE_NAME')
        cosmos_container_name = os.getenv('COSMOS_DB_CONTAINER_NAME')
        aoai_url = os.getenv('AOAI_URL')
        aoai_key = os.getenv('AOAI_KEY')
        model = os.getenv('MODEL')
        aoai_version_completion = os.getenv('AOAI_VERSION_COMPLETION')
        bibliography_url = os.getenv('BIBLIOGRAPHY_FUNCTION_URL')  # URL for Bibliography function

        # Validate environment variables
        if not all([search_endpoint, search_key, index_name, cosmos_db_connection_string, cosmos_db_name, cosmos_container_name, aoai_url, aoai_key, model, aoai_version_completion, bibliography_url]):
            logging.error("One or more required environment variables are missing.")
            raise ValueError("One or more required environment variables are missing.")

        # Initialize clients
        logging.info("Initializing Search and Cosmos clients.")
        search_client = SearchClient(endpoint=search_endpoint, index_name=index_name, credential=AzureKeyCredential(search_key))
        cosmos_client = CosmosClient.from_connection_string(cosmos_db_connection_string)
        database = cosmos_client.get_database_client(cosmos_db_name)
        container = database.get_container_client(cosmos_container_name)

        # Call the Bibliography function via HTTP to get the bibliographies
        logging.info("Calling Bibliography function via HTTP.")
        bibliography_response = requests.post(bibliography_url, json={"documents": doc_ids})
        
        if bibliography_response.status_code != 200:
            logging.error(f"Failed to get bibliographies. Status Code: {bibliography_response.status_code}")
            raise ValueError("Failed to retrieve bibliographies.")
        
        # Ensure bibliographies is a list of strings
        bibliographies = bibliography_response.json().get("bibliographies", [])
        logging.info(f"Received Bibliographies: {bibliographies}")

        # Group documents by their source PDF (using file_name field)
        doc_groups = defaultdict(list)
        for doc_id in doc_ids:
            result = search_client.get_document(key=doc_id)
            pdf_name = result['file_name'].split('_chunk_')[0]
            doc_groups[pdf_name].append(result)

        combined_summaries = []
        for i, (pdf_name, docs) in enumerate(doc_groups.items()):
            # Combine summaries for each PDF
            pdf_summaries = [doc['summary'] for doc in docs]
            combined_summary_prompt = f"Can you summarize these documents based on the user query: '{query}'? " + " ".join(pdf_summaries)
            combined_summary = summary.generate_prompt(combined_summary_prompt, "You are an AI assistant that summarizes texts.", aoai_key, aoai_url, model, aoai_version_completion)

            # Retrieve the correct bibliography for each main PDF, ensuring it's treated as a string
            bibliography_entry = str(bibliographies[i]) if i < len(bibliographies) else "No bibliography available"

            # Add combined summary with bibliography
            combined_summaries.append({
                "pdf_name": pdf_name,
                "summary": combined_summary,
                "bibliography": bibliography_entry
            })

        overall_summary_prompt = "Please generate a comprehensive and cohesive overall summary based on the following document summaries. As you synthesize the information, incorporate superscript reference numbers corresponding to each source document using the format exampleTextⁿ, where n represents the unique reference number for each document.\n\n"
        for i, summary_info in enumerate(combined_summaries, 1):
            overall_summary_prompt += f"{summary_info['summary']} [{i}]\n"

        overall_summary = summary.generate_prompt(overall_summary_prompt, overall_summary_system_prompt, aoai_key, aoai_url, model, aoai_version_completion)
 
        #Extract Keywords
        keyword_prompt = "Extract the keywords from the following text: " + overall_summary
        keywords = summary.generate_prompt(keyword_prompt,"You are an AI Assistant that extracts keywords and themes. Do not provide any other statements other than the keywords and themes only. Extract a max of 25 key words. Ensure they make sense and aren't dates like years. For example do not ever add years like 'xxxx-xxxx' where x are numbers",aoai_key, aoai_url, model, aoai_version_completion)

        # Build the final knowledge scan response
        knowledge_scan = {
            "id": str(uuid.uuid4()),
            "query": query,
            "combined_summaries": combined_summaries,
            "overall_summary": overall_summary,
            "general_notes": f"Generated based on query: {query}. The Library Services AI Agent has conducted a search for journal articles, books and papers or reports from GcDocs repository. Following is an AI generated knowledge scan report.",
            "keywords":keywords
        }

        # Save the knowledge scan to Cosmos DB
        try:
            response = container.create_item(body=knowledge_scan)
            logging.info(f"Knowledge scan saved to Cosmos DB. Response: {response}")
        except Exception as e:
            logging.error(f"Error saving knowledge scan to Cosmos DB: {e}")
            raise

        return knowledge_scan

    except Exception as e:
        logging.error(f"Error in generate_knowledge_scan: {e}")
        raise

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        query = data.get("query")
        doc_ids = data.get("documents")

        if not query or not doc_ids:
            return func.HttpResponse(
                "Please pass both 'query' and 'documents' in the request body.",
                status_code=400
            )

        knowledge_scan = generate_knowledge_scan(query, doc_ids)
        knowledge_scan_json = json.dumps(knowledge_scan, ensure_ascii=False)

        return func.HttpResponse(
            knowledge_scan_json,
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error in GenerateKnowledgeScan function: {e}")
        return func.HttpResponse(f"Error: {e}", status_code=500)