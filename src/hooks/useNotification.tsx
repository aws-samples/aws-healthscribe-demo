// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useCallback, useState } from 'react';

import { FlashbarProps } from '@cloudscape-design/components/flashbar';
import ProgressBar from '@cloudscape-design/components/progress-bar';

import dayjs from 'dayjs';

export type AddFlashMessageProps = {
    id: string;
    header: string;
    content: string | JSX.Element;
    type?: 'success' | 'error' | 'warning' | 'info';
    dismissible?: boolean;
    otherParams?: null | object;
};

export type UpdateProgressBarProps = {
    type?: 'info' | 'success' | 'error';
    id: string;
    value: number;
    description: string;
    additionalInfo?: string;
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

    /**
     * @description Function used to update the lifecycle of creating a new HealthScribe job
     *              0% initially, 0-95% from the S3 upload, 5% submitting the HealthScribe API
     * @param {string} type - type of flash message (info, success, error)
     * @param {string} id - unique ID for the job. reuse to update progress bar
     * @param {number} value - value of the progress bar (1-100)
     * @param {string} description - description of the progress bar
     * @param {string} additionalInfo - (optional) additional info to be displayed in the progress bar
     */
    function updateProgressBar({ type = 'info', id, value, description, additionalInfo = '' }: UpdateProgressBarProps) {
        addFlashMessage({
            id: id,
            dismissible: ['success', 'error'].includes(type),
            header: id,
            type: type,
            content: (
                <ProgressBar value={value} variant="flash" description={description} additionalInfo={additionalInfo} />
            ),
        });
    }

    return {
        flashbarItems,
        setFlashbaritems,
        addFlashMessage,
        updateProgressBar,
    };
}
