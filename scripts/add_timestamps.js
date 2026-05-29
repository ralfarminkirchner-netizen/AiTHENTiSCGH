const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../public/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let currentTime = 1;

// Group nodes by type
const nodesByType = {
  personality: [],
  default: [],
  bridge: [],
  tension: []
};

data.nodes.forEach(node => {
  if (nodesByType[node.type]) {
    nodesByType[node.type].push(node);
  } else {
    nodesByType.default.push(node);
  }
});

// Assign time sequentially
const assignTime = (nodes) => {
  // Shuffle slightly for organic growth
  nodes.sort(() => Math.random() - 0.5);
  nodes.forEach(node => {
    node.time = currentTime++;
  });
};

assignTime(nodesByType.personality);
assignTime(nodesByType.default);
assignTime(nodesByType.bridge);
assignTime(nodesByType.tension);

// Assign time to links
const nodeTimeMap = {};
data.nodes.forEach(n => {
  nodeTimeMap[n.id] = n.time;
});

data.links.forEach(link => {
  const sourceTime = nodeTimeMap[link.source] || 0;
  const targetTime = nodeTimeMap[link.target] || 0;
  // Link appears slightly after both nodes exist
  link.time = Math.max(sourceTime, targetTime) + Math.floor(Math.random() * 3);
});

// Calculate max time
const maxNodeTime = Math.max(...data.nodes.map(n => n.time));
const maxLinkTime = Math.max(...data.links.map(l => l.time));
const maxTime = Math.max(maxNodeTime, maxLinkTime);

console.log(`Max time is ${maxTime}`);

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Successfully added timestamps to data.json');
