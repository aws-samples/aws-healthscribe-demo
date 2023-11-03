import React, { createContext, useContext } from 'react';

import { useLocalStorage } from '@/hooks/useLocalStorage';

type AppThemeContextType = {
    appTheme: string;
    setAppTheme: (theme: string) => void;
};

export const AppThemeContext = createContext<AppThemeContextType>({
    appTheme: 'theme.light',
    setAppTheme: () => {},
});

export function useAppThemeContext() {
    const context = useContext(AppThemeContext);
    if (!context) {
        throw new Error('useAppThemeContext must be used within an AppThemeContextProvider');
    }
    return context;
}
export default function AppThemeContextProvider({ children }: { children: React.ReactElement }) {
    const [appTheme, setAppTheme] = useLocalStorage<string>('App-Theme', 'theme.light'); // App theme

    const appThemeContextValue = {
        appTheme: appTheme,
        setAppTheme: setAppTheme,
    };

    return <AppThemeContext.Provider value={appThemeContextValue}>{children}</AppThemeContext.Provider>;
}
