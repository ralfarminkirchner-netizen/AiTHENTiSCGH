const fs = require('fs');
const path = require('path');

const sourcePath = '/Volumes/ThunderBolt4_2TB/MeineApps/spiralmind-export/spiral-mind/20_bootstrap/SEED_CORE_BOOTSTRAP_QUERIES.md';
const content = fs.readFileSync(sourcePath, 'utf8');

const nodesMap = new Map();
const links = [];

// Parse entities
// Pattern matches: ('ent-id', 'Title', 'entity_kind', 'cluster_key', ...
const entityRegex = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',/g;
let match;
let timeCounter = 1;

// Phase 1: Traditions & Methods
// Phase 2: Concepts & Question Fields
// Phase 3: Axes

const entitiesData = [];
while ((match = entityRegex.exec(content)) !== null) {
  entitiesData.push({
    id: match[1],
    name: match[2],
    entity_kind: match[3],
    cluster_key: match[4]
  });
}

// Assign time based on phase
const phases = {
  tradition: 1,
  method: 1,
  concept: 3,
  question_field: 3,
  axis: 5
};

entitiesData.forEach(e => {
  let val = 15;
  if (e.entity_kind === 'tradition' || e.entity_kind === 'method') val = 20;
  if (e.entity_kind === 'axis') val = 25;
  
  nodesMap.set(e.id, {
    id: e.id,
    name: e.name,
    type: e.entity_kind,
    cluster: e.cluster_key,
    val: val,
    time: phases[e.entity_kind] || 2
  });
});

// Parse relations
// Pattern matches: ('rel-id', 'ent-a-id', 'relation_type', 'ent-b-id',
const relationRegex = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',/g;
while ((match = relationRegex.exec(content)) !== null) {
  const sourceId = match[2];
  const type = match[3];
  const targetId = match[4];
  
  if (nodesMap.has(sourceId) && nodesMap.has(targetId)) {
    const sourceNode = nodesMap.get(sourceId);
    const targetNode = nodesMap.get(targetId);
    
    // Link time should be slightly after both nodes exist
    const linkTime = Math.max(sourceNode.time, targetNode.time) + 2;
    
    links.push({
      source: sourceId,
      target: targetId,
      type: type, // similar, contrast, contradiction, bridge, partial_overlap, etc.
      time: linkTime
    });
  }
}

const data = {
  nodes: Array.from(nodesMap.values()),
  links: links
};

const dataPath = path.join(__dirname, '../public/data.json');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Parsed ${data.nodes.length} nodes and ${data.links.length} links.`);
