'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';
const textureCache = new Map();

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

  // Filter data based on timeline - wrap in useMemo to prevent graph rebuilds on every keystroke
  const filteredData = useMemo(() => ({
    nodes: data.nodes.filter(n => n.time <= currentTime),
    links: data.links.filter(l => l.time <= currentTime),
  }), [data, currentTime]);

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
  }, [searchQuery, data.nodes, currentTime]);

  const handleSearchEnter = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleNodeClick(searchResults[0]);
      setShowDropdown(false);
    }
  };

  // Dynamically update Three.js objects for search highlighting without rebuilding graph
  useEffect(() => {
    if (!fgRef.current) return;
    
    // The force graph scene contains all our nodes
    const scene = fgRef.current.scene();
    
    // Find all nodes in the current filtered data
    filteredData.nodes.forEach(node => {
      // Force graph stores the three object on the node as __threeObj
      if (node.__threeObj) {
        const isMatch = !isSearchActive || searchResults.some(res => res.id === node.id);
        
        // Find the mesh or sprite (it's either the object itself or the first child if it has a material)
        const renderable = node.__threeObj.type === 'Mesh' || node.__threeObj.type === 'Sprite' 
          ? node.__threeObj 
          : node.__threeObj.children.find(c => c.type === 'Mesh' || c.type === 'Sprite');
        
        if (renderable && renderable.material) {
          renderable.material.opacity = isSearchActive ? (isMatch ? 1.0 : 0.05) : (node === hoverNode ? 1.0 : 0.85);
          if (renderable.type === 'Mesh') {
            renderable.material.color.set(isSearchActive && !isMatch ? '#1a1a24' : (node.color || '#94a3b8'));
          }
        }
        
        // Handle labels
        const sprite = node.__threeObj.children?.find(c => c.type === 'Sprite');
        if (sprite) {
          // If searching, hide labels of non-matches. Otherwise show if hovered/selected.
          sprite.visible = isSearchActive ? isMatch : (node === hoverNode || node === selectedNode);
        } else if (isSearchActive && isMatch && searchResults.length < 20) {
          // Add sprite if it's a search match and we don't have too many
          const newSprite = new SpriteText(node.name);
          newSprite.color = '#ffffff';
          newSprite.textHeight = 5;
          newSprite.backgroundColor = 'rgba(0,0,0,0.7)';
          newSprite.padding = 3;
          newSprite.borderRadius = 4;
          newSprite.position.y = (node.val ? Math.min(node.val / 3, 6) : 3) + 4;
          node.__threeObj.add(newSprite);
        }
      }
    });
  }, [searchQuery, isSearchActive, searchResults, hoverNode, selectedNode, filteredData.nodes]);

  const activeNode = selectedNode || hoverNode;

  return (
    <div className="relative w-full h-screen bg-[#050508] overflow-hidden">
      <ForceGraph3D
        ref={fgRef}
        graphData={filteredData}
        nodeThreeObject={node => {
          // Only evaluate the initial state
          const isMatch = !isSearchActive || searchResults.some(res => res.id === node.id);
          
          const group = new THREE.Group();
          
          if (node.image) {
            let material;
            if (textureCache.has(node.image)) {
              material = new THREE.SpriteMaterial({ map: textureCache.get(node.image), color: 0xffffff });
            } else {
              material = new THREE.SpriteMaterial({ color: 0xffffff });
              textureLoader.load(node.image, (texture) => {
                textureCache.set(node.image, texture);
                material.map = texture;
                material.needsUpdate = true;
              });
            }
            material.transparent = true;
            material.opacity = isSearchActive ? (isMatch ? 1.0 : 0.05) : 0.85;
            const sprite = new THREE.Sprite(material);
            const size = node.val ? Math.min(node.val, 12) : 8;
            sprite.scale.set(size, size, 1);
            group.add(sprite);
          } else {
            const geometry = new THREE.SphereGeometry(node.val ? Math.min(node.val / 3, 6) : 3, 10, 10);
            const material = new THREE.MeshBasicMaterial({
              color: isSearchActive && !isMatch ? '#1a1a24' : (node.color || '#94a3b8'),
              transparent: true,
              opacity: isSearchActive ? (isMatch ? 1.0 : 0.05) : 0.85,
            });
            const sphere = new THREE.Mesh(geometry, material);
            group.add(sphere);
          }

          if (node === hoverNode || node === selectedNode || (isSearchActive && isMatch && searchResults.length < 20)) {
            const sprite = new SpriteText(node.name);
            sprite.color = '#ffffff';
            sprite.textHeight = node.image ? 3 : 5;
            sprite.backgroundColor = 'rgba(0,0,0,0.7)';
            sprite.padding = 3;
            sprite.borderRadius = 4;
            const yOffset = node.image ? (node.val ? Math.min(node.val, 12)/2 : 4) + 2 : (node.val ? Math.min(node.val / 3, 6) : 3) + 4;
            sprite.position.y = yOffset;
            group.add(sprite);
          }
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

      {/* Node Info Side Panel */}
      <AnimatePresence>
        {activeNode && (
          <motion.div
            key={activeNode.id}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-screen w-[450px] max-w-[100vw] bg-[#050508]/90 backdrop-blur-2xl border-l border-white/10 text-white shadow-2xl overflow-y-auto z-40 flex flex-col"
          >
             <div className="relative shrink-0">
               {activeNode.image && (
                 <img
                   src={activeNode.image}
                   alt={activeNode.name}
                   className="w-full h-72 object-cover object-top"
                   onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                 />
               )}
               <button 
                 onClick={() => setSelectedNode(null)}
                 className="absolute top-6 right-6 bg-black/50 hover:bg-white/20 rounded-full p-2 backdrop-blur-md transition-colors border border-white/10"
               >
                 <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
               {/* Gradient overlay for text readability */}
               <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050508]/90 to-transparent pointer-events-none"></div>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute top-10 left-10 pointer-events-none max-w-sm">
        <h1 className="text-5xl font-serif font-bold text-white tracking-widest drop-shadow-2xl">MiNDCEL</h1>
        <p className="text-[#b99b5d] tracking-[0.2em] text-xs mt-3 uppercase font-semibold">Das lebendige Tensor-Netzwerk</p>
        <p className="text-gray-400 text-xs mt-2 leading-relaxed opacity-80">{filteredData.nodes.length} / 1055 Tensoren sichtbar</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: 'Philosophie', color: '#93c5fd' },
            { label: 'Psychologie', color: '#fbbf24' },
            { label: 'Spiritualität', color: '#c084fc' },
            { label: 'Wissenschaft', color: '#60a5fa' },
            { label: 'Synthesen', color: '#00ffcc' },
          ].map(c => (
            <span key={c.label} className="flex items-center gap-1 text-[10px]" style={{ color: c.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.label}
            </span>
          ))}
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
