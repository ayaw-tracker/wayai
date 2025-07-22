import { createContext, useContext, useState, ReactNode } from 'react';

export type SportType = 'NFL' | 'NBA' | 'MLB';

interface SportContextType {
  selectedSport: SportType;
  setSelectedSport: (sport: SportType) => void;
  availableSports: SportType[];
}

const SportContext = createContext<SportContextType | undefined>(undefined);

interface SportProviderProps {
  children: ReactNode;
}

export function SportProvider({ children }: SportProviderProps) {
  const [selectedSport, setSelectedSport] = useState<SportType>('NFL');
  
  const availableSports: SportType[] = ['NFL', 'NBA', 'MLB'];

  return (
    <SportContext.Provider value={{
      selectedSport,
      setSelectedSport,
      availableSports
    }}>
      {children}
    </SportContext.Provider>
  );
}

export function useSport() {
  const context = useContext(SportContext);
  if (context === undefined) {
    throw new Error('useSport must be used within a SportProvider');
  }
  return context;
}