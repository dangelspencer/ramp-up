import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db, createTables } from '@/db/client';
import { seedDatabase } from '@/db/seed';
import { settingsService } from '@/services/settings.service';

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
        // Create all tables if they don't exist
        await createTables();

        // Initialize default settings
        await settingsService.initializeDefaults();

        // Seed default data (barbells, plates, settings) if tables are empty
        await seedDatabase();

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
