import React, { useState } from 'react';
import { IconPlay, IconStop, IconSettings } from './Icons';

const GameViewport: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [resolution, setResolution] = useState("1920x1080");

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Viewport Toolbar */}
      <div className="h-10 bg-game-panel border-b border-game-border flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center space-x-2 px-3 py-1 rounded transition-colors ${isPlaying ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}
          >
            {isPlaying ? <IconStop className="w-4 h-4" /> : <IconPlay className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase">{isPlaying ? 'Stop' : 'Play'}</span>
          </button>
          <div className="h-4 w-[1px] bg-game-border mx-2"></div>
          <button className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-game-input">2D</button>
          <button className="text-xs text-white bg-game-input px-2 py-1 rounded border border-game-border">3D</button>
        </div>

        <div className="flex items-center space-x-2">
            <select 
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="bg-game-input text-xs text-gray-300 border border-game-border rounded px-2 py-1 focus:outline-none focus:border-accent-500"
            >
                <option value="1920x1080">1920x1080 (16:9)</option>
                <option value="1280x720">1280x720 (16:9)</option>
                <option value="1080x1920">1080x1920 (9:16)</option>
                <option value="free">Free Aspect</option>
            </select>
            <button className="p-1 hover:bg-game-input rounded text-gray-400">
                <IconSettings className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Main Viewport Area */}
      <div className="flex-1 relative overflow-hidden bg-[#121212] flex items-center justify-center">
         {/* Background Grid Pattern */}
         <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             transform: 'perspective(500px) rotateX(20deg) scale(1.5)',
             transformOrigin: 'center 60%'
         }}></div>

         {/* Horizon Line simulation */}
         <div className="absolute inset-x-0 top-1/3 h-[1px] bg-accent-500/30"></div>

         {/* World Origin */}
         <div className="absolute top-1/2 left-1/2 w-4 h-4 -mt-2 -ml-2 pointer-events-none">
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-green-500"></div>
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-red-500"></div>
         </div>

         {/* Simulated Game Content */}
         <div className={`transition-all duration-500 ${isPlaying ? 'scale-100 opacity-100' : 'scale-95 opacity-80 blur-[1px]'}`}>
             {isPlaying ? (
                 <div className="w-[480px] h-[270px] bg-black border border-gray-800 shadow-2xl relative flex items-center justify-center overflow-hidden">
                     {/* Game Running Simulation */}
                     <div className="absolute inset-0 bg-gradient-to-b from-sky-900 to-indigo-900 opacity-50"></div>
                     <div className="text-center z-10">
                        <h1 className="text-2xl font-bold text-white mb-2 animate-bounce">GAME RUNNING</h1>
                        <p className="text-xs text-cyan-300 font-mono">FPS: 60.01</p>
                     </div>
                     {/* Fake particles */}
                     <div className="absolute bottom-4 left-4 w-8 h-8 bg-red-500 rounded-sm animate-spin"></div>
                     <div className="absolute top-10 right-20 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                 </div>
             ) : (
                 <div className="text-center select-none">
                    <p className="text-gray-600 font-mono text-sm mb-2">Scene View [Edit Mode]</p>
                    <div className="w-32 h-32 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center mx-auto">
                        <span className="text-gray-700 text-4xl">+</span>
                    </div>
                 </div>
             )}
         </div>

         {/* Overlay UI (Gizmos) */}
         <div className="absolute top-4 right-4 bg-game-panel/80 p-2 rounded border border-game-border backdrop-blur-sm">
             <div className="w-8 h-8 rounded-full border-2 border-gray-500 relative flex items-center justify-center">
                 <div className="w-1 h-3 bg-green-500 absolute -top-1"></div>
                 <div className="h-1 w-3 bg-red-500 absolute -right-1"></div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
             </div>
         </div>
      </div>
      
      {/* Footer Status */}
      <div className="h-6 bg-game-dark border-t border-game-border flex items-center px-4 justify-between text-[10px] text-gray-500 select-none">
          <div>Objects: 14 | Lights: 2 | Cameras: 1</div>
          <div>Baking: Idle</div>
      </div>
    </div>
  );
};

export default GameViewport;