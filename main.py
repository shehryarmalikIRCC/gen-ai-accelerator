from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from common import embedding, summary
import os
import fitz  # PyMuPDF

# Azure Search and OpenAI details
search_endpoint = ''
search_key = ''
index = ''

# Initialize the Search Client
search_client = SearchClient(endpoint=search_endpoint, index_name=index, credential=AzureKeyCredential(search_key))

# Azure OpenAI configuration
aoai_url = ''
aoai_key = ''
embedding_model = ''
aoai_version_embedding = ''
aoai_version_completion = ''
model = ''

# Local path to your chunked files
intermediate_dir = ''

# Iterate through each PDF file in the intermediate directory
for file_name in os.listdir(intermediate_dir):
    if file_name.endswith(".pdf"):  # Ensure only PDFs are processed
        # Read the chunked file
        file_path = os.path.join(intermediate_dir, file_name)
        with fitz.open(file_path) as pdf:
            data = ""
            for page in pdf:
                data += page.get_text()

        # Extract chunk number and page range from the file name
        parts = file_name.split('_')
        chunk_number = parts[1]
        page_range = parts[3].split('.')[0]

        # Generate embeddings
        embedding_vec = embedding.get_new_embedding(data, aoai_url, aoai_key, embedding_model, aoai_version_embedding)

        # Generate summary
        with open('common/summary-prompt.txt', 'r') as file:
            prompt_template = file.read()

        prompt = prompt_template + data
        summary_str = summary.generate_prompt(prompt, "You are an AI assistant that summarizes texts.", aoai_key, aoai_url, model, aoai_version_completion)

        # Create the document for Azure Search
        document = {
            "file_name": file_name,
            "file_name_chunk": f"{chunk_number}_{page_range}",  # Combining chunk number and page range
            "content_text": data,
            "summary": summary_str,
            "vector": embedding_vec['data'][0]['embedding']  # Adjust according to the actual response structure
        }

        # Upload the document to Azure Search
        result = search_client.upload_documents(documents=[document])
        print(f"Uploaded document {file_name} to the search index with result: {result}")
