import React from 'react';
import Button from './ui/Button';
import { ShieldCheck, RefreshCw, CheckCircle, XCircle, Users } from 'lucide-react';

interface InitializationProps {
  acmeAgent: {
    isInitialized: boolean;
    label?: string;
    endpoints?: string[];
  };
  bobAgent: {
    isInitialized: boolean;
    label?: string;
    endpoints?: string[];
  };
  initializingAcme: boolean;
  initializingBob: boolean;
  onInitializeAcme: () => Promise<void>;
  onInitializeBob: () => Promise<void>;
}

export const Initialization: React.FC<InitializationProps> = ({
  acmeAgent,
  bobAgent,
  initializingAcme,
  initializingBob,
  onInitializeAcme,
  onInitializeBob
}) => {
  const bothInitialized = acmeAgent.isInitialized && bobAgent.isInitialized;

  if (bothInitialized) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <div>
            <p className="text-sm font-medium text-green-800">Both Agents Initialized</p>
            <p className="text-sm text-green-600">
              Acme: {acmeAgent.label} • Bob: {bobAgent.label}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <ShieldCheck className="h-6 w-6 text-yellow-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">Initialize SSI Agents</h3>
            <p className="text-sm text-yellow-600 mt-1">
              Initialize Acme (Issuer/Verifier) and/or Bob (Holder) agents to start.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Acme Agent Card */}
        <div className={`p-4 rounded-lg border ${
          acmeAgent.isInitialized 
            ? 'bg-green-50 border-green-200' 
            : initializingAcme 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                acmeAgent.isInitialized 
                  ? 'bg-green-500' 
                  : initializingAcme 
                  ? 'bg-blue-500 animate-pulse' 
                  : 'bg-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                acmeAgent.isInitialized 
                  ? 'text-green-800' 
                  : initializingAcme 
                  ? 'text-blue-800' 
                  : 'text-gray-600'
              }`}>
                Acme Agent (Issuer/Verifier)
              </span>
            </div>
            {acmeAgent.isInitialized ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Button
                onClick={onInitializeAcme}
                loading={initializingAcme}
                size="sm"
                className="flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Initialize
              </Button>
            )}
          </div>
          {acmeAgent.isInitialized ? (
            <div className="text-xs text-green-600 space-y-1">
              <div>Label: {acmeAgent.label}</div>
              <div>Endpoints: {acmeAgent.endpoints?.join(', ')}</div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              Responsible for issuing credentials and verifying proofs
            </div>
          )}
        </div>

        {/* Bob Agent Card */}
        <div className={`p-4 rounded-lg border ${
          bobAgent.isInitialized 
            ? 'bg-green-50 border-green-200' 
            : initializingBob 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                bobAgent.isInitialized 
                  ? 'bg-green-500' 
                  : initializingBob 
                  ? 'bg-blue-500 animate-pulse' 
                  : 'bg-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                bobAgent.isInitialized 
                  ? 'text-green-800' 
                  : initializingBob 
                  ? 'text-blue-800' 
                  : 'text-gray-600'
              }`}>
                Bob Agent (Holder)
              </span>
            </div>
            {bobAgent.isInitialized ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Button
                onClick={onInitializeBob}
                loading={initializingBob}
                size="sm"
                className="flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Initialize
              </Button>
            )}
          </div>
          {bobAgent.isInitialized ? (
            <div className="text-xs text-green-600 space-y-1">
              <div>Label: {bobAgent.label}</div>
              <div>Endpoints: {bobAgent.endpoints?.join(', ')}</div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              Responsible for holding credentials and presenting proofs
            </div>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="mt-4 pt-4 border-t border-yellow-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-yellow-700">
            Status: {acmeAgent.isInitialized && bobAgent.isInitialized ? 'Ready' : 
                   acmeAgent.isInitialized ? 'Acme Ready' : 
                   bobAgent.isInitialized ? 'Bob Ready' : 'Not Initialized'}
          </span>
          <span className="text-yellow-600">
            {acmeAgent.isInitialized && bobAgent.isInitialized ? '✅ Both agents ready' :
             acmeAgent.isInitialized ? '✅ Acme ready' :
             bobAgent.isInitialized ? '✅ Bob ready' : '❌ Initialize agents to begin'}
          </span>
        </div>
      </div>
    </div>
  );
};