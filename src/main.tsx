// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import ReactDOM from 'react-dom/client';

// Cloudscape
import '@cloudscape-design/global-styles/index.css';

// Router
import { BrowserRouter } from 'react-router-dom';

// AWS Amplify
import { Authenticator } from '@aws-amplify/ui-react';

// Toast
import { Toaster } from 'react-hot-toast';

// App
import { App } from './components';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Authenticator.Provider>
                <App />
            </Authenticator.Provider>
            <Toaster position="bottom-left" reverseOrder={false} />
        </BrowserRouter>
    </React.StrictMode>
);
