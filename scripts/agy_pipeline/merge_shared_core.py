import json
import os

DATA_JSON_PATH = "/Volumes/ThunderBolt4_2TB/MeineApps/mycel-web/public/data.json"
SHARED_CORE_DIR = "/Volumes/ThunderBolt4_2TB/MeineApps/shared-core/data"
MAPPING_PATH = "/Volumes/ThunderBolt4_2TB/MeineApps/mycel-web/scripts/moon_id_map.json"

def main():
    with open(DATA_JSON_PATH, "r") as f:
        mindcel_data = json.load(f)
        
    with open(MAPPING_PATH, "r") as f:
        mapping = json.load(f).get("sharedToMindcel", {})
        
    personalities_path = os.path.join(SHARED_CORE_DIR, "personalities.json")
    bridges_path = os.path.join(SHARED_CORE_DIR, "bridges.json")
    
    # 1. Merge Personalities
    if os.path.exists(personalities_path):
        with open(personalities_path, "r") as f:
            personalities = json.load(f)
            
        nodes_by_id = {n["id"]: n for n in mindcel_data["nodes"]}
        merged_bios = 0
        
        for p in personalities:
            shared_id = p.get("id")
            mindcel_id = mapping.get(shared_id)
            
            if mindcel_id and mindcel_id in nodes_by_id:
                node = nodes_by_id[mindcel_id]
                node["bio"] = p.get("bio", "")
                if "lifespan" in p:
                    node["lifespan"] = p["lifespan"]
                if "keyConcepts" in p:
                    node["keyConcepts"] = p["keyConcepts"]
                merged_bios += 1
                
        mindcel_data["nodes"] = list(nodes_by_id.values())
        print(f"Merged {merged_bios} biographies from shared-core.")
        
    # 2. Merge Bridges
    if os.path.exists(bridges_path):
        with open(bridges_path, "r") as f:
            bridges = json.load(f)
            
        existing_links = set()
        for l in mindcel_data["links"]:
            s = l["source"]["id"] if isinstance(l["source"], dict) else l["source"]
            t = l["target"]["id"] if isinstance(l["target"], dict) else l["target"]
            existing_links.add((s, t))
            
        merged_bridges = 0
        for b in bridges:
            s_shared = b.get("sourceId")
            t_shared = b.get("targetId")
            
            s_mindcel = mapping.get(s_shared)
            t_mindcel = mapping.get(t_shared)
            
            if s_mindcel and t_mindcel and s_mindcel != t_mindcel:
                if (s_mindcel, t_mindcel) not in existing_links:
                    mindcel_data["links"].append({
                        "source": s_mindcel,
                        "target": t_mindcel,
                        "type": "shared-core-bridge",
                        "description": b.get("description", "Bridge from shared-core"),
                        "time": 25 # default timeline value
                    })
                    existing_links.add((s_mindcel, t_mindcel))
                    merged_bridges += 1
                    
        print(f"Merged {merged_bridges} bridges from shared-core.")
        
    with open(DATA_JSON_PATH, "w") as f:
        json.dump(mindcel_data, f, indent=2)
        
    print("Done merging!")

if __name__ == "__main__":
    main()
