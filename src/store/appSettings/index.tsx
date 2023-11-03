import React, { createContext, useContext } from 'react';

import { useSettings } from '@/hooks/useSettings';

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
    const [appSettings, setAppSettings] = useSettings();

    const appSettingsContextValue = {
        appSettings: appSettings,
        setAppSettings: setAppSettings,
    };

    return <AppSettingsContext.Provider value={appSettingsContextValue}>{children}</AppSettingsContext.Provider>;
}
