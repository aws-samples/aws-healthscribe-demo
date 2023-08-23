// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { createContext, useContext } from 'react';

// AWS Amplify
import { AmplifyUser } from '@aws-amplify/ui';

// Types
import { AppSettings } from '../Settings/Settings';
import { AddFlashMessageProps } from '../../hooks/useNotification';

// Settings
import { DEFAULT_SETTINGS } from '../Settings/defaultSettings';

// Auth Context
type AuthContextType = {
    user?: AmplifyUser;
};
export const AuthContext = createContext<AuthContextType | null>(null);
export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

// App Context
type AppContextType = {
    appTheme: string;
    appSettings: AppSettings;
};
export const AppContext = createContext<AppContextType>({
    appTheme: 'theme.light',
    appSettings: DEFAULT_SETTINGS,
});
export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('AppContext must be used within an AppProvider');
    }
    return context;
}

// Notification Context
type NotificationContextType = {
    // eslint-disable-next-line no-unused-vars
    addFlashMessage: (props: AddFlashMessageProps) => void;
};
export const NotificationContext = createContext<NotificationContextType>({
    addFlashMessage: () => {},
});
export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('NotificationContext must be used within an AppProvider');
    }
    return context;
}
