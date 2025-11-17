/**
 * API service for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PersonaSummary {
  name: string;
  summary: string;
  category: string;
}

export interface PersonaDetail {
  name: string;
  instructions: string;
  summary: string;
  category: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  uncensored: boolean;
  description: string;
}

export interface ChatRequest {
  persona: string;
  message: string;
  history?: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
}

export interface ChatResponse {
  reply: string;
  model_used: string;
}

export interface ImageRequest {
  prompt: string;
  model?: string;
}

export interface ImageResponse {
  url: string;
}

export const api = {
  async getModels(): Promise<ModelInfo[]> {
    const response = await fetch(`${API_BASE_URL}/models`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }
    return response.json();
  },

  async getPersonas(): Promise<PersonaSummary[]> {
    const response = await fetch(`${API_BASE_URL}/personas`);
    if (!response.ok) {
      throw new Error(`Failed to fetch personas: ${response.status}`);
    }
    return response.json();
  },

  async getPersona(name: string): Promise<PersonaDetail> {
    const response = await fetch(`${API_BASE_URL}/persona/${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch persona ${name}: ${response.status}`);
    }
    return response.json();
  },

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }
    return response.json();
  },

  async generateImage(request: ImageRequest): Promise<ImageResponse> {
    const response = await fetch(`${API_BASE_URL}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.status}`);
    }
    return response.json();
  },
};
