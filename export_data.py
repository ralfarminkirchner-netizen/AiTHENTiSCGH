import json
import os
import random

SHARED_CORE_PATH = "/Volumes/ThunderBolt4_2TB/MeineApps/shared-core/data"
OUTPUT_PATH = "./public/data.json"

def export_data():
    nodes = []
    links = []
    
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    # 1. Load Personalities
    personalities_file = os.path.join(SHARED_CORE_PATH, "personalities.json")
    if os.path.exists(personalities_file):
        with open(personalities_file, 'r', encoding='utf-8') as f:
            personalities = json.load(f)
            for p in personalities:
                nodes.append({
                    "id": p.get("id"),
                    "name": p.get("name"),
                    "group": hash(p.get("tradition", "none")) % 10,
                    "val": 10,
                    "type": "personality",
                    "role": p.get("role", ""),
                    "bio": p.get("bio", ""),
                    "portraitUrl": p.get("portraitUrl", "")
                })

    # 2. Load Bridges
    bridges_file = os.path.join(SHARED_CORE_PATH, "bridges.json")
    if os.path.exists(bridges_file):
        with open(bridges_file, 'r', encoding='utf-8') as f:
            bridges = json.load(f)
            for b in bridges:
                nodes.append({
                    "id": b.get("id"),
                    "name": b.get("label"),
                    "group": 11,
                    "val": b.get("strength", 5),
                    "type": "bridge",
                    "summary": b.get("summary", ""),
                    "tensionPoints": b.get("tensionPoints", []),
                    "sharedMotifs": b.get("sharedMotifs", []),
                    "answerDifferences": b.get("answerDifferences", [])
                })
                
                related = b.get("relatedNodeIds", [])
                has_tension = len(b.get("tensionPoints", [])) > 0
                for target in related:
                    links.append({
                        "source": b.get("id"),
                        "target": target,
                        "type": "tension" if has_tension else "bridge",
                        "value": b.get("strength", 5)
                    })
                    
    for i in range(len(nodes)):
        for j in range(i+1, len(nodes)):
            n1 = nodes[i]
            n2 = nodes[j]
            if n1["type"] == "personality" and n2["type"] == "personality":
                if n1["group"] == n2["group"]:
                    exists = any((l["source"] == n1["id"] and l["target"] == n2["id"]) or (l["source"] == n2["id"] and l["target"] == n1["id"]) for l in links)
                    if not exists and random.random() > 0.5:
                        links.append({
                            "source": n1["id"],
                            "target": n2["id"],
                            "type": "cluster",
                            "value": 2
                        })

    node_ids = {n["id"] for n in nodes}
    valid_links = [l for l in links if l["source"] in node_ids and l["target"] in node_ids]

    data = {"nodes": nodes, "links": valid_links}
    
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Exported {len(nodes)} nodes and {len(valid_links)} links to {OUTPUT_PATH}")

if __name__ == "__main__":
    export_data()
