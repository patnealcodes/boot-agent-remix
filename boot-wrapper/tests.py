from main import make_post_request

print(make_post_request("get_files_info", ["calculator", "."]))
print(make_post_request("get_files_info", ["calculator", "pkg"]))
print(make_post_request("get_files_info", ["calculator", "/bin"]))
print(make_post_request("get_files_info", ["calculator", "../"]))
