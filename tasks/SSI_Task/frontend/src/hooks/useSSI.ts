import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Connection, Credential, ProofRecord, AgentState, AgentResponse,DID, Schema, CredentialDefinition } from '../types';
import { useApi } from './useApi';

export const useSSI = () => {
  // Load initial state from localStorage
  const [connections, setConnections] = useState<Connection[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [proofs, setProofs] = useState<ProofRecord[]>([]);

  // Add ledger state
  const [dids, setDids] = useState<DID[]>([]);
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [credentialDefinitions, setCredentialDefinitions] = useState<CredentialDefinition[]>([]);

  
  // Add state for current invitation
  const [currentInvitation, setCurrentInvitation] = useState<{
    invitationUrl: string;
    oobId: string;
  } | null>(null);
  
  // Agent states - start as uninitialized but load from localStorage
  const [acmeAgent, setAcmeAgent] = useState<AgentState>(() => {
    try {
      const saved = localStorage.getItem('ssi-acme-agent');
      return saved ? JSON.parse(saved) : { isInitialized: false, label: '', endpoints: [] };
    } catch {
      return { isInitialized: false, label: '', endpoints: [] };
    }
  });
  
  const [bobAgent, setBobAgent] = useState<AgentState>(() => {
    try {
      const saved = localStorage.getItem('ssi-bob-agent');
      return saved ? JSON.parse(saved) : { isInitialized: false, label: '', endpoints: [] };
    } catch {
      return { isInitialized: false, label: '', endpoints: [] };
    }
  });

  // Track if we've loaded initial data
  const [isInitialized, setIsInitialized] = useState(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ssi-connections', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem('ssi-credentials', JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem('ssi-proofs', JSON.stringify(proofs));
  }, [proofs]);

  useEffect(() => {
    localStorage.setItem('ssi-acme-agent', JSON.stringify(acmeAgent));
  }, [acmeAgent]);

  useEffect(() => {
    localStorage.setItem('ssi-bob-agent', JSON.stringify(bobAgent));
  }, [bobAgent]);

  // Save current invitation to localStorage
  useEffect(() => {
    if (currentInvitation) {
      localStorage.setItem('ssi-current-invitation', JSON.stringify(currentInvitation));
    } else {
      localStorage.removeItem('ssi-current-invitation');
    }
  }, [currentInvitation]);

   useEffect(() => {
    localStorage.setItem('ssi-dids', JSON.stringify(dids));
  }, [dids]);

  useEffect(() => {
    localStorage.setItem('ssi-schemas', JSON.stringify(schemas));
  }, [schemas]);

  useEffect(() => {
    localStorage.setItem('ssi-credential-definitions', JSON.stringify(credentialDefinitions));
  }, [credentialDefinitions]);

  // Combined agent state for UI
  const agentState = {
    isInitialized: acmeAgent.isInitialized || bobAgent.isInitialized,
    label: acmeAgent.isInitialized ? acmeAgent.label : bobAgent.label,
    endpoints: acmeAgent.isInitialized ? acmeAgent.endpoints : bobAgent.endpoints,
    bothInitialized: acmeAgent.isInitialized && bobAgent.isInitialized
  };

  // API hooks
  const { execute: initializeAcmeAgent, loading: initializingAcme } = useApi<any>();
  const { execute: initializeBobAgent, loading: initializingBob } = useApi<any>();
  const { execute: createInvitationApi, loading: creatingInvitation } = useApi<any>();
  const { execute: receiveInvitationApi, loading: receivingInvitation } = useApi<any>();
  const { execute: loadConnections, loading: loadingConnections } = useApi<any>();
  const { execute: loadCredentials, loading: loadingCredentials } = useApi<any>();
  const { execute: loadProofs, loading: loadingProofs } = useApi<any>();
   const { execute: generateDIDApi, loading: generatingDID } = useApi<any>();
  const { execute: registerSchemaApi, loading: registeringSchema } = useApi<any>();
  const { execute: registerCredDefApi, loading: registeringCredDef } = useApi<any>();

  // Helper function to extract data from API responses
  const extractDataFromResponse = (response: any): any[] => {
    if (!response) {
      console.log(' No response provided to extractDataFromResponse');
      return [];
    }
    
    console.log(' Extracting data from response:', {
      responseType: typeof response,
      isArray: Array.isArray(response),
      keys: response ? Object.keys(response) : 'no keys'
    });

    // If response is directly an array of connections
    if (Array.isArray(response)) {
      console.log(' Response is directly an array');
      return response;
    }
    
    // If response has a data property that's an array
    if (response.data && Array.isArray(response.data)) {
      console.log(' Response.data is an array');
      return response.data;
    }
    
    // If response has nested data.data property that's an array
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log(' Response.data.data is an array');
      return response.data.data;
    }
    
    // If response is an object with statusCode and data array
    if (response.statusCode && response.data && Array.isArray(response.data)) {
      console.log(' Response has statusCode and data array');
      return response.data;
    }
    
    // Look for any array property in the response
    for (const key in response) {
      if (Array.isArray(response[key])) {
        console.log(` Found array in response.${key}`);
        return response[key];
      }
    }
    
    console.log(' No array found in response structure:', response);
    return [];
  };

  // Initialize Acme Agent
  const initializeAcme = async () => {
    try {
      console.log('Initializing Acme agent...');
      const result = await initializeAcmeAgent(apiService.initializeAcmeAgent());
      
      const newAcmeAgent = {
        isInitialized: true,
        label: result.data?.config?.label || 'demo-agent-acme',
        endpoints: result.data?.config?.endpoints || []
      };
      
      setAcmeAgent(newAcmeAgent);
      await refreshConnections();
      
    } catch (error: unknown) {
      console.error('Failed to initialize Acme agent:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to initialize Acme agent');
    }
  };

  // Initialize Bob Agent
  const initializeBob = async () => {
    try {
      console.log('Initializing Bob agent...');
      const result = await initializeBobAgent(apiService.initializeBobAgent());
      
      const newBobAgent = {
        isInitialized: true,
        label: result.data?.config?.label || 'docs-agent-Bob',
        endpoints: result.data?.config?.endpoints || []
      };
      
      setBobAgent(newBobAgent);
      await refreshCredentials();
      
    } catch (error: unknown) {
      console.error('Failed to initialize Bob agent:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to initialize Bob agent');
    }
  };

  // Create invitation
  const handleCreateInvitation = async () => {
    try {
      console.log('Creating invitation...');
      const result = await createInvitationApi(apiService.createInvitation());
      console.log('Full invitation result:', result);
      
      // Extract invitation data from the response - FIXED
      if (result && result.data) {
        const invitationData = {
          invitationUrl: result.data.invitationUrl,
          oobId: result.data.oobId
        };
        setCurrentInvitation(invitationData);
        console.log('✅ Invitation created and stored:', invitationData);
      } else {
        console.error(' No invitation data in response:', result);
      }
      
      await refreshConnections();
      return result;
    } catch (error: unknown) {
      console.error('Failed to create invitation:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create invitation');
    }
  };

  // Clear current invitation
  const clearCurrentInvitation = () => {
    setCurrentInvitation(null);
  };

  // Receive invitation
  const receiveInvitation = async (invitationUrl: string) => {
    try {
      const cleanInvitationUrl = invitationUrl.trim().replace(/[{}"']/g, '');
      const result = await receiveInvitationApi(apiService.receiveInvitation(cleanInvitationUrl));
      
      await refreshConnections();
      await refreshCredentials();
      
      return result;
    } catch (error: unknown) {
      console.error('Failed to receive invitation:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to receive invitation');
    }
  };

  const refreshConnections = async () => {
    try {
      // Only try to load connections if Acme agent is initialized
      if (!acmeAgent.isInitialized) {
        console.log('Acme agent not initialized, skipping connections refresh');
        setConnections([]);
        return;
      }

      console.log(' Refreshing connections for Acme agent...');
      
      // FIX: Use await directly instead of through loadConnections
      const response = await apiService.getConnections('acme');
      console.log('📦 Raw connections API response:', response);
      
      if (!response) {
        console.error(' No response from connections API');
        setConnections([]);
        return;
      }

      console.log('🔍 Response structure:', {
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: 'data' in response,
        dataType: response?.data ? typeof response.data : 'no data',
        dataIsArray: Array.isArray(response?.data),
        hasNestedData: response?.data?.data ? typeof response.data.data : 'no nested data',
        nestedDataIsArray: Array.isArray(response?.data?.data)
      });

      const connectionsData = extractDataFromResponse(response) as Connection[];
      console.log('Processed connections data:', connectionsData);
      console.log(' Connections count:', connectionsData.length);
      
      setConnections(connectionsData);
      
    } catch (error: unknown) {
      console.error('Failed to load connections:', error);
      setConnections([]);
    }
  };

  const refreshCredentials = async () => {
    try {
      if (!bobAgent.isInitialized) {
        console.log('Bob agent not initialized, skipping credentials refresh');
        setCredentials([]);
        return;
      }

      let response;
      try {
        response = await apiService.getBobCredentials();
      } catch (error) {
        response = await apiService.getCredentials('bob');
      }
      
      console.log('📦 Raw credentials API response:', response);
      const credentialsData = extractDataFromResponse(response) as Credential[];
      console.log('✅ Processed credentials data:', credentialsData);
      setCredentials(credentialsData);
      
    } catch (error: unknown) {
      console.error('Failed to load credentials:', error);
      setCredentials([]);
    }
  };

  const refreshProofs = async () => {
    try {
      if (!acmeAgent.isInitialized) {
        console.log('Acme agent not initialized, skipping proofs refresh');
        setProofs([]);
        return;
      }

      const response = await apiService.getProofRecords('acme');
      console.log(' Raw proofs API response:', response);
      const proofsData = extractDataFromResponse(response) as ProofRecord[];
      console.log('Processed proofs data:', proofsData);
      setProofs(proofsData);
      
    } catch (error: unknown) {
      console.error('Failed to load proofs:', error);
      setProofs([]);
    }
  };


  const generateDID = async (data: { method: string; namespace: string; did: string; seed: string }) => {
    try {
      const result = await generateDIDApi(apiService.didGenerate(data));
      
      const newDID: DID = {
        did: result.data?.ledgerDid || `did:${data.method}:${data.namespace}:${data.did}`,
        method: data.method,
        seed: data.seed,
        createdAt: new Date().toISOString(),
      };
      
      setDids(prev => [newDID, ...prev]);
      return result;
    } catch (error: unknown) {
      console.error('Failed to generate DID:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate DID');
    }
  };

  const registerSchema = async (data: { issuerId: string }) => {
    try {
      const result = await registerSchemaApi(apiService.registerSchema(data));
      
      const newSchema: Schema = {
        schemaId: result.data?.schemaState?.schemaId || 'Unknown Schema ID',
        name: 'CDB_Login',
        version: '1.0',
        issuerId: data.issuerId,
        createdAt: new Date().toISOString(),
      };
      
      setSchemas(prev => [newSchema, ...prev]);
      return result;
    } catch (error: unknown) {
      console.error('Failed to register schema:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to register schema');
    }
  };

  const registerCredentialDefinition = async (data: { issuerId: string; schemaId: string }) => {
    try {
      const result = await registerCredDefApi(apiService.registerCredentialDefinition(data));
      
      const newCredDef: CredentialDefinition = {
        credentialDefinitionId: result.data?.credentialDefinitionState?.credentialDefinitionId || 'Unknown CredDef ID',
        schemaId: data.schemaId,
        tag: 'CDBLogin',
        issuerId: data.issuerId,
        createdAt: new Date().toISOString(),
      };
      
      setCredentialDefinitions(prev => [newCredDef, ...prev]);
      return result;
    } catch (error: unknown) {
      console.error('Failed to register credential definition:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to register credential definition');
    }
  };


  // const resetState = () => {
  //   console.log('Resetting all state...');
  //   setConnections([]);
  //   setCredentials([]);
  //   setProofs([]);
  //   setCurrentInvitation(null);
  //   setAcmeAgent({ isInitialized: false, label: '', endpoints: [] });
  //   setBobAgent({ isInitialized: false, label: '', endpoints: [] });
  //   setDids([]);
  //   setSchemas([]);
  //   setCredentialDefinitions([]);


  //   localStorage.removeItem('ssi-connections');
  //   localStorage.removeItem('ssi-credentials');
  //   localStorage.removeItem('ssi-proofs');
  //   localStorage.removeItem('ssi-acme-agent');
  //   localStorage.removeItem('ssi-bob-agent');
  //   localStorage.removeItem('ssi-current-invitation');
  //   localStorage.removeItem('ssi-dids');
  //   localStorage.removeItem('ssi-schemas');
  //   localStorage.removeItem('ssi-credential-definitions');


  // };

  // FIXED: Load initial data from localStorage ONLY, don't call APIs automatically
  useEffect(() => {
    const loadInitialData = () => {
      console.log('🔄 Loading initial data from localStorage...');
      
      try {
        // Load all data from localStorage
        const savedConnections = localStorage.getItem('ssi-connections');
        const savedCredentials = localStorage.getItem('ssi-credentials');
        const savedProofs = localStorage.getItem('ssi-proofs');
        const savedInvitation = localStorage.getItem('ssi-current-invitation');
        const savedDids = localStorage.getItem('ssi-dids');
        const savedSchemas = localStorage.getItem('ssi-schemas');
        const savedCredDefs = localStorage.getItem('ssi-credential-definitions');
        
        if (savedConnections) {
          setConnections(JSON.parse(savedConnections));
          console.log(' Loaded connections from localStorage');
        }
        if (savedCredentials) {
          setCredentials(JSON.parse(savedCredentials));
          console.log(' Loaded credentials from localStorage');
        }
        if (savedProofs) {
          setProofs(JSON.parse(savedProofs));
          console.log(' Loaded proofs from localStorage');
        }
        if (savedInvitation) {
          setCurrentInvitation(JSON.parse(savedInvitation));
          console.log(' Loaded invitation from localStorage');
        }


        if (savedDids) {
          setDids(JSON.parse(savedDids));
          console.log('Loaded DIDs from localStorage');
        }
        if (savedSchemas) {
          setSchemas(JSON.parse(savedSchemas));
          console.log(' Loaded schemas from localStorage');
        }
        if (savedCredDefs) {
          setCredentialDefinitions(JSON.parse(savedCredDefs));
          console.log(' Loaded credential definitions from localStorage');
        }
        
        console.log(' Initial state loaded:', {
          connections: JSON.parse(savedConnections || '[]').length,
          credentials: JSON.parse(savedCredentials || '[]').length,
          proofs: JSON.parse(savedProofs || '[]').length,
          acmeInitialized: acmeAgent.isInitialized,
          bobInitialized: bobAgent.isInitialized
        });
        
      } catch (error) {
        console.error('Error loading initial data from localStorage:', error);
      } finally {
        setIsInitialized(true);
        console.log(' Initial data loading complete');
      }
    };

    loadInitialData();
  }, []); // Empty dependency array - only run once on mount

  return {

    offerCredential: async (data: any) => {
      const result = await apiService.offerCredential(data);
      await refreshCredentials();
      return result;
    },

    acceptCredential: async (credentialRecordId: string) => {
      const result = await apiService.acceptCredential(credentialRecordId);
      await refreshCredentials();
      return result;
    },


    // State
    connections,
    credentials,
    proofs,
    currentInvitation,
    agentState,
    acmeAgent,
    bobAgent,
    isInitialized,
    dids,
    schemas,
    credentialDefinitions,

    
    // Loading states
    initializingAcme,
    initializingBob,
    creatingInvitation,
    receivingInvitation,
    loadingConnections,
    loadingCredentials,
    loadingProofs,
    generatingDID,
    registeringSchema,
    registeringCredDef,


    // Actions
    initializeAcme,
    initializeBob,
    createInvitation: handleCreateInvitation,
    clearCurrentInvitation,
    receiveInvitation,
    refreshConnections,
    refreshCredentials,
    refreshProofs,
    // resetState,
    generateDID,
    registerSchema,
    registerCredentialDefinition,
  };
};