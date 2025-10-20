// hooks/useSSI.ts
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Connection, Credential, ProofRecord, AgentState, AgentResponse } from '../types';
import { useApi } from './useApi';

export const useSSI = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [proofs, setProofs] = useState<ProofRecord[]>([]);
  
  // Track both agents separately
  const [acmeAgent, setAcmeAgent] = useState<AgentState>({
    isInitialized: false,
    label: '',
    endpoints: []
  });
  
  const [bobAgent, setBobAgent] = useState<AgentState>({
    isInitialized: false,
    label: '', 
    endpoints: []
  });

  // Combined agent state for UI
  const agentState = {
    isInitialized: acmeAgent.isInitialized || bobAgent.isInitialized,
    label: acmeAgent.isInitialized ? acmeAgent.label : bobAgent.label,
    endpoints: acmeAgent.isInitialized ? acmeAgent.endpoints : bobAgent.endpoints,
    bothInitialized: acmeAgent.isInitialized && bobAgent.isInitialized
  };

  const { execute: initializeAcmeAgent, loading: initializingAcme, data: acmeData } = useApi<AgentResponse>();
  const { execute: initializeBobAgent, loading: initializingBob, data: bobData } = useApi<AgentResponse>();
  const { execute: createInvitationApi, loading: creatingInvitation, data: invitationData } = useApi<any>();
  const { execute: receiveInvitationApi, loading: receivingInvitation, data: receiveInvitationData } = useApi<any>();
  const { execute: loadConnections, loading: loadingConnections } = useApi<Connection[]>();
  const { execute: loadCredentials, loading: loadingCredentials } = useApi<Credential[]>();
  const { execute: loadProofs, loading: loadingProofs } = useApi<ProofRecord[]>();

  // Initialize Acme Agent only
  const initializeAcme = async () => {
    try {
      console.log('Initializing Acme agent...');
      const result = await initializeAcmeAgent(apiService.initializeAcmeAgent());
      console.log('Acme agent initialized:', result);
      
      setAcmeAgent({
        isInitialized: true,
        label: result.data?.config?.label || 'demo-agent-acme',
        endpoints: result.data?.config?.endpoints || []
      });

      // Load connections after Acme is initialized
      await refreshConnections();
      
    } catch (error) {
      console.error('Failed to initialize Acme agent:', error);
      setAcmeAgent({ isInitialized: false, label: '', endpoints: [] });
      throw error;
    }
  };

  // Initialize Bob Agent only
  const initializeBob = async () => {
    try {
      console.log('Initializing Bob agent...');
      const result = await initializeBobAgent(apiService.initializeBobAgent());
      console.log('Bob agent initialized:', result);
      
      setBobAgent({
        isInitialized: true,
        label: result.data?.config?.label || 'docs-agent-Bob',
        endpoints: result.data?.config?.endpoints || []
      });

      // Load credentials after Bob is initialized
      await refreshCredentials();
      
    } catch (error) {
      console.error('Failed to initialize Bob agent:', error);
      setBobAgent({ isInitialized: false, label: '', endpoints: [] });
      throw error;
    }
  };

  // Receive invitation (Bob agent accepts invitation from Acme)
  const receiveInvitation = async (invitationUrl: string) => {
    try {
      console.log('Receiving invitation...', invitationUrl);
      const result = await receiveInvitationApi(apiService.receiveInvitation(invitationUrl));
      console.log('Invitation received successfully:', result);
      
      // Refresh connections to show the new connection
      await refreshConnections();
      await refreshCredentials();
      
      return result;
    } catch (error) {
      console.error('Failed to receive invitation:', error);
      throw error;
    }
  };

  const handleCreateInvitation = async () => {
    try {
      const result = await createInvitationApi(apiService.createInvitation());
      console.log('Invitation created:', result);
      await refreshConnections();
      return result;
    } catch (error) {
      console.error('Failed to create invitation:', error);
      throw error;
    }
  };

  const refreshConnections = async () => {
    try {
      const response = await loadConnections(apiService.getConnections('acme'));
      if (response && Array.isArray(response)) {
        setConnections(response);
      } else {
        setConnections([]);
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
      setConnections([]);
    }
  };

  const refreshCredentials = async () => {
    try {
      const response = await loadCredentials(apiService.getCredentials('bob'));
      if (response && Array.isArray(response)) {
        setCredentials(response);
      } else {
        setCredentials([]);
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
      setCredentials([]);
    }
  };

  const refreshProofs = async () => {
    try {
      const response = await loadProofs(apiService.getProofRecords('acme'));
      if (response && Array.isArray(response)) {
        setProofs(response);
      } else {
        setProofs([]);
      }
    } catch (error) {
      console.error('Failed to load proofs:', error);
      setProofs([]);
    }
  };

  // Load initial data when agents are initialized
  useEffect(() => {
    if (agentState.isInitialized) {
      refreshConnections();
      refreshCredentials();
      refreshProofs();
    }
  }, [agentState.isInitialized]);

  return {
    // State
    connections,
    credentials,
    proofs,
    agentState,
    acmeAgent,
    bobAgent,
    
    // Loading states
    initializingAcme,
    initializingBob,
    creatingInvitation,
    receivingInvitation,
    loadingConnections,
    loadingCredentials,
    loadingProofs,

    // Data
    invitationData,
    receiveInvitationData,

    // Actions
    initializeAcme,
    initializeBob,
    createInvitation: handleCreateInvitation,
    receiveInvitation,
    refreshConnections,
    refreshCredentials,
    refreshProofs,
  };
};