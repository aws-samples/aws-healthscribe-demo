// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useCallback, useState } from 'react';

import { FlashbarProps } from '@cloudscape-design/components/flashbar';

import dayjs from 'dayjs';

export type AddFlashMessageProps = {
    id: string;
    header: string;
    content: string | JSX.Element;
    type?: 'success' | 'error' | 'warning' | 'info';
    dismissible?: boolean;
    otherParams?: null | object;
};

export function useNotification() {
    const [flashbarItems, setFlashbaritems] = useState<FlashbarProps.MessageDefinition[]>([]); // Items for the flashbar

    // Add flash message
    const addFlashMessage = useCallback(
        ({ id, header, content, type = 'info', dismissible = true, otherParams }: AddFlashMessageProps) => {
            if (!content) return;
            const idValue = id ? id : `${header} ${content}`;
            const newMessage: FlashbarProps.MessageDefinition = {
                id: idValue,
                header: `${dayjs().format('H:mm')} - ${header}`,
                type: type,
                content: content,
                dismissible: dismissible,
                onDismiss: () => setFlashbaritems((items) => items.filter((item) => item.id !== idValue)),
                ...otherParams,
            };
            setFlashbaritems((currentMessages) => [...currentMessages, newMessage]);
        },
        []
    );

    return {
        flashbarItems,
        setFlashbaritems,
        addFlashMessage,
    };
}
