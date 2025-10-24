// src/pages/verification.tsx
import React, { useState, useEffect } from 'react';
import { useSSI } from '../hooks/useSSI';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { ShieldCheck, RefreshCw, Play, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../services/api';

export const Verification: React.FC = () => {
  const {
    connections,
    proofs,
    credentialDefinitions,
    refreshConnections,
    refreshProofs,
    acmeAgent,
  } = useSSI();

  const [selectedConnection, setSelectedConnection] = useState('');
  const [selectedCredDef, setSelectedCredDef] = useState('');
  const [requestingProof, setRequestingProof] = useState(false);
  const [verifyingProof, setVerifyingProof] = useState('');

  useEffect(() => {
    refreshConnections();
    refreshProofs();
  }, []);

  const handleRequestProof = async () => {
    if (!selectedConnection || !selectedCredDef) {
      alert('Please select a connection and a credential definition.');
      return;
    }

    setRequestingProof(true);
    try {
      await apiService.requestProof({
        connectionId: selectedConnection,
        credentialDefId: selectedCredDef,
      });
      await refreshProofs();
      alert('Proof request sent.');
    } catch (error: any) {
      alert(`Error sending proof request: ${error.message}`);
    } finally {
      setRequestingProof(false);
    }
  };

  const handleVerifyProof = async (proofRecordId: string) => {
    setVerifyingProof(proofRecordId);
    try {
      await apiService.verifyProof(proofRecordId);
      await refreshProofs();
      alert('Proof verified successfully.');
    } catch (error: any) {
      alert(`Error verifying proof: ${error.message}`);
    } finally {
      setVerifyingProof('');
    }
  };

  const activeConnections = connections.filter(c =>
    ['complete', 'responded'].includes(c.state),
  );

  if (!acmeAgent.isInitialized) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Acme Agent Not Initialized</h3>
        <p className="mt-2 text-sm text-gray-500">
          Please initialize the Acme agent to proceed with verification.
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
          <p className="text-sm text-gray-500">Request and verify proof presentations</p>
        </div>
        <Button onClick={refreshProofs} variant="secondary">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Request Section */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Request Proof</h3>

        <div>
          <label className="block text-sm font-medium mb-2">Select Connection</label>
          <select
            value={selectedConnection}
            onChange={(e) => setSelectedConnection(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Choose a connection</option>
            {activeConnections.map(conn => (
              <option key={conn.id} value={conn.id}>
                {conn.theirLabel || conn.id.slice(0, 10)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select Credential Definition</label>
          <select
            value={selectedCredDef}
            onChange={(e) => setSelectedCredDef(e.target.value)}
            className="w-full px-3 py-2 border"
          >
            <option value="">Choose credential definition</option>
            {credentialDefinitions.map(cd => (
              <option key={cd.credentialDefinitionId} value={cd.credentialDefinitionId}>
                {cd.tag} ({cd.credentialDefinitionId.slice(0, 25)}...)
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleRequestProof}
          disabled={!selectedConnection || !selectedCredDef}
          loading={requestingProof}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Request Proof
        </Button>
      </div>

      {/* Proof History */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Proof History</h3>
          {proofs.length === 0 ? (
            <p className="text-gray-500 text-center mt-4">No proof records.</p>
          ) : (
            proofs.map(proof => (
              <div key={proof.id} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">
                    Proof {proof.id.slice(0, 10)}...
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(proof.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={proof.state} />
                  {proof.isVerified ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Verified
                    </span>
                  ) : proof.state === 'presentation-received' ? (
                    <Button
                      size="sm"
                      loading={verifyingProof === proof.id}
                      onClick={() => handleVerifyProof(proof.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Verify
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};