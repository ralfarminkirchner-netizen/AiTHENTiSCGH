'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { motion, AnimatePresence } from 'framer-motion';

export default function Graph() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [hoverNode, setHoverNode] = useState(null);
  const fgRef = useRef();

  // Timeline State
  const [maxTime, setMaxTime] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        // Calculate max time based on the new injected time properties
        let maxT = 0;
        fetchedData.nodes.forEach(n => { if (n.time > maxT) maxT = n.time; });
        fetchedData.links.forEach(l => { if (l.time > maxT) maxT = l.time; });
        setMaxTime(maxT);
        setCurrentTime(0); // Start empty
      });
  }, []);

  // Auto-play interval
  useEffect(() => {
    let interval;
    if (isPlaying && currentTime < maxTime) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return prev + 1;
        });
      }, 400); // 400ms per step for organic growth speed
    } else if (currentTime >= maxTime) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, maxTime]);

  const handleNodeClick = useCallback(node => {
    if (fgRef.current) {
      const distance = 40;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node, 
        3000
      );
    }
  }, [fgRef]);

  // Filter data based on timeline
  const filteredData = {
    nodes: data.nodes.filter(n => n.time <= currentTime),
    links: data.links.filter(l => l.time <= currentTime)
  };

  return (
    <div className="relative w-full h-screen bg-[#050508] overflow-hidden">
      <ForceGraph3D
        ref={fgRef}
        graphData={filteredData}
        nodeLabel="name"
        nodeColor={node => node.type === 'bridge' ? '#aaaaaa' : '#b99b5d'}
        nodeRelSize={6}
        nodeResolution={16}
        linkWidth={link => link.type === 'tension' ? 2 : 1}
        linkColor={link => link.type === 'tension' ? '#ff3366' : (link.type === 'bridge' ? '#00ffcc' : '#445577')}
        linkOpacity={0.6}
        linkDirectionalParticles={link => link.type === 'tension' ? 4 : 0}
        linkDirectionalParticleSpeed={link => link.type === 'tension' ? 0.01 : 0}
        linkDirectionalParticleWidth={3}
        linkDirectionalParticleColor={() => '#ff3366'}
        onNodeHover={setHoverNode}
        onNodeClick={handleNodeClick}
        backgroundColor="#050508"
        enableNodeDrag={false}
      />

      <AnimatePresence>
        {hoverNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-10 right-10 w-80 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-white shadow-2xl"
          >
            {hoverNode.type === 'personality' && hoverNode.portraitUrl && (
              <img src={hoverNode.portraitUrl} alt={hoverNode.name} className="w-full h-40 object-cover rounded-xl mb-4 border border-white/20" />
            )}
            <h2 className="text-2xl font-serif font-bold text-[#b99b5d] mb-2">{hoverNode.name}</h2>
            {hoverNode.role && <p className="text-sm text-gray-400 mb-4">{hoverNode.role}</p>}
            {hoverNode.bio && <p className="text-sm leading-relaxed">{hoverNode.bio}</p>}
            
            {hoverNode.type === 'bridge' && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{hoverNode.summary}</p>
                {hoverNode.tensionPoints && hoverNode.tensionPoints.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                    <h3 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">Tension Points</h3>
                    <ul className="text-xs space-y-1 list-disc pl-4 text-red-200">
                      {hoverNode.tensionPoints.map((tp, i) => <li key={i}>{tp}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="absolute top-10 left-10 pointer-events-none max-w-sm">
         <h1 className="text-5xl font-serif font-bold text-white tracking-widest drop-shadow-2xl">MiNDCEL</h1>
         <p className="text-[#b99b5d] tracking-[0.2em] text-xs mt-3 uppercase font-semibold">Das lebendige Tensor-Netzwerk</p>
         <p className="text-gray-400 text-xs mt-2 leading-relaxed opacity-80">Das persistente, wellenerhaltende Gedächtnis der Resonanzen und Verbindungen.</p>
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
            <span className="text-white">Zeit-Tensor {currentTime} / {maxTime}</span>
            <span>Jetzt</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max={maxTime} 
            value={currentTime}
            onChange={(e) => {
              setCurrentTime(parseInt(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#b99b5d] focus:outline-none"
          />
        </div>
      </div>

    </div>
  );
}
