import requests
from sys import argv

BASE_URL = "http://localhost:3000/api"

class Exceptions:
    class InvalidArgument(Exception):
        """Base exception"""
        pass
    class ErrorCallingAPI(Exception):
        """API exception"""
        pass

def main():
    try:
        args = argv[1:]

        if not args:
            raise Exceptions.InvalidArgument
        res = make_post_request("agent", args)
        print(res)
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

def make_post_request(endpoint, args):
    try:
        response = requests.post(
            f"{BASE_URL}/{endpoint}",
            json={"args": args},
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()
        res = response.json()
        return "\n".join(res)
    except requests.exceptions.RequestException as e:
        raise Exceptions.ErrorCallingAPI(e)

if __name__ == "__main__":
    main()
