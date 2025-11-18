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

  async generateTitle(messages: Array<{ role: string; content: string }>): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/generate-title`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });
    if (!response.ok) {
      throw new Error(`Failed to generate title: ${response.status}`);
    }
    const data = await response.json();
    return data.title;
  },

  async createPersona(persona: {
    name: string;
    tagline: string;
    description: string;
    greeting: string;
    category?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/persona/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(persona),
    });
    if (!response.ok) {
      throw new Error(`Failed to create persona: ${response.status}`);
    }
    return response.json();
  },

  async shareChat(
    messages: Array<{ role: string; content: string }>,
    personaName: string,
    title: string,
    expiresIn?: number
  ): Promise<{ shareId: string; shareUrl: string; expiresAt?: string }> {
    const response = await fetch(`${API_BASE_URL}/chat/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, personaName, title, expiresIn }),
    });
    if (!response.ok) {
      throw new Error(`Failed to share chat: ${response.status}`);
    }
    return response.json();
  },

  async updateSharedChat(
    shareId: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/chat/share/${shareId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shareId, messages }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update shared chat: ${response.status}`);
    }
    return response.json();
  },

  async getSharedChat(shareId: string): Promise<{
    messages: Array<{ role: string; content: string }>;
    personaName: string;
    title: string;
    createdAt: string;
    updatedAt?: string;
    expiresAt?: string;
    views: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/chat/shared/${shareId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Shared chat not found');
      }
      if (response.status === 410) {
        throw new Error('This shared chat has expired');
      }
      throw new Error(`Failed to get shared chat: ${response.status}`);
    }
    return response.json();
  },

  async deleteSharedChat(shareId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/chat/share/${shareId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete shared chat: ${response.status}`);
    }
    return response.json();
  },

  async registerSharedConversation(
    shareId: string,
    userId: string,
    conversationId: string
  ): Promise<{ success: boolean; conversationId: string }> {
    const response = await fetch(
      `${API_BASE_URL}/chat/share/${shareId}/register?user_id=${encodeURIComponent(userId)}&conversation_id=${encodeURIComponent(conversationId)}`,
      {
        method: 'POST',
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to register conversation: ${response.status}`);
    }
    return response.json();
  },

  async checkUserConversation(
    shareId: string,
    userId: string
  ): Promise<{ exists: boolean; conversationId: string | null }> {
    const response = await fetch(`${API_BASE_URL}/chat/share/${shareId}/check/${encodeURIComponent(userId)}`);
    if (!response.ok) {
      throw new Error(`Failed to check conversation: ${response.status}`);
    }
    return response.json();
  },
};
