// hooks/SSIContext.tsx
import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useSSI } from './useSSI';

const SSIContext = createContext<ReturnType<typeof useSSI> | null>(null);

interface SSIProviderProps {
  children: ReactNode;
}

export const SSIProvider: React.FC<SSIProviderProps> = ({ children }) => {
  const ssi = useSSI();
  
  return (
    <SSIContext.Provider value={ssi}>
      {children}
    </SSIContext.Provider>
  );
};

export const useSSIContext = () => {
  const context = useContext(SSIContext);
  if (!context) {
    throw new Error('useSSIContext must be used within an SSIProvider');
  }
  return context;
};