import React from 'react';
import { useSSI } from '../hooks/useSSI';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { FileText, Download, Eye, RefreshCw } from 'lucide-react';
import type { Credential } from '../types';

export const Credentials: React.FC = () => {
  const { 
    credentials, 
    loadingCredentials, 
    refreshCredentials 
  } = useSSI();

  const handleViewCredential = (credential: Credential) => {
    console.log('View credential:', credential);
    alert(`Credential Details:\nID: ${credential.id}\nState: ${credential.state}\nAttributes: ${JSON.stringify(credential.credentialAttributes, null, 2)}`);
  };

  const handleExportCredential = (credential: Credential) => {
    const blob = new Blob([JSON.stringify(credential, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `credential-${credential.id}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credentials</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your verifiable credentials</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={refreshCredentials}
          loading={loadingCredentials}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {credentials.map((credential) => (
          <div key={credential.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {credential.credentialAttributes?.[0]?.value || 'Unknown Credential'}
                    </h3>
                    <StatusBadge status={credential.state} />
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm text-gray-500">
                  <p className="truncate">ID: {credential.id.substring(0, 20)}...</p>
                  <p>Protocol: {credential.protocolVersion}</p>
                  <p>Created: {new Date(credential.createdAt).toLocaleDateString()}</p>
                </div>
                
                {credential.credentialAttributes && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700">Attributes:</h4>
                    <ul className="mt-1 text-sm text-gray-600">
                      {credential.credentialAttributes.slice(0, 3).map((attr, index) => (
                        <li key={index} className="truncate">
                          {attr.name}: {attr.value}
                        </li>
                      ))}
                      {credential.credentialAttributes.length > 3 && (
                        <li className="text-gray-400">
                          +{credential.credentialAttributes.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => handleViewCredential(credential)}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleExportCredential(credential)}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {credentials.length === 0 && !loadingCredentials && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No credentials</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by issuing a credential.</p>
        </div>
      )}

      {loadingCredentials && (
        <div className="text-center py-12">
          <RefreshCw className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
          <p className="mt-2 text-sm text-gray-500">Loading credentials...</p>
        </div>
      )}
    </div>
  );
};