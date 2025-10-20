import React, { useState } from 'react';
import Button from '../components/ui/Button';
import { Initialization } from '../components/Initialization';
import { Users, FileText, ShieldCheck, Plus, Link, CheckCircle, Clock, RefreshCw, Key, MessageSquare } from 'lucide-react';
import { useSSIContext } from '../hooks/SSIContext';

export const Dashboard: React.FC = () => {
  const { 
    connections, 
    credentials, 
    proofs, 
    agentState,
    acmeAgent,
    bobAgent,
    initializingAcme,
    initializingBob,
    creatingInvitation, 
    createInvitation,
    initializeAcme,
    initializeBob,
    refreshConnections,
    refreshCredentials,
    refreshProofs,
    receiveInvitation,
    receivingInvitation
  } = useSSIContext();

  const [invitationUrl, setInvitationUrl] = useState('');
  const [showInvitationInput, setShowInvitationInput] = useState(false);

  const handleCreateInvitation = async () => {
    try {
      await createInvitation();
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

  const handleRefreshAll = async () => {
    await refreshConnections();
    await refreshCredentials();
    await refreshProofs();
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    description 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string;
    description?: string;
  }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md bg-${color}-500`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-semibold text-gray-900">{value}</dd>
              {description && (
                <dd className="text-xs text-gray-400 mt-1">{description}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const activeConnections = connections.filter(c => c.state === 'complete' || c.state === 'responded').length;
  const pendingConnections = connections.filter(c => c.state === 'invited' || c.state === 'requested').length;
  const issuedCredentials = credentials.filter(c => c.state === 'done' || c.state === 'credential-received').length;
  const verifiedProofs = proofs.filter(p => p.isVerified).length;

  // Check if we can create invitations (requires Acme agent)
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
          <h1 className="text-3xl font-bold text-gray-900">SSI Agent Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage your Self-Sovereign Identity agents and interactions
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            onClick={handleRefreshAll}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh All
          </Button>
          <Button 
            onClick={handleCreateInvitation} 
            loading={creatingInvitation}
            disabled={!canCreateInvitations}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Invitation
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

      {/* Show content if at least one agent is initialized */}
      {agentState.isInitialized ? (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Connections"
              value={connections.length}
              icon={<Users className="w-6 h-6 text-white" />}
              color="blue"
              description={`${activeConnections} active, ${pendingConnections} pending`}
            />
            <StatCard
              title="Issued Credentials"
              value={credentials.length}
              icon={<FileText className="w-6 h-6 text-white" />}
              color="green"
              description={`${issuedCredentials} successfully issued`}
            />
            <StatCard
              title="Proof Verifications"
              value={proofs.length}
              icon={<ShieldCheck className="w-6 h-6 text-white" />}
              color="purple"
              description={`${verifiedProofs} verified proofs`}
            />
            <StatCard
              title="Agents Online"
              value={(acmeAgent.isInitialized ? 1 : 0) + (bobAgent.isInitialized ? 1 : 0)}
              icon={<CheckCircle className="w-6 h-6 text-white" />}
              color="green"
              description={`${acmeAgent.isInitialized ? 'Acme' : ''} ${bobAgent.isInitialized ? 'Bob' : ''}`.trim()}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Common tasks to get started with SSI workflows
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="primary"
                onClick={handleCreateInvitation}
                disabled={!canCreateInvitations}
                className="flex flex-col items-center justify-center p-4 h-auto"
              >
                <Link className="w-8 h-8 mb-2" />
                <span className="text-sm">Create Invitation</span>
                {!canCreateInvitations && (
                  <span className="text-xs text-gray-500 mt-1">Requires Acme</span>
                )}
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/issuance'}
                disabled={!agentState.bothInitialized || connections.length === 0}
                className="flex flex-col items-center justify-center p-4 h-auto"
              >
                <FileText className="w-8 h-8 mb-2" />
                <span className="text-sm">Issue Credential</span>
                {!agentState.bothInitialized && (
                  <span className="text-xs text-gray-500 mt-1">Requires both agents</span>
                )}
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/verification'}
                disabled={!agentState.bothInitialized || connections.length === 0}
                className="flex flex-col items-center justify-center p-4 h-auto"
              >
                <ShieldCheck className="w-8 h-8 mb-2" />
                <span className="text-sm">Request Proof</span>
                {!agentState.bothInitialized && (
                  <span className="text-xs text-gray-500 mt-1">Requires both agents</span>
                )}
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/dids'}
                disabled={!acmeAgent.isInitialized}
                className="flex flex-col items-center justify-center p-4 h-auto"
              >
                <Key className="w-8 h-8 mb-2" />
                <span className="text-sm">Manage DIDs</span>
                {!acmeAgent.isInitialized && (
                  <span className="text-xs text-gray-500 mt-1">Requires Acme</span>
                )}
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Connections */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Connections</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={refreshConnections}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="p-4">
                {connections.slice(0, 5).map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded px-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        connection.state === 'complete' ? 'bg-green-500' : 
                        connection.state === 'invited' ? 'bg-yellow-500' : 
                        'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {connection.theirLabel || 'Unknown Agent'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(connection.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      connection.state === 'complete' ? 'bg-green-100 text-green-800' : 
                      connection.state === 'invited' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {connection.state}
                    </span>
                  </div>
                ))}
                {connections.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No connections yet</p>
                    <Button 
                      onClick={handleCreateInvitation} 
                      loading={creatingInvitation}
                      disabled={!canCreateInvitations}
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Invitation
                    </Button>
                  </div>
                )}
                {connections.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.location.href = '/connections'}
                    >
                      View All Connections
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Credentials */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Credentials</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={refreshCredentials}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="p-4">
                {credentials.slice(0, 5).map((credential) => (
                  <div key={credential.id} className="py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded px-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {credential.credentialAttributes?.[0]?.value || 'Unknown Credential'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {credential.credentialAttributes?.[1]?.value || 'No additional info'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        credential.state === 'done' ? 'bg-green-100 text-green-800' : 
                        credential.state === 'offer-sent' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {credential.state}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {credential.id}
                    </p>
                  </div>
                ))}
                {credentials.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No credentials issued yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {agentState.bothInitialized ? 'Create a connection first to issue credentials' : 'Initialize both agents to issue credentials'}
                    </p>
                  </div>
                )}
                {credentials.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.location.href = '/credentials'}
                    >
                      View All Credentials
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Status</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${acmeAgent.isInitialized ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-700">Acme Agent</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{acmeAgent.isInitialized ? acmeAgent.label : 'Not Initialized'}</p>
                    <p className="text-xs text-gray-500">Issuer/Verifier</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${bobAgent.isInitialized ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-700">Bob Agent</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{bobAgent.isInitialized ? bobAgent.label : 'Not Initialized'}</p>
                    <p className="text-xs text-gray-500">Holder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <ShieldCheck className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Agents Initialized</h3>
          <p className="mt-2 text-sm text-gray-500">
            Initialize at least one agent to start using the SSI system.
          </p>
          <div className="mt-6 flex gap-4 justify-center">
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
      )}
    </div>
  );
};