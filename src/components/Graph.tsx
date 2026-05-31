'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';
const textureCache = new Map();

// Generates a single, perfect circular alpha mask on the GPU for all images
const createCircleAlphaMap = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0,0,128,128);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(64,64,64,0,Math.PI*2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
};
const circleAlphaMap = createCircleAlphaMap();

export default function Graph() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const fgRef = useRef();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Ref for LOD animation loop to access latest search state without re-binding
  const searchStateRef = useRef({ active: false, results: [] });
  useEffect(() => {
    searchStateRef.current = { active: isSearchActive, results: searchResults };
  }, [isSearchActive, searchResults]);

  // Category State
  const [activeClusters, setActiveClusters] = useState(new Set());
  const uniqueClusters = useMemo(() => {
    const clusters = new Set(data.nodes.map(n => n.cluster).filter(Boolean));
    return Array.from(clusters).sort();
  }, [data.nodes]);

  useEffect(() => {
    if (uniqueClusters.length > 0 && activeClusters.size === 0) {
      setActiveClusters(new Set(uniqueClusters));
    }
  }, [uniqueClusters]);

  const toggleCluster = (c) => {
    setActiveClusters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(c)) newSet.delete(c);
      else newSet.add(c);
      return newSet;
    });
  };

  // Timeline State
  const [maxTime, setMaxTime] = useState(25);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        let maxT = 0;
        fetchedData.nodes.forEach(n => { if (n.time > maxT) maxT = n.time; });
        fetchedData.links.forEach(l => { if (l.time > maxT) maxT = l.time; });
        setMaxTime(maxT);
        setCurrentTime(0);
      });
  }, []);

  // Auto-play interval
  useEffect(() => {
    let interval;
    if (isPlaying && currentTime < maxTime) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= maxTime) { setIsPlaying(false); return maxTime; }
          return prev + 1;
        });
      }, 500);
    } else if (currentTime >= maxTime) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, maxTime]);

  const handleNodeClick = useCallback(node => {
    setSelectedNode(node);
    if (fgRef.current) {
      const distance = 60;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        2000
      );
    }
  }, [fgRef]);

  // Filter data based on timeline and active categories - Strict filtering!
  const filteredData = useMemo(() => {
    const activeNodes = data.nodes.filter(n => 
      n.time <= currentTime && 
      (!n.cluster || activeClusters.has(n.cluster))
    );
    
    const activeNodeIds = new Set(activeNodes.map(n => n.id));
    const activeLinks = data.links.filter(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      return l.time <= currentTime && activeNodeIds.has(sourceId) && activeNodeIds.has(targetId);
    });

    return { nodes: activeNodes, links: activeLinks };
  }, [data, currentTime, activeClusters]);

  // Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchActive(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = filteredData.nodes.filter(n => 
      (n.name && n.name.toLowerCase().includes(q)) || 
      (n.cluster && n.cluster.toLowerCase().includes(q)) ||
      (n.description && n.description.toLowerCase().includes(q))
    ).slice(0, 8);
    setSearchResults(results);
    setIsSearchActive(true);
  }, [searchQuery, filteredData.nodes, currentTime]);

  const handleSearchEnter = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleNodeClick(searchResults[0]);
      setShowDropdown(false);
    }
  };

  const clusterLabelsRef = useRef([]);
  const loadedNodesRef = useRef([]);

  // Pre-generate cluster labels once, independently of the timeline/filter loop
  useEffect(() => {
    if (!fgRef.current || uniqueClusters.length === 0) return;
    const scene = fgRef.current.scene();
    if (!scene) return;
    
    // Cleanup old labels
    clusterLabelsRef.current.forEach(({ sprite }) => {
      scene.remove(sprite);
      if (sprite.material) sprite.material.dispose();
    });
    
    const newLabels = [];
    uniqueClusters.forEach(cluster => {
      const sprite = new SpriteText(cluster.replace(/_/g, ' ').toUpperCase());
      sprite.color = 'rgba(255, 255, 255, 0.8)';
      sprite.textHeight = 35;
      sprite.fontWeight = 'bold';
      sprite.renderOrder = -1; // Behind nodes
      sprite.material.depthWrite = false;
      sprite.visible = false;
      scene.add(sprite);
      newLabels.push({ cluster, sprite });
    });
    clusterLabelsRef.current = newLabels;
    
    return () => {
      newLabels.forEach(({ sprite }) => {
        scene.remove(sprite);
        if (sprite.material) sprite.material.dispose();
      });
      clusterLabelsRef.current = [];
    };
  }, [uniqueClusters]);

  // LOD Engine & Centroids
  useEffect(() => {
    if (!fgRef.current || uniqueClusters.length === 0) return;
    
    let animationId;
    const updateLOD = () => {
      const camera = fgRef.current.camera();
      if (!camera) return;
      const camPos = camera.position;
      
      const sums = {}; const counts = {};
      uniqueClusters.forEach(c => { sums[c] = {x:0, y:0, z:0}; counts[c] = 0; });
      
      let textsCreatedThisFrame = 0;
      
      filteredData.nodes.forEach(node => {
        if (!node.__cachedObj) return;
        const group = node.__cachedObj;
        const size = group.userData.size || 8;
        
        // Centroid Math
        if (node.cluster && sums[node.cluster]) {
          sums[node.cluster].x += group.position.x;
          sums[node.cluster].y += group.position.y;
          sums[node.cluster].z += group.position.z;
          counts[node.cluster]++;
        }
        
        // Discrete LOD Check
        const distSq = camPos.distanceToSquared(group.position);
        
        // Search opacity override (using ref for latest state)
        const isMatch = !searchStateRef.current.active || searchStateRef.current.results.some(res => res.id === node.id);
        const baseOpacity = searchStateRef.current.active && !isMatch ? 0.05 : 1.0;
        
        if (group.userData.mesh && group.userData.mesh.material.opacity !== baseOpacity) {
          group.userData.mesh.material.opacity = baseOpacity;
        }
        // Toggle Name Sprite based on LOD (Incremental Lazy-Load with Throttle)
        const showText = (distSq < 250 * 250) && (baseOpacity > 0.1);
        
        // 1. Lazy-Load Text Sprite
        if (showText) {
          if (!group.userData.nameSprite) {
            // Throttle: max 2 texts per frame to prevent CPU lockup when all nodes start at (0,0,0)
            if (textsCreatedThisFrame >= 2) return; 
            
            // Instantiate exactly ONCE when the user zooms in!
            const nameSprite = new SpriteText(node.name);
            nameSprite.color = '#ffffff';
            nameSprite.textHeight = size * 0.3;
            nameSprite.backgroundColor = 'rgba(0,0,0,0.6)';
            nameSprite.padding = 2;
            nameSprite.borderRadius = 2;
            nameSprite.position.y = -(size / 2) - (size * 0.2);
            group.add(nameSprite);
            group.userData.nameSprite = nameSprite;
            textsCreatedThisFrame++;
          }
          if (!group.userData.nameSprite.visible) {
            group.userData.nameSprite.visible = true;
          }
        } else {
          if (group.userData.nameSprite && group.userData.nameSprite.visible) {
             group.userData.nameSprite.visible = false;
          }
        }
      });
      
      // Update Cluster Labels
      clusterLabelsRef.current.forEach(({ cluster, sprite }) => {
        if (counts[cluster] > 0 && activeClusters.has(cluster)) {
          sprite.position.x = sums[cluster].x / counts[cluster];
          sprite.position.y = (sums[cluster].y / counts[cluster]) + 40;
          sprite.position.z = sums[cluster].z / counts[cluster];
          
          const dist = camPos.distanceTo(sprite.position);
          
          // Sharp toggle for cluster text based on distance
          sprite.visible = (dist >= 250);
        } else {
          sprite.visible = false;
        }
      });
      
      animationId = requestAnimationFrame(updateLOD);
    };
    updateLOD();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [filteredData.nodes, uniqueClusters, activeClusters]);

  // Active Node Image Loading (Strict Click-to-Load with 3-Image LRU Cache & UV Cropping)
  useEffect(() => {
    if (!selectedNode || !selectedNode.image || !selectedNode.__cachedObj) return;
    
    const group = selectedNode.__cachedObj;
    if (group.userData.imageLoaded) return;
    
    textureLoader.load(selectedNode.image, (texture) => {
      // Fix Cut-off Heads (UV Math)
      texture.colorSpace = THREE.SRGBColorSpace;
      const aspect = texture.image.width / texture.image.height;
      if (aspect < 1) {
        // Portrait: Align Top
        texture.repeat.set(1, aspect);
        texture.offset.set(0, 1.0 - aspect);
      } else {
        // Landscape: Center horizontally
        const invAspect = texture.image.height / texture.image.width;
        texture.repeat.set(invAspect, 1);
        texture.offset.set((1.0 - invAspect) / 2, 0);
      }
      
      group.userData.imageLoaded = true;
      group.userData.texture = texture;
      
      if (group.userData.mesh) {
        group.userData.mesh.material.map = texture;
        group.userData.mesh.material.color.setHex(0xffffff);
        group.userData.mesh.material.needsUpdate = true;
      }
      
      loadedNodesRef.current.push(selectedNode);
      
      // Strict 3-Image LRU Cache: Destroy older textures!
      if (loadedNodesRef.current.length > 3) {
        const oldNode = loadedNodesRef.current.shift();
        if (oldNode.__cachedObj && oldNode.__cachedObj.userData.mesh) {
          const oldGroup = oldNode.__cachedObj;
          const mat = oldGroup.userData.mesh.material;
          mat.map = null;
          mat.color.setHex(new THREE.Color(oldNode.color || '#94a3b8').getHex());
          mat.needsUpdate = true;
          oldGroup.userData.imageLoaded = false;
          
          if (oldGroup.userData.texture) {
            oldGroup.userData.texture.dispose(); // CRITICAL: Free WebGL RAM!
            oldGroup.userData.texture = null;
          }
        }
      }
    });
  }, [selectedNode, textureLoader]);

  const activeNode = selectedNode || hoverNode;

  return (
    <div className="relative w-full h-screen bg-[#050508] overflow-hidden">
      <ForceGraph3D
        ref={fgRef}
        graphData={filteredData}
        nodeThreeObject={node => {
          // MEMORY LEAK FIX: Return cached object if it exists!
          if (node.__cachedObj) return node.__cachedObj;

          const isMatch = !searchStateRef.current.active || searchStateRef.current.results.some(res => res.id === node.id);
          const initialOpacity = searchStateRef.current.active && !isMatch ? 0.05 : 1.0;
          
          const group = new THREE.Group();
          // Smooth non-linear sizing
          const size = node.val ? Math.min(Math.max(Math.sqrt(node.val) * 3, 6), 18) : 8;
          group.userData.size = size;
          
          // 1. Mesh / Sprite (Pre-computed FALLBACK only, zero images loaded initially)
          const colorHex = node.color || '#94a3b8';
          const material = new THREE.SpriteMaterial({
            alphaMap: circleAlphaMap,
            color: colorHex,
            transparent: true,
            opacity: initialOpacity,
            alphaTest: 0.1
          });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(size, size, 1);
          group.add(sprite);
          group.userData.mesh = sprite;
          
          if (node.image) {
            group.userData.imageLoaded = false;
          }
          
          // 2. Name Text Placeholder (Initialized as null to prevent freeze)
          // The SpriteText will be dynamically built inside updateLOD only when zooming in.
          group.userData.nameSprite = null;
          
          node.__cachedObj = group;
          return group;
        }}
        nodeThreeObjectExtend={false}
        linkWidth={link => link.type === 'semantic' ? 2 : (link.type === 'bridge' ? 1.5 : 0.5)}
        linkColor={link => link.type === 'semantic' ? '#e879f9' : (link.type === 'bridge' ? '#00ffcc' : '#1e3a5f')}
        linkOpacity={link => link.type === 'semantic' ? 0.6 : 0.3}
        linkDirectionalParticles={link => link.type === 'semantic' ? 4 : (link.type === 'bridge' ? 2 : 0)}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={link => link.type === 'semantic' ? 2 : 1.5}
        linkDirectionalParticleColor={link => link.type === 'semantic' ? '#e879f9' : '#00ffcc'}
        onNodeHover={setHoverNode}
        onNodeClick={handleNodeClick}
        backgroundColor="#050508"
        enableNodeDrag={false}
      />

      {/* Search Panel */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-20 w-[28rem] max-w-[90vw]">
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all">
          <div className="flex items-center px-4 py-3">
            <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Suche Tensoren..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleSearchEnter}
              className="bg-transparent border-none text-white w-full focus:outline-none placeholder-gray-500 font-sans"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowDropdown(false); setIsSearchActive(false); }} className="text-gray-400 hover:text-white transition-colors shrink-0 p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          
          {/* Dropdown Results */}
          <AnimatePresence>
            {showDropdown && isSearchActive && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-white/10 max-h-72 overflow-y-auto"
              >
                {searchResults.map(node => (
                  <div
                    key={node.id}
                    onClick={() => {
                      handleNodeClick(node);
                      setShowDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-white/10 cursor-pointer flex flex-col gap-1 border-b border-white/5 last:border-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-semibold">{node.name}</span>
                      {node.cluster && (
                         <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ml-2" style={{ backgroundColor: (node.color || '#9ca3af') + '33', color: node.color || '#9ca3af' }}>
                           {node.cluster.replace(/_/g, ' ')}
                         </span>
                      )}
                    </div>
                    {node.description && (
                      <span className="text-xs text-gray-400 line-clamp-1">{node.description}</span>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Node Info Side Panel (Split-Screen Wikipedia) */}
      <AnimatePresence>
        {activeNode && (
          <motion.div
            key={activeNode.id}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-screen w-[50vw] min-w-[800px] max-w-[100vw] bg-[#050508]/95 backdrop-blur-3xl border-l border-white/10 text-white shadow-2xl z-40 flex"
          >
            {/* Left Side: Internal Tensor Metadata */}
            <div className="w-1/2 h-full overflow-y-auto flex flex-col relative border-r border-white/10">
               <div className="relative shrink-0">
                 {activeNode.image && (
                   <img
                     src={activeNode.image}
                     alt={activeNode.name}
                     className="w-full h-64 object-cover object-top"
                     onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                   />
                 )}
                 <button 
                   onClick={() => setSelectedNode(null)}
                   className="absolute top-6 right-6 bg-black/50 hover:bg-white/20 rounded-full p-2 backdrop-blur-md transition-colors border border-white/10 z-50"
                 >
                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                 {/* Gradient overlay for text readability */}
                 <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050508]/95 to-transparent pointer-events-none"></div>
               </div>
               
               <div className="p-8 flex-1 flex flex-col -mt-10 relative z-10">
                  <div
                    className="inline-block self-start text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-4 font-semibold shadow-lg backdrop-blur-md"
                    style={{ backgroundColor: (activeNode.color || '#94a3b8') + '33', color: activeNode.color || '#94a3b8', border: `1px solid ${(activeNode.color || '#94a3b8')}40` }}
                  >
                    {activeNode.cluster?.replace(/_/g, ' ')}
                  </div>
                  
                  <h2 className="text-4xl font-serif font-bold text-white mb-2 leading-tight drop-shadow-md">{activeNode.name}</h2>
                  {activeNode.lifespan && (
                    <p className="text-sm text-[#b99b5d] tracking-widest font-mono mb-4">{activeNode.lifespan}</p>
                  )}
                  {(!activeNode.lifespan && activeNode.year && activeNode.year !== 9999) && (
                    <p className="text-sm text-[#b99b5d] tracking-widest font-mono mb-4">* {activeNode.year}</p>
                  )}
                  
                  {activeNode.bio && (
                     <div className="mt-8">
                       <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-semibold border-b border-white/10 pb-2">Biografie</h3>
                       <p className="text-sm text-gray-300 leading-relaxed opacity-90 font-sans">{activeNode.bio}</p>
                     </div>
                  )}
                  
                  {activeNode.description && (
                     <div className="mt-8">
                       <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-semibold border-b border-white/10 pb-2">Philosophischer Kern</h3>
                       <p className="text-sm text-gray-300 leading-relaxed opacity-90 font-sans">{activeNode.description}</p>
                     </div>
                  )}
                  
                  {activeNode.keyConcepts && activeNode.keyConcepts.length > 0 && (
                     <div className="mt-8">
                       <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-semibold border-b border-white/10 pb-2">Schlüsselkonzepte</h3>
                       <div className="flex flex-wrap gap-2">
                         {activeNode.keyConcepts.map(kc => (
                           <span key={kc} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-lg text-gray-300 cursor-default">{kc}</span>
                         ))}
                       </div>
                     </div>
                  )}
                  
                  {/* Links / Connections Section */}
                  {filteredData.links.filter(l => 
                    (l.source.id === activeNode.id || l.target.id === activeNode.id) || 
                    (l.source === activeNode.id || l.target === activeNode.id)
                  ).length > 0 && (
                    <div className="mt-8">
                       <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-semibold border-b border-white/10 pb-2">Verbindungen</h3>
                       <div className="flex flex-col gap-2">
                         {filteredData.links.filter(l => 
                           (l.source.id === activeNode.id || l.target.id === activeNode.id) || 
                           (l.source === activeNode.id || l.target === activeNode.id)
                         ).slice(0, 15).map((l, idx) => {
                           const isSource = l.source.id === activeNode.id || l.source === activeNode.id;
                           const otherNodeId = isSource ? (l.target.id || l.target) : (l.source.id || l.source);
                           const otherNode = filteredData.nodes.find(n => n.id === otherNodeId);
                           if (!otherNode) return null;
                           
                           return (
                             <div key={idx} className="flex flex-col p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer" onClick={() => handleNodeClick(otherNode)}>
                               <span className="text-sm font-semibold text-white">{otherNode.name}</span>
                               {l.description && (
                                 <span className="text-xs text-gray-400 mt-1 leading-snug">{l.description}</span>
                               )}
                             </div>
                           );
                         })}
                       </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Right Side: Wikipedia Web-View */}
            <div className="w-1/2 h-full bg-white relative flex flex-col">
              <div className="h-12 bg-gray-100 border-b border-gray-300 flex items-center px-4 shrink-0">
                <span className="text-gray-500 text-xs font-mono uppercase tracking-widest flex-1 truncate">
                  wikipedia.org/wiki/{activeNode.name.replace(/ /g, '_')}
                </span>
                <a 
                  href={`https://de.wikipedia.org/wiki/${encodeURIComponent(activeNode.name.replace(/ /g, '_'))}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 text-xs hover:underline flex items-center gap-1"
                >
                  Im Browser öffnen
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
              <iframe 
                src={`https://de.wikipedia.org/wiki/${encodeURIComponent(activeNode.name.replace(/ /g, '_'))}`} 
                className="w-full flex-1 border-none bg-white"
                sandbox="allow-same-origin allow-scripts allow-popups"
                title="Wikipedia"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend & Categories Filter */}
      <div className="absolute top-10 left-10 max-w-sm z-20 pointer-events-auto">
        <h1 className="text-5xl font-serif font-bold text-white tracking-widest drop-shadow-2xl">MiNDCEL</h1>
        <p className="text-[#b99b5d] tracking-[0.2em] text-[10px] mt-3 uppercase font-semibold">Das lebendige Tensor-Netzwerk</p>
        <p className="text-gray-400 text-xs mt-2 mb-6 leading-relaxed opacity-80">{filteredData.nodes.filter(n => !n.cluster || activeClusters.has(n.cluster)).length} / 1055 Tensoren sichtbar</p>
        
        <div className="max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="flex flex-col gap-1.5">
            {uniqueClusters.map(c => {
              const isActive = activeClusters.has(c);
              const nodeWithCluster = data.nodes.find(n => n.cluster === c);
              const color = nodeWithCluster ? nodeWithCluster.color : '#ffffff';
              
              return (
                <button 
                  key={c}
                  onClick={() => toggleCluster(c)}
                  className={`flex items-center text-left gap-3 px-3 py-2 rounded-xl transition-all border ${isActive ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-black/60 border-transparent opacity-40 hover:opacity-80'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{ backgroundColor: color }} />
                  <span className="text-xs font-semibold text-white tracking-wider truncate">{c.replace(/_/g, ' ')}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-8 py-5 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center gap-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-[#b99b5d]/10 text-[#b99b5d] hover:bg-[#b99b5d]/30 hover:scale-105 transition-all border border-[#b99b5d]/40 shadow-lg"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#b99b5d] font-mono">
            <span>Genesis</span>
            <span className="text-white">{filteredData.nodes.length} Tensoren aktiv</span>
            <span>Jetzt</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxTime}
            value={currentTime}
            onChange={e => { setCurrentTime(parseInt(e.target.value)); setIsPlaying(false); }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#b99b5d] focus:outline-none"
          />
        </div>
      </div>

      {/* Close detail panel and dropdown on click outside */}
      {(selectedNode || showDropdown) && (
        <button
          className="absolute inset-0 z-0 cursor-default"
          onClick={() => {
            setSelectedNode(null);
            setShowDropdown(false);
          }}
        />
      )}
    </div>
  );
}
