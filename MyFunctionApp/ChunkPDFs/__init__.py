import os
import PyPDF2
import logging
from azure.functions import InputStream, Out
from azure.storage.blob import BlobServiceClient
from io import BytesIO

def split_pdf_into_chunks(input_pdf_stream, output_blob_name, output_container_client, n):
    try:
        # Convert InputStream to BytesIO
        input_pdf_bytes = BytesIO(input_pdf_stream.read())
        reader = PyPDF2.PdfReader(input_pdf_bytes)
        num_pages = len(reader.pages)
        chunks = []
        overlap = n // 2

        for start in range(0, num_pages, overlap):
            end = min(start + n, num_pages)
            if start >= num_pages:
                break
            chunk = {
                'start_page': start,
                'end_page': end
            }
            chunks.append(chunk)

        for i, chunk in enumerate(chunks):
            output_pdf_writer = PyPDF2.PdfWriter()
            for j in range(chunk['start_page'], chunk['end_page']):
                output_pdf_writer.add_page(reader.pages[j])

            # Create a chunk file name without directories
            chunk_blob_name = f"{os.path.basename(output_blob_name)}_chunk_{i + 1}_pages_{chunk['start_page'] + 1}_to_{chunk['end_page']}.pdf"
            output_blob_path = os.path.join("/tmp", chunk_blob_name)  # Ensure /tmp directory is used
            with open(output_blob_path, 'wb') as output_pdf:
                output_pdf_writer.write(output_pdf)

            with open(output_blob_path, 'rb') as data:
                output_container_client.upload_blob(name=chunk_blob_name, data=data, overwrite=True)
            os.remove(output_blob_path)
            logging.info(f"Chunk {i + 1} saved as {chunk_blob_name}")

    except Exception as e:
        logging.error(f"Error splitting PDF: {e}")
        raise

def main(inputBlob: InputStream, outputBlob: Out[bytes]):
    try:
        logging.info(f"Processing blob\nName: {inputBlob.name}\nBlob Size: {inputBlob.length} bytes")

        connect_str = os.getenv('SECONDARY_STORAGE_ACCOUNT_CONNECTION_STRING')
        blob_service_client = BlobServiceClient.from_connection_string(connect_str)
        output_container_client = blob_service_client.get_container_client("intermediate")

        split_pdf_into_chunks(inputBlob, inputBlob.name, output_container_client, 10)
        logging.info(f"Processing completed for blob {inputBlob.name}")

    except Exception as e:
        logging.error(f"Error in main function: {e}")
        raise


