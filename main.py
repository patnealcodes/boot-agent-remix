import os
from dotenv import load_dotenv
from google import genai
from sys import argv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

MODEL="gemini-2.5-flash"

def main():
    content = client.models.generate_content(
        model=MODEL,
        contents="Why is Boot.dev such a great place to learn backend development? Use one paragraph maximum"
    )

    print(content.text)

    if content.usage_metadata:
        print(f"Prompt tokens: {content.usage_metadata.prompt_token_count}")
        print(f"Response tokens: {content.usage_metadata.candidates_token_count}")

if __name__ == "__main__":
    main()
