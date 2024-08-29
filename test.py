import requests

# Function to generate embedding using Azure OpenAI
def generate_embedding(text, api_key, base_url):
    headers = {
        "Content-Type": "application/json",
        "api-key": api_key
    }

    body = {
        "input": text,
    }

    try:
        result = requests.post(url=base_url, headers=headers, json=body)
        print(f"Status Code: {result.status_code}")
        response_json = result.json()
        print(f"Response JSON: {response_json}")
        
        # Extract the embedding
        embedding = response_json['data'][0]['embedding']
        return embedding
    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage
api_key = "" #Replace with OpenAI key
base_url = "" # follow the template: https://<your-resource-name>.openai.azure.com/openai/deployments/<deployment-name>/<operation>?api-version=<version>
text = "citizenship process?" #replace with your user query

embedding = generate_embedding(text, api_key, base_url)
print(f"Generated Embedding: {embedding}")



