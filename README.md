# GenAI Document Search Accelerator

## Objective

This project is aimed at implementing and operationalizing an AI-powered document search solution using **Azure AI Search**, **Azure OpenAI**, and other Azure services. The goal is to introduce improvements to the GenAI document search solution and prepare it for deployment in production.

### Key Objectives:
- Introduce pre-defined abstractive summaries for documents.
- Update summaries based on user search terms.
- Expand detailed summarizations after user prompts.
- Annotate based on bibliographical terms.
- Help operationalize the solution to MVP/Pilot stage in preparation for production.

---

## Architecture Overview

The architecture includes the following services:

- **Azure Data Lake**: Stores documents and knowledge scan files.
- **Azure OpenAI**: Handles text summarization and embedding generation.
- **Azure AI Search**: Manages indexing and querying document chunks.
- **Azure Cosmos DB**: Stores knowledge scan metadata and references to files.
- **Azure Functions**: Orchestrates the process, including document chunking, generating embeddings, creating knowledge scans, and generating `.docx` files.

---

## Deployment Instructions

### Infrastructure Deployment
- Use the `deploy.bicep` template to deploy the required services.
- After creating the resource group, run the following command using Azure Cloud Shell:
  ```bash
  az deployment group create --resource-group <resource-group-name> --template-file deploy.bicep
