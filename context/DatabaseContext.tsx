import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db } from '@/db/client';
import { settingsService } from '@/services/settings.service';
import { barbellService } from '@/services/barbell.service';
import { plateInventoryService } from '@/services/plateInventory.service';

interface DatabaseContextType {
  isReady: boolean;
  db: typeof db;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initializeDatabase() {
      try {
        // Initialize default settings
        await settingsService.initializeDefaults();

        // Check if we need to seed default data
        const barbells = await barbellService.getAll();
        if (barbells.length === 0) {
          // Create default barbells
          await barbellService.create({ name: 'Olympic Barbell', weight: 45, isDefault: true });
          await barbellService.create({ name: 'EZ Curl Bar', weight: 25, isDefault: false });
          await barbellService.create({ name: 'Trap Bar', weight: 55, isDefault: false });
        }

        const plates = await plateInventoryService.getAll();
        if (plates.length === 0) {
          // Create default plate inventory
          await plateInventoryService.resetToDefaults();
        }

        setIsReady(true);
      } catch (error) {
        console.error('Database initialization error:', error);
        // Still set ready to allow app to load
        setIsReady(true);
      }
    }

    initializeDatabase();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isReady, db }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
