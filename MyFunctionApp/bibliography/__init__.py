import re
import logging

def bibliography(first_chunk, aoai_key, aoai_url, model, aoai_version_completion):
    """
    Use GPT to extract the reference information (authors, title, date) from the first chunk of a document.
    """
    prompt = f"Please extract the following reference information from the text below:\n\n\
    1. Authors \n\
    2. Title of the document \n\
    3. Date of publication \n\
    4. Publisher (if available)\n\n\
    Here is the text:\n\n{first_chunk}"

    try:
        response = summary.generate_prompt(
            prompt,
            "You are an AI assistant that extracts reference information.",
            aoai_key,
            aoai_url,
            model,
            aoai_version_completion
        )

        # Extract the text directly from the GPT response
        extracted_info = response.get('text', '').strip()
        return format_reference_apa(extracted_info)  # Format the extracted info into APA
    except Exception as e:
        logging.error(f"Error extracting reference information: {e}")
        return "Reference extraction error."

def format_reference_apa(extracted_info):
    """
    Format the extracted reference information into APA format.
    This function assumes that the extracted_info contains authors, title, date, and publisher.
    """
    # Simple logic to find key elements: authors, title, publication date, and publisher
    authors = re.search(r'Authors?:\s*(.*)', extracted_info)
    title = re.search(r'Title:\s*(.*)', extracted_info)
    publication_date = re.search(r'Date of publication:\s*(.*)', extracted_info)
    publisher = re.search(r'Publisher:\s*(.*)', extracted_info)

    # Fallback to defaults if any fields are missing
    authors = authors.group(1).strip() if authors else "Unknown Author"
    title = title.group(1).strip() if title else "Unknown Title"
    publication_date = publication_date.group(1).strip() if publication_date else "(n.d.)"
    publisher = publisher.group(1).strip() if publisher else ""

    # Format into APA style: Author(s). (Year). Title. Publisher.
    apa_reference = f"{authors}. {publication_date}. {title}. {publisher}".strip()

    return apa_reference
