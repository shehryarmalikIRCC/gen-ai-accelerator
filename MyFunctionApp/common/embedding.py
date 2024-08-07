import requests
import json

def get_new_embedding(text, aoai_url, aoai_key, embedding_model, aoai_version_embedding):
    base_url = f"{aoai_url}/openai/deployments/{embedding_model}/embeddings?api-version={aoai_version_embedding}"
    headers = {
        "Content-Type": "application/json",
        "api-key": aoai_key
    }
    body = {
        "input": text
    }
    result = requests.post(url=base_url, headers=headers, json=body)
    result.raise_for_status()
    embedding = json.loads(result.text)
    return embedding
