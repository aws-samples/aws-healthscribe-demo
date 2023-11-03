// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { columnDefs } from './tableColumnDefs';

export const collectionPreferencesProps = {
    title: 'Preferences',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    preferences: {
        pageSize: 10,
        visibleContent: ['variable', 'value', 'type', 'description'],
    },
    pageSizePreference: {
        title: 'Select page size',
        options: [
            { value: 10, label: '10 Jobs' },
            { value: 15, label: '15 Jobs' },
            { value: 20, label: '20 Jobs' },
        ],
    },
    wrapLinesPreference: {
        label: 'Wrap line',
        description: 'Check to see all the text and wrap the lines',
    },
    stripedRowsPreference: {
        label: 'Striped rows',
        description: 'Check to add alternating shaded rows',
    },
    visibleContentPreference: {
        title: 'Select visible content',
        options: [
            {
                label: 'Job properties',
                options: columnDefs.map((c) => {
                    return {
                        id: c.id,
                        label: c.header,
                    };
                }),
            },
        ],
    },
};

export type TablePreferencesDef = {
    pageSize?: number;
    wrapLines?: boolean;
    stripedRows?: boolean;
    visibleContent?: ReadonlyArray<string>;
};

export const DEFAULT_PREFERENCES: TablePreferencesDef = {
    pageSize: 20,
    wrapLines: false,
    stripedRows: true,
    visibleContent: ['MedicalScribeJobName', 'MedicalScribeJobStatus', 'CreationTime', 'ExpiresIn'],
};
