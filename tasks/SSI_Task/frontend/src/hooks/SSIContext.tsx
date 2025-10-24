// hooks/SSIContext.tsx
import React, { createContext, useContext, useRef } from 'react';
import type { ReactNode } from 'react';
import { useSSI } from './useSSI';

// Create the context with undefined as default value
const SSIContext = createContext<ReturnType<typeof useSSI> | undefined>(undefined);

interface SSIProviderProps {
  children: ReactNode;
}

export const SSIProvider: React.FC<SSIProviderProps> = ({ children }) => {
  const ssi = useSSI();
  
  // Use ref to prevent unnecessary re-renders
  const ssiRef = useRef(ssi);
  ssiRef.current = ssi;
  
  return (
    <SSIContext.Provider value={ssiRef.current}>
      {children}
    </SSIContext.Provider>
  );
};

export const useSSIContext = () => {
  const context = useContext(SSIContext);
  if (context === undefined) {
    throw new Error('useSSIContext must be used within an SSIProvider');
  }
  return context;
};