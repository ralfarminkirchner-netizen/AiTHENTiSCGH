const fs = require('fs');
const path = require('path');

const data = {
  nodes: [
    // Personalities
    { id: "yajnavalkya", name: "Yajnavalkya", type: "personality", role: "Vedischer Weiser", time: 1, val: 20, bio: "Formuliert Atman als reines Bewusstsein." },
    { id: "patanjali", name: "Patanjali", type: "personality", role: "Systematiker", time: 1, val: 20, bio: "Verfasser der Yoga Sutras." },
    { id: "shankara", name: "Shankara", type: "personality", role: "Philosoph", time: 2, val: 25, bio: "Begründer des Advaita Vedanta." },
    { id: "ramana", name: "Ramana Maharshi", type: "personality", role: "Lehrer", time: 3, val: 20, bio: "Lehrt Selbsterforschung." },
    { id: "vivekananda", name: "Vivekananda", type: "personality", role: "Botschafter", time: 4, val: 20, bio: "Bringt Vedanta in den Westen." },
    
    // Core Concepts
    { id: "atman", name: "Atman (Self)", type: "bridge", time: 5, val: 15, summary: "The true, pure self." },
    { id: "brahman", name: "Brahman (Reality)", type: "bridge", time: 5, val: 15, summary: "The ultimate, unchanging reality." },
    { id: "purusha", name: "Purusha (Consciousness)", type: "bridge", time: 6, val: 15, summary: "Pure consciousness in Yoga." },
    { id: "prakriti", name: "Prakriti (Nature)", type: "bridge", time: 6, val: 15, summary: "The material nature." },
    { id: "advaita", name: "Advaita (Non-Duality)", type: "bridge", time: 7, val: 30, summary: "The concept that Atman and Brahman are one." },
    { id: "maya", name: "Maya (Illusion)", type: "bridge", time: 8, val: 15, summary: "The cosmic illusion masking reality." },
    { id: "moksha", name: "Moksha (Liberation)", type: "bridge", time: 9, val: 15, summary: "Liberation from the cycle of rebirth." },
    
    // Tensions
    { id: "tension_dualism", name: "Dualism vs Non-Dualism", type: "tension", time: 15, val: 10, tensionPoints: ["Is reality one or two?", "Yoga vs Vedanta"] },
    { id: "tension_action", name: "Action vs Renunciation", type: "tension", time: 16, val: 10, tensionPoints: ["Should one act in the world or withdraw?", "Karma vs Jnana"] },
    { id: "tension_illusion", name: "Reality of the World", type: "tension", time: 17, val: 10, tensionPoints: ["Is the world completely illusory or a real manifestation?"] }
  ],
  links: [
    // Personality to Concept
    { source: "yajnavalkya", target: "atman", type: "flow", time: 6 },
    { source: "yajnavalkya", target: "brahman", type: "flow", time: 6 },
    { source: "shankara", target: "advaita", type: "flow", time: 8 },
    { source: "shankara", target: "maya", type: "flow", time: 9 },
    { source: "shankara", target: "moksha", type: "flow", time: 10 },
    { source: "patanjali", target: "purusha", type: "flow", time: 8 },
    { source: "patanjali", target: "prakriti", type: "flow", time: 8 },
    { source: "patanjali", target: "moksha", type: "flow", time: 10 },
    { source: "ramana", target: "atman", type: "flow", time: 11 },
    { source: "ramana", target: "advaita", type: "flow", time: 12 },
    { source: "vivekananda", target: "advaita", type: "flow", time: 13 },
    
    // Concept to Concept (Bridges)
    { source: "atman", target: "brahman", type: "bridge", time: 14 },
    { source: "purusha", target: "atman", type: "bridge", time: 14 },
    { source: "maya", target: "prakriti", type: "bridge", time: 14 },
    { source: "advaita", target: "atman", type: "bridge", time: 14 },
    { source: "advaita", target: "brahman", type: "bridge", time: 14 },
    
    // Tensions
    { source: "patanjali", target: "tension_dualism", type: "tension", time: 18 },
    { source: "shankara", target: "tension_dualism", type: "tension", time: 18 },
    { source: "advaita", target: "tension_dualism", type: "tension", time: 18 },
    
    { source: "vivekananda", target: "tension_action", type: "tension", time: 19 },
    { source: "ramana", target: "tension_action", type: "tension", time: 19 },
    
    { source: "maya", target: "tension_illusion", type: "tension", time: 20 },
    { source: "shankara", target: "tension_illusion", type: "tension", time: 20 },
    { source: "ramana", target: "tension_illusion", type: "tension", time: 20 }
  ]
};

const dataPath = path.join(__dirname, '../public/data.json');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Semantic data generated successfully!');
