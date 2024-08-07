import requests
import json

search_endpoint = ''
search_key = ''

base_url=search_endpoint + '/indexes?api-version=2024-05-01-preview'
headers = {"Content-Type": "application/json", "api-key": search_key}

with open('index.json') as file:
    body = json.load(file)
results = requests.post(url = base_url, headers = headers, json = body)
print(results.status_code)
print(results.json())