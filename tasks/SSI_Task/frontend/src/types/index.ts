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


export interface Schema {
  schemaId: string;
  schema: {
    attrNames: string[];
    name: string;
    version: string;
    issuerId: string;
  };
}

export interface CredentialDefinition {
  credentialDefinitionId: string;
  credentialDefinition: {
    schemaId: string;
    tag: string;
    issuerId: string;
  };
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
