import os

file_path = "/src/pages/Admin.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's find the start of the duplicate block
# We want to find the first occurrence of 'shadow-sm text-slate-600">নোটস দেখুন</Button>'
# and then find the next one (which is the duplicate on line 1674)
first_idx = content.find('shadow-sm text-slate-600">নোটস দেখুন</Button>')
if first_idx != -1:
    second_idx = content.find('shadow-sm text-slate-600">নোটস দেখুন</Button>', first_idx + len('shadow-sm text-slate-600">নোটস দেখুন</Button>'))
    if second_idx != -1:
        # We find the start of the button tag
        btn_start = content.rfind("<Button", 0, second_idx)
        if btn_start != -1:
            # We want to delete from btn_start to right before the real questions tab
            # The real questions tab starts with:
            # ) : activeTab === "questions" ? (\n          <div className="space-y-6 overflow-hidden">
            target_str = ') : activeTab === "questions" ? (\n          <div className="space-y-6 overflow-hidden">'
            target_idx = content.find(target_str, btn_start)
            if target_idx != -1:
                # We do the replacement!
                new_content = content[:btn_start] + " " + content[target_idx:]
                with open(file_path, "w", encoding="utf-8") as out:
                    out.write(new_content)
                print("SUCCESS: Successfully removed duplicate blocks!")
            else:
                # Let's try finding space-y-6
                target_str_alt = ') : activeTab === "questions" ? (\n          <div className="space-y-6 overflow-hidden">'
                # Let's try with windows newline \r\n just in case
                target_str_alt_2 = ') : activeTab === "questions" ? (\r\n          <div className="space-y-6 overflow-hidden">'
                target_idx = content.find(target_str_alt_2, btn_start)
                if target_idx != -1:
                    new_content = content[:btn_start] + " " + content[target_idx:]
                    with open(file_path, "w", encoding="utf-8") as out:
                        out.write(new_content)
                    print("SUCCESS: Successfully removed duplicate blocks (windows newlines)!")
                else:
                    print("FAILED to find ending anchor.")
    else:
        print("FAILED to find second notes button occurrence.")
else:
    print("FAILED to find any notes button occurrence.")
