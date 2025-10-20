import React, { useState, useEffect } from 'react';
import { useSSI } from '../hooks/useSSI';
import Button from '../components/ui/Button';
import { Send, RefreshCw } from 'lucide-react'; //Plus
import { apiService } from '../services/api';
// import type { Connection } from '../types';

export const Issuance: React.FC = () => {
  const { connections, refreshConnections } = useSSI();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    connectionId: '',
    credentialDefinitionId: 'did:indy:bcovrin:test:QZbPJxNuvDWMHqsqCMFMLs/anoncreds/v0/CLAIM_DEF/2934900/CDBLogin',
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
    const newAttributes = [...formData.attributes];
    newAttributes[index].value = value;
    setFormData({ ...formData, attributes: newAttributes });
  };

  const handleIssueCredential = async () => {
    setLoading(true);
    try {
      await apiService.offerCredential({
        protocolVersion: 'v2',
        connectionId: formData.connectionId,
        credentialDefinitionId: formData.credentialDefinitionId,
        attributes: formData.attributes.filter(attr => attr.value.trim() !== ''),
      });
      
      alert('Credential offered successfully!');
      setStep(1);
      setFormData({
        connectionId: '',
        credentialDefinitionId: 'did:indy:bcovrin:test:QZbPJxNuvDWMHqsqCMFMLs/anoncreds/v0/CLAIM_DEF/2934900/CDBLogin',
        attributes: [
          { name: 'Name', value: '' },
          { name: 'Email ID', value: '' },
          { name: 'Organisation Name', value: '' },
          { name: 'Organisation ID', value: '' },
          { name: 'Role', value: '' },
        ],
      });
    } catch (error: any) {
      alert(`Failed to issue credential: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.connectionId !== '';
      case 2:
        return formData.attributes.some(attr => attr.value.trim() !== '');
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Issue Credentials</h1>
          <p className="mt-1 text-sm text-gray-500">Issue verifiable credentials to connections</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={refreshConnections}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Connections
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[1, 2, 3].map((stepNumber) => (
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

      {/* Step 1: Select Connection */}
      {step === 1 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Connection</h3>
          <div className="space-y-4">
            {connections.filter(conn => conn.state === 'complete').map((connection) => (
              <div
                key={connection.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  formData.connectionId === connection.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => setFormData({ ...formData, connectionId: connection.id })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {connection.theirLabel || 'Unknown Agent'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{connection.id}</p>
                  </div>
                  {formData.connectionId === connection.id && (
                    <div className="w-3 h-3 rounded-full bg-indigo-600" />
                  )}
                </div>
              </div>
            ))}
            {connections.filter(conn => conn.state === 'complete').length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No active connections available. Create a connection first.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Enter Attributes */}
      {step === 2 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enter Credential Attributes</h3>
          <div className="space-y-4">
            {formData.attributes.map((attribute, index) => (
              <div key={attribute.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {attribute.name}
                </label>
                <input
                  type="text"
                  value={attribute.value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Enter ${attribute.name.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Review Credential</h3>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Connection:</span>{' '}
              <span className="text-gray-600">
                {connections.find(c => c.id === formData.connectionId)?.theirLabel || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Credential Definition:</span>{' '}
              <span className="text-gray-600 text-sm">
                {formData.credentialDefinitionId.substring(0, 50)}...
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Attributes:</span>
              <ul className="mt-1 space-y-1">
                {formData.attributes
                  .filter(attr => attr.value.trim() !== '')
                  .map((attr, index) => (
                    <li key={index} className="text-gray-600">
                      {attr.name}: {attr.value}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          Previous
        </Button>
        
        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
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