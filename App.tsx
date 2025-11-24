import React, { useState } from 'react';
import ChatPanel from './components/ChatPanel';
import CodeEditor from './components/CodeEditor';
import AssetLibrary from './components/AssetLibrary';
import GameViewport from './components/GameViewport';
import SettingsModal from './components/SettingsModal';
import { IconSettings, IconCode, IconImage } from './components/Icons';
import { ChatMessage, MessageRole, AssetType, AssetItem, AppSettings } from './types';
import { streamCodeGeneration, generateAssetHelp } from './services/geminiService';

// Default code template
const DEFAULT_CODE = `import { Engine, Scene, Vector3 } from 'game-engine';

class PlayerController extends Component {
  speed: number = 10;
  
  start() {
    console.log("Player Initialized");
  }

  update(deltaTime: number) {
    // Basic movement logic
    const input = Input.getAxis("Horizontal");
    this.transform.position.x += input * this.speed * deltaTime;
  }
}
`;

const App: React.FC = () => {
  // --- Settings State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    codeAI: {
      provider: 'gemini',
      model: 'gemini-3-pro-preview',
      apiKey: '' // Managed by env
    },
    assetAI: {
      provider: 'gemini',
      model: 'gemini-2.5-flash-image',
      apiKey: '' // Managed by env
    }
  });

  // --- UI State ---
  const [activeBottomTab, setActiveBottomTab] = useState<'code' | 'assets'>('code');

  // --- State for Code Chat (Right) ---
  const [codeMessages, setCodeMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: MessageRole.MODEL,
      text: "Hello! I'm your Coding Assistant. I can help you write scripts, debug code, or optimize your game logic. What are we building?",
      timestamp: new Date(),
    }
  ]);
  const [isCodeLoading, setIsCodeLoading] = useState(false);

  // --- State for Asset Chat (Left) ---
  const [assetMessages, setAssetMessages] = useState<ChatMessage[]>([
    {
        id: '1',
        role: MessageRole.MODEL,
        text: "Hi! I'm your Asset Architect. I can generate 2D sprites, describe 3D models, or suggest sound effects. Try asking for a 'cyberpunk sword sprite'.",
        timestamp: new Date(),
    }
  ]);
  const [isAssetLoading, setIsAssetLoading] = useState(false);

  // --- State for Code Editor ---
  const [code, setCode] = useState<string>(DEFAULT_CODE);

  // --- State for Asset Library ---
  const [assets, setAssets] = useState<AssetItem[]>([]);

  // --- Code AI Handler ---
  const handleCodeMessage = async (text: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: text,
      timestamp: new Date(),
    };
    
    const newHistory = [...codeMessages, userMsg];
    setCodeMessages(newHistory);
    setIsCodeLoading(true);

    // Placeholder for model response
    const responseId = (Date.now() + 1).toString();
    let fullResponse = "";
    
    setCodeMessages(prev => [
        ...prev,
        {
            id: responseId,
            role: MessageRole.MODEL,
            text: "",
            timestamp: new Date(),
            isLoading: true
        }
    ]);

    try {
        // In a real multi-provider app, we would switch service based on settings.codeAI.provider
        const generator = await streamCodeGeneration(newHistory, text, code);
        
        for await (const chunk of generator) {
            fullResponse += chunk;
            setCodeMessages(prev => prev.map(msg => 
                msg.id === responseId ? { ...msg, text: fullResponse, isLoading: false } : msg
            ));
            
            // Naive auto-update of editor
            if (chunk.includes('```') && fullResponse.split('```').length >= 3) {
               const match = fullResponse.match(/```(?:typescript|javascript|csharp|cpp|)?\n([\s\S]*?)```/);
               if (match && match[1]) {
                   if (text.toLowerCase().includes("code") || text.toLowerCase().includes("script")) {
                       setCode(match[1]);
                       setActiveBottomTab('code'); // Switch to code tab when code is generated
                   }
               }
            }
        }

    } catch (error) {
        setCodeMessages(prev => prev.map(msg => 
            msg.id === responseId ? { ...msg, text: "Error connecting to AI Service.", isLoading: false } : msg
        ));
    } finally {
        setIsCodeLoading(false);
    }
  };

  // --- Asset AI Handler ---
  const handleAssetMessage = async (text: string) => {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: MessageRole.USER,
        text: text,
        timestamp: new Date(),
      };
      
      const newHistory = [...assetMessages, userMsg];
      setAssetMessages(newHistory);
      setIsAssetLoading(true);

      try {
        // In a real multi-provider app, we would switch service based on settings.assetAI.provider
        const result = await generateAssetHelp(text);
        
        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: MessageRole.MODEL,
            text: result.text,
            timestamp: new Date(),
            images: result.imageUrl ? [result.imageUrl] : undefined
        };

        setAssetMessages(prev => [...prev, aiMsg]);

        // If an image was generated, add to library
        if (result.imageUrl) {
            const newAsset: AssetItem = {
                id: Date.now().toString(),
                name: `Generated Asset ${assets.length + 1}`,
                type: AssetType.SPRITE_2D, 
                url: result.imageUrl,
                createdAt: new Date()
            };
            setAssets(prev => [newAsset, ...prev]);
            setActiveBottomTab('assets'); // Switch to assets tab
        } else {
           // Simulate placeholders
           if (text.toLowerCase().includes("3d model")) {
               setAssets(prev => [{
                   id: Date.now().toString(),
                   name: "3D: " + text.slice(0, 15),
                   type: AssetType.MODEL_3D,
                   createdAt: new Date()
               }, ...prev]);
               setActiveBottomTab('assets');
           }
           if (text.toLowerCase().includes("sound") || text.toLowerCase().includes("sfx")) {
                setAssets(prev => [{
                    id: Date.now().toString(),
                    name: "SFX: " + text.slice(0, 15),
                    type: AssetType.AUDIO,
                    createdAt: new Date()
                }, ...prev]);
                setActiveBottomTab('assets');
            }
        }

      } catch (e) {
        setAssetMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: MessageRole.MODEL,
            text: "Failed to process asset request.",
            timestamp: new Date()
        }]);
      } finally {
          setIsAssetLoading(false);
      }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121212] text-white overflow-hidden">
      
      {/* Top Navigation Bar */}
      <header className="h-12 bg-[#1a1a1a] border-b border-[#3e3e42] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-accent-500 font-bold text-lg">
             <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
             GameGen Studio
          </div>
          <nav className="flex space-x-1 ml-4 border-l border-game-border pl-4">
              <button className="px-3 py-1 text-xs hover:bg-[#333] rounded text-gray-300 transition-colors">File</button>
              <button className="px-3 py-1 text-xs hover:bg-[#333] rounded text-gray-300 transition-colors">Edit</button>
              <button className="px-3 py-1 text-xs hover:bg-[#333] rounded text-gray-300 transition-colors">View</button>
              <button className="px-3 py-1 text-xs hover:bg-[#333] rounded text-gray-300 transition-colors">Window</button>
              <button className="px-3 py-1 text-xs hover:bg-[#333] rounded text-gray-300 transition-colors">Help</button>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
            <div className="flex items-center bg-game-input rounded-full px-3 py-1 border border-game-border">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-[10px] text-gray-400 font-mono">
                    {settings.codeAI.provider === 'gemini' ? 'Gemini 3 Pro' : settings.codeAI.provider}
                </span>
            </div>
            
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-game-input transition-colors"
                title="AI Settings & API Keys"
            >
                <IconSettings className="w-5 h-5" />
            </button>

            <button className="bg-accent-600 hover:bg-accent-500 px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center shadow-lg shadow-accent-600/20">
                <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                Build & Run
            </button>
        </div>
      </header>

      {/* Main Workspace - Grid Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Assets AI */}
        <div className="w-80 shrink-0 flex flex-col h-full z-10 shadow-xl">
             <ChatPanel 
               title="Asset Architect" 
               modelName={settings.assetAI.model}
               position="left"
               messages={assetMessages}
               onSendMessage={handleAssetMessage}
               isTyping={isAssetLoading}
               placeholder={`Ask ${settings.assetAI.provider} for assets...`}
             />
        </div>

        {/* Center Column: Game Viewport (Top) + Bottom Panel (Code/Assets) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d0d0d]">
            
            {/* Center Top: Game Viewport / Output Display */}
            <div className="flex-1 basis-2/3 min-h-0 relative border-b border-game-border z-0">
                <GameViewport />
            </div>
            
            {/* Center Bottom: Tabbed Panel (Assets & Code) */}
            <div className="basis-1/3 min-h-0 relative z-0 flex flex-col bg-game-panel">
                 {/* Bottom Tabs */}
                 <div className="flex h-9 bg-game-dark border-b border-game-border shrink-0">
                    <button 
                        onClick={() => setActiveBottomTab('code')}
                        className={`px-4 text-xs flex items-center border-r border-game-border transition-colors ${activeBottomTab === 'code' ? 'bg-game-panel text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-[#252526]'}`}
                    >
                        <IconCode className="w-3 h-3 mr-2"/> Code Editor
                    </button>
                    <button 
                        onClick={() => setActiveBottomTab('assets')}
                        className={`px-4 text-xs flex items-center border-r border-game-border transition-colors ${activeBottomTab === 'assets' ? 'bg-game-panel text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-[#252526]'}`}
                    >
                        <IconImage className="w-3 h-3 mr-2"/> Asset Library
                    </button>
                 </div>
                 
                 {/* Panel Content */}
                 <div className="flex-1 relative overflow-hidden">
                     {activeBottomTab === 'code' && (
                         <CodeEditor code={code} onChange={setCode} />
                     )}
                     {activeBottomTab === 'assets' && (
                         <AssetLibrary assets={assets} />
                     )}
                 </div>
            </div>
        </div>

        {/* Right Sidebar: Code AI */}
        <div className="w-80 shrink-0 flex flex-col h-full z-10 shadow-xl">
            <ChatPanel 
               title="Code Assistant" 
               modelName={settings.codeAI.model}
               position="right"
               messages={codeMessages}
               onSendMessage={handleCodeMessage}
               isTyping={isCodeLoading}
               placeholder={`Ask ${settings.codeAI.provider} to code...`}
             />
        </div>

      </div>

      {/* Configuration Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
};

export default App;