import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../app/api';
import { useToast } from './ToastContext';

const SiteSettingsContext = createContext();

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiFetch("/settings/public");
        setSettings(response.data || {});
      } catch (error) {
        pushToast("Failed to load site settings.", "error");
        console.error("Failed to load site settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [pushToast]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);