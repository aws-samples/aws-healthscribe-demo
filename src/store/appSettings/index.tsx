import React, { createContext, useContext, useEffect } from 'react';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { updateConfig } from '@/utils/Sdk';

import { AppSettings } from './appSettings.type';
import { DEFAULT_SETTINGS } from './defaultSettings';

type AppSettingsContextType = {
    appSettings: AppSettings;
    setAppSettings: (newValue: AppSettings) => void;
};

export const AppSettingsContext = createContext<AppSettingsContextType>({
    appSettings: DEFAULT_SETTINGS,
    setAppSettings: () => {},
});

export function useAppSettingsContext() {
    const context = useContext(AppSettingsContext);
    if (!context) {
        throw new Error('useAppSettingsContext must be used within an AppSettingsContextProvider');
    }
    return context;
}
export default function AppSettingsContextProvider({ children }: { children: React.ReactElement }) {
    const [appSettings, setAppSettings] = useLocalStorage('App-Settings', DEFAULT_SETTINGS);

    // Update AWS API settings when appSettings is changed
    useEffect(() => {
        const region = appSettings['app.region']?.value || 'us-east-1';
        const apiTiming = appSettings['app.apiTiming']?.value || 'off';
        updateConfig({ region: region, apiTiming: apiTiming });
    }, [appSettings]);

    const appSettingsContextValue = {
        appSettings: appSettings,
        setAppSettings: setAppSettings,
    };

    return <AppSettingsContext.Provider value={appSettingsContextValue}>{children}</AppSettingsContext.Provider>;
}
