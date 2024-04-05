import React, { createContext, useContext } from 'react';

import { useLocalStorage } from '@/hooks/useLocalStorage';

type AppTheme = {
    color: string;
    density: string;
};

type AppThemeContextType = {
    appTheme: AppTheme;
    setAppTheme: (appTheme: AppTheme) => void;
    setAppThemeColor: (color: string) => void;
    setAppThemeDensity: (density: string) => void;
};

const DEFAULT_APP_THEME = {
    color: 'appTheme.light',
    density: 'density.comfortable',
};

export const AppThemeContext = createContext<AppThemeContextType>({
    appTheme: DEFAULT_APP_THEME,
    setAppTheme: () => {},
    setAppThemeColor: () => {},
    setAppThemeDensity: () => {},
});

export function useAppThemeContext() {
    const context = useContext(AppThemeContext);
    if (!context) {
        throw new Error('useAppThemeContext must be used within an AppThemeContextProvider');
    }
    return context;
}
export default function AppThemeContextProvider({ children }: { children: React.ReactElement }) {
    const [appTheme, setAppTheme] = useLocalStorage<AppTheme>('App-AppTheme', DEFAULT_APP_THEME); // App appTheme

    function setAppThemeColor(color: string) {
        setAppTheme({ ...appTheme, color: color });
    }

    function setAppThemeDensity(density: string) {
        setAppTheme({ ...appTheme, density: density });
    }

    const appThemeContextValue = {
        appTheme: appTheme,
        setAppTheme: setAppTheme,
        setAppThemeColor: setAppThemeColor,
        setAppThemeDensity: setAppThemeDensity,
    };

    return <AppThemeContext.Provider value={appThemeContextValue}>{children}</AppThemeContext.Provider>;
}
