import React, { useEffect, useState } from 'react';
import { useSSI } from '../hooks/useSSI';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import {RefreshCw,Play,CheckCircle,Timer,Eye,} from 'lucide-react';
import { apiService } from '../services/api';
import type { ProofRecord } from '../types';

export const Verification: React.FC = () => {
  const {
    connections,
    acmeAgent,
    bobAgent,
    refreshConnections,
  } = useSSI();

  const [proofs, setProofs] = useState<ProofRecord[]>([]);
  const [agentView, setAgentView] = useState<'acme' | 'bob'>('acme');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [manualCredDefId, setManualCredDefId] = useState('');
  const [requestingProof, setRequestingProof] = useState(false);
  const [verifyingProof, setVerifyingProof] = useState('');
  const [presentingProof, setPresentingProof] = useState('');
  const [revealedAttrs, setRevealedAttrs] = useState<{ name: string; value: string }[] | null>(null);

  const isAcme = agentView === 'acme';
  const activeConnections = connections.filter((c) =>
    ['complete', 'completed', 'responded'].includes(c.state)
  );

  useEffect(() => {
    refreshConnections();
  }, []);

  useEffect(() => {
    fetchProofRecords();
  }, [agentView]);

  const fetchProofRecords = async () => {
    try {
      const result = await apiService.getProofRecords(agentView);
      setProofs(result);
    } catch (err: any) {
      alert(' Failed to fetch proof records: ' + err.message);
    }
  };

  const handleRequestProof = async () => {
    if (!selectedConnection || !manualCredDefId) {
      alert('Please select a connection and enter a credential definition ID.');
      return;
    }

    setRequestingProof(true);
    try {
      await apiService.requestProof({
        connectionId: selectedConnection,
        credentialDefId: manualCredDefId.trim(),
      });
      alert(' Proof request sent.');
      fetchProofRecords();
    } catch (err: any) {
      alert(' Request failed: ' + err.message);
    } finally {
      setRequestingProof(false);
    }
  };

  const handleAcceptAndPresentProof = async (proofId: string) => {
    setPresentingProof(proofId);
    try {
      await apiService.acceptAndPresentProof(proofId);
      alert(' Proof presented.');
      fetchProofRecords();
    } catch (err: any) {
      alert(' Presentation failed: ' + err.message);
    } finally {
      setPresentingProof('');
    }
  };

  const handleVerifyProof = async (proofId: string) => {
    setVerifyingProof(proofId);
    try {
      await apiService.verifyProof(proofId);
      alert(' Proof verified.');
      fetchProofRecords();
    } catch (err: any) {
      alert(' Verification failed: ' + err.message);
    } finally {
      setVerifyingProof('');
    }
  };

  const handleViewAttributes = async (proofId: string) => {
    try {
      const response = await apiService.getProofById(proofId);

      console.log(' FULL /verification/proof-record/:id response:');
      console.log(response);

      const attrs = response.data?.revealedAttributes ?? {};

      // Log the raw structure
      console.log(' Revealed Attributes:', attrs);

      const mappedAttrs = Object.entries(attrs).map(([key, item]: [string, any]) => ({
        name: item.raw ? key.replace(/_ref$/, '').replace(/_/g, ' ') : key,
        value: item.raw || item.value || 'N/A',
      }));

      setRevealedAttrs(mappedAttrs);
    } catch (err: any) {
      alert(' Failed to fetch proof details: ' + err.message);
    }
  };

  const agentInitialized = isAcme ? acmeAgent.isInitialized : bobAgent.isInitialized;

  if (!agentInitialized) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Agent not initialized
        </h3>
        <p className="text-sm text-gray-500">
          Please initialize {isAcme ? 'Acme' : 'Bob'} agent to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verification</h1>
          <p className="text-sm text-gray-500">
            Request and verify proof presentations
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant={agentView === 'acme' ? 'primary' : 'secondary'}
            onClick={() => setAgentView('acme')}
          >
            Acme
          </Button>
          <Button
            variant={agentView === 'bob' ? 'primary' : 'secondary'}
            onClick={() => setAgentView('bob')}
          >
            Bob
          </Button>
          <Button onClick={fetchProofRecords} variant="secondary">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Request Proof */}
      {isAcme && (
        <div className="bg-white shadow p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-medium">Request Proof</h3>
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Connection
            </label>
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose a connection</option>
              {activeConnections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.theirLabel || conn.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Credential Definition ID
            </label>
            <input
              value={manualCredDefId}
              onChange={(e) => setManualCredDefId(e.target.value)}
              placeholder="Paste credentialDefinitionId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <Button
            onClick={handleRequestProof}
            disabled={requestingProof || !selectedConnection || !manualCredDefId}
            loading={requestingProof}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Request Proof
          </Button>
        </div>
      )}

      {/* Proof History List */}
      <div className="bg-white shadow p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Proof History</h3>
        {proofs.length === 0 ? (
          <p className="text-gray-500">No proof records available.</p>
        ) : (
          <div className="space-y-4">
            {proofs.map((proof) => (
              <div
                key={proof.id}
                className="border p-4 rounded-lg flex justify-between items-start"
              >
                <div>
                  <p className="text-sm font-semibold text-indigo-700">
                    Proof ID: {proof.id.slice(0, 12)}...
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(proof.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Connection ID: {proof.connectionId}
                  </p>
                </div>

                <div className="space-y-2 text-right min-w-[160px]">
                  <StatusBadge status={proof.state} />

                  {proof.isVerified ? (
                    <div className="space-y-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block">
                        ✅ Verified
                      </span>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewAttributes(proof.id)}
                        className="w-full"
                      >
                        Show Attributes
                      </Button>
                    </div>
                  ) : (
                    <>
                      {proof.state === 'request-received' && agentView === 'bob' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAcceptAndPresentProof(proof.id)}
                          loading={presentingProof === proof.id}
                        >
                          <Timer className="w-4 h-4" />
                          Present
                        </Button>
                      )}

                      {proof.state === 'presentation-received' && agentView === 'acme' && (
                        <div className="space-y-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleViewAttributes(proof.id)}
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>

                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleVerifyProof(proof.id)}
                            loading={verifyingProof === proof.id}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Verify
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revealed Attributes Modal */}
      {revealedAttrs && (
          <div className="bg-white border p-6 rounded shadow">
            <h3 className="text-md font-semibold text-gray-900 mb-2">
              Revealed Attributes
            </h3>

            {revealedAttrs.length > 0 ? (
              <ul className="text-sm text-gray-700 space-y-1">
                {revealedAttrs.map((attr, idx) => (
                  <li key={idx}>
                    <strong>{attr.name}</strong>: {attr.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">⚠️ No attributes revealed</p>
            )}

            <div className="mt-3 flex justify-end">
              <Button variant="secondary" onClick={() => setRevealedAttrs(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
    </div>
  );
};