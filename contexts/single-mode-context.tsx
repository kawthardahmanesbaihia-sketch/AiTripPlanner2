'use client';

import React, { createContext, useContext, useState } from 'react';

interface SingleModePreferences {
  selectedImages: string[];
  budget: string;
  interests: string[];
  dateRange?: { start: string; end: string };
}

interface SingleModeContextType {
  preferences: SingleModePreferences;
  updatePreferences: (updates: Partial<SingleModePreferences>) => void;
}

const SingleModeContext = createContext<SingleModeContextType | undefined>(undefined);

export function SingleModeProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<SingleModePreferences>({
    selectedImages: [],
    budget: '',
    interests: [],
  });

  const updatePreferences = (updates: Partial<SingleModePreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SingleModeContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </SingleModeContext.Provider>
  );
}

export function useSingleMode() {
  const context = useContext(SingleModeContext);
  return context;
}
