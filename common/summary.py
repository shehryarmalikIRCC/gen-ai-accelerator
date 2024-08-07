import requests
import json
import datetime
import uuid
def generate_prompt(prompt, system_message, aoi_key, can_aoai_url, model, aoai_version_completion):
    
    # Define the deployment name and base URL for Azure OpenAI service  
    base_url=f"{can_aoai_url}/openai/deployments/{model}/chat/completions?api-version={aoai_version_completion}"
    
    headers = {  
        "Content-Type": "application/json",  
        "api-key": aoi_key
    }
    body = {
        "messages": [
            {
                "role": "user",
                "content": prompt
            },
    {"role": "system", "content": system_message}
        ]
    }

    # Set headers for the HTTP request  

    result = requests.post(url = base_url, headers = headers, json = body)
    prediction = json.loads(result.text)["choices"][0]["message"]["content"]

    return prediction
