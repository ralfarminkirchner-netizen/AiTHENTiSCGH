'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

export default function Graph() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const fgRef = useRef();

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

  // Filter data based on timeline
  const filteredData = {
    nodes: data.nodes.filter(n => n.time <= currentTime),
    links: data.links.filter(l => l.time <= currentTime),
  };

  const activeNode = selectedNode || hoverNode;

  return (
    <div className="relative w-full h-screen bg-[#050508] overflow-hidden">
      <ForceGraph3D
        ref={fgRef}
        graphData={filteredData}
        nodeThreeObject={node => {
          // Small glowing sphere for every node - much faster than sprites at 1055 nodes
          const geometry = new THREE.SphereGeometry(node.val ? Math.min(node.val / 3, 6) : 3, 10, 10);
          const material = new THREE.MeshBasicMaterial({
            color: node.color || '#94a3b8',
            transparent: true,
            opacity: node === hoverNode ? 1.0 : 0.85,
          });
          const sphere = new THREE.Mesh(geometry, material);

          // Only render text label for hovered/selected node (performance)
          if (node === hoverNode || node === selectedNode) {
            const sprite = new SpriteText(node.name);
            sprite.color = '#ffffff';
            sprite.textHeight = 5;
            sprite.backgroundColor = 'rgba(0,0,0,0.7)';
            sprite.padding = 3;
            sprite.borderRadius = 4;
            sprite.position.y = (node.val ? Math.min(node.val / 3, 6) : 3) + 4;
            sphere.add(sprite);
          }
          return sphere;
        }}
        nodeThreeObjectExtend={false}
        linkWidth={link => link.type === 'bridge' ? 1.5 : 0.5}
        linkColor={link => link.type === 'bridge' ? '#00ffcc' : '#1e3a5f'}
        linkOpacity={0.3}
        linkDirectionalParticles={link => link.type === 'bridge' ? 2 : 0}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={() => '#00ffcc'}
        onNodeHover={setHoverNode}
        onNodeClick={handleNodeClick}
        backgroundColor="#050508"
        enableNodeDrag={false}
      />

      {/* Node Info Panel */}
      <AnimatePresence>
        {activeNode && (
          <motion.div
            key={activeNode.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-10 right-10 w-80 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl text-white shadow-2xl overflow-hidden"
          >
            {/* Portrait */}
            {activeNode.image && (
              <img
                src={activeNode.image}
                alt={activeNode.name}
                className="w-full h-44 object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="p-5">
              <div
                className="inline-block text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full mb-3 font-semibold"
                style={{ backgroundColor: activeNode.color + '33', color: activeNode.color }}
              >
                {activeNode.cluster?.replace(/_/g, ' ')}
              </div>
              <h2 className="text-xl font-serif font-bold text-white mb-1">{activeNode.name}</h2>
              {activeNode.year && (
                <p className="text-sm text-gray-400">* {activeNode.year}</p>
              )}
              {activeNode.wordCount > 0 && (
                <p className="text-xs text-gray-600 mt-2">{activeNode.wordCount} Wörter im Monograph</p>
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

      {/* Close detail panel on click outside */}
      {selectedNode && (
        <button
          className="absolute inset-0 z-0"
          onClick={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
