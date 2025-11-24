import React, { useState } from 'react';
import { AssetType, AssetItem } from '../types';
import { IconImage, IconBox, IconMusic, IconSparkles, IconWind } from './Icons';

interface AssetLibraryProps {
  assets: AssetItem[];
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({ assets }) => {
  const [activeTab, setActiveTab] = useState<AssetType>(AssetType.SPRITE_2D);

  const tabs = [
    { type: AssetType.SPRITE_2D, icon: IconImage, label: '2D Sprites' },
    { type: AssetType.MODEL_3D, icon: IconBox, label: '3D Models' },
    { type: AssetType.AUDIO, icon: IconMusic, label: 'Audio & SFX' },
    { type: AssetType.PARTICLE, icon: IconSparkles, label: 'Particles' },
    { type: AssetType.ANIMATION, icon: IconWind, label: 'Animations' },
  ];

  const filteredAssets = assets.filter(a => a.type === activeTab);

  return (
    <div className="flex flex-col h-full bg-game-panel">
        {/* Tabs */}
      <div className="flex border-b border-game-border bg-game-dark overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.type 
                ? 'text-white border-t-2 border-accent-500 bg-game-panel' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {/* Render actual assets */}
            {filteredAssets.map(asset => (
                <div key={asset.id} className="group relative bg-game-input border border-game-border rounded-lg overflow-hidden hover:border-accent-500 transition-all cursor-pointer shadow-lg">
                    <div className="aspect-square w-full bg-gray-800 flex items-center justify-center relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] bg-[length:16px_16px]">
                            {/* Asset Preview */}
                            {asset.url ? (
                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-600">
                                  {(() => {
                                      const Icon = tabs.find(t => t.type === asset.type)?.icon || IconBox;
                                      return <Icon className="w-8 h-8 mb-2" />;
                                  })()}
                                  <span className="text-[10px] uppercase font-bold opacity-50">{asset.type.split(' ')[0]}</span>
                                </div>
                            )}
                            
                            {/* Overlay for interactions */}
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2">
                                <span className="text-xs text-white font-bold px-3 py-1 bg-accent-600 rounded hover:bg-accent-500">Inspect</span>
                                <span className="text-[10px] text-gray-300">Drag to Scene</span>
                            </div>
                    </div>
                    <div className="p-2 bg-game-panel">
                        <p className="text-xs text-gray-300 truncate font-mono">{asset.name}</p>
                        <p className="text-[10px] text-gray-600">{asset.createdAt.toLocaleDateString()}</p>
                    </div>
                </div>
            ))}

            {/* Render Placeholders/Slots to fill the grid - gives the "Game Engine" feel */}
            {Array.from({ length: Math.max(0, 12 - filteredAssets.length) }).map((_, i) => (
                <div key={`placeholder-${i}`} className="aspect-square bg-game-input/30 border border-game-border border-dashed rounded-lg flex flex-col items-center justify-center opacity-30 group hover:opacity-50 transition-opacity select-none">
                    <div className="w-8 h-8 rounded-full bg-game-border mb-2 group-hover:bg-accent-500/50 transition-colors"></div>
                    <span className="text-[10px] text-gray-600 font-mono">Empty Slot</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AssetLibrary;