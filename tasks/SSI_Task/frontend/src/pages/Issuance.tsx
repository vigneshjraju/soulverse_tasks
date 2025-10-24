// src/pages/issuance.tsx
import React, { useEffect, useState } from 'react';
import { useSSI } from '../hooks/useSSI';
import Button from '../components/ui/Button';
import { Send, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

export const Issuance: React.FC = () => {
  const {
    connections,
    credentialDefinitions,
    refreshConnections,
    acmeAgent,
  } = useSSI();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    connectionId: '',
    credentialDefinitionId: '',
    attributes: [
      { name: 'Name', value: '' },
      { name: 'Email ID', value: '' },
      { name: 'Organisation Name', value: '' },
      { name: 'Organisation ID', value: '' },
      { name: 'Role', value: '' },
    ],
  });

  useEffect(() => {
    refreshConnections();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    const updated = [...formData.attributes];
    updated[index].value = value;
    setFormData(prev => ({ ...prev, attributes: updated }));
  };

  const handleIssueCredential = async () => {
    setLoading(true);
    try {
      const data = {
        connectionId: formData.connectionId,
        credentialDefinitionId: formData.credentialDefinitionId,
        attributes: formData.attributes.filter(attr => attr.value.trim() !== ''),
        protocolVersion: 'v2' as const,
      };

      await apiService.offerCredential(data);
      alert('Credential offered successfully');
      setStep(1);
      setFormData(prev => ({
        ...prev,
        connectionId: '',
        credentialDefinitionId: '',
        attributes: prev.attributes.map(attr => ({ ...attr, value: '' })),
      }));
    } catch (error: any) {
      alert(`Failed to issue credential: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  
  const canProceed = () => {
    if (step === 1) return formData.connectionId && formData.credentialDefinitionId;
    if (step === 2) return formData.attributes.some(attr => attr.value.trim().length > 0);
    return true;
  };

  if (!acmeAgent.isInitialized) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Acme Agent Not Initialized</h3>
        <p className="mt-2 text-sm text-gray-500">
          Please initialize the Acme agent to proceed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Issue Credentials</h1>
          <p className="text-sm text-gray-500">Issue verifiable credentials</p>
        </div>
        <Button onClick={refreshConnections} variant="secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[1, 2, 3].map(stepNumber => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= stepNumber
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-24 h-1 mx-4 ${
                    step > stepNumber ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-2xl mx-auto mt-2 text-sm text-gray-500">
          <span>Select Connection</span>
          <span>Enter Attributes</span>
          <span>Review & Issue</span>
        </div>
      </div>

      {/* Step 1: Select Connection & Credential Definition */}
      {step === 1 && (
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Select Connection</h3>
          <div className="space-y-4">
            {connections.filter(c => c.state === 'complete').map(conn => (
              <div
                key={conn.id}
                className={`border p-4 rounded-lg cursor-pointer ${
                  formData.connectionId === conn.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'hover:border-indigo-300 border-gray-200'
                }`}
                onClick={() => setFormData({ ...formData, connectionId: conn.id })}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{conn.theirLabel || 'Unknown Agent'}</p>
                    <p className="text-sm text-gray-500 truncate">{conn.id}</p>
                  </div>
                  {formData.connectionId === conn.id && (
                    <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Credential Definition</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.credentialDefinitionId}
              onChange={(e) => setFormData({ ...formData, credentialDefinitionId: e.target.value })}
            >
              <option value="">-- Select Credential Definition --</option>
              {credentialDefinitions.map(def => (
                <option key={def.credentialDefinitionId} value={def.credentialDefinitionId}>
                  {def.tag} ({def.credentialDefinitionId.slice(0, 25)}...)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Enter Attributes */}
      {step === 2 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enter Credential Attributes</h3>
          <div className="space-y-4">
            {formData.attributes.map((attr, index) => (
              <div key={attr.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{attr.name}</label>
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={`Enter ${attr.name.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-medium">Review Credential</h3>
          <div>
            <span className="font-medium">Connection:</span>{' '}
            {connections.find(c => c.id === formData.connectionId)?.theirLabel || 'Unknown'}
          </div>
          <div>
            <span className="font-medium">Credential Definition:</span>
            <div className="text-sm text-gray-600">
              {formData.credentialDefinitionId.slice(0, 60)}...
            </div>
          </div>
          <div>
            <span className="font-medium">Attributes:</span>
            <ul className="text-gray-600 list-disc ml-6">
              {formData.attributes
                .filter(attr => attr.value.trim() !== '')
                .map(attr => (
                  <li key={attr.name}>
                    {attr.name}: {attr.value}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={step === 1}>
          Previous
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Next
          </Button>
        ) : (
          <Button
            onClick={handleIssueCredential}
            loading={loading}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Issue Credential
          </Button>
        )}
      </div>
    </div>
  );
};