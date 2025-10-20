import React, { useState } from 'react';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { Initialization } from '../components/Initialization';
import { Plus, RefreshCw, Users, Copy, CheckCircle, Link, Trash2, Eye, MessageSquare } from 'lucide-react';
import { useSSIContext } from '../hooks/SSIContext';

export const Connections: React.FC = () => {
  const { 
    connections, 
    agentState,
    acmeAgent,
    bobAgent,
    initializingAcme,
    initializingBob,
    creatingInvitation, 
    loadingConnections,
    createInvitation, 
    invitationData,
    initializeAcme,
    initializeBob,
    refreshConnections,
    receiveInvitation,
    receivingInvitation
  } = useSSIContext();

  const [copiedInvitation, setCopiedInvitation] = React.useState<string | null>(null);
  const [copiedConnectionId, setCopiedConnectionId] = React.useState<string | null>(null);
  const [invitationUrl, setInvitationUrl] = useState('');
  const [showInvitationInput, setShowInvitationInput] = useState(false);

  const handleCreateInvitation = async () => {
    try {
      const result = await createInvitation();
      console.log('Invitation created:', result);
      
      if (result?.data?.invitationUrl) {
        navigator.clipboard.writeText(result.data.invitationUrl);
        setCopiedInvitation(result.data.invitationUrl);
        setTimeout(() => setCopiedInvitation(null), 3000);
      }
      
      await refreshConnections();
    } catch (error) {
      console.error('Failed to create invitation:', error);
    }
  };

  const handleReceiveInvitation = async () => {
    if (!invitationUrl.trim()) return;
    
    try {
      await receiveInvitation(invitationUrl);
      setInvitationUrl('');
      setShowInvitationInput(false);
      await refreshConnections();
    } catch (error) {
      console.error('Failed to receive invitation:', error);
    }
  };

  const copyToClipboard = (text: string, type: 'connection' | 'invitation') => {
    navigator.clipboard.writeText(text);
    if (type === 'connection') {
      setCopiedConnectionId(text);
      setTimeout(() => setCopiedConnectionId(null), 2000);
    }
  };

  const getConnectionStatus = (state: string) => {
    switch (state) {
      case 'complete':
      case 'responded':
        return { color: 'green', text: 'Connected', icon: CheckCircle };
      case 'invited':
      case 'requested':
        return { color: 'yellow', text: 'Pending', icon: Clock };
      case 'error':
      case 'failed':
        return { color: 'red', text: 'Failed', icon: XCircle };
      default:
        return { color: 'gray', text: state, icon: Users };
    }
  };

  const activeConnections = connections.filter(c => c.state === 'complete' || c.state === 'responded').length;
  const pendingConnections = connections.filter(c => c.state === 'invited' || c.state === 'requested').length;
  const canCreateInvitations = acmeAgent.isInitialized;
  const canReceiveInvitations = bobAgent.isInitialized;

  return (
    <div className="space-y-6">
      {/* Initialization Component */}
      <Initialization
        acmeAgent={acmeAgent}
        bobAgent={bobAgent}
        initializingAcme={initializingAcme}
        initializingBob={initializingBob}
        onInitializeAcme={initializeAcme}
        onInitializeBob={initializeBob}
      />

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage agent connections and create invitations for other agents
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={refreshConnections}
            loading={loadingConnections}
            disabled={!agentState.isInitialized}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button 
            onClick={handleCreateInvitation} 
            loading={creatingInvitation}
            disabled={!canCreateInvitations}
            className="flex items-center gap-2"
          >
            {copiedInvitation ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Invitation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Receive Invitation Section */}
      {canReceiveInvitations && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">Receive Invitation</p>
                <p className="text-sm text-blue-600">
                  Bob agent can accept invitations from other agents
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowInvitationInput(!showInvitationInput)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {showInvitationInput ? 'Cancel' : 'Receive Invitation'}
            </Button>
          </div>
          
          {showInvitationInput && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={invitationUrl}
                  onChange={(e) => setInvitationUrl(e.target.value)}
                  placeholder="Paste invitation URL here..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  onClick={handleReceiveInvitation}
                  loading={receivingInvitation}
                  disabled={!invitationUrl.trim()}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept
                </Button>
              </div>
              <p className="text-xs text-blue-600">
                Paste an invitation URL generated by another agent to establish a connection
              </p>
            </div>
          )}
        </div>
      )}

      {/* Invitation URL Display */}
      {invitationData?.data?.invitationUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">New Invitation Created</p>
                <p className="text-sm text-green-600 mt-1 truncate max-w-2xl">
                  {invitationData.data.invitationUrl}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(invitationData.data.invitationUrl);
                  setCopiedInvitation(invitationData.data.invitationUrl);
                  setTimeout(() => setCopiedInvitation(null), 3000);
                }}
                className="flex items-center gap-2"
              >
                {copiedInvitation === invitationData.data.invitationUrl ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copy URL
              </Button>
            </div>
          </div>
        </div>
      )}

      {agentState.isInitialized ? (
        <div className="space-y-6">
          {/* Connection Statistics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Connections</dt>
                      <dd className="text-lg font-semibold text-gray-900">{connections.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                      <dd className="text-lg font-semibold text-gray-900">{activeConnections}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="text-lg font-semibold text-gray-900">{pendingConnections}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connections List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">All Connections</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    List of all established and pending connections between agents
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{connections.length} connections</span>
                </div>
              </div>
            </div>
            
            {connections.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {connections.map((connection) => {
                  const statusConfig = getConnectionStatus(connection.state);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <li key={connection.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4 min-w-0 flex-1">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-indigo-600 truncate">
                                  {connection.theirLabel || 'Unknown Agent'}
                                </p>
                                <button
                                  onClick={() => copyToClipboard(connection.id, 'connection')}
                                  className="ml-2 text-gray-400 hover:text-gray-500 transition-colors"
                                  title="Copy Connection ID"
                                >
                                  {copiedConnectionId === connection.id ? (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <span className="truncate font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                  {connection.id.substring(0, 30)}...
                                </span>
                              </div>
                              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                                <span>Created: {new Date(connection.createdAt).toLocaleString()}</span>
                                {connection.theirDid && (
                                  <span className="font-mono">
                                    DID: {connection.theirDid.substring(0, 20)}...
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`h-4 w-4 text-${statusConfig.color}-500`} />
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}>
                                {statusConfig.text}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => copyToClipboard(connection.id, 'connection')}
                                className="flex items-center gap-1"
                              >
                                {copiedConnectionId === connection.id ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                ID
                              </Button>
                              {connection.theirDid && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => copyToClipboard(connection.theirDid!, 'connection')}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  DID
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No connections</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating an invitation.</p>
                <div className="mt-6">
                  <Button 
                    onClick={handleCreateInvitation} 
                    loading={creatingInvitation}
                    disabled={!canCreateInvitations}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Invitation
                  </Button>
                </div>
              </div>
            )}

            {loadingConnections && (
              <div className="text-center py-12">
                <RefreshCw className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
                <p className="mt-2 text-sm text-gray-500">Loading connections...</p>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">About Connections</h3>
                <div className="mt-2 text-sm text-gray-600 space-y-3">
                  <p>
                    <strong>Connections</strong> establish secure communication channels between SSI agents. 
                    They are required for issuing credentials and requesting proofs.
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Create invitations for other agents</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Accept invitations from other agents</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Secure peer-to-peer communication</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Required for credential exchange</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Agents Not Initialized</h3>
          <p className="mt-1 text-sm text-gray-500">
            Initialize both Acme and Bob agents to start managing connections.
          </p>
          <div className="mt-6">
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={initializeAcme}
                loading={initializingAcme}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Initialize Acme
              </Button>
              <Button 
                onClick={initializeBob}
                loading={initializingBob}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Initialize Bob
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Import missing icons
import { Clock, XCircle } from 'lucide-react';