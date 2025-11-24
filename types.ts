export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  isLoading?: boolean;
  images?: string[]; // Base64 strings for asset previews in chat
}

export enum AssetType {
  SPRITE_2D = '2D Assets',
  MODEL_3D = '3D Models',
  AUDIO = 'Audio/SFX',
  PARTICLE = 'Particles',
  ANIMATION = 'Animations'
}

export interface AssetItem {
  id: string;
  name: string;
  type: AssetType;
  url?: string; // Data URL for images/audio
  placeholderIcon?: string; // SVG string or icon name
  createdAt: Date;
}

export interface CodeFile {
  name: string;
  language: string;
  content: string;
}

export type AIProvider = 'gemini' | 'openai' | 'grok' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
}

export interface AppSettings {
  assetAI: AIConfig;
  codeAI: AIConfig;
}