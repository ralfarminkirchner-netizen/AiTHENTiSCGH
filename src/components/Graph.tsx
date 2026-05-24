// @ts-nocheck
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

export default function Graph() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [hoverNode, setHoverNode] = useState(null);
  const fgRef = useRef();

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  const handleNodeClick = useCallback(node => {
    if (fgRef.current) {
      const distance = 40;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );
    }
  }, [fgRef]);

  return (
    <div className="relative w-full h-screen bg-[#050508] overflow-hidden">
      <ForceGraph3D
        ref={fgRef}
        graphData={data}
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
      
      <div className="absolute top-10 left-10 pointer-events-none">
         <h1 className="text-4xl font-serif font-bold text-white tracking-widest drop-shadow-lg">MyCeL</h1>
         <p className="text-gray-400 tracking-[0.3em] text-xs mt-2 uppercase">Knowledge Core Visualizer</p>
      </div>
    </div>
  );
}
