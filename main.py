import os
from dotenv import load_dotenv
from google import genai
from sys import argv

MODEL="gemini-2.5-flash"

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

# Unpack prompt & unused args form argv
prompt, *args = argv[1:] or (None, None)

def main():
    if prompt:
        content = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )

        print(content.text)

        if content.usage_metadata:
            print(f"Prompt tokens: {content.usage_metadata.prompt_token_count}")
            print(f"Response tokens: {content.usage_metadata.candidates_token_count}")
    else:
        print("Error: Please include a prompt")
        exit(1)

if __name__ == "__main__":
    main()
