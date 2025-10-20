import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout for agent initialization
  withCredentials: false, // Set to false for CORS
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(` Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error(' Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(` Response received from: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error(' Response error:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);


export const apiService = {
  
  initializeAcmeAgent: () => api.get('/acme-agent/initialize'),
  initializeBobAgent: () => api.get('/bob-agent/initialize'),

 
  createInvitation: () => api.post('/connection/create-invitation'),
  receiveInvitation: (invitationUrl: string) => api.get(`/connection/receive-invitation-bob?invitationUrl=${encodeURIComponent(invitationUrl)}`),
  getConnections: (agent: 'acme' | 'bob') => api.get(`/connection/connections?agent=${agent}`),
  getConnectionId: (oobId: string) => api.get(`/connection/connection-id?oobId=${oobId}`),

 
  offerCredential: (data: {protocolVersion: 'v1' | 'v2'; connectionId: string; credentialDefinitionId: string; attributes: Array<{ name: string; value: string }>;
  }) => api.post('/issuance/offer-cred', data),
  acceptCredential: (credentialRecordId: string) => api.post('/issuance/accept-cred', { credentialRecordId }),
  autoacceptCredential: (credentialRecordId: string) => api.post('/issuance/auto-accept-cred', { credentialRecordId }),
  getCredentials: (agent: 'acme' | 'bob') => api.get(`/records/agent-records?agent=${agent}`),


  requestProof: (data: {connectionId: string; credentialDefId: string;}) => api.post('/verification/request-proof', data),
  acceptAndPresentProof: (proofRecordId: string) => api.post('/verification/accept-present-proof', { proofRecordId }),
  verifyProof: (proofRecordId: string) => api.post('/verification/verify-proof', { proofRecordId }),
  getProofRecords: (agent: 'acme' | 'bob') => api.get(`/verification/all-proofrecords?agent=${agent}`),


  registerSchema: (issuerId: string) => api.post('/ledger/schema', { issuerId }),
  registerCredentialDefinition: (data: {issuerId: string;schemaId: string;}) => api.post('/ledger/credential-definition', data),
  didGenerate: (data: {method: string; namespace: string; did: string; seed: string;}) => api.post('/ledger/did-generate', data),

};

export default api;