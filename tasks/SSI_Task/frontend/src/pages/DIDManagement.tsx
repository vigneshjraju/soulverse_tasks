import React, { useState } from 'react';
import Button from '../components/ui/Button';
import { Key, Copy, Plus, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface DID {
  did: string;
  method: string;
  seed?: string;
  createdAt: string;
}

export const DIDManagement: React.FC = () => {
  const [dids, setDids] = useState<DID[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    method: 'indy',
    namespace: 'bcovrin:test',
    did: '',
    seed: '',
  });
  const [copiedDid, setCopiedDid] = useState('');

  const handleGenerateDID = async () => {
    setGenerating(true);
    try {
      await apiService.didGenerate(formData);
      
      const newDID: DID = {
        did: `did:${formData.method}:${formData.namespace}:${formData.did}`,
        method: formData.method,
        seed: formData.seed,
        createdAt: new Date().toISOString(),
      };
      
      setDids([newDID, ...dids]);
      setShowForm(false);
      setFormData({
        method: 'indy',
        namespace: 'bcovrin:test',
        did: '',
        seed: '',
      });
      
      alert('DID generated successfully!');
    } catch (error: any) {
      alert(`Failed to generate DID: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDid(text);
    setTimeout(() => setCopiedDid(''), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DID Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your Decentralized Identifiers</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate DID
        </Button>
      </div>

      {/* Generate DID Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New DID</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Method
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
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
                value={formData.namespace}
                onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
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
                value={formData.did}
                onChange={(e) => setFormData({ ...formData, did: e.target.value })}
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
                value={formData.seed}
                onChange={(e) => setFormData({ ...formData, seed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter 32-character seed"
                required
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateDID}
              loading={generating}
              disabled={!formData.seed}
            >
              Generate DID
            </Button>
          </div>
        </div>
      )}

      {/* DID List */}
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
                      {copiedDid === did.did ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copiedDid === did.did ? 'Copied!' : 'Copy'}
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