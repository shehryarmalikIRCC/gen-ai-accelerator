import logging
import os
import json
import requests
from azure.functions import HttpRequest, HttpResponse

def create_index():
    search_endpoint = os.getenv('SEARCH_SERVICE_ENDPOINT')
    search_key = os.getenv('SEARCH_SERVICE_ADMIN_KEY')

    base_url = f"{search_endpoint}/indexes?api-version=2024-05-01-preview"
    headers = {
        "Content-Type": "application/json",
        "api-key": search_key
    }

    index_schema_path = os.path.join(os.path.dirname(__file__), 'index.json')
    with open(index_schema_path) as file:
        body = json.load(file)

    response = requests.post(url=base_url, headers=headers, json=body)
    return response.status_code, response.json()

def main(req: HttpRequest) -> HttpResponse:
    try:
        status_code, response_json = create_index()
        if status_code == 201 or status_code == 204:
            return HttpResponse("Index created successfully.", status_code=200)
        else:
            return HttpResponse(f"Failed to create index: {response_json}", status_code=status_code)
    except Exception as e:
        logging.error(f"Error in index creation function: {e}")
        return HttpResponse(f"Error: {e}", status_code=500)
