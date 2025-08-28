from main import make_post_request

# print(make_post_request("fs/get_files_info", ["calculator", "."]))
# print(make_post_request("fs/get_files_info", ["calculator", "pkg"]))
# print(make_post_request("fs/get_files_info", ["calculator", "/bin"]))
# print(make_post_request("fs/get_files_info", ["calculator", "../"]))

# print(make_post_request("fs/get_file_content", ["calculator", "main.py"]))
# print(make_post_request("fs/get_file_content", ["calculator", "pkg/calculator.py"]))
# print(make_post_request("fs/get_file_content", ["calculator", "/bin/cat"]))
# print(make_post_request("fs/get_file_content", ["calculator", "pkg/does_not_exist.py"]))

print(make_post_request("fs/write_file", ["calculator", "lorem.txt", "wait, this isn't lorem ipsum"]))
print(make_post_request("fs/write_file", ["calculator", "pkg/morelorem.txt", "lorem ipsum dolor sit amet"]))
print(make_post_request("fs/write_file", ["calculator", "/tmp/temp.txt", "this should not be allowed"]))
