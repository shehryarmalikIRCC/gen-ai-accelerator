import requests
import json

def get_new_embedding(text, aoai_url, aoi_key, embedding_model, aoai_version_embedding):

    base_url = f"{aoai_url}/openai/deployments/{embedding_model}/embeddings?api-version={aoai_version_embedding}"

    # Set headers for the HTTP request  
    headers = {  
        "Content-Type": "application/json",  
        "api-key": aoi_key
    }  

    # Prepare the request body with the extracted text  
    body = {  
        "input": text  
    }  

    # Send the request to the Azure OpenAI service to get embeddings  
    result = requests.post(url=base_url, headers=headers, json=body)  
    print(result.text)
    result.raise_for_status()  # This will raise an HTTPError if the HTTP request returned an unsuccessful status code  

    # Parse the response to get the embeddings  
    embedding = json.loads(result.text)  
    return embedding
