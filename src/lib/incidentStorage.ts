// Local storage service for incidents

interface StoredIncident {
  id: string;
  incident_type: string;
  equipment: string;
  failure_mode: string;
  description: string;
  immediate_cause: string;
  root_causes: string[];
  safeguards_worked: string;
  safeguards_failed: string;
  corrective_actions: Array<{ action: string; dueDate: string; owner: string }>;
  severity: number;
  created_at: string;
}

const STORAGE_KEY = 'safety_pro_incidents';

export const incidentStorage = {
  // Get all incidents
  getAll: (): StoredIncident[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading incidents from storage:', error);
      return [];
    }
  },

  // Add new incident
  add: (incident: Omit<StoredIncident, 'id' | 'created_at'>): StoredIncident => {
    const id = `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newIncident: StoredIncident = {
      ...incident,
      id,
      created_at: new Date().toISOString(),
    };

    try {
      const incidents = incidentStorage.getAll();
      incidents.unshift(newIncident); // Add to beginning (newest first)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
      return newIncident;
    } catch (error) {
      console.error('Error saving incident to storage:', error);
      throw error;
    }
  },

  // Delete incident
  delete: (id: string): void => {
    try {
      const incidents = incidentStorage.getAll();
      const filtered = incidents.filter((inc) => inc.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting incident from storage:', error);
      throw error;
    }
  },

  // Clear all incidents
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing incidents from storage:', error);
      throw error;
    }
  },
};
