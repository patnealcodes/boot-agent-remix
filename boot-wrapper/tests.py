from main import make_post_request

# print(make_post_request("fs/get_files_info", ["calculator", "."]))
# print(make_post_request("fs/get_files_info", ["calculator", "pkg"]))
# print(make_post_request("fs/get_files_info", ["calculator", "/bin"]))
# print(make_post_request("fs/get_files_info", ["calculator", "../"]))

print(make_post_request("fs/get_file_content", ["calculator", "main.py"]))
print(make_post_request("fs/get_file_content", ["calculator", "pkg/calculator.py"]))
print(make_post_request("fs/get_file_content", ["calculator", "/bin/cat"]))
print(make_post_request("fs/get_file_content", ["calculator", "pkg/does_not_exist.py"]))
