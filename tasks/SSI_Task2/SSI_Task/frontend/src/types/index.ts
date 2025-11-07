// src/types/index.ts
export interface Connection {
  id: string;
  state: string;
  theirLabel?: string;
  createdAt: string;
  theirDid?: string;
}

export interface Credential {
  id: string;
  state: string;
  connectionId?: string;
  protocolVersion: string;
  createdAt: string;
  credentialAttributes?: Array<{
    name: string;
    value: string;
    'mime-type'?: string;
  }>;
}

export interface ProofRecord {
  id: string;
  state: string;
  connectionId?: string;
  isVerified?: boolean;
  protocolVersion: string;
  createdAt: string;
}

export interface DID {
  did: string;
  method: string;
  seed?: string;
  createdAt: string;
}

export interface Schema {
  schemaId: string;
  name: string;
  version: string;
  issuerId: string;
  createdAt: string;
}

export interface CredentialDefinition {
  credentialDefinitionId: string;
  schemaId: string;
  tag: string;
  issuerId: string;
  createdAt: string;
}

export interface AgentState {
  isInitialized: boolean;
  label?: string;
  endpoints?: string[];
}

export interface AgentConfig {
  label: string;
  walletConfig?: {
    id: string;
    key: string;
  };
  endpoints: string[];
}

export interface AgentResponse {
  statusCode: number;
  message: string;
  data: {
    config: AgentConfig;
  };
}

// NEW: Frontend Bob Agent State
export interface BobAgentState {
  isInitialized: boolean;
  label?: string;
  endpoints?: string[];
  agent?: any; // Reference to the actual agent instance
}