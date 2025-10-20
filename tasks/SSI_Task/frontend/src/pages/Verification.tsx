import React, { useState } from 'react';
import { useSSI } from '../hooks/useSSI';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { ShieldCheck, RefreshCw, Play, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../services/api';
// import type{ ProofRecord } from '../types';

export const Verification: React.FC = () => {
  const { 
    connections, 
    proofs, 
    refreshConnections, 
    refreshProofs 
  } = useSSI();

  const [selectedConnection, setSelectedConnection] = useState('');
  const [requestingProof, setRequestingProof] = useState(false);
  const [verifyingProof, setVerifyingProof] = useState('');

  const handleRequestProof = async () => {
    if (!selectedConnection) return;
    
    setRequestingProof(true);
    try {
      await apiService.requestProof({
        connectionId: selectedConnection,
        credentialDefId: 'did:indy:bcovrin:test:QZbPJxNuvDWMHqsqCMFMLs/anoncreds/v0/CLAIM_DEF/2934900/CDBLogin',
      });
      await refreshProofs();
      alert('Proof request sent successfully!');
    } catch (error: any) {
      alert(`Failed to request proof: ${error.message}`);
    } finally {
      setRequestingProof(false);
    }
  };

  const handleVerifyProof = async (proofRecordId: string) => {
    setVerifyingProof(proofRecordId);
    try {
      await apiService.verifyProof(proofRecordId);
      await refreshProofs();
      alert('Proof verified successfully!');
    } catch (error: any) {
      alert(`Failed to verify proof: ${error.message}`);
    } finally {
      setVerifyingProof('');
    }
  };

  const activeConnections = connections.filter(conn => conn.state === 'complete');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verification</h1>
          <p className="mt-1 text-sm text-gray-500">Request and verify proof presentations</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={refreshConnections}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Request Proof Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Request Proof</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Connection
            </label>
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choose a connection</option>
              {activeConnections.map((connection) => (
                <option key={connection.id} value={connection.id}>
                  {connection.theirLabel || connection.id.substring(0, 20)}...
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requested Attributes
            </label>
            <div className="bg-gray-50 rounded-md p-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Name</li>
                <li>• Email ID</li>
                <li>• Organisation Name</li>
                <li>• Role</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={handleRequestProof}
            loading={requestingProof}
            disabled={!selectedConnection}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Request Proof
          </Button>
        </div>
      </div>

      {/* Proof History Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Proof History</h3>
        </div>
        <div className="p-4">
          {proofs.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No proof requests</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by requesting a proof.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proofs.map((proof) => (
                <div key={proof.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {proof.isVerified ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : proof.state === 'done' ? (
                        <XCircle className="h-6 w-6 text-red-500" />
                      ) : (
                        <ShieldCheck className="h-6 w-6 text-blue-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Proof {proof.id.substring(0, 16)}...
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(proof.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <StatusBadge status={proof.state} />
                      
                      {proof.isVerified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                      
                      {proof.state === 'presentation-received' && !proof.isVerified && (
                        <Button
                          variant="primary"
                          size="sm"
                          loading={verifyingProof === proof.id}
                          onClick={() => handleVerifyProof(proof.id)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};