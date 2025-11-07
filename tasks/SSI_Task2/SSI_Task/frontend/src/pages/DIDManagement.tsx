import React, { useState,useEffect } from 'react';
import Button from '../components/ui/Button';
import { Key, Copy, Plus, CheckCircle, FileText, ShieldCheck } from 'lucide-react';
import { useSSIContext } from '../hooks/SSIContext';

export const DIDManagement: React.FC = () => {

  const { 
    refreshConnections,
    refreshCredentials,
    refreshProofs,
    acmeAgent,
    dids, 
    schemas, 
    credentialDefinitions,
    generatingDID,  
    registeringSchema, 
    registeringCredDef,
    isInitialized, 
    generateDID, 
    registerSchema, 
    registerCredentialDefinition 
  } = useSSIContext();

  const [showDIDForm, setShowDIDForm] = useState(false);
  const [showSchemaForm, setShowSchemaForm] = useState(false);
  const [showCredDefForm, setShowCredDefForm] = useState(false);
  
  const [didFormData, setDIDFormData] = useState({
    method: 'indy',
    namespace: 'bcovrin:test',
    did: '',
    seed: '',
  });

  const [schemaFormData, setSchemaFormData] = useState({
    issuerId: '',
  });

  const [credDefFormData, setCredDefFormData] = useState({
    issuerId: '',
    schemaId: '',
  });

  const [copiedId, setCopiedId] = useState('');

  // DID Generation
  const handleGenerateDID = async () => {
    try {
      await generateDID(didFormData);
      setShowDIDForm(false);
      setDIDFormData({
        method: 'indy',
        namespace: 'bcovrin:test',
        did: '',
        seed: '',
      });
      alert('DID generated successfully!');
    } catch (error: any) {
      alert(`Failed to generate DID: ${error.message}`);
    }
  };

  // Schema Registration
  const handleRegisterSchema = async () => {
    try {
      await registerSchema(schemaFormData);
      setShowSchemaForm(false);
      setSchemaFormData({ issuerId: '' });
      alert('Schema registered successfully!');
    } catch (error: any) {
      alert(`Failed to register schema: ${error.message}`);
    }
  };

  // Credential Definition Registration
  const handleRegisterCredentialDefinition = async () => {
    try {
      await registerCredentialDefinition(credDefFormData);
      setShowCredDefForm(false);
      setCredDefFormData({ issuerId: '', schemaId: '' });
      alert('Credential Definition registered successfully!');
    } catch (error: any) {
      alert(`Failed to register credential definition: ${error.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(''), 2000);
  };

  useEffect(() => {
    if (isInitialized && acmeAgent.isInitialized) {
      console.log('🔁 Rehydrating DID page state from context/localStorage...');
      refreshConnections(); // optional
      refreshCredentials(); // optional
      refreshProofs();      // optional
    }
  }, [isInitialized, acmeAgent.isInitialized]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DID & Ledger Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage DIDs, Schemas, and Credential Definitions on the ledger</p>
        </div>
        <Button onClick={() => {
          refreshConnections();
          refreshCredentials();
          refreshProofs();
        }}>
          Refresh All
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Button 
          onClick={() => setShowDIDForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate DID
        </Button>
        <Button 
          onClick={() => setShowSchemaForm(true)}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Register Schema
        </Button>
        <Button 
          onClick={() => setShowCredDefForm(true)}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          Register CredDef
        </Button>
      </div>

      {/* Generate DID Form */}
      {showDIDForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New DID</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Method
              </label>
              <select
                value={didFormData.method}
                onChange={(e) => setDIDFormData({ ...didFormData, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="indy">Indy</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Namespace
              </label>
              <select
                value={didFormData.namespace}
                onChange={(e) => setDIDFormData({ ...didFormData, namespace: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="bcovrin:test">bcovrin:test</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DID (Optional)
              </label>
              <input
                type="text"
                value={didFormData.did}
                onChange={(e) => setDIDFormData({ ...didFormData, did: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Leave empty for auto-generation"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seed
              </label>
              <input
                type="text"
                value={didFormData.seed}
                onChange={(e) => setDIDFormData({ ...didFormData, seed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter 32-character seed"
                required
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDIDForm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateDID}
              loading={generatingDID}  // Fixed: using the correct prop name
              disabled={!didFormData.seed}
            >
              Generate DID
            </Button>
          </div>
        </div>
      )}

      {/* Register Schema Form */}
      {showSchemaForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Register Schema</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuer DID
              </label>
              <input
                type="text"
                value={schemaFormData.issuerId}
                onChange={(e) => setSchemaFormData({ ...schemaFormData, issuerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="did:indy:bcovrin:test:PCwxM24d87tKgAy8kaWyUf"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use a DID you've previously generated
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowSchemaForm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegisterSchema}
              loading={registeringSchema}  // Fixed: using the correct prop name
              disabled={!schemaFormData.issuerId}
            >
              Register Schema
            </Button>
          </div>
        </div>
      )}

      {/* Register Credential Definition Form */}
      {showCredDefForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Register Credential Definition</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuer DID
              </label>
              <input
                type="text"
                value={credDefFormData.issuerId}
                onChange={(e) => setCredDefFormData({ ...credDefFormData, issuerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="did:indy:bcovrin:test:PCwxM24d87tKgAy8kaWyUf"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schema ID
              </label>
              <input
                type="text"
                value={credDefFormData.schemaId}
                onChange={(e) => setCredDefFormData({ ...credDefFormData, schemaId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="did:indy:bcovrin:test:PCwxM24d87tKgAy8kaWyUf/anoncreds/v0/SCHEMA/CDB_Login/1.0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use a Schema ID from a previously registered schema
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowCredDefForm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegisterCredentialDefinition}
              loading={registeringCredDef}  // Fixed: using the correct prop name
              disabled={!credDefFormData.issuerId || !credDefFormData.schemaId}
            >
              Register Credential Definition
            </Button>
          </div>
        </div>
      )}

      {/* DIDs List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your DIDs</h3>
        </div>
        <div className="p-4">
          {dids.length === 0 ? (
            <div className="text-center py-8">
              <Key className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No DIDs generated</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by generating your first DID.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dids.map((did) => (
                <div key={did.did} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Key className="h-6 w-6 text-indigo-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{did.did}</p>
                        <p className="text-sm text-gray-500">
                          Method: {did.method} • Created: {new Date(did.createdAt).toLocaleDateString()}
                        </p>
                        {did.seed && (
                          <p className="text-xs text-gray-400 mt-1">
                            Seed: {did.seed.substring(0, 16)}...
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(did.did)}
                      className="flex items-center gap-2"
                    >
                      {copiedId === did.did ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copiedId === did.did ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schemas List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Registered Schemas</h3>
        </div>
        <div className="p-4">
          {schemas.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No schemas registered</h3>
              <p className="mt-1 text-sm text-gray-500">Register a schema to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schemas.map((schema) => (
                <div key={schema.schemaId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{schema.schemaId}</p>
                        <p className="text-sm text-gray-500">
                          Name: {schema.name} v{schema.version} • Issuer: {schema.issuerId}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(schema.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(schema.schemaId)}
                      className="flex items-center gap-2"
                    >
                      {copiedId === schema.schemaId ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copiedId === schema.schemaId ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Credential Definitions List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Credential Definitions</h3>
        </div>
        <div className="p-4">
          {credentialDefinitions.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No credential definitions</h3>
              <p className="mt-1 text-sm text-gray-500">Register a credential definition to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {credentialDefinitions.map((credDef) => (
                <div key={credDef.credentialDefinitionId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{credDef.credentialDefinitionId}</p>
                        <p className="text-sm text-gray-500">
                          Tag: {credDef.tag} • Schema: {credDef.schemaId.substring(0, 50)}...
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Issuer: {credDef.issuerId} • Created: {new Date(credDef.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(credDef.credentialDefinitionId)}
                      className="flex items-center gap-2"
                    >
                      {copiedId === credDef.credentialDefinitionId ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copiedId === credDef.credentialDefinitionId ? 'Copied!' : 'Copy'}
                    </Button>
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