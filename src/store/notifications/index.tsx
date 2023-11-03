import React, { createContext, useContext } from 'react';

import { FlashbarProps } from '@cloudscape-design/components/flashbar';

import { AddFlashMessageProps, UpdateProgressBarProps, useNotification } from '@/hooks/useNotification';

type NotificationContextType = {
    flashbarItems: FlashbarProps.MessageDefinition[];
    addFlashMessage: (props: AddFlashMessageProps) => void;
    updateProgressBar: (props: UpdateProgressBarProps) => void;
};

export const NotificationsContext = createContext<NotificationContextType>({
    flashbarItems: [],
    addFlashMessage: () => {},
    updateProgressBar: () => {},
});

export function useNotificationsContext() {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotificationsContext must be used within an NotificationsContextProvider');
    }
    return context;
}
export default function NotificationsContextProvider({ children }: { children: React.ReactElement[] }) {
    const { flashbarItems, addFlashMessage, updateProgressBar } = useNotification(); // Flashbar

    const notificationsContextValue = {
        flashbarItems: flashbarItems,
        addFlashMessage: addFlashMessage,
        updateProgressBar: updateProgressBar,
    };

    return <NotificationsContext.Provider value={notificationsContextValue}>{children}</NotificationsContext.Provider>;
}
