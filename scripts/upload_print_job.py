import requests
import base64
import argparse
import os

def upload_job(file_path, api_url, api_key):
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        return

    try:
        with open(file_path, "rb") as f:
            pdf_bytes = f.read()
            # Standard Base64 encoding
            content_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

        filename = os.path.basename(file_path)
        
        payload = {
            "filename": filename,
            "content": content_base64
        }
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        print(f"Uploading {filename} ({len(pdf_bytes)} bytes)...")
        response = requests.post(api_url, json=payload, headers=headers)
        
        if response.status_code == 200:
            print("Success! Job queued.")
            print(response.json())
        else:
            print(f"Failed with status {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload a PDF print job")
    parser.add_argument("file", help="Path to PDF file")
    # Default URL based on previous context
    parser.add_argument("--url", default="http://localhost:3001/api/queue-job", help="API URL")
    # Default API Key from previous context (sk_...)
    parser.add_argument("--key", default="sk_f716e1f47c1f8f478871d77f0fd1da205b78efdb38cbc35d", help="API Key")

    args = parser.parse_args()
    upload_job(args.file, args.url, args.key)
