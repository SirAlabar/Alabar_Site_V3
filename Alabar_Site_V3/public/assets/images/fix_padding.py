import json

OFFSET = 2  # padding só na borda

with open("collectables.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for frame_data in data["frames"].values():
    frame = frame_data["frame"]
    frame["x"] += OFFSET
    frame["y"] += OFFSET

with open("collectables_padded.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("✅ JSON corrigido (padding apenas nas bordas)")
