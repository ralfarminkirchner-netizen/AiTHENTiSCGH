const fs = require('fs');
const path = require('path');

const SOURCE = '/Volumes/ThunderBolt4_2TB/MeineApps/einsein-salvage/einsein/wiki-app/public/data-index.json';
const OUT = path.join(__dirname, '../public/data.json');

const entries = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));

// Map topCategory → a stable time bucket (for timeline)
const CATEGORY_TIME = {
  'Religion_und_Spiritualitaet': 1,
  'Tradition': 2,
  'Philosophie': 3,
  'Philosophie_und_Konstruktivismus': 3,
  'Anthropologie': 4,
  'Soziologie': 5,
  'Psychologie': 6,
  'Traumaforschung': 6,
  'Neurowissenschaften_und_Bewusstsein': 7,
  'Neurologie': 7,
  'Bewusstseinsforschung': 8,
  'Biologie_und_Evolution': 8,
  'Physik_und_Mathematik': 9,
  'Quantenphysik_und_Kosmologie': 9,
  'Informatik_und_KI': 10,
  'Kybernetik': 10,
  'Wirtschaft': 11,
  'Wissenschaft': 11,
  'Sprachwissenschaft_und_Semiotik': 12,
  'Kunst_und_Literatur': 13,
  'Oekologie_und_Umwelt': 14,
  'Ökologie_und_Umwelt': 14,
  'Synthesen': 20,
};

// Map topCategory → a display color family
const CATEGORY_COLOR = {
  'Religion_und_Spiritualitaet': '#c084fc',
  'Tradition': '#a78bfa',
  'Philosophie': '#93c5fd',
  'Philosophie_und_Konstruktivismus': '#7dd3fc',
  'Anthropologie': '#6ee7b7',
  'Soziologie': '#34d399',
  'Psychologie': '#fbbf24',
  'Traumaforschung': '#f87171',
  'Neurowissenschaften_und_Bewusstsein': '#fb923c',
  'Neurologie': '#fb923c',
  'Bewusstseinsforschung': '#e879f9',
  'Biologie_und_Evolution': '#4ade80',
  'Physik_und_Mathematik': '#38bdf8',
  'Quantenphysik_und_Kosmologie': '#818cf8',
  'Informatik_und_KI': '#22d3ee',
  'Kybernetik': '#2dd4bf',
  'Wirtschaft': '#f59e0b',
  'Wissenschaft': '#60a5fa',
  'Sprachwissenschaft_und_Semiotik': '#f472b6',
  'Kunst_und_Literatur': '#e2e8f0',
  'Oekologie_und_Umwelt': '#86efac',
  'Ökologie_und_Umwelt': '#86efac',
  'Synthesen': '#00ffcc',
};

const nodes = entries.map(e => ({
  id: e.id,
  name: e.cleanTitle || e.title,
  type: e.topCategory,
  cluster: e.topCategory,
  image: e.finalImageUrl || null,
  hasImage: e.hasRealImage || false,
  year: e.year || null,
  wordCount: e.wordCount || 0,
  val: e.hasRealImage ? 12 : 8,
  time: CATEGORY_TIME[e.topCategory] || 15,
  color: CATEGORY_COLOR[e.topCategory] || '#94a3b8',
}));

// Build cross-category links based on shared category (within-cluster), 
// and cross-cluster bridges for Synthesen entries
const links = [];

// Group by category
const byCategory = {};
nodes.forEach(n => {
  if (!byCategory[n.cluster]) byCategory[n.cluster] = [];
  byCategory[n.cluster].push(n.id);
});

// Add within-category links: connect each node to ~3 random peers in same category
const rng = (seed) => {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return Math.abs(s) / 0x7fffffff; };
};
const rand = rng(42);

const addedLinks = new Set();
nodes.forEach(n => {
  const peers = byCategory[n.cluster].filter(id => id !== n.id);
  const count = Math.min(3, peers.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rand() * peers.length);
    const targetId = peers[idx];
    const key = [n.id, targetId].sort().join('|');
    if (!addedLinks.has(key)) {
      addedLinks.add(key);
      links.push({
        source: n.id,
        target: targetId,
        type: 'similar',
        time: n.time + 2,
      });
    }
  }
});

// Cross-cluster: Synthesen → randomly connect to one node in each other category
const synthesenNodes = nodes.filter(n => n.cluster === 'Synthesen');
const otherCategories = Object.keys(byCategory).filter(k => k !== 'Synthesen');
synthesenNodes.forEach(sn => {
  const targetCat = otherCategories[Math.floor(rand() * otherCategories.length)];
  const pool = byCategory[targetCat];
  if (!pool || pool.length === 0) return;
  const targetId = pool[Math.floor(rand() * pool.length)];
  const key = [sn.id, targetId].sort().join('|');
  if (!addedLinks.has(key)) {
    addedLinks.add(key);
    links.push({
      source: sn.id,
      target: targetId,
      type: 'bridge',
      time: 22,
    });
  }
});

// Apply Moonfingers descriptions
let moonDescriptions = {};
try {
  moonDescriptions = JSON.parse(fs.readFileSync(path.join(__dirname, 'moonfingers_descriptions.json'), 'utf8'));
} catch(e) {
  console.log('No moonfingers_descriptions.json found, skipping descriptions.');
}

// Add descriptions to nodes
nodes.forEach(n => {
  if (moonDescriptions[n.id]) {
    n.description = moonDescriptions[n.id];
  }
});

// Load Moonfingers relations if available
let idMap = { moonToMindcel: {}, sharedToMindcel: {} };
let moonRelations = [];
try {
  idMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'moon_id_map.json'), 'utf8'));
  moonRelations = JSON.parse(fs.readFileSync(path.join(__dirname, 'moonfingers_relations.json'), 'utf8'));
} catch(e) {
  console.log('No Moonfingers mapping files found, skipping semantic relations.');
}

const moonToMindcel = idMap.moonToMindcel || {};
const sharedToMindcel = idMap.sharedToMindcel || {};
let semanticLinksCount = 0;

moonRelations.forEach(r => {
  if (moonToMindcel[r.source] && moonToMindcel[r.target]) {
    const mindcelSource = moonToMindcel[r.source];
    const mindcelTarget = moonToMindcel[r.target];
    
    const key = [mindcelSource, mindcelTarget].sort().join('|');
    if (!addedLinks.has(key)) {
      addedLinks.add(key);
      links.push({
        source: mindcelSource,
        target: mindcelTarget,
        type: 'semantic',
        moonType: r.type,
        description: r.description,
        time: 25
      });
      semanticLinksCount++;
    }
  }
});

// Load Shared Core data
let personalities = [];
let bridges = [];
try {
  personalities = JSON.parse(fs.readFileSync(path.join(__dirname, '../../shared-core/data/personalities.json'), 'utf8'));
  bridges = JSON.parse(fs.readFileSync(path.join(__dirname, '../../shared-core/data/bridges.json'), 'utf8'));
} catch (e) {
  console.log('No shared-core data found, skipping.');
}

// Add shared-core personalities descriptions
personalities.forEach(p => {
  const mindcelId = sharedToMindcel[p.id];
  if (mindcelId) {
    const node = nodes.find(n => n.id === mindcelId);
    if (node) {
      if (p.bio) {
        node.description = (node.description ? node.description + '\n\n' : '') + p.bio;
      }
      if (p.role) {
        node.role = p.role;
      }
    }
  }
});

// Add shared-core bridges
bridges.forEach(b => {
  const mappedIds = (b.relatedNodeIds || [])
    .map(id => sharedToMindcel[id])
    .filter(id => id && nodes.some(n => n.id === id));
    
  // Create combinations of links
  for (let i = 0; i < mappedIds.length; i++) {
    for (let j = i + 1; j < mappedIds.length; j++) {
      const source = mappedIds[i];
      const target = mappedIds[j];
      if (source === target) continue;
      
      const key = [source, target].sort().join('|');
      if (!addedLinks.has(key)) {
        addedLinks.add(key);
        links.push({
          source,
          target,
          type: 'semantic',
          description: b.label || b.summary,
          time: 26
        });
        semanticLinksCount++;
      }
    }
  }
});

fs.writeFileSync(OUT, JSON.stringify({ nodes, links }, null, 2));
console.log(`✓ Generated ${nodes.length} nodes and ${links.length} links (${semanticLinksCount} semantic) → public/data.json`);
