// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { CollectionPreferencesProps } from '@cloudscape-design/components';

import { columnDefs } from './conversationsColumnDefs';

export const collectionPreferencesProps = {
    preferences: {
        pageSize: 10,
        visibleContent: ['variable', 'value', 'type', 'description'],
    },
    pageSizePreference: {
        title: 'Select page size',
        options: [
            { value: 10, label: '10 Jobs' },
            { value: 20, label: '20 Jobs' },
            { value: 30, label: '30 Jobs' },
        ],
    },
    wrapLinesPreference: {},
    stripedRowsPreference: {},
    contentDensityPreference: {},
    stickyColumnsPreference: {
        firstColumns: {
            title: 'Stick first column(s)',
            description: 'Keep the first column(s) visible while horizontally scrolling the table content.',
            options: [
                { label: 'None', value: 0 },
                { label: 'First column', value: 1 },
            ],
        },
        lastColumns: {
            title: 'Stick last column',
            description: 'Keep the last column visible while horizontally scrolling the table content.',
            options: [
                { label: 'None', value: 0 },
                { label: 'Last column', value: 1 },
            ],
        },
    },
    contentDisplayPreference: {
        options: columnDefs.map((c) => {
            return {
                id: c.id,
                label: c.header,
            };
        }),
    },
};

export const DEFAULT_PREFERENCES: CollectionPreferencesProps.Preferences = {
    pageSize: 20,
    wrapLines: false,
    stripedRows: true,
    visibleContent: ['FirstName', 'LastName', 'AppontmentDate', 'AppointmnetDuration', 'MedicalScribeJobStatus'],
    contentDisplay: [
        {
            id: 'MedicalScribeJobName',
            visible: false,
        },
        {
            id: 'CreationTime',
            visible: false,
        },
        {
            id: 'ExpiresIn',
            visible: false,
        },
        {
            id: 'LanguageCode',
            visible: false,
        },
        {
            id: 'CompletionTime',
            visible: false,
        },
        {
            id: 'Duration',
            visible: false,
        },
        {
            id: 'FailureReason',
            visible: false,
        },
        {
            id: 'FirstName',
            visible: true,
        },
        {
            id: 'LastName',
            visible: true,
        },
        {
            id: 'AppontmentDate',
            visible: true,
        },
        {
            id: 'AppointmnetDuration',
            visible: true,
        },
        {
            id: 'MedicalScribeJobStatus',
            visible: true,
        },
    ],
    stickyColumns: {
        first: 0,
        last: 0,
    },
};
