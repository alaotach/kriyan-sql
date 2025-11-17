export interface Persona {
  id: string;
  name: string;
  avatar: string;
  subtitle: string;
  description: string;
  longDescription: string;
  tags: string[];
  category: string;
  isOnline?: boolean;
  isVerified?: boolean;
  messageCount?: number;
  createdBy?: string;
  traits?: string[];
  exampleDialogues?: ExampleDialogue[];
  settings?: PersonaSettings;
}

export interface ExampleDialogue {
  id: string;
  userMessage: string;
  personaResponse: string;
}

export interface PersonaSettings {
  creativity: number;
  strictness: number;
  personalityStrength: number;
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  personaAvatar?: string;
}

export interface Conversation {
  id: string;
  personaId: string;
  personaName: string;
  personaAvatar: string;
  lastMessage: string;
  timestamp: Date;
  isPinned?: boolean;
  unreadCount?: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}
