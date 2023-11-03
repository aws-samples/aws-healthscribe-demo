// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import { BrowserRouter } from 'react-router-dom';

import Box from '@cloudscape-design/components/box';
import '@cloudscape-design/global-styles/index.css';

import { Authenticator } from '@aws-amplify/ui-react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

import AppSettingsContextProvider from '@/store/appSettings';
import AppThemeContextProvider from '@/store/appTheme';
import AuthContextProvider from '@/store/auth';
import NotificationsContextProvider from '@/store/notifications';

import { App } from './components';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Authenticator.Provider>
                <AuthContextProvider>
                    <AppThemeContextProvider>
                        <AppSettingsContextProvider>
                            <NotificationsContextProvider>
                                <App />
                                <Box>
                                    <Toaster position="bottom-left" reverseOrder={false} />
                                </Box>
                            </NotificationsContextProvider>
                        </AppSettingsContextProvider>
                    </AppThemeContextProvider>
                </AuthContextProvider>
            </Authenticator.Provider>
        </BrowserRouter>
    </React.StrictMode>
);
