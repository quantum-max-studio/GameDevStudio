import React, { useState } from 'react';
import { AppSettings, AIConfig, AIProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const ConfigSection: React.FC<{
  title: string;
  config: AIConfig;
  onChange: (config: AIConfig) => void;
}> = ({ title, config, onChange }) => {
  return (
    <div className="bg-game-input p-4 rounded-lg border border-game-border">
      <h3 className="text-sm font-bold text-accent-500 mb-4 border-b border-game-border pb-2">{title}</h3>
      
      <div className="space-y-4">
        {/* Provider */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">AI Provider</label>
          <select 
            value={config.provider}
            onChange={(e) => onChange({ ...config, provider: e.target.value as AIProvider })}
            className="w-full bg-game-dark border border-game-border text-gray-200 text-sm rounded px-2 py-1.5 focus:border-accent-500 focus:outline-none"
          >
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI (GPT)</option>
            <option value="grok">xAI (Grok)</option>
            <option value="custom">Custom (Local LLM)</option>
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Model Name</label>
          <input 
            type="text" 
            value={config.model}
            onChange={(e) => onChange({ ...config, model: e.target.value })}
            placeholder="e.g. gemini-3-pro"
            className="w-full bg-game-dark border border-game-border text-gray-200 text-sm rounded px-2 py-1.5 focus:border-accent-500 focus:outline-none"
          />
        </div>

        {/* API Key */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">API Key</label>
          <div className="relative">
            <input 
              type="password" 
              value={config.provider === 'gemini' ? 'ENV_VAR_SECURE_KEY_LOADED' : config.apiKey}
              disabled={config.provider === 'gemini'}
              onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
              placeholder={config.provider === 'gemini' ? "Using process.env.API_KEY" : "sk-..."}
              className={`w-full bg-game-dark border border-game-border text-gray-200 text-sm rounded px-2 py-1.5 focus:border-accent-500 focus:outline-none ${config.provider === 'gemini' ? 'text-green-500 opacity-70 cursor-not-allowed' : ''}`}
            />
            {config.provider === 'gemini' && (
              <span className="absolute right-2 top-1.5 text-[10px] text-green-500 font-mono">ACTIVE</span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            {config.provider === 'gemini' 
              ? "Key managed securely via environment." 
              : "Enter your personal API key for this provider."}
          </p>
        </div>
      </div>
    </div>
  );
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-game-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-game-border shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-game-border flex justify-between items-center bg-game-dark">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white">Studio Configuration</h2>
            <span className="text-xs bg-accent-600/20 text-accent-500 px-2 py-0.5 rounded border border-accent-600/30">v1.0.0</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#161616]">
          
          <ConfigSection 
            title="Code Assistant (Right Panel)" 
            config={localSettings.codeAI}
            onChange={(newConfig) => setLocalSettings({...localSettings, codeAI: newConfig})}
          />

          <ConfigSection 
            title="Asset Architect (Left Panel)" 
            config={localSettings.assetAI}
            onChange={(newConfig) => setLocalSettings({...localSettings, assetAI: newConfig})}
          />

          <div className="md:col-span-2 bg-game-input p-4 rounded-lg border border-game-border opacity-70">
             <h3 className="text-sm font-bold text-gray-400 mb-2">IDE Preferences</h3>
             <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="form-checkbox text-accent-500 rounded bg-game-dark border-game-border" defaultChecked />
                    <span className="text-sm text-gray-300">Auto-save Code</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="form-checkbox text-accent-500 rounded bg-game-dark border-game-border" defaultChecked />
                    <span className="text-sm text-gray-300">Stream Responses</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="form-checkbox text-accent-500 rounded bg-game-dark border-game-border" />
                    <span className="text-sm text-gray-300">Vim Mode</span>
                </label>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-game-border bg-game-dark flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-accent-600 hover:bg-accent-500 text-white text-sm font-bold rounded shadow-lg shadow-accent-600/20 transition-all"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;