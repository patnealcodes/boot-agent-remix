import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from sys import argv

# Constants
MODEL = "gemini-2.5-flash"

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

def main():
    user_prompt, verbose_flag = parse_args()
    messages = [types.Content(role="user", parts=[types.Part(text=user_prompt)])]
    content = client.models.generate_content(model=MODEL, contents=messages)

    print(content.text) # The response

    if verbose_flag:
        if content.usage_metadata:
            print(f"User prompt: {user_prompt}")
            print(f"Prompt tokens: {content.usage_metadata.prompt_token_count}")
            print(f"Response tokens: {content.usage_metadata.candidates_token_count}")

def parse_args():
    args = argv[1:]

    if not args:
        print("Error: Please include a prompt")
        exit(1)

    user_prompt = args[0]
    verbose_flag = len(args) > 1 and args[1] == "--verbose"

    return user_prompt, verbose_flag

if __name__ == "__main__":
    main()
