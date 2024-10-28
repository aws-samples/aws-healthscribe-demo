// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { Suspense, lazy } from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from '@cloudscape-design/components/app-layout';
import Flashbar from '@cloudscape-design/components/flashbar';

import Breadcrumbs from '@/components/Breadcrumbs';
import SideNav from '@/components/SideNav';
import SuspenseLoader from '@/components/SuspenseLoader';
import TopNav from '@/components/TopNav';
import Welcome from '@/components/Welcome';
import { useAuthContext } from '@/store/auth';
import { useNotificationsContext } from '@/store/notifications';

// Lazy components
const Debug = lazy(() => import('@/components/Debug'));
const Settings = lazy(() => import('@/components/Settings'));
const Conversations = lazy(() => import('@/components/Conversations'));
const Conversation = lazy(() => import('@/components/Conversation'));
const NewConversation = lazy(() => import('@/components/NewConversation'));
const GenerateAudio = lazy(() => import('@/components/GenerateAudio'));

export default function App() {
    const { isUserAuthenticated } = useAuthContext();
    const { flashbarItems } = useNotificationsContext();

    const content = (
        <Suspense fallback={<SuspenseLoader />}>
            {isUserAuthenticated ? (
                <Routes>
                    <Route index element={<Welcome />} />
                    <Route path="/debug" element={<Debug />} />
                    <Route path="/appointments" element={<Conversations />} />
                    <Route path="/conversation/:conversationName" element={<Conversation />} />
                    <Route path="/new" element={<NewConversation />} />
                    <Route path="/generate" element={<GenerateAudio />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            ) : (
                <Routes>
                    <Route path="*" element={<Welcome />} />
                </Routes>
            )}
        </Suspense>
    );

    return (
        <>
            <div id="appTopNav">
                <TopNav />
            </div>
            <AppLayout
                breadcrumbs={<Breadcrumbs />}
                content={content}
                headerSelector="#appTopNav"
                headerVariant="high-contrast"
                navigation={<SideNav />}
                notifications={<Flashbar items={flashbarItems} />}
                toolsHide={true}
            />
        </>
    );
}
