// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Suspense, lazy, useEffect } from 'react';

// Cloudscape
import AppLayout from '@cloudscape-design/components/app-layout';
import Flashbar from '@cloudscape-design/components/flashbar';

// AWS Amplify
import { Amplify } from 'aws-amplify';
import { useAuthenticator } from '@aws-amplify/ui-react';

// Router
import { Route, Routes, Navigate } from 'react-router-dom';

// Hooks
import { useLocalStorage } from '../../hooks/useLocalStorage';

// Utils
import { isUserAuth } from '../../utils/Auth';

// App
import { DEFAULT_SETTINGS } from '../Settings/defaultSettings';
import { useNotification } from '../../hooks/useNotification';
import Breadcrumbs from '../Breadcrumbs';
import SuspenseLoader from '../SuspenseLoader';
import Welcome from '../Welcome';
import TopNav from '../TopNav';
import SideNav from '../SideNav';

// Contexts
import { AuthContext, AppContext, NotificationContext } from './contexts';

// API
import { updateConfig } from '../../utils/HealthScribeApi';

// Configure AWS Amplify
import awsExports from '../../aws-exports';
import { AppSettings } from '../Settings/Settings';
Amplify.configure(awsExports);

// Lazy components
const Debug = lazy(() => import('../Debug'));
const Settings = lazy(() => import('../Settings'));
const Conversations = lazy(() => import('../Conversations'));
const Conversation = lazy(() => import('../Conversation'));
const NewConversation = lazy(() => import('../NewConversation'));

export default function App() {
    const [appTheme, setAppTheme] = useLocalStorage<string>('App-Theme', 'theme.light'); // App theme
    const [appSettings, setAppSettings] = useLocalStorage<AppSettings>('App-Settings', DEFAULT_SETTINGS); // App settings
    const { user, signOut } = useAuthenticator((context) => [context.user]); // Cognito user context and signOut from AWS Amplify
    const { flashbarItems, addFlashMessage } = useNotification(); // Flashbar

    // Update API settings when appSettings is changed
    useEffect(() => {
        const region = appSettings['app.region']?.value || 'us-east-1';
        const apiTiming = appSettings['app.apiTiming']?.value || false;
        updateConfig({ region: region, apiTiming: apiTiming });
    }, [appSettings]);

    // Routes
    const content = (
        <Suspense fallback={<SuspenseLoader />}>
            {isUserAuth(user) ? (
                <Routes>
                    <Route index element={<Welcome />} />
                    <Route path="/debug" element={<Debug />} />
                    <Route path="/conversations" element={<Conversations />} />
                    <Route path="/conversation/:conversationName" element={<Conversation />} />
                    <Route path="/new" element={<NewConversation />} />
                    <Route path="/settings" element={<Settings setAppSettings={setAppSettings} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            ) : (
                <Routes>
                    <Route path="*" element={<Welcome />} />
                </Routes>
            )}
        </Suspense>
    );

    // Set default context values
    const authContextValue = {
        user: user,
    };
    const appContextValue = {
        appTheme: appTheme,
        appSettings: appSettings,
    };
    const notificationContextValue = {
        addFlashMessage: addFlashMessage,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            <AppContext.Provider value={appContextValue}>
                <NotificationContext.Provider value={notificationContextValue}>
                    <TopNav signOut={signOut} setAppTheme={setAppTheme} />
                    <AppLayout
                        navigation={<SideNav activeHref="/" />}
                        breadcrumbs={<Breadcrumbs />}
                        toolsHide={true}
                        notifications={<Flashbar items={flashbarItems} />}
                        content={content}
                    />
                </NotificationContext.Provider>
            </AppContext.Provider>
        </AuthContext.Provider>
    );
}
