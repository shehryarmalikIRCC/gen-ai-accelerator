import requests
import json

def generate_prompt(prompt, system_message, aoai_key, aoai_url, model, aoai_version_completion):
    base_url = f"{aoai_url}/openai/deployments/{model}/chat/completions?api-version={aoai_version_completion}"
    headers = {
        "Content-Type": "application/json",
        "api-key": aoai_key
    }
    body = {
        "messages": [
            {"role": "user", "content": prompt},
            {"role": "system", "content": system_message}
        ]
    }
    result = requests.post(url=base_url, headers=headers, json=body)
    prediction = json.loads(result.text)["choices"][0]["message"]["content"]
    return prediction
