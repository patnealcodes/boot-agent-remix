import requests
import json
from sys import argv

URL = "http://localhost:3000/api/agent"

class Exceptions:
    class InvalidArgument(Exception):
        """Base exception"""
        pass
    class ErrorCallingAPI(Exception):
        """API exception"""
        pass

def main():
    try:
        res = make_request()
        print("\n".join(res))
    except Exceptions.ErrorCallingAPI as e:
        print(f"Error calling API: {e}")
        exit(1)
    except Exceptions.InvalidArgument as e:
        print("Error: Please include a prompt")
        exit(1)
    except Exception as e:
        print("Error: IDK FAM")
        print(e)
        exit(1)

def make_request():
    try:
        args = argv[1:]

        if not args:
            raise Exceptions.InvalidArgument
        response = requests.post(
            URL,
            json={"args": args},
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exceptions.ErrorCallingAPI(e)

if __name__ == "__main__":
    main()
