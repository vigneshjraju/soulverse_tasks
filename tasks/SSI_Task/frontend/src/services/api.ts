import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🚨 Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received from: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('🚨 Response error:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const apiService = {
  // Agent Initialization
  initializeAcmeAgent: () => api.get('/acme-agent/initialize'),
  initializeBobAgent: () => api.get('/bob-agent/initialize'),

  // Connection Management
  createInvitation: () => api.post('/connection/create-invitation'),
  receiveInvitation: (invitationUrl: string) => 
    api.get(`/connection/receive-invitation-bob?invitationUrl=${encodeURIComponent(invitationUrl)}`),
  getConnections: (agent: 'acme' | 'bob') => 
    api.get(`/connection/connections?agent=${agent}`).then(response => {
      console.log('🔍 API Service - Raw axios response:', response);
      console.log('🔍 API Service - Response data:', response.data);
      return response.data; // Return the data directly
  }),
  getConnectionId: (oobId: string) => 
    api.get(`/connection/connection-id?oobId=${oobId}`),

  // Credential Management - FIXED ENDPOINTS
  offerCredential: (data: {
    protocolVersion: 'v1' | 'v2';
    connectionId: string;
    credentialDefinitionId: string;
    attributes: Array<{ name: string; value: string }>;
  }) => api.post('/issuance/offer-cred', data),
  
  acceptCredential: (credentialRecordId: string) => 
    api.post('/issuance/accept-cred', { credentialRecordId }),
  
  // Use issuance endpoints instead of records
  getCredentials: (agent: 'acme' | 'bob') => 
    api.get(`/issuance/credentials?agent=${agent}`).then(response => {
      return response.data.data || response.data;
  }),
    
  getBobCredentials: () => 
    api.get('/issuance/bob-credentials'),
  
  autoAcceptCredential: () => 
    api.post('/issuance/auto-accept-cred'),

  // Verification
  requestProof: (data: { connectionId: string; credentialDefId: string }) => 
    api.post('/verification/request-proof', data),
  
  acceptAndPresentProof: (proofRecordId: string) => 
    api.post('/verification/accept-present-proof', { proofRecordId }),
  
  verifyProof: (proofRecordId: string) => 
    api.post('/verification/verify-proof', { proofRecordId }),
  
  getProofRecords: (agent: 'acme' | 'bob') => 
    api.get(`/verification/all-proofrecords?agent=${agent}`).then(response => {
      return response.data.data || response.data;
  }),

  // Ledger Operations
  didGenerate: (data: { method: string; namespace: string; did: string; seed: string }) => 
    api.post('/ledger/did-generate', data),
  
  registerSchema: (data: { issuerId: string }) => 
    api.post('/ledger/schema', data),
  
  registerCredentialDefinition: (data: { issuerId: string; schemaId: string }) => 
    api.post('/ledger/credential-definition', data),
};

export default api;